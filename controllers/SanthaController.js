const Santha = require("../Schema/SanthaSchema");
const Member = require("../Schema/memberSchema");
const generateTransId = require("../util/generateTransId");
const moment = require("moment");

exports.addSantha = async (req, res) => {
    try {
        const { date, day, rows } = req.body;

        /* ================= VALIDATION ================= */

        if (!date || !day) {
            return res.status(400).json({
                status: "Failed",
                message: "Date and Day required",
            });
        }

        if (!rows || !Array.isArray(rows) || rows.length === 0) {
            return res.status(400).json({
                status: "Failed",
                message: "Rows data required",
            });
        }

        const parsedDate = new Date(date);

        const year = new Date(date).getFullYear();
        const shortYear = String(year).slice(-2);

        const allowedMonths = [`Apr ${shortYear}`, `Sep ${shortYear}`];

        /* ================= PROCESS ROWS ================= */

        const entries = [];

        for (const r of rows) {
            if (!r.member) {
                return res.status(400).json({
                    status: "Failed",
                    message: "Member is required",
                });
            }

            if (!r.entries || r.entries.length === 0) {
                return res.status(400).json({
                    status: "Failed",
                    message: "At least one month required",
                });
            }

            const months = [];

            for (const m of r.entries) {
                // ✅ Only Apr / Sep
                if (!allowedMonths.includes(m.month)) {
                    return res.status(400).json({
                        status: "Failed",
                        message: "Only Apr and Sep allowed",
                    });
                }

                // ✅ Amount validation
                if (!m.amount || m.amount <= 0) {
                    return res.status(400).json({
                        status: "Failed",
                        message: "Amount must be greater than 0",
                    });
                }

                months.push({
                    month: m.month,
                    amount: m.amount,
                });
            }

            entries.push({
                member: r.member,
                months,
            });
        }


        // ================= DUPLICATE CHECK (DB LEVEL) =================

        for (const r of rows) {

            const memberData = await Member.findById(r.member)
                .select("member_id member_name");

            for (const m of r.entries) {

                const exists = await Santha.findOne({
                    date: parsedDate,
                    entries: {
                        $elemMatch: {
                            member: r.member,
                            months: {
                                $elemMatch: { month: m.month }
                            }
                        }
                    }
                });

                if (exists) {
                    return res.status(409).json({
                        status: "Failed",
                        message: `${memberData?.member_id} - ${memberData?.member_name} already has ${m.month} for this date`
                    });
                }
            }
        }





        // 1️⃣ Create doc WITHOUT transId
        const doc = new Santha({
            date: parsedDate,
            day,
            entries,
        });


        // 2️⃣ Generate TransId AFTER ALL VALIDATIONS
        const formattedDate = moment(date).format("YYYY-MM-DD");
        const transId = await generateTransId("Santha", formattedDate);

        // 3️⃣ Assign
        doc.transId = transId;

        await doc.save();

        return res.status(200).json({
            status: "Success",
            message: "Santha added successfully",
        });

    } catch (err) {
        console.error(err);

        return res.status(500).json({
            status: "Failed",
            message: "Server error",
        });
    }
};






exports.getSanthaMembers = async (req, res) => {
    try {
        const { search = "", page = 1, limit = 25 } = req.query;

        const year = new Date().getFullYear();
        const start = new Date(`${year}-01-01`);
        const end = new Date(`${year}-12-31`);

        // ✅ STEP 1: GET SANATHA DOCS
        const docs = await Santha.find({
            date: { $gte: start, $lte: end },
        });

        // ✅ STEP 2: UNIQUE MEMBER IDS
        const memberSet = new Set();

        docs.forEach((doc) => {
            doc.entries.forEach((e) => {
                memberSet.add(e.member.toString());
            });
        });

        const memberIds = Array.from(memberSet);

        // ✅ STEP 3: BUILD QUERY
        const query = {
            _id: { $in: memberIds },
        };

        if (search) {
            query.$or = [
                { member_id: { $regex: search, $options: "i" } },
                { member_name: { $regex: search, $options: "i" } },
            ];
        }

        // ✅ STEP 4: FETCH MEMBERS
        const members = await Member.find(query)
            .select("_id member_id member_name member_tamil_name");

        // ✅ STEP 5: PAGINATION
        const total = members.length;
        const startIndex = (page - 1) * limit;

        const paginated = members.slice(
            startIndex,
            startIndex + Number(limit)
        );

        return res.json({
            data: paginated,
            totalPages: Math.ceil(total / limit),
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error fetching Santha members",
        });
    }
};




exports.getSanthaByMember = async (req, res) => {
    try {
        const { memberId } = req.query;

        if (!memberId) {
            return res.status(400).json({
                message: "MemberId required",
            });
        }

        const mongoose = require("mongoose");
        const memberObjectId = new mongoose.Types.ObjectId(memberId);

        const year = new Date().getFullYear();

        const docs = await Santha.find({
            "entries.member": memberObjectId,
        })
            .populate({
                path: "entries.member",
                select: "member_id member_name family_id primary_contact",
            })
            .lean();

        let months = [];
        let grandTotal = 0;

        docs.forEach((doc) => {
            if (new Date(doc.date).getFullYear() === year) {
                doc.entries.forEach((e) => {
                    if (e.member._id.equals(memberObjectId)) {
                        e.months.forEach((m) => {
                               grandTotal += m.amount;
                            months.push({
                                month: m.month,
                                amount: m.amount,
                                date: doc.date,
                                transId: doc.transId,
                                member_id: e.member.member_id,
                                member_name: e.member.member_name,
                                family_id: e.member.family_id,
                                primary_contact: e.member.primary_contact,
                            });
                        });
                    }
                });
            }
        });

        return res.json({
            data: months,
            grandTotal,
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: "Error fetching member data",
        });
    }
};








exports.getSanthaReport = async (req, res) => {
  try {
    const { fromdate, todate, search = "", page = 1, limit = 25 } = req.query;

    const from = new Date(fromdate);
    const to = new Date(todate);

    const docs = await Santha.aggregate([
      {
        $match: {
          date: { $gte: from, $lte: to },
        },
      },
      { $unwind: "$entries" },

      {
        $group: {
          _id: "$entries.member",
        },
      },

      {
        $lookup: {
          from: "members",
          localField: "_id",
          foreignField: "_id",
          as: "member",
        },
      },

      { $unwind: "$member" },

      {
        $match: search
          ? {
              $or: [
                { "member.member_id": { $regex: search, $options: "i" } },
                { "member.member_name": { $regex: search, $options: "i" } },
              ],
            }
          : {},
      },

      {
        $project: {
          _id: "$member._id",
          member_id: "$member.member_id",
          member_name: "$member.member_name",
          member_tamil_name: "$member.member_tamil_name",
        },
      },

      { $sort: { member_id: 1 } },
    ]);

    // pagination (manual)
    const total = docs.length;
    const start = (page - 1) * limit;

    const data = docs.slice(start, start + Number(limit));

    res.json({
      data,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error in report" });
  }
};






exports.getSanthaReportByMember = async (req, res) => {
  try {
    const { memberId } = req.params;
    const { fromdate, todate } = req.query;

    const from = new Date(fromdate);
    const to = new Date(todate);

    const mongoose = require("mongoose");

    const result = await Santha.aggregate([
      {
        $match: {
          date: { $gte: from, $lte: to },
          "entries.member": new mongoose.Types.ObjectId(memberId),
        },
      },

      { $unwind: "$entries" },

      {
        $match: {
          "entries.member": new mongoose.Types.ObjectId(memberId),
        },
      },

      { $unwind: "$entries.months" },

      {
        $lookup: {
          from: "members",
          localField: "entries.member",
          foreignField: "_id",
          as: "member",
        },
      },

      { $unwind: "$member" },

      {
        $project: {
          date: 1,
          transId: 1,
          month: "$entries.months.month",
          amount: "$entries.months.amount",
          member_id: "$member.member_id",
          member_name: "$member.member_name",
          family_id: "$member.family_id",
          primary_contact: "$member.primary_contact",
        },
      },

      { $sort: { date: -1 } },
    ]);

    /* ================= TOTAL CALCULATIONS ================= */

    let grandTotal = 0;
    const dateTotals = {};

    result.forEach((item) => {
      // Grand total
      grandTotal += item.amount;

      // Date-wise total
      const d = new Date(item.date).toLocaleDateString("en-GB");

      if (!dateTotals[d]) dateTotals[d] = 0;
      dateTotals[d] += item.amount;
    });

    res.json({
      data: result,
      grandTotal,
      dateTotals,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching member report" });
  }
};