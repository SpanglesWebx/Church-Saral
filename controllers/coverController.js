const mongoose = require("mongoose");
const CoverOffering = require("../Schema/CoverOfferingSchema");
const generateTransId = require("../util/generateTransId");
const Member = require("../Schema/memberSchema");
const moment = require("moment");



exports.addCoverOffering = async (req, res) => {

  try {

    const { offertoryType, date, day, rows } = req.body;

    /* ================= BASIC VALIDATION ================= */

    if (!offertoryType || !date || !day || !Array.isArray(rows) || rows.length === 0) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    /* ================= DATE VALIDATION ================= */

    const parsedDate = new Date(date);

    if (isNaN(parsedDate.getTime())) {
      return res.status(400).json({ message: "Invalid date" });
    }

    /* ================= FINANCIAL YEAR ================= */

    let financialYear = null;

    if (offertoryType === "Monthly Offertory") {

      const fyStartYear =
        parsedDate.getMonth() >= 3
          ? parsedDate.getFullYear()
          : parsedDate.getFullYear() - 1;

      const fyEndYear = fyStartYear + 1;

      financialYear = `${fyStartYear}-${fyEndYear}`;
    }

    /* ================= FIND EXISTING DOCUMENT ================= */



    const doc = new CoverOffering({
      offertoryType,
      date: parsedDate,
      day,
      financialYear,
      entries: []
    });



    const memberIds = rows.map(r => r.member);
    if (new Set(memberIds).size !== memberIds.length) {
      return res.status(400).json({
        message: "Duplicate members are not allowed"
      });
    }

    /* ================= PROCESS ROWS ================= */

    for (const r of rows) {

      // skip empty rows
      if (!r.member && !r.amount && (!r.entries || r.entries.length === 0)) {
        continue;
      }

      if (!r.member) {
        return res.status(400).json({ message: "Member is required" });
      }

      if (!mongoose.Types.ObjectId.isValid(r.member)) {
        return res.status(400).json({ message: "Invalid member reference" });
      }

      /* ======================================================
         NON MONTHLY OFFERTORY
      ====================================================== */

      if (offertoryType !== "Monthly Offertory") {

        const amount = Number(r.amount);

        if (!amount || amount <= 0) {
          return res.status(400).json({
            message: "Amount must be greater than zero"
          });
        }

        let memberEntry = doc.entries.find(
          e => e.member.toString() === r.member
        );

        if (!memberEntry) {

          memberEntry = {
            member: r.member,
            amount: amount,
            months: []
          };

          doc.entries.push(memberEntry);

        } else {

          memberEntry.amount = amount;

        }

        continue;
      }

      /* ======================================================
         MONTHLY OFFERTORY
      ====================================================== */

      const monthEntries = r.entries || [];

      if (monthEntries.length === 0) {
        return res.status(400).json({
          message: "Select at least one month with amount"
        });
      }

      let memberEntry = doc.entries.find(
        e => e.member.toString() === r.member
      );

      if (!memberEntry) {

        doc.entries.push({
          member: r.member,
          months: []
        });

        memberEntry = doc.entries[doc.entries.length - 1];

      }

      for (const e of monthEntries) {

        if (!e.amount || Number(e.amount) <= 0) {
          return res.status(400).json({
            message: "Amount must be greater than zero"
          });
        }

        if (!e.month) {
          return res.status(400).json({
            message: "Month is required"
          });
        }




        // 🔥 CHECK ACROSS FINANCIAL YEAR (NOT DATE)
        const exists = await CoverOffering.findOne({
          offertoryType,

          ...(offertoryType === "Monthly Offertory" && {
            financialYear
          }),

          "entries": {
            $elemMatch: {
              member: r.member,
              months: {
                $elemMatch: { month: e.month }
              }
            }
          }
        });

        if (exists) {
          const memberData = await Member.findById(r.member)
            .select("member_id member_name");

          return res.status(409).json({
            message: `${memberData.member_name} already has ${e.month}`
          });
        }

        memberEntry.months.push({
          month: e.month,
          amount: Number(e.amount)
        });

      }

    }




    const formattedDate = moment(date).format("YYYY-MM-DD");
    const transId = await generateTransId("Cover", formattedDate);

    doc.transId = transId;

    await doc.save();


    return res.status(201).json({
      message: "Cover offering saved successfully"
    });

  }

  catch (err) {

    console.error("Cover offering error:", err);

    return res.status(500).json({
      message: "Server error while saving cover offering"
    });

  }

};


const getCurrentFinancialYear = () => {
  const today = new Date();

  const fyStartYear =
    today.getMonth() >= 3
      ? today.getFullYear()
      : today.getFullYear() - 1;

  const fyEndYear = fyStartYear + 1;

  return `${fyStartYear}-${fyEndYear}`;
};


exports.getCoverList = async (req, res) => {
  try {

    const {
      page = 1,
      limit = 25,
      memberId = "",
      memberName = "",
      offertoryType = ""
    } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const financialYear = getCurrentFinancialYear();

    /* ---------- BASE MATCH ---------- */

    const matchStage = {
      $or: [
        { offertoryType: "Monthly Offertory", financialYear },
        { offertoryType: { $ne: "Monthly Offertory" } }
      ]
    };

    if (offertoryType) {
      matchStage.offertoryType = offertoryType;
    }

    const pipeline = [

      /* 1️⃣ MATCH */
      { $match: matchStage },

      /* 2️⃣ UNWIND ENTRIES */
      { $unwind: "$entries" },

      /* 3️⃣ LOOKUP MEMBER */
      {
        $lookup: {
          from: "members",
          localField: "entries.member",
          foreignField: "_id",
          as: "member"
        }
      },

      { $unwind: "$member" },

      /* 4️⃣ SEARCH */
      {
        $match: {
          $or: [
            { "member.member_id": { $regex: memberId, $options: "i" } },
            { "member.member_name": { $regex: memberName, $options: "i" } }
          ]
        }
      },

      /* 5️⃣ PROJECT */
      {
        $project: {
          _id: 1,
          offertoryType: 1,
          date: 1,
          transId: 1,
          financialYear: 1,

          member: {
            member_id: "$member.member_id",
            member_name: "$member.member_name",
            primary_contact: "$member.primary_contact"
          },

          entries: {
            months: "$entries.months",
            amount: "$entries.amount"
          }
        }
      },


      // ✅ STEP 1: SORT FIRST (latest first)
      { $sort: { date: -1 } },
      {
        $group: {
          _id: {
            member: "$member.member_id",
            offertoryType: "$offertoryType"
          },

          // ✅ latest date only for display
          latestDate: { $max: "$date" },

          // ✅ member info
          member: { $first: "$member" },

          // ✅ collect ALL months (from all dates)
          allMonths: { $push: "$entries.months" }
        }
      },

      // ✅ flatten months
      {
        $project: {
          _id: 0,
          member: 1,
          offertoryType: "$_id.offertoryType",
          date: "$latestDate",

          months: {
            $reduce: {
              input: "$allMonths",
              initialValue: [],
              in: { $concatArrays: ["$$value", "$$this"] }
            }
          }
        }
      },

      // ✅ OPTIONAL: remove duplicates in backend
      {
        $addFields: {
          months: {
            $setUnion: ["$months", []]
          }
        }
      },

      { $sort: { date: -1 } }

    ];

    /* ---------- TOTAL COUNT ---------- */

    const totalData = await CoverOffering.aggregate([
      ...pipeline,
      { $count: "total" }
    ]);

    const total = totalData[0]?.total || 0;

    /* ---------- PAGINATION ---------- */

    const data = await CoverOffering.aggregate([
      ...pipeline,
      { $sort: { date: -1 } },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum }
    ]);

    res.json({
      data,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
      total
    });

  } catch (err) {
    console.error("GET COVER LIST ERROR:", err);
    res.status(500).json({ message: "Failed to fetch cover offerings" });
  }
};




exports.getCoverByMember = async (req, res) => {
  try {

    const { member_id, offertoryType } = req.query;

    if (!offertoryType) {
      return res.status(400).json({ message: "Offertory type is required" });
    }

    const financialYear = getCurrentFinancialYear();

    let memberObjectId = null;

    /* -------- FIND MEMBER IF PROVIDED -------- */

    if (member_id) {
      const Member = require("../Schema/memberSchema");

      const memberDoc = await Member.findOne({ member_id });

      if (!memberDoc) {
        return res.status(404).json({ message: "Member not found" });
      }

      memberObjectId = memberDoc._id;
    }

    /* -------- AGGREGATION PIPELINE -------- */

    const pipeline = [

      /* 1️⃣ Filter offertory type */
      { $match: { offertoryType } },

      /* 2️⃣ Monthly filter */
      ...(offertoryType === "Monthly Offertory"
        ? [{ $match: { financialYear } }]
        : []),

      /* 3️⃣ Split entries */
      { $unwind: "$entries" },

      /* 4️⃣ Filter member */
      ...(memberObjectId
        ? [{ $match: { "entries.member": memberObjectId } }]
        : []),

      /* 5️⃣ Split months 🔥 IMPORTANT */
      {
        $unwind: {
          path: "$entries.months",
          preserveNullAndEmptyArrays: true   // ✅ VERY IMPORTANT
        }
      },

      /* 6️⃣ Lookup member */
      {
        $lookup: {
          from: "members",
          localField: "entries.member",
          foreignField: "_id",
          as: "member"
        }
      },

      { $unwind: "$member" },

      /* 7️⃣ Final output */
      {
        $project: {
          member_id: "$member.member_id",
          member_name: "$member.member_name",

          offertoryType: 1,
          date: 1,
          transId: 1,

          month: "$entries.months.month",
          amount: {
            $ifNull: ["$entries.months.amount", "$entries.amount"] // ✅ FIX
          }
        }
      },

      /* 8️⃣ Sort */
      { $sort: { date: -1 } }

    ];

    const data = await CoverOffering.aggregate(pipeline);

    res.json({ data });

  } catch (err) {
    console.error("GET COVER BY MEMBER ERROR:", err);
    res.status(500).json({ message: "Server error while fetching data" });
  }
};



