const MenActivity = require("../Schema/MenActivitySchema");




exports.getDashboardStats = async (req, res) => {
  try {

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total offering this month
    const offering = await MenActivity.aggregate([
      {
        $match: {
          status: "Completed",
          date: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: "$totalOffering" }
        }
      }
    ]);

    const totalOffering = offering[0]?.total || 0;

    const planned = await MenActivity.countDocuments({ status: "Planned" });

    const completed = await MenActivity.countDocuments({ status: "Completed" });

    // Nearest upcoming planned activity
    const nextActivity = await MenActivity
      .findOne({ status: "Planned" })
      .sort({ date: 1 });

    res.json({
      totalOffering,
      planned,
      completed,
      nextActivity
    });

  } catch (err) {

    res.status(500).json({
      status: "Failed",
      message: err.message
    });

  }
};



// Create Activity
exports.createActivity = async (req, res) => {
  try {

    const data = req.body;


    // ✅ Leader validation
    if (!data.leader || !data.leader.member) {
      return res.status(400).json({
        status: "Failed",
        message: "Please select valid leader from list"
      });
    }

    // Validation
    if (data.activityType === "house-visit" && (!data.houses || data.houses.length === 0)) {
      return res.status(400).json({
        status: "Failed",
        message: "House visit must include at least one house"
      });
    }


  

    // Format houses
    const houses = (data.houses || []).map(h => ({
      member: h.member || null,
      name: h.name,
      address: h.address || "",
      isMember: h.isMember ?? true,
      offering: Number(h.offering) || 0
    }));

    const activity = new MenActivity({
      date: data.date,
      activityType: data.activityType,
      title: data.title || "",
      churchName: data.churchName || "",
      churchLocation: data.churchLocation || "",
      customTitle: data.customTitle || "",
      leader: {
        member: data.leader?.member || null,
        name: data.leader?.name || ""
      },
      notes: data.notes || "",
      houses
    });

    await activity.save();

    res.status(201).json({
      status: "Success",
      message: "Activity Created",
      activity
    });

  } catch (err) {

    res.status(500).json({
      status: "Failed",
      message: err.message
    });

  }
};



exports.getActivities = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const { startDate, endDate, search, status } = req.query;

    const filter = {};

    // Date filter
    if (startDate && endDate) {
      filter.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
    }

    // Status filter
    if (status && status !== "All") {
      filter.status = status;
    }

    // Search filter (case-insensitive)
    if (search) {
      const regex = new RegExp(search, "i"); // insensitive
      filter.$or = [
        { activityType: regex },
        { title: regex },
        { churchName: regex },
        { customTitle: regex },
        { "leader.name": regex },
        { "houses.name": regex }, // search inside house members for house-visit
      ];
    }

    const [activities, total] = await Promise.all([
      MenActivity.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      MenActivity.countDocuments(filter),
    ]);

    res.json({
      activities,
      currentPage: page,
      totalPages: Math.ceil(total / limit),
    });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};





exports.markAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { attendees } = req.body;

    const activity = await MenActivity.findById(id);
    if (!activity) return res.status(404).json({ status: "Failed", message: "Activity not found" });

    if (activity.status === "Completed") {
      return res.status(400).json({ status: "Failed", message: "Cannot modify attendance of a completed activity" });
    }

    const formattedAttendees = attendees.map(a => ({
      member: a.isMember ? a.member : null,
      name: a.name,
      isMember: a.isMember,
      status: a.status
    }));

    activity.attendees = formattedAttendees;
    await activity.save();
    res.json({ status: "Success", message: "Attendance Updated", activity });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};

exports.getAttendanceSummary = async (req, res) => {
  try {
    const { id } = req.params; // activity ID
    const activity = await MenActivity.findById(id);

    if (!activity) return res.status(404).json({ message: "Activity not found" });

    const totalPresent = activity.attendees.filter(a => a.status === "present").length;
    const membersPresent = activity.attendees.filter(a => a.status === "present" && a.isMember).length;
    const guestsPresent = activity.attendees.filter(a => a.status === "present" && !a.isMember).length;
    const totalMembers = activity.attendees.filter(a => a.isMember).length;


    res.json({ totalPresent, membersPresent, guestsPresent, totalMembers });
  } catch (err) {
    res.status(500).json({ status: "Failed", message: err.message });
  }
};










exports.updateActivity = async (req, res) => {
  try {

    const { id } = req.params;
    const data = req.body;

    const activity = await MenActivity.findById(id);

    if (!activity) {
      return res.status(404).json({
        status: "Failed",
        message: "Activity not found"
      });
    }

    if (activity.status === "Completed") {
      return res.status(400).json({
        status: "Failed",
        message: "Completed activity cannot be modified"
      });
    }

    let houses = [];

    if (data.activityType === "house-visit" && data.houses?.length > 0) {

      houses = data.houses.map(h => ({
        member: h.isMember ? h.member : null,
        name: h.name,
        address: h.address,
        isMember: h.isMember,
        offering: Number(h.offering) || 0
      }));

    }

    const updatedActivity = await MenActivity.findByIdAndUpdate(
      id,
      { ...data, houses },
      { new: true }
    );

    res.json({
      status: "Success",
      message: "Activity Updated",
      activity: updatedActivity
    });

  } catch (err) {

    res.status(500).json({
      status: "Failed",
      message: err.message
    });

  }
};
