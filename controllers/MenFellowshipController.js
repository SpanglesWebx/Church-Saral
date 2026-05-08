const MenFellowship = require("../Schema/MenFellowship");
const Member = require("../Schema/memberSchema");

exports.addMenFellowshipMember = async (req, res) => {
  try {

    const { member } = req.body;

    if (!member) {
      return res.status(400).json({
        message: "Member selection required"
      });
    }

    // Validate member
    const memberData = await Member.findOne({
      _id: member,
      gender: "Male",
      status: "Active"
    });

    if (!memberData) {
      return res.status(400).json({
        message: "Only active male church members can be added"
      });
    }

    // Prevent duplicate
    const exists = await MenFellowship.findOne({ member });

    if (exists) {
      return res.status(400).json({
        message: "This member is already added to Men's Fellowship"
      });
    }

    const newMember = new MenFellowship({
      member
    });

    await newMember.save();

    res.status(201).json({
      message: "Member added to Men's Fellowship successfully"
    });

  } catch (err) {

    console.error("❌ Men Fellowship Add Error:", err);

    res.status(500).json({
      message: "Server error"
    });

  }
};


exports.getMenFellowshipMembers = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const search = req.query.search || "";

    const skip = (page - 1) * limit;

    const matchStage = {
      "member.status": "Active",
      "member.gender": "Male"
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
          _id: "$member._id",
          member_id: "$member.member_id",
          member_name: "$member.member_name",
          member_tamil_name: "$member.member_tamil_name",
          mobile_number: "$member.primary_contact"
        }
      }

    ];

    // Get paginated data
    const data = await MenFellowship.aggregate([
      ...pipeline,
      { $skip: skip },
      { $limit: limit }
    ]);

    // Count total documents
    const totalCount = await MenFellowship.aggregate(pipeline);

    res.json({
      data,
      totalPages: Math.ceil(totalCount.length / limit)
    });

  } catch (err) {

    console.error("❌ Men Fellowship Fetch Error:", err);

    res.status(500).json({
      message: "Server error"
    });

  }
};

