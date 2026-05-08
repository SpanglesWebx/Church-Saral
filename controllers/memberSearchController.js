const Member = require("../Schema/memberSchema");
const Family = require("../Schema/familySchema");
const Pastor = require("../Schema/pastorSchema");
// const PastorFamilyMember = require("../Schema/pastorFamilyMemberSchema");
const MenFellowship = require("../Schema/MenFellowship");
const WomenFellowship = require("../Schema/WomenFellowship");
// const YouthFellowship = require("../Schema/YouthFellowshipSchema");
// const Creditor = require("../Schema/CreditorSchema");
const ChoirMember = require("../Schema/ChoirMemberSchema");



const escapeRegex = (text = "") => {
  // escape regex special chars to avoid regex injection
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

// Search by name across Member, Pastor, PastorFamilyMember
exports.searchMembers = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Name query is required" });

    const regex = new RegExp(escapeRegex(name), "i");


    // run queries in parallel for speed
    // const [members, pastors, pastorFamilyMembers] = await Promise.all([
    const [members, pastors] = await Promise.all([
      Member.find({ member_name: { $regex: regex } })
        .select("member_id member_name member_tamil_name primary_contact permanent_address present_address familyId gender status aadhar_number")
        .lean(),
      Pastor.find({ member_name: { $regex: regex } })
        .select("member_id member_name member_tamil_name primary_contact permanent_address present_address familyId pastor_role gender status aadhar_number")
        .lean(),
      // PastorFamilyMember.find({ member_name: { $regex: regex } })
      //   .select("member_id member_name member_tamil_name primary_contact permanent_address present_address familyId relationship_with_family_head gender status aadhar_number")
      //   .lean()
    ]);

    // normalize and deduplicate by member_id (fallback to Mongo _id if member_id missing)
    const map = new Map();



    const normalizeAndMerge = (doc, source) => {
      const idKey = (doc.member_id && String(doc.member_id).trim()) || String(doc._id);




      const extractedMobile = doc.primary_contact || null;




      if (!map.has(idKey)) {
        const base = {

          _id: doc._id,
          member_id: doc.member_id || null,
          member_name: doc.member_name || null,
          member_tamil_name: doc.member_tamil_name || null,
          mobile_number: extractedMobile,
          permanent_address: doc.permanent_address || doc.permanentAddress || null,
          present_address: doc.present_address || doc.presentAddress || null,
          familyId: doc.familyId || null,
          pastor_role: doc.pastor_role || null,
          relationship_with_family_head: doc.relationship_with_family_head || null,
          gender: doc.gender || null,
          status: doc.status || null,
          sources: [source],
          aadhar_number: doc.aadhar_number || null,
        };
        map.set(idKey, base);
      } else {
        const existing = map.get(idKey);
        existing.sources = Array.from(new Set([...existing.sources, source]));

        // 🔥 Ensure _id exists
        if (!existing._id && doc._id) {
          existing._id = doc._id;
        }



        const maybeAssign = (field) => {
          if ((existing[field] === null || existing[field] === undefined) && doc[field] !== undefined) {
            existing[field] = doc[field];
          }
        };

        ["member_name", "member_tamil_name", "permanent_address", "present_address",
          "familyId", "pastor_role", "relationship_with_family_head",
          "gender", "status", "aadhar_number"].forEach(maybeAssign);

        // fix mobile number merge
        if (!existing.mobile_number && doc.primary_contact) {
          existing.mobile_number = doc.primary_contact;
        }

      }
    };



    members.forEach(m => normalizeAndMerge(m, "Member"));
    pastors.forEach(p => normalizeAndMerge(p, "Pastor"));
    // pastorFamilyMembers.forEach(pf => normalizeAndMerge(pf, "PastorFamilyMember"));

    const results = Array.from(map.values());

    if (!results.length) {
      return res.status(404).json({ message: "No members found" });
    }

    res.json(results);
  } catch (err) {
    console.error("❌ Member search error (combined):", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.searchMembersById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ message: "ID query is required" });
    }

    const regex = new RegExp(escapeRegex(id), "i");

    // const [members, pastors, pastorFamilyMembers] = await Promise.all([
    const [members, pastors] = await Promise.all([
      Member.find({ member_id: { $regex: regex } })
        .select(
          "member_id member_name member_tamil_name primary_contact permanent_address present_address family_id gender status aadhar_number relation_with_head isHead"
        )
        .lean(),

      Pastor.find({ member_id: { $regex: regex } })
        .select(
          "member_id member_name member_tamil_name primary_contact permanent_address present_address familyId pastor_role gender status aadhar_number"
        )
        .lean(),

      // PastorFamilyMember.find({ member_id: { $regex: regex } })
      //   .select(
      //     "member_id member_name member_tamil_name primary_contact permanent_address present_address familyId relationship_with_family_head gender status aadhar_number"
      //   )
      //   .lean(),
    ]);

    const map = new Map();

    const normalizeAndMerge = (doc, source) => {
      const idKey =
        (doc.member_id && String(doc.member_id).trim()) || String(doc._id);

      // 🔹 MOBILE NUMBER
      const extractedMobile = doc.primary_contact || null;


      // 🔹 FAMILY ID
      const extractedFamilyId =
        doc.family_id || doc.familyId || null;

      // 🔹 RELATION WITH HEAD
      const extractedRelation =
        doc.relation_with_head ||
        doc.relationship_with_family_head ||
        null;

      // 🔹 AADHAR
      const extractedAadhar =
        doc.aadhar_number || null;

      // 🔹 IS HEAD (explicit rules)
      let extractedIsHead = null;
      if (doc.isHead) {
        extractedIsHead = doc.isHead; // Member
      } else if (source === "Pastor") {
        extractedIsHead = "Yes";
      } else if (source === "PastorFamilyMember") {
        extractedIsHead = "No";
      }



      if (!map.has(idKey)) {
        map.set(idKey, {

          _id: doc._id,
          member_id: doc.member_id || null,
          member_name: doc.member_name || null,
          member_tamil_name: doc.member_tamil_name || null,

          mobile_number: extractedMobile,
          familyId: extractedFamilyId,
          relationship_with_family_head: extractedRelation,
          aadhar_number: extractedAadhar,
          isHead: extractedIsHead,

          permanent_address: doc.permanent_address || null,
          present_address: doc.present_address || null,
          pastor_role: doc.pastor_role || null,
          gender: doc.gender || null,
          status: doc.status || null,

          sources: [source],
        });
      } else {
        const existing = map.get(idKey);

        // merge sources
        existing.sources = Array.from(
          new Set([...existing.sources, source])
        );


        if (!existing._id && doc._id) {
          existing._id = doc._id;
        }


        // merge fields (same rule everywhere)
        if (!existing.mobile_number && extractedMobile) {
          existing.mobile_number = extractedMobile;
        }

        if (!existing.familyId && extractedFamilyId) {
          existing.familyId = extractedFamilyId;
        }

        if (
          !existing.relationship_with_family_head &&
          extractedRelation
        ) {
          existing.relationship_with_family_head = extractedRelation;
        }

        if (!existing.aadhar_number && extractedAadhar) {
          existing.aadhar_number = extractedAadhar;
        }

        if (!existing.isHead && extractedIsHead) {
          existing.isHead = extractedIsHead;
        }

        if (!existing.member_name && doc.member_name) {
          existing.member_name = doc.member_name;
        }

        if (!existing.member_tamil_name && doc.member_tamil_name) {
          existing.member_tamil_name = doc.member_tamil_name;
        }

        if (!existing.permanent_address && doc.permanent_address) {
          existing.permanent_address = doc.permanent_address;
        }

        if (!existing.present_address && doc.present_address) {
          existing.present_address = doc.present_address;
        }

        if (!existing.gender && doc.gender) {
          existing.gender = doc.gender;
        }

        if (!existing.status && doc.status) {
          existing.status = doc.status;
        }
      }
    };

    members.forEach((m) => normalizeAndMerge(m, "Member"));
    pastors.forEach((p) => normalizeAndMerge(p, "Pastor"));
    // pastorFamilyMembers.forEach((pf) =>
    //   normalizeAndMerge(pf, "PastorFamilyMember")
    // );

    const results = Array.from(map.values());

    if (!results.length) {
      return res.status(404).json({ message: "Member not found" });
    }

    res.json(results);
  } catch (err) {
    console.error("❌ Member ID search error (combined):", err);
    res.status(500).json({ message: "Server error" });
  }
};


// 🔹 Unified search by either ID or Name
exports.searchMembersUnified = async (req, res) => {
  try {
    const { query } = req.query; // can be ID or Name
    if (!query) {
      return res.status(400).json({ message: "Query is required" });
    }

    let filter = {};

    // If query looks like an ID (e.g. starts with MBR + numbers), search by ID
    if (/^MBR\d+/i.test(query)) {
      filter.member_id = { $regex: `^${query}`, $options: "i" };
    } else {
      // Otherwise, search by name
      filter.member_name = { $regex: `^${query}`, $options: "i" };
    }

    const members = await Member.find(filter).select(
      "member_id member_name mobile_number"
    );

    if (!members.length) {
      return res.status(404).json({ message: "No members found" });
    }

    res.json(members);
  } catch (err) {
    console.error("❌ Unified search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ✅ Search male members by name
exports.searchMaleMembers = async (req, res) => {

  try {

    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Name query is required" });
    }

    const members = await Member.aggregate([
      {
        $match: {
          gender: "Male",
          status: "Active",
          member_name: { $regex: `^${name}`, $options: "i" }
        }
      },
      {
        $project: {
          _id: 1,
          member_id: 1,
          member_name: 1,
          member_tamil_name: 1,
          mobile_number: "$primary_contact"
        }
      }
    ]);

    res.json(members);

  } catch (err) {

    console.error("❌ Male member search error:", err);

    res.status(500).json({
      message: "Server error"
    });

  }

};

// ✅ Search male members by ID
exports.searchMaleMembersById = async (req, res) => {

  try {

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        message: "ID query is required"
      });
    }

    const members = await Member.aggregate([
      {
        $match: {
          gender: "Male",
          status: "Active",
          member_id: { $regex: `^${id}`, $options: "i" }
        }
      },
      {
        $project: {
          _id: 1,
          member_id: 1,
          member_name: 1,
          member_tamil_name: 1,
          mobile_number: "$primary_contact"
        }
      }
    ]);

    res.json(members);

  } catch (err) {

    console.error("❌ Male member ID search error:", err);

    res.status(500).json({
      message: "Server error"
    });

  }

};

// ✅ Controller for female member search by name
exports.searchFemaleMembers = async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ message: "Name query is required" });
    }

    const members = await Member.aggregate([
      {
        $match: {
          gender: "Female",
          status: "Active",
          member_name: { $regex: `^${name}`, $options: "i" }
        }
      },
      {
        $project: {
          _id: 1,
          member_id: 1,
          member_name: 1,
          member_tamil_name: 1,
          mobile_number: "$primary_contact"
        }
      }
    ]);

    res.json(members); // return empty array if none

  } catch (err) {
    console.error("❌ Female member search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Controller for female member search by ID
exports.searchFemaleMembersById = async (req, res) => {
  try {

    const { id } = req.query;

    if (!id) {
      return res.status(400).json({ message: "ID query is required" });
    }

    const members = await Member.aggregate([
      {
        $match: {
          gender: "Female",
          status: "Active",
          member_id: { $regex: `^${id}`, $options: "i" }
        }
      },
      {
        $project: {
          _id: 1,
          member_id: 1,
          member_name: 1,
          member_tamil_name: 1,
          mobile_number: "$primary_contact"
        }
      }
    ]);

    res.json(members);

  } catch (err) {
    console.error("❌ Female member ID search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// controllers/MemberController.js
exports.searchMarriedHusbands = async (req, res) => {
  try {
    const { query = "" } = req.query;
    const regex = new RegExp(query, "i");

    // Find all married heads
    const families = await Family.find({
      "members.relationship_with_family_head": "Wife"
    }).lean();

    const husbands = [];

    for (const f of families) {
      if (!f.head) continue; // skip if no head

      const head = await Member.findOne({
        member_id: f.head,
        $or: [
          { member_id: query },      // exact match for ID
          { member_name: regex },    // regex match for name
        ]
      }).select("member_id member_name member_tamil_name mobile_number").lean();

      if (head) husbands.push(head);
    }

    res.json(husbands);
  } catch (err) {
    console.error("Error in /married-husbands:", err);
    res.status(500).json({ error: err.message });
  }
};

// Fetch spouse of a given family head
exports.getSpouse = async (req, res) => {
  try {
    const { memberId } = req.query; // match your frontend

    if (!memberId) return res.status(400).json({ message: "memberId is required" });

    // Find the family where this member is the head
    const family = await Family.findOne({ head: memberId }).lean();

    if (!family) return res.status(404).json({ message: "Family not found" });

    const wife = family.members.find(m => m.relationship_with_family_head === "Wife");

    if (!wife) return res.status(404).json({ message: "Wife not found" });

    const wifeDetails = await Member.findOne({ member_id: wife.ref_id })
      .select("member_id member_name member_tamil_name mobile_number")
      .lean();

    if (!wifeDetails) return res.status(404).json({ message: "Wife member details not found" });

    res.status(200).json(wifeDetails);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.searchMenFellowshipByName = async (req, res) => {
  try {
    const { name } = req.query;

    const regex = new RegExp("^" + name, "i");

    const data = await MenFellowship.find()
      .populate({
        path: "member",
        match: { member_name: { $regex: regex } },
        select: "member_id member_name member_tamil_name primary_contact"
      })
      .lean();

    const result = data
      .filter(d => d.member)
      .map(d => ({
        _id: d.member._id,   // ✅ ObjectId
        member_id: d.member.member_id,
        member_name: d.member.member_name,
        member_tamil_name: d.member.member_tamil_name,
        mobile_number: d.member.primary_contact || ""  // ✅ FIX
      }));

    res.json(result.length ? result : [{
      member_id: "none",
      member_name: "No member found"
    }]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Search Men Fellowship members by ID
exports.searchMenFellowshipById = async (req, res) => {
  try {
    const { id } = req.query;

    const regex = new RegExp("^" + id, "i");

    const data = await MenFellowship.find()
      .populate({
        path: "member",
        match: { member_id: { $regex: regex } },
        select: "member_id member_name member_tamil_name primary_contact"
      })
      .lean();

    const result = data
      .filter(d => d.member)
      .map(d => ({
        _id: d.member._id,   // ✅ ObjectId
        member_id: d.member.member_id,
        member_name: d.member.member_name,
        member_tamil_name: d.member.member_tamil_name,
        mobile_number: d.member.primary_contact || ""  // ✅ FIX
      }));

    res.json(result.length ? result : [{
      member_id: "none",
      member_name: "No member found"
    }]);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Search Women Fellowship members by Name
exports.searchWomenFellowshipByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Name query is required" });

    const regex = new RegExp("^" + escapeRegex(name), "i");

    const members = await WomenFellowship.find({ member_name: { $regex: regex } })
      .select("member_id member_name member_tamil_name mobile_number")
      .lean();

    if (!members.length) {
      return res.status(404).json([{ member_id: "none", member_name: "No member found" }]);
    }

    res.json(members);
  } catch (err) {
    console.error("❌ WomenFellowship name search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Search Women Fellowship members by ID
exports.searchWomenFellowshipById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "ID query is required" });

    const regex = new RegExp("^" + escapeRegex(id), "i");

    const members = await WomenFellowship.find({ member_id: { $regex: regex } })
      .select("member_id member_name member_tamil_name mobile_number")
      .lean();

    if (!members.length) {
      return res.status(404).json([{ member_id: "none", member_name: "No member found" }]);
    }

    res.json(members);
  } catch (err) {
    console.error("❌ WomenFellowship ID search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.searchYouthFellowshipByName = async (req, res) => {
  try {
    const { name } = req.query;
    if (!name) return res.status(400).json({ message: "Name query is required" });

    const regex = new RegExp("^" + escapeRegex(name), "i");

    const members = await YouthFellowship.find({ member_name: { $regex: regex } })
      .select("member_id member_name member_tamil_name mobile_number")
      .lean();

    if (!members.length) {
      return res
        .status(404)
        .json([{ member_id: "none", member_name: "No member found" }]);
    }

    res.json(members);
  } catch (err) {
    console.error("❌ YouthFellowship name search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Search Youth Fellowship members by ID
exports.searchYouthFellowshipById = async (req, res) => {
  try {
    const { id } = req.query;
    if (!id) return res.status(400).json({ message: "ID query is required" });

    const regex = new RegExp("^" + escapeRegex(id), "i");

    const members = await YouthFellowship.find({ member_id: { $regex: regex } })
      .select("member_id member_name member_tamil_name mobile_number")
      .lean();

    if (!members.length) {
      return res
        .status(404)
        .json([{ member_id: "none", member_name: "No member found" }]);
    }

    res.json(members);
  } catch (err) {
    console.error("❌ YouthFellowship ID search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// ➤ Search teacher by ID
exports.searchTeacherById = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const teachers = await Member.find(
      { member_id: { $regex: query, $options: "i" } },
      "member_id member_name member_tamil_name mobile_number"
    )
      .limit(20)
      .lean();

    res.json(teachers);
  } catch (err) {
    console.error("Error searching teacher by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ➤ Search teacher by Name
exports.searchTeacherByName = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) return res.json([]);

    const teachers = await Member.find(
      { member_name: { $regex: query, $options: "i" } },
      "member_id member_name member_tamil_name mobile_number"
    )
      .limit(20)
      .lean();

    res.json(teachers);
  } catch (err) {
    console.error("Error searching teacher by Name:", err);
    res.status(500).json({ message: "Server error" });
  }
};











exports.searchChoirMemberById = async (req, res) => {
  try {
    const { member_id } = req.query;
    if (!member_id) return res.json([]);

    const regex = new RegExp(escapeRegex(member_id), "i");

    const members = await ChoirMember.find({
      member_id: { $regex: regex }
    }).lean();

    res.json(members);
  } catch (err) {
    res.status(500).json([]);
  }
};


// 🔍 BY NAME
exports.searchChoirMemberByName = async (req, res) => {
  try {
    const { member_name } = req.query;
    if (!member_name) return res.json([]);

    const regex = new RegExp("^" + escapeRegex(member_name), "i");

    const members = await ChoirMember.find({
      member_name: { $regex: regex },
    }).lean();

    res.json(members);
  } catch (err) {
    console.error("Choir name search error:", err);
    res.status(500).json([]);
  }
};

// 🔍 BY MOBILE
exports.searchChoirMemberByMobile = async (req, res) => {
  try {
    const { mobile_number } = req.query;
    if (!mobile_number) return res.json([]);

    const regex = new RegExp("^" + escapeRegex(mobile_number), "i");

    const members = await ChoirMember.find({
      mobile_number: { $regex: regex },
    }).lean();

    res.json(members);
  } catch (err) {
    console.error("Choir mobile search error:", err);
    res.status(500).json([]);
  }
};


