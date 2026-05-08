const Member = require("../Schema/memberSchema");
const Family = require("../Schema/familySchema");


// ================================
// MEMBER COUNT + MEMBER TYPES
// ================================
exports.getMemberCount = async (req, res) => {
  try {

    // Total Members
    const totalMembers = await Member.countDocuments();

    // Head Members
    const headYes = await Member.countDocuments({
      is_head: true
    });

     // Non Head Members
    const headNo = await Member.countDocuments({
      is_head: false
    });

    // Member Types Count
    const memberTypes = await Member.aggregate([
      {
        $group: {
          _id: "$member_type",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      totalMembers: [{ count: totalMembers }],
      memberTypes: memberTypes,
      headYes: [{ count: headYes }],
      headNo: [{ count: headNo }]
    });

  } catch (error) {
    console.error("Dashboard Member Error:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};



// ================================
// FAMILY COUNT
// ================================
exports.getFamilyCount = async (req, res) => {
  try {

    const totalFamilies = await Family.countDocuments();

    res.json({
      totalFamilies
    });

  } catch (error) {
    console.error("Dashboard Family Error:", error);
    res.status(500).json({
      message: "Server Error"
    });
  }
};