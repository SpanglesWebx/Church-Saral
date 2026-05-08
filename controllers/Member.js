


const mongoose = require("mongoose");
const puppeteer = require("puppeteer");
const Member = require("../Schema/memberSchema");
const Family = require("../Schema/familySchema");

const generateNonCommunicalMemberCode = require("../util/generateNonCommunicalMemberCode");

const {
  generateMemberCode,
  previewMemberCode
} = require("../util/generateMemberCode");

const {
  generateFamilyCode,
  previewFamilyCode
} = require("../util/FamilyId");

const relabelChildrenByDOB = require("../util/relabelChildrenByDOB");
const fs = require("fs");
const path = require("path");
const handleMemberPhoto = require("../util/handleMemberPhoto");
const { renameMemberPhoto } = require("../util/renameMemberPhoto");
const generateMembersPDF = require("../template/Member/Memberlist");

const todayISO = () => {
  return new Date().toISOString().split("T")[0];
};









// =======================================================
// GET MEMBERS LIST (PAGINATION + SEARCH + STATUS FILTER)
// =======================================================
exports.getMembersList = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 50,
      search = "",
      status = "All",
    } = req.query;

    const pageNumber = parseInt(page, 10);
    const limitNumber = parseInt(limit, 10);
    const skip = (pageNumber - 1) * limitNumber;

    const query = {};

    /* =========================
       ✅ STATUS FILTER FIX
    ========================== */
    if (status && status !== "All") {
      query.status = status; // Active / Inactive only
    }

    /* =========================
       🔍 SEARCH FILTER
    ========================== */
    if (search && search.trim() !== "") {
      query.$or = [
        { member_id: { $regex: search, $options: "i" } },
        { member_name: { $regex: search, $options: "i" } },
        { family_id: { $regex: search, $options: "i" } },
        { contact_numbers: { $regex: search, $options: "i" } },
      ];
    }

    /* =========================
       📦 FETCH DATA
    ========================== */
    const [members, totalCount] = await Promise.all([
      Member.find(query)
        .sort({ member_id: -1 })
        .skip(skip)
        .limit(limitNumber)
        .lean(),

      Member.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalCount / limitNumber) || 1;

    return res.status(200).json({
      status: "Success",
      data: members,
      totalCount,
      totalPages,
      currentPage: pageNumber,
    });

  } catch (err) {
    console.error("Get Members Error:", err);
    return res.status(500).json({
      status: "Failed",
      message: "Server Error",
    });
  }
};


// =======================================================
// CREATE NEW MEMBER (HEAD / WIFE / CHILD)
// =======================================================
exports.addNewMember = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const data = req.body;

    /* =====================================================
       🔐 REQUIRED VALIDATION (SCHEMA SAFE)
    ===================================================== */
    if (!data.member_type) {
      throw new Error("Member Type is required");
    }
    if (!data.relationship) {
      throw new Error("Relationship is required");
    }
    if (!data.member_name) {
      throw new Error("Member Name is required");
    }
    if (!data.gender) {
      throw new Error("Gender is required");
    }

    let member_id = "";
    let familyId = data.family_id || "";
    let relationship = data.relationship;

    /* =====================================================
       🚫 INVALID COMBINATIONS (BUSINESS RULES)
    ===================================================== */
    // if (
    //   data.member_type === "Non - Communical Member" &&
    //   (relationship === "Husband" || relationship === "Wife")
    // ) {
    //   throw new Error("Non-Communical Member cannot be Husband or Wife");
    // }

    /* =====================================================
       👨 HUSBAND → FULL MEMBER → FAMILY HEAD
    ===================================================== */
    if (data.is_head === "true" || data.is_head === true) {

      familyId = await generateFamilyCode(session);

      // ✅ FULL MEMBER HEAD
      if (data.member_type === "Full Member") {

        member_id = await generateMemberCode(session);

      }

      // ✅ NON COMMUNICAL HEAD
      else if (data.member_type === "Non - Communical Member") {

        // generate future full-member base
        const baseId = await generateMemberCode(session);

        // create child-style code
        member_id = `${baseId}-1`;
      }




      // keep original relationship
      relationship = data.relationship;

      const photoPath = handleMemberPhoto(req, member_id, data);

      /* ---------- CREATE MEMBER FIRST ---------- */
      const member = await Member.create(
        [
          {
            member_id,
            member_type: data.member_type,
            family_id: familyId,
            relationship,
            is_head: true,

            member_name: data.member_name,
            member_title: data.member_title || "",
            member_tamil_name: data.member_tamil_name || "",
            member_tamil_title: data.member_tamil_title || "",
            father_name: data.father_name || "",
            mother_name: data.mother_name || "",

            gender: data.gender,
            dob: data.dob || "",
            age: data.age || 0,
            place_of_birth: data.place_of_birth || "",
            aadhar_number: data.aadhar_number || "",
            blood_group: data.blood_group || "",

            joining_date: data.joining_date || todayISO(),
            email: data.email || "",
            primary_email: data.primary_email || "",
            qualification: data.qualification || "",
            occupation: data.occupation || "",
            community: data.community || "",
            nationality: data.nationality || "",

            contact_numbers: data.contact_numbers || [],
            primary_contact: data.primary_contact || "",

            photo: photoPath,

            present_address: data.present_address || "",
            permanent_address: data.permanent_address || "",
            present_pincode: data.present_pincode || "",
            permanent_pincode: data.permanent_pincode || "",
            zone: data.zone || "",
            area: data.area || "",


            membership_from:
              data.member_type === "Full Member"
                ? data.membership_from || todayISO()
                : "",
            official_address: data.official_address || "",
            official_pincode: data.official_pincode || "",

            baptism: data.baptism || "",
            baptism_date: data.baptism_date || "",
            baptism_by: data.baptism_by || "",
            baptism_church: data.baptism_church || "",

            confirmation: data.confirmation || "",
            confirmation_date: data.confirmation_date || "",
            confirmation_by: data.confirmation_by || "",
            confirmation_church: data.confirmation_church || "",

            marital_status: data.marital_status || "",
            marriage_date: data.marriage_date || "",
            marriage_place: data.marriage_place || "",
            child_label: "",

            status: "Active",
            membership_status: "Unhold",
          },
        ],
        { session }
      );



      /* ---------- CREATE FAMILY AFTER MEMBER ---------- */



      await Family.create([
        {
          family_id: familyId,
          head: member[0]._id,
          members: [member[0]._id]
        }
      ], { session });


      await session.commitTransaction();

      return res.status(201).json({
        status: "Success",
        data: member[0],
      });
    }

    /* =====================================================
       👩👶 WIFE / SON / DAUGHTER
    ===================================================== */
    if (!familyId) {
      throw new Error("Family ID is required");
    }

    const family = await Family.findOne({ family_id: familyId }).session(session);
    if (!family) {
      throw new Error("Invalid Family ID");
    }



    /* ===============================
     👶 CHILD REQUIRES WIFE (OBJECTID VERSION)
  =============================== */

    // if (relationship === "Son" || relationship === "Daughter") {

    //   const wifeExists = await Member.exists({
    //     family_id: familyId,
    //     relationship: "Wife"
    //   }).session(session); // keep inside transaction

    //   if (!wifeExists) {
    //     throw new Error("Cannot add Son / Daughter without Wife in family");
    //   }
    // }


    /* ---------- MEMBER ID GENERATION ---------- */
    if (data.member_type === "Non - Communical Member") {

      const headMember = await Member.findById(family.head)
        .session(session);

      if (!headMember) {
        throw new Error("Family head not found");
      }

      // ✅ VKDMBR00016-1 → VKDMBR00016
      const rootId = headMember.member_id.split("-")[0];

      member_id = await generateNonCommunicalMemberCode(
        rootId
      );

    } else {
      member_id = await generateMemberCode(session);
    }



    const photoPath = handleMemberPhoto(req, member_id, data);

    /* ---------- CREATE MEMBER ---------- */
    const member = await Member.create(
      [
        {
          member_id,
          member_type: data.member_type,
          family_id: familyId,
          relationship,
          is_head: false,

          member_name: data.member_name,
          member_title: data.member_title || "",
          member_tamil_name: data.member_tamil_name || "",
          member_tamil_title: data.member_tamil_title || "",
          father_name: data.father_name || "",
          mother_name: data.mother_name || "",
          child_label: "",


          gender: data.gender,
          dob: data.dob || "",
          age: data.age || 0,
          place_of_birth: data.place_of_birth || "",
          aadhar_number: data.aadhar_number || "",
          blood_group: data.blood_group || "",
          email: data.email || "",
          primary_email: data.primary_email || "",
          qualification: data.qualification || "",
          occupation: data.occupation || "",
          community: data.community || "",
          nationality: data.nationality || "",

          contact_numbers: data.contact_numbers || [],
          primary_contact: data.primary_contact || "",

          photo: photoPath,


          present_address: data.present_address || "",
          permanent_address: data.permanent_address || "",
          present_pincode: data.present_pincode || "",
          permanent_pincode: data.permanent_pincode || "",
          zone: data.zone || "",
          area: data.area || "",


          official_address: data.official_address || "",
          official_pincode: data.official_pincode || "",


          joining_date: data.joining_date || todayISO(),
          membership_from:
            data.member_type === "Full Member"
              ? data.membership_from || todayISO()
              : "",


          baptism: data.baptism || "",
          baptism_date: data.baptism_date || "",
          baptism_by: data.baptism_by || "",
          baptism_church: data.baptism_church || "",

          confirmation: data.confirmation || "",
          confirmation_date: data.confirmation_date || "",
          confirmation_by: data.confirmation_by || "",
          confirmation_church: data.confirmation_church || "",

          marital_status: data.marital_status || "",
          marriage_date: data.marriage_date || "",
          marriage_place: data.marriage_place || "",

          status: "Active",
          membership_status: "Unhold",
        },
      ],
      { session }
    );








    // 3️⃣ FETCH UPDATED LABEL
    const updatedMember = await Member.findOne(
      { member_id },
      { child_label: 1 }
    ).session(session);


    /* ---------- UPDATE FAMILY ---------- */
    await Family.updateOne(
      { family_id: familyId },
      {
        $addToSet: {
          members: member[0]._id   // ✅ push ObjectId directly
        },
      },
      { session }
    );




    if (relationship === "Son" || relationship === "Daughter") {
      await relabelChildrenByDOB(familyId, session);
    }


    await session.commitTransaction();

    return res.status(201).json({
      status: "Success",
      data: member[0],
    });

  } catch (err) {
    await session.abortTransaction();
    console.error("Add Member Error:", err);
    return res.status(400).json({
      status: "Failed",
      message: err.message || "Server Error",
    });
  } finally {
    session.endSession();
  }
};

exports.getMemberById = async (req, res) => {
  try {
    const { id } = req.params;

    let member = null;

    // If Mongo ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      member = await Member.findById(id).lean();
    }

    // If Business Member ID
    if (!member) {
      member = await Member.findOne({ member_id: id }).lean();
    }

    if (!member) {
      return res.status(404).json({
        status: "Failed",
        message: "Member not found",
      });
    }

    let family = null;
    if (member.family_id) {
      family = await Family.findOne({ family_id: member.family_id })
        .populate("head")
        .populate("members")
        .lean();
    }

    // ✅ Correct logic
    const isHead = member.is_head;

    res.json({
      status: "Success",
      data: {
        ...member,
        isHead: isHead ? "Yes" : "No",
        head_member_id: !isHead ? family?.head?.member_id || "" : "",
        head_name: !isHead ? family?.head?.member_name || "" : "",
        relation_with_head: !isHead ? member.relationship : "",
      },
    });

  } catch (err) {
    console.error("Get Member Error:", err);
    res.status(500).json({
      status: "Failed",
      message: "Server Error",
    });
  }
};










exports.getNextIds = async (req, res) => {
  try {

    const { member_type, head_member_id } = req.query;

    if (!member_type) {
      return res.status(400).json({
        status: "Failed",
        message: "member_type is required"
      });
    }

    let member_id = "";
    let family_id = "";

    // Full Member → new member + new family
    if (member_type === "Full Member") {
      member_id = await generateMemberCode();
      family_id = await generateFamilyCode();
    }

    // Non Communical Member → need head member
    else if (member_type === "Non - Communical Member") {

      if (!head_member_id) {
        return res.status(400).json({
          status: "Failed",
          message: "Head Member ID is required"
        });
      }

      member_id = await generateNonCommunicalMemberCode(head_member_id);
    }

    return res.json({
      status: "Success",
      member_id,
      ...(family_id && { family_id })
    });

  } catch (err) {
    console.error("ID generation failed:", err);

    return res.status(500).json({
      status: "Failed",
      message: "ID generation failed"
    });
  }
};









exports.previewMemberId = async (req, res) => {
  try {

    const { member_type, relationship, head_member_id, is_head } = req.query;

    /* ===============================
       HEAD MEMBER → NEW FAMILY
    =============================== */

    if (is_head === "true" || is_head === true) {

      let preview_id = "";

      if (member_type === "Full Member") {

        preview_id = await previewMemberCode();

      } else if (member_type === "Non - Communical Member") {

        const baseId = await previewMemberCode();
        preview_id = `${baseId}-1`;
      }

      const family_id = await previewFamilyCode();

      return res.json({
        preview_id,
        family_id
      });
    }

    /* ===============================
       NON HEAD → REQUIRE HEAD
    =============================== */

    if (!head_member_id) {
      return res.status(400).json({
        message: "Head Member ID required"
      });
    }

    const headMember = await Member.findOne({
      member_id: head_member_id
    });

    if (!headMember) {
      return res.status(404).json({
        message: "Head Member not found"
      });
    }

    /* ===============================
       FULL MEMBER → NEW MEMBER ID
    =============================== */

    if (member_type === "Full Member") {

      const preview_id = await previewMemberCode();

      return res.json({
        preview_id,
        family_id: headMember.family_id
      });
    }

    /* ===============================
       NON COMMUNICAL MEMBER → CHILD CODE
    =============================== */

    if (member_type === "Non - Communical Member") {

      // ✅ VKDMBR00016-1 → VKDMBR00016
      const rootId = head_member_id.split("-")[0];

      const preview_id =
        await generateNonCommunicalMemberCode(rootId);

      return res.json({
        preview_id,
        family_id: headMember.family_id
      });
    }

    res.json({});

  } catch (err) {

    console.error("Preview Error:", err);

    res.status(500).json({
      message: "Preview generation failed"
    });

  }
};

exports.searchFamilyHead = async (req, res) => {
  const { query } = req.query;

  if (!query) return res.json([]);

  const heads = await Member.find({
    is_head: true,
    $or: [
      { member_id: { $regex: `^${query}`, $options: "i" } },
      { member_name: { $regex: query, $options: "i" } }
    ]
  })
    .limit(10)
    .lean();

  const familyIds = heads.map(h => h.family_id);

  const wives = await Member.find({
    family_id: { $in: familyIds },
    relationship: "Wife"
  }).lean();

  const wifeMap = {};
  wives.forEach(w => {
    wifeMap[w.family_id] = w;
  });

  const result = heads.map(head => {
    const wife = wifeMap[head.family_id];

    return {
      member_id: head.member_id,
      member_name: head.member_name,
      family_id: head.family_id,

      relationship: head.relationship,
      isHead: head.is_head,

      wife_exists: !!wife,

      father_name: head.member_name,
      mother_name: wife?.member_name || "",

      marital_status: head.marital_status || "",
      marriage_date: head.marriage_date || "",
      marriage_place: head.marriage_place || "",

      present_address: head.present_address,
      permanent_address: head.permanent_address,
      present_pincode: head.present_pincode,
      permanent_pincode: head.permanent_pincode,
      contact_numbers: head.contact_numbers,
    };
  });

  res.json(result);
};


exports.previewUpgradeMemberId = async (req, res) => {

  try {

    const {
      member_type,
      relationship,
      head_member_id
    } = req.query;

    /* ===============================
       REQUIRED VALIDATION
    =============================== */

    if (!member_type || !relationship) {

      return res.status(400).json({
        message: "member_type and relationship are required",
      });

    }

    /* ===============================
       ONLY FULL MEMBER UPGRADE
    =============================== */

    if (
      member_type === "Full Member" &&
      ["Son", "Daughter", "Husband", "Wife"].includes(relationship)
    ) {

      let preview_id = "";

      /* ===============================
         HEAD NON-COMMUNICAL MEMBER
         EX:
         VKDMBR00016-1 → VKDMBR00016
      =============================== */

      if (
        head_member_id &&
        head_member_id.includes("-1")
      ) {

        preview_id = head_member_id.split("-")[0];

      }

      /* ===============================
         NORMAL MEMBER UPGRADE
         EX:
         VKDMBR00016-2 → VKDMBR00017
      =============================== */

      else {

        preview_id = await previewMemberCode();

      }

      /* ===============================
         FIND HEAD MEMBER
      =============================== */

      const headMember = await Member.findOne({
        member_id: head_member_id
      }).lean();

      if (!headMember) {

        return res.status(404).json({
          message: "Head member not found"
        });

      }

      /* ===============================
         FIND FAMILY
      =============================== */

      const family = await Family.findOne({
        family_id: headMember.family_id
      }).lean();

      if (!family) {

        return res.status(404).json({
          message: "Family not found"
        });

      }

      /* ===============================
         SUCCESS RESPONSE
      =============================== */

      return res.json({
        status: "Success",
        preview_id,
        family_id: family.family_id,
      });

    }

    /* ===============================
       INVALID REQUEST
    =============================== */

    return res.status(400).json({
      message: "Invalid upgrade request",
    });

  } catch (err) {

    console.error(
      "Preview Upgrade Member ID Error:",
      err
    );

    return res.status(500).json({
      message: "Server Error"
    });

  }

};


exports.previewTransferFamily = async (req, res) => {
  try {
    // 🔥 ONLY generate new family
    const preview_family_id = await previewFamilyCode();

    return res.json({
      status: "Success",
      preview_family_id,
    });

  } catch (err) {
    console.error("Preview Transfer Family Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};


const safeMemberIdForFile = (memberId) => {
  return memberId.replace(/\//g, "-"); // MBR00001/3 → MBR00001-3
};


exports.updateMember = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const data = req.body;

    /* ===============================
       1️⃣ FETCH MEMBER
    =============================== */
    const member = await Member.findById(id).session(session);
    if (!member) throw new Error("Member not found");

    const oldMemberId = member.member_id;
    const oldMemberType = member.member_type;
    const oldFamilyId = member.family_id;
    const oldMemberName = member.member_name;

    let newFamilyCreated = false; // 🔑 KEY FIX



    /* ===============================
       🔒 PREVENT DOWNGRADE
    =============================== */
    if (
      oldMemberType === "Full Member" &&
      data.member_type === "Non - Communical Member"
    ) {
      throw new Error("Full Member cannot be downgraded");
    }

    /* ===============================
       2️⃣ PRIMARY CONTACT VALIDATION
    =============================== */
    if (data.primary_contact) {
      member.primary_contact = data.primary_contact;
    }

    /* ===============================
       3️⃣ PREVENT DATE MANUAL EDIT
    =============================== */
    delete data.joining_date;
    delete data.membership_from;




    /* ===============================
   🔥 NON-COMMUNICAL → FULL MEMBER
=============================== */
    const isUpgradeToFull =
      oldMemberType === "Non - Communical Member" &&
      data.member_type === "Full Member";

    let finalMemberId = member.member_id; // ✅ DEFAULT

    if (isUpgradeToFull) {
      member.old_member_id = oldMemberId;
      member.old_member_id_changed_at = new Date();

      member.old_member_type = oldMemberType;
      member.old_member_type_changed_at = new Date();

      await Family.updateOne(
        { family_id: oldFamilyId },
        { $pull: { members: member._id } },
        { session }
      );

      /* ===============================
    HEAD NON-COMMUNICAL MEMBER
    EX:
    VKDMBR00016-1 → VKDMBR00016
 =============================== */

      if (
        member.is_head === true &&
        oldMemberId.includes("-1")
      ) {

        finalMemberId = oldMemberId.split("-")[0];

      }

      /* ===============================
         NORMAL NON-COMMUNICAL MEMBER
         EX:
         VKDMBR00016-2 → VKDMBR00017
      =============================== */

      else {

        finalMemberId =
          await generateMemberCode(session);

      }// ✅ PROMOTED

      member.member_id = finalMemberId;
      member.member_type = "Full Member";
      member.membership_from = new Date().toISOString().split("T")[0];

      await Family.updateOne(
        { family_id: oldFamilyId },
        {
          $addToSet: {
            members: member._id   // ✅ ObjectId reference
          },
        },
        { session }
      );
    }





    const uploadsDir = path.join(__dirname, "..", "uploads", "memberPhotos");
    const safeId = safeMemberIdForFile(finalMemberId);
    const safeName = member.member_name.replace(/\s+/g, "");



    // ✅ CASE 1: NEW PHOTO UPLOADED
    if (req.file) {
      const ext = path.extname(req.file.originalname);
      const newFileName = `${safeId}(${safeName})${ext}`;

      const tempPath = path.join(uploadsDir, req.file.filename);
      const finalPath = path.join(uploadsDir, newFileName);

      if (!fs.existsSync(tempPath)) {
        throw new Error("Uploaded photo file not found");
      }

      fs.renameSync(tempPath, finalPath);
      member.photo = `uploads/memberPhotos/${newFileName}`;
    }

    // ✅ CASE 2: UPGRADE ONLY → RENAME EXISTING PHOTO
    else if (isUpgradeToFull && member.photo) {
      const oldAbsolutePath = path.join(__dirname, "..", member.photo);
      const ext = path.extname(member.photo);

      const newFileName = `${safeId}(${safeName})${ext}`;
      const newAbsolutePath = path.join(uploadsDir, newFileName);

      if (fs.existsSync(oldAbsolutePath)) {
        fs.renameSync(oldAbsolutePath, newAbsolutePath);
        member.photo = `uploads/memberPhotos/${newFileName}`;
      }
    }




    /* ===============================
       🔥 SON + FULL MEMBER + MARRIED
       → CREATE NEW FAMILY
    =============================== */


    if (
      data.relationship === "Head" &&
      data.marital_status !== "Married"
    ) {
      throw new Error("Only married members can become Head via transfer");
    }

    const shouldCreateNewFamily =
      member.relationship === "Son" &&
      (data.member_type || member.member_type) === "Full Member" &&
      data.marital_status === "Married";


    if (shouldCreateNewFamily) {

      const previousFamilyId = member.family_id;

      const originalChildLabel = member.child_label || "";
      const originalRelationship = member.relationship;

      member.old_family_id = previousFamilyId;
      member.family_changed_at = new Date();

      // 🔥 ONLY NEW FAMILY ID
      const newFamilyId = await generateFamilyCode(session);


      let newRelationship = originalRelationship;
      let newIsHead = false;

      if (originalRelationship === "Son") {
        newRelationship = "Husband";
        newIsHead = true;
      }

      if (originalRelationship === "Daughter") {
        newRelationship = "Wife";
        newIsHead = true;
      }

      /* ---------- STORE TRANSFER HISTORY ---------- */

      await Family.updateOne(
        { family_id: previousFamilyId },
        {
          $push: {
            transfer_details: {
              member: member._id,
              old_relationship: originalRelationship,
              // show Head in history but keep Husband/Wife in DB
              new_relationship: newIsHead ? "Head" : newRelationship,
              old_family_id: previousFamilyId,
              family_changed_at: new Date(),
              child_label: originalChildLabel
            }
          }
        },
        { session }
      );

      /* ---------- REMOVE FROM OLD FAMILY ---------- */

      await Family.updateOne(
        { family_id: previousFamilyId },
        { $pull: { members: member._id } },
        { session }
      );

      /* ---------- CREATE NEW FAMILY ---------- */

      await Family.create(
        [
          {
            family_id: newFamilyId,
            head: member._id,
            members: [member._id]
          }
        ],
        { session }
      );

      /* ---------- UPDATE MEMBER ---------- */

      member.family_id = newFamilyId;
      // member.relationship = newRelationship;
      // member.is_head = newIsHead;


      // convert relation
      if (originalRelationship === "Son") {
        member.relationship = "Husband";
        member.is_head = true;
      }

      else if (originalRelationship === "Daughter") {
        member.relationship = "Wife";
        member.is_head = true;
      }
      member.child_label = "";

      // ❌ DO NOT CHANGE MEMBER ID

      newFamilyCreated = true;
    }




    /* ===============================
       4️⃣ FAMILY CHANGE (NORMAL CASE)
       ❌ SKIP IF NEW FAMILY CREATED
    =============================== */
    const familyChanged =
      !newFamilyCreated &&
      data.family_id &&
      data.family_id !== member.family_id;

    if (familyChanged) {
      member.old_family_id = member.family_id;
      member.family_changed_at = new Date();

      await Family.updateOne(
        { family_id: member.family_id },
        { $pull: { members: member._id } },
        { session }
      );

      await Family.updateOne(
        { family_id: data.family_id },
        {
          $addToSet: {
            members: member._id
          },
        },
        { session }
      );

      member.family_id = data.family_id;
    }


    /* ===============================
   🔥 RELABEL IF DOB CHANGED
=============================== */

    const isChild =
      member.relationship === "Son" ||
      member.relationship === "Daughter";

    const isDobUpdated =
      data.dob &&
      data.dob !== member.dob &&
      isChild &&
      !newFamilyCreated; // do not relabel during transfer


    /* ===============================
       5️⃣ UPDATE SAFE FIELDS
    =============================== */
    Object.keys(data).forEach((key) => {
      if (
        ![
          "member_id",
          "member_type",
          "family_id",
          "joining_date",
          "membership_from",
          "relationship",
        ].includes(key)
      ) {
        member[key] = data[key];
      }
    });



    //  rename photo if name changed
    if (
      member.photo &&
      oldMemberName !== member.member_name &&
      !req.file
    ) {
      const uploadsDir = path.join(__dirname, "..", "uploads", "memberPhotos");

      const safeId = safeMemberIdForFile(member.member_id);
      const safeName = member.member_name.replace(/\s+/g, "");
      const ext = path.extname(member.photo);

      const oldAbsolutePath = path.join(__dirname, "..", member.photo);
      const newFileName = `${safeId}(${safeName})${ext}`;
      const newAbsolutePath = path.join(uploadsDir, newFileName);

      if (fs.existsSync(oldAbsolutePath)) {
        fs.renameSync(oldAbsolutePath, newAbsolutePath);
        member.photo = `uploads/memberPhotos/${newFileName}`;
      }
    }







    /* ===============================
       7️⃣ SAVE MEMBER
    =============================== */
    await member.save({ session });


    if (isDobUpdated) {
      await relabelChildrenByDOB(member.family_id, session);
    }

    await session.commitTransaction();

    return res.json({
      status: "Success",
      message: "Member updated successfully",
      data: member,
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Update Member Error:", err);
    return res.status(400).json({
      status: "Failed",
      message: err.message || "Update failed",
    });
  } finally {
    session.endSession();
  }
};





exports.downloadMembersPDF = async (req, res) => {
  try {
    const members = await Member.find()
      .sort({ member_id: 1 })
      .lean();

    const pdfBuffer = generateMembersPDF(members);

    res.setHeader("Content-Type", "application/pdf");

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=Members.pdf"
    );

    res.send(Buffer.from(pdfBuffer));

  } catch (err) {
    console.error("PDF ERROR:", err);

    res.status(500).json({
      status: "Failed",
      message: err.message,
    });
  }
};




















