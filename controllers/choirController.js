const mongoose = require("mongoose");
const ChoirMember = require("../Schema/ChoirMemberSchema");




exports.addChoirMember = async (req, res) => {
  try {
    const { member } = req.body;

    if (!member) {
      return res.status(400).json({ message: "Member is required" });
    }

    // 🔥 Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(member)) {
      return res.status(400).json({ message: "Invalid member ID" });
    }

    const existing = await ChoirMember.findOne({ member });
    if (existing) {
      return res.status(400).json({ message: "Member already in choir" });
    }

    const newMember = new ChoirMember({ member });
    await newMember.save();

    res.status(201).json({ message: "Choir member added successfully" });

  } catch (err) {
    console.error("ADD CHOIR ERROR:", err);  // 🔥 IMPORTANT
    res.status(500).json({ message: "Server error" });
  }
};







// Get all Choir Members (with pagination + search)
exports.getChoirMembers = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "" } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    // Build member search filter
    let memberMatch = {};

    if (search) {
      memberMatch = {
        $or: [
          { member_name: { $regex: search, $options: "i" } },
          { member_id: { $regex: search, $options: "i" } }
        ]
      };
    }

    // Fetch with populate
    const members = await ChoirMember.find()
      .populate({
        path: "member",
        match: memberMatch,
        select: "member_id member_name primary_contact status"
      })
      .sort({ createdAt: -1 });

    // Remove records where populate didn't match search
    const filtered = members.filter(m => m.member !== null);

    const total = filtered.length;

    const paginated = filtered.slice(skip, skip + Number(limit));

    res.json({
      members: paginated,
      total,
      currentPage: Number(page),
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
