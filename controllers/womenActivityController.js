const WomenActivity = require("../Schema/WomenActivitySchema");
exports.createActivity = async (req, res) => {
  try {

    const data = req.body;

    let houses = [];

    if (data.activityType === "house-visit" && data.houses?.length > 0) {

      houses = data.houses.map(h => {

        // Member house
        if (h.isMember) {
          return {
            member: h.member || null,
            name: h.name,
            address: h.address || "",
            isMember: true,
            offering: 0
          };
        }

        // Non-member house
        return {
          member: null,
          name: h.name,
          address: h.address,
          isMember: false,
          offering: 0
        };

      });

    }

    const activity = new WomenActivity({
      date: data.date,
      activityType: data.activityType,
      title: data.title,
      churchName: data.churchName,
      churchLocation: data.churchLocation,
      customTitle: data.customTitle,
      leader: data.leader,
      notes: data.notes,
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
// ✅ Get Activities with filters + pagination
exports.getActivities = async (req, res) => {
  try {

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;   // ✅ FIX
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

    // Search filter
    if (search) {
      const regex = new RegExp(search, "i");
      filter.$or = [
        { activityType: regex },
        { title: regex },
        { churchName: regex },
        { customTitle: regex },
        { "leader.name": regex },
        { "houses.name": regex },
      ];
    }

    const [activities, total] = await Promise.all([
      WomenActivity.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),

      WomenActivity.countDocuments(filter),
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



exports.getDashboardStats = async (req, res) => {
  try {

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Total offering this month
    const offering = await WomenActivity.aggregate([
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

    const planned = await WomenActivity.countDocuments({ status: "Planned" });

    const completed = await WomenActivity.countDocuments({ status: "Completed" });

    // next upcoming activity
    const nextActivity = await WomenActivity
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

// ✅ Mark Attendance
exports.markAttendance = async (req, res) => {

  try {

    const { id } = req.params;
    const { attendees } = req.body;

    const activity = await WomenActivity.findById(id);

    if (!activity) {
      return res.status(404).json({
        status: "Failed",
        message: "Activity not found"
      });
    }

    if (activity.status === "Completed") {
      return res.status(400).json({
        status: "Failed",
        message: "Cannot modify attendance of completed activity"
      });
    }

    const formattedAttendees = attendees.map(a => ({
      member: a.isMember ? a.member : null,
      name: a.name,
      isMember: a.isMember,
      status: a.status
    }));

    activity.attendees = formattedAttendees;

    await activity.save();

    res.json({
      status: "Success",
      message: "Attendance Updated",
      activity
    });

  } catch (err) {

    res.status(500).json({
      status: "Failed",
      message: err.message
    });

  }

};
// ✅ Attendance Summary
exports.getAttendanceSummary = async (req, res) => {
  try {
    const { id } = req.params;
    const activity = await WomenActivity.findById(id);

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

// ✅ Update Activity
exports.updateActivity = async (req, res) => {
  try {

    const id = req.params.id;
    const data = req.body;

    let houses = [];

    if (data.activityType === "house-visit" && data.houses?.length > 0) {

      houses = data.houses.map(h => ({
        member: h.isMember ? h.member : null,
        name: h.name,
        address: h.address,
        isMember: h.isMember,
        offering: h.offering || 0
      }));

    }

    const updated = await WomenActivity.findByIdAndUpdate(
      id,
      { ...data, houses },
      { new: true }
    );

    res.json({
      status: "Success",
      message: "Activity Updated",
      activity: updated
    });

  } catch (err) {

    res.status(500).json({
      status: "Failed",
      message: err.message
    });

  }
};