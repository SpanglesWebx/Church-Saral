
const mongoose = require("mongoose");
const ChoirSubscription = require("../Schema/ChoirSubscriptionSchema");
const ChoirSubscriptionAmount = require("../Schema/ChoirSubscriptionAmountSchema");

exports.addChoirSubscription = async (req, res) => {
  try {
    const { member, amount, date } = req.body;

    if (!member || !mongoose.Types.ObjectId.isValid(member)) {
      return res.status(400).json({ message: "Invalid member" });
    }

    if (!amount || amount <= 0) {
      return res.status(400).json({ message: "Invalid amount" });
    }

    // 🔥 Use payment date for year
    const paymentDate = date ? new Date(date) : new Date();
    const year = paymentDate.getFullYear();

    // 🔥 Get required amount of that year
    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const requiredDoc = await ChoirSubscriptionAmount.findOne({
      createdAt: {
        $gte: startOfYear,
        $lte: endOfYear
      }
    }).sort({ createdAt: -1 });

    const requiredAmount = requiredDoc ? requiredDoc.requiredAmount : 0;

    // 🔥 Find by member + year
    let doc = await ChoirSubscription.findOne({ member, year });

    if (!doc) {
      doc = new ChoirSubscription({
        member,
        year,
        subscriptions: [],
        totalAmount: 0,
        status: "Pending"
      });
    }

    // Add subscription
    doc.subscriptions.push({
      amount,
      date: paymentDate
    });

    doc.totalAmount += Number(amount);

    doc.status = doc.totalAmount >= requiredAmount
      ? "Completed"
      : "Pending";

    doc.statusUpdatedAt = new Date();

    await doc.save();

    res.status(200).json({
      message: "Subscription added successfully",
      data: doc
    });

  } catch (err) {
    console.error("ADD SUB ERROR:", err);
    res.status(500).json({ message: "Failed to add subscription" });
  }
};










exports.getChoirSubscriptions = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = "", status } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const currentYear = new Date().getFullYear();

    let matchStage = {
      year: currentYear   // 🔥 Only current year
    };
    if (status) {
      matchStage.status = status;
    }

    const aggregateQuery = [
      { $match: matchStage },

      {
        $lookup: {
          from: "members",
          localField: "member",
          foreignField: "_id",
          as: "memberData"
        }
      },
      { $unwind: "$memberData" },

      ...(search ? [{
        $match: {
          $or: [
            { "memberData.member_name": { $regex: search, $options: "i" } },
            { "memberData.member_id": { $regex: search, $options: "i" } },
            { "memberData.primary_contact": { $regex: search, $options: "i" } }
          ]
        }
      }] : []),

      { $sort: { createdAt: -1 } },

      {
        $facet: {
          data: [
            { $skip: (pageNum - 1) * limitNum },
            { $limit: limitNum }
          ],
          totalCount: [{ $count: "count" }]
        }
      }
    ];

    const result = await ChoirSubscription.aggregate(aggregateQuery);

    const data = result[0].data;
    const total = result[0].totalCount[0]?.count || 0;

    res.json({
      data,
      total,
      currentPage: pageNum,
      totalPages: Math.ceil(total / limitNum)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch subscriptions" });
  }
};






exports.getChoirSubscriptionByMemberId = async (req, res) => {
  try {
    const { member } = req.query;

    if (!member || !mongoose.Types.ObjectId.isValid(member)) {
      return res.status(400).json({ message: "Valid member ObjectId required" });
    }

    const currentYear = new Date().getFullYear();

    const data = await ChoirSubscription.findOne({
      member,
      year: currentYear   // 🔥 Only current year
    })
      .populate("member", "member_id member_name primary_contact")
      .lean();

    if (!data) {
      return res.status(404).json({
        message: `No subscription found for ${currentYear}`
      });
    }

    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};









exports.addChoirSubscriptionRequiredAmount = async (req, res) => {
  try {
    const { requiredAmount } = req.body;

    const year = new Date().getFullYear();

    const data = await ChoirSubscriptionAmount.findOneAndUpdate(
      { year },
      { requiredAmount },
      { new: true, upsert: true }
    );

    res.json({
      message: "Required amount saved",
      data
    });

  } catch (err) {
    res.status(500).json({ message: "Error saving amount" });
  }
};




exports.getChoirSubscriptionRequiredAmounts = async (req, res) => {
  try {
    const now = new Date();
    const year = now.getFullYear();

    const startOfYear = new Date(year, 0, 1);
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999);

    const latestAmount = await ChoirSubscriptionAmount.findOne({
      createdAt: {
        $gte: startOfYear,
        $lte: endOfYear
      }
    }).sort({ createdAt: -1 });

    res.json({
      data: latestAmount
    });

  } catch (err) {
    res.status(500).json({ message: "Failed to fetch required amount" });
  }
};

