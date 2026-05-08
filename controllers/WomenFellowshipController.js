const WomenFellowship = require("../Schema/WomenFellowship");
const Member = require("../Schema/memberSchema");

exports.addWomenFellowshipMember = async (req, res) => {
  try {

    const { member } = req.body; // ObjectId

    if (!member) {
      return res.status(400).json({
        message: "Member selection required"
      });
    }

    // Check member exists
    const memberData = await Member.findOne({
      _id: member,
      gender: "Female",
      status: "Active"
    });

    if (!memberData) {
      return res.status(400).json({
        message: "Only active female church members can be added"
      });
    }

    // Check duplicate
    const exists = await WomenFellowship.findOne({ member });

    if (exists) {
      return res.status(400).json({
        message: "This member is already added to Women's Fellowship"
      });
    }

    const newMember = new WomenFellowship({
      member
    });

    await newMember.save();

    res.status(201).json({
      message: "Member added to Women's Fellowship successfully"
    });

  } catch (err) {
    console.error("❌ Women Fellowship Add Error:", err);

    res.status(500).json({
      message: "Server error"
    });
  }
};

// 📋 Get all Women’s Fellowship members
exports.getWomenFellowshipMembers = async (req, res) => {

  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    
    const search = req.query.name || "";


    const skip = (page - 1) * limit;

    const matchStage = {
      "member.status": "Active",
      "member.gender": "Female"
    };

    if (search) {
      matchStage.$or = [
        { "member.member_id": { $regex: search, $options: "i" } },
        { "member.member_name": { $regex: search, $options: "i" } }
      ];
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
      { $unwind: "$member" },
      { $match: matchStage },
      {
        $project: {
          _id: "$member._id", // ✅ return Members id
          member_id: "$member.member_id",
          member_name: "$member.member_name",
          member_tamil_name: "$member.member_tamil_name",
          mobile_number: "$member.primary_contact"
        }
      }
    ];

    const total = await WomenFellowship.aggregate(pipeline);

    const data = await WomenFellowship.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limit }
    ]);

    res.json({
      data,
      totalPages: Math.ceil(total.length / limit)
    });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Server error" });

  }

};