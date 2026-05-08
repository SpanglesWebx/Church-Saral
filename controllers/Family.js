
//controllers/Family.js

const fs = require("fs");
const path = require("path");
const Member = require("../Schema/memberSchema");
const Family = require("../Schema/familySchema");




const { familyIdFromMemberId } = require("../util/familyIdFromMember");

// ===============================================================
// CREATE FAMILY HEAD (UPDATED TO USE MEMBER → FAMILY ID MAPPING)
// ===============================================================
exports.createFamilyHead = async (req, res) => {
  try {
    const { member_id } = req.body;

    if (!member_id) {
      return res.status(400).json({ message: "Member ID required" });
    }

    // Step 1 — Find Member
    const member = await Member.findOne({ member_id });

    if (!member) {
      return res.status(404).json({ message: "Member not found" });
    }

    // Step 2 — Prevent duplication
    if (member.family_id) {
      return res.status(400).json({
        message: "This member already belongs to a family"
      });
    }

    // Step 3 — Generate Family ID from Member ID
    const newFamilyId = await generateNextId(Family, "family_id", "FAM");

    // Step 4 — Check if family already exists
    const existingFamily = await Family.findOne({ family_id: newFamilyId });
    if (existingFamily) {
      return res.status(400).json({
        message: `Family ${newFamilyId} already exists`
      });
    }

    // Step 5 — Create Family
    const newFamily = await Family.create({
      family_id: newFamilyId,
      head: {
        member_id: member.member_id,
        member_name: member.member_name,
        member_tamil_name: member.member_tamil_name,
      },
      members: [
        {
          member_id: member.member_id,
          member_name: member.member_name,
          member_tamil_name: member.member_tamil_name,
          relation_with_head: "Head"
        }
      ]
    });

    // Step 6 — Update Member Document
    member.family_id = newFamilyId;
    member.relation_with_head = "Head";
    member.isHead = "Yes";
    await member.save();

    return res.status(200).json({
      status: "Success",
      message: "Family created successfully",
      data: newFamily,
    });

  } catch (error) {
    console.error("Create Family Head Error:", error);
    return res.status(500).json({
      status: "Failed",
      message: "Server Error"
    });
  }
};





exports.getFamilies = async (req, res) => {
  try {
    let { page = 1, search = "", limit = 50 } = req.query;

    page = Number(page);
    limit = Math.min(Math.max(Number(limit), 1), 500);

    const skip = (page - 1) * limit;

    let matchStage = {};

    if (search.trim()) {
      matchStage = {
        family_id: { $regex: search, $options: "i" }
      };
    }

    const families = await Family.aggregate([
      { $match: matchStage },

      // 🔥 Lookup Head Member
      {
        $lookup: {
          from: "members",
          localField: "head",
          foreignField: "_id",
          as: "head"
        }
      },

      {
        $unwind: {
          path: "$head",
          preserveNullAndEmptyArrays: true
        }
      },

      {
        $sort: { family_id: -1 }
      },

      {
        $skip: skip
      },

      {
        $limit: limit
      }
    ]);

    const total = await Family.countDocuments(matchStage);

    return res.json({
      data: families,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      limit
    });

  } catch (err) {
    console.error("Get Families Error:", err);
    res.status(500).json({
      status: "Failed",
      message: "Server Error"
    });
  }
};





exports.getFamilyById = async (req, res) => {
  try {
    const { family_id } = req.params;

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const family = await Family.findOne({ family_id })
      .populate("head")
      .populate("transfer_details.member")
      .lean();

    if (!family) {
      return res.status(404).json({ message: "Family not found" });
    }

    const searchQuery = {
      family_id,
      $or: [
        { member_name: { $regex: search, $options: "i" } },
        { member_id: { $regex: search, $options: "i" } }
      ]
    };

    const total = await Member.countDocuments(searchQuery);

    const members = await Member.find(searchQuery)
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    res.json({
      family_id: family.family_id,
      head_member_id: family.head?.member_id,
      head_member_name: family.head?.member_name,
      family_photo: family.family_photo,  
      members,
      transfer_details: family.transfer_details || [],
      currentPage: page,
      totalPages: Math.ceil(total / limit),
      total
    });

  } catch (err) {
    console.error("Get Family Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};




exports.uploadFamilyPhoto = async (req, res) => {
  try {

    const { family_id } = req.params;

    const family = await Family.findOne({ family_id });

    if (!family) {
      return res.status(404).json({ message: "Family not found" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadDir = path.join(
      __dirname,
      "..",
      "uploads",
      "FamilyPhotos",
      family_id
    );

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileName = `${family_id}.jpg`;

    const filePath = path.join(uploadDir, fileName);

    fs.writeFileSync(filePath, req.file.buffer);

    
       const dbPath = `uploads/FamilyPhotos/${family_id}/${fileName}`;

    family.family_photo = dbPath;

    await family.save();

    res.json({
      message: "Family photo uploaded",
      family_photo: dbPath
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Upload failed" });
  }
};
