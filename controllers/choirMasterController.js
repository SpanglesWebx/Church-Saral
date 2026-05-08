const mongoose = require("mongoose");
const ChoirMaster = require("../Schema/ChoirMasterSchema");

exports.addChoirMaster = async (req, res) => {
  try {
    const { isMember, member, nonMemberName, nonMemberPhone, nonMemberAadhar } = req.body;

    if (isMember) {
      if (!member) {
        return res.status(400).json({ message: "Member selection required" });
      }

      // 🔥 Check if already exists
      const existing = await ChoirMaster.findOne({ member });

      if (existing) {
        return res.status(400).json({
          message: "This member is already added as Choir Master"
        });
      }
    } else {
      if (!nonMemberName || !nonMemberPhone) {
        return res.status(400).json({ message: "Non-member details incomplete" });
      }
    }

    const choirMaster = new ChoirMaster({
      isMember,
      member: isMember ? member : null,
      nonMemberName,
      nonMemberPhone,
      nonMemberAadhar,
      status: "Active",
    });

    await choirMaster.save();

    res.status(201).json({
      message: "Choir Master added successfully",
      choirMaster,
    });

  } catch (error) {

    // 🔥 Catch duplicate index error (E11000)
    if (error.code === 11000) {
      return res.status(400).json({
        message: "This member is already added as Choir Master"
      });
    }

    res.status(500).json({ message: "Server error", error });
  }
};



exports.getChoirMasters = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", status = "All" } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);

    const matchStage = {};

    if (status !== "All") {
      matchStage.status = status;
    }

    const pipeline = [
      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          as: "member"
        }
      },
      { $unwind: { path: "$member", preserveNullAndEmptyArrays: true } },
      { $match: matchStage }
    ];

    if (search) {
      pipeline.push({
        $match: {
          $or: [
            { nonMemberName: { $regex: search, $options: "i" } },
            { "member.member_name": { $regex: search, $options: "i" } },
            { "member.member_id": { $regex: search, $options: "i" } }
          ]
        }
      });
    }

    pipeline.push(
      { $sort: { createdAt: -1 } },
      { $skip: (pageNum - 1) * limitNum },
      { $limit: limitNum }
    );

    const data = await ChoirMaster.aggregate(pipeline);

    const totalPipeline = [...pipeline];
    totalPipeline.splice(-3); // remove sort/skip/limit
    totalPipeline.push({ $count: "total" });

    const totalResult = await ChoirMaster.aggregate(totalPipeline);
    const total = totalResult[0]?.total || 0;

    res.status(200).json({
      data,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum),
    });

  } catch (error) {
    console.error("GET CHOIR MASTERS ERROR:", error);
    res.status(500).json({ message: "Server error" });
  }
};



// Update Choir Master Status (Active -> Inactive only)
exports.updateChoirMasterStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, inactiveReason } = req.body;

    const choirMaster = await ChoirMaster.findById(id);
    if (!choirMaster) {
      return res.status(404).json({ message: "Choir Master not found" });
    }

    // Prevent reactivation
    if (choirMaster.status === "Inactive") {
      return res.status(400).json({ message: "Cannot reactivate once inactive" });
    }

    if (status === "Inactive") {
      choirMaster.status = "Inactive";
      choirMaster.inactiveDate = new Date();
      choirMaster.inactiveReason = inactiveReason || "";
    }

    await choirMaster.save();
    res.status(200).json({ message: "Status updated successfully", choirMaster });
  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};
