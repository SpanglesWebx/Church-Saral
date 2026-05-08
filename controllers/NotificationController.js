const Notification = require("../Schema/NotificationSchema");




exports.addNotification = async (req, res) => {
  try {
    const { heading, items } = req.body;

    if (!heading || !items?.length) {
      return res.status(400).json({
        success: false,
        message: "Heading and items required"
      });
    }

    const notification = await Notification.create({
      heading,
      items,
      status: "Active"
    });

    const io = req.app.get("io");
    if (io) {
      io.emit("new_notification", notification);
    }

    res.json({
      success: true,
      data: notification
    });

  } catch (err) {
    console.error("Add Notification Error:", err);

    res.status(500).json({
      success: false,
      message: "Error saving notification"
    });
  }
};





exports.getMemberNotifications = async (req, res) => {

  try {

    const { memberId } = req.params;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const notifications = await Notification
      .find({
        status: "Active",
        "items.date": { $gte: today }   // Mongo filters valid notifications
      })
      .select("heading items seenBy createdAt updatedAt")
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    const formatted = notifications.map(n => {

      const validItems = (n.items || []).filter(item => {

        const itemDate = new Date(item.date);
        itemDate.setHours(0, 0, 0, 0);

        return itemDate >= today;

      });

      const seen = (n.seenBy || []).some(
        s => String(s.memberId) === String(memberId)
      );

      return {
        _id: n._id,
        heading: n.heading,
        items: validItems,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
        seen
      };

    });

    res.json({
      success: true,
      notifications: formatted
    });

  } catch (err) {

    console.error("Member notification error:", err);

    res.status(500).json({
      success: false,
      message: "Server error"
    });

  }

};



exports.updateNotification = async (req, res) => {

  try {

    const { id } = req.params;
    const { heading, items } = req.body;

    const updated = await Notification.findByIdAndUpdate(
      id,
      {
        heading,
        items,
        seenBy: []   // 🔔 Reset seen status after edit
      },
      { new: true }
    );

    // optional realtime emit
    const io = req.app.get("io");
    io.emit("notification_updated", updated);

    res.json({
      success: true,
      data: updated
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Update failed"
    });

  }

};


exports.markSeen = async (req, res) => {

  try {

    const { notificationId, memberId } = req.body;

    await Notification.updateOne(
      {
        _id: notificationId,
        "seenBy.memberId": { $ne: memberId } // only if not exists
      },
      {
        $push: {
          seenBy: {
            memberId,
            seenAt: new Date()
          }
        }
      }
    );

    res.json({ success: true });

  } catch (err) {

    console.error("Mark seen error:", err);

    res.status(500).json({ success: false });

  }

};




exports.markAllSeen = async (req, res) => {

  try {

    const { memberId } = req.body;

    await Notification.updateMany(
      {
        status: "Active",
        "seenBy.memberId": { $ne: memberId }
      },
      {
        $push: {
          seenBy: {
            memberId,
            seenAt: new Date()
          }
        }
      }
    );

    res.json({ success: true });

  } catch (err) {

    console.error(err);
    res.status(500).json({ success: false });

  }

};





exports.listNotifications = async (req, res) => {

  try {

    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 25;
    const skip = (page - 1) * limit;

    const search = req.query.search || "";

    const status = req.query.status;

    const filter = {};

    if (search) {
      filter.heading = { $regex: search, $options: "i" };
    }

    if (status) {
      filter.status = status;
    }

    const data = await Notification
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Notification.countDocuments(filter);

    res.json({
      data,
      totalPages: Math.ceil(total / limit)
    });

  } catch (err) {
    res.status(500).json({ message: "Error" });
  }

};



exports.updateNotificationStatus = async (req, res) => {

  try {

    const { id } = req.params;
    const { status } = req.body;

    await Notification.findByIdAndUpdate(id, { status });

    res.json({ message: "Status updated" });

  } catch (err) {
    res.status(500).json({ message: "Error updating status" });
  }

};