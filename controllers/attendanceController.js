const Attendance = require("../Schema/Attendance");
const SundayClass = require("../Schema/SundayClass");


exports.addAttendance = async (req, res) => {
  try {
    const { class: classId, date, attendance } = req.body;

    if (!classId) {
      return res.status(400).json({ message: "Class is required" });
    }

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    if (!Array.isArray(attendance) || attendance.length === 0) {
      return res.status(400).json({ message: "Attendance list is empty" });
    }

    const totalStudents = attendance.length;
    const presentCount = attendance.filter(a => a.present === true).length;
    const absentCount = totalStudents - presentCount;

    const totalOffering = attendance.reduce(
      (sum, a) => sum + (a.present ? Number(a.amount || 0) : 0),
      0
    );

    const newAttendance = new Attendance({
      class: classId,
      date: new Date(date),
      totalStudents,
      presentCount,
      absentCount,
      totalOffering,
      attendance: attendance.map((a) => ({
        student: a.student,
        present: a.present,
        amount: a.present ? Number(a.amount || 0) : 0,
      })),
    });

    await newAttendance.save();

    res.status(201).json({
      message: "Attendance saved successfully",
      data: newAttendance,
    });

  } catch (err) {

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Attendance already exists for this class on this date",
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: Object.values(err.errors)
          .map(e => e.message)
          .join(", "),
      });
    }

    console.error("Attendance Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};






exports.updateAttendance = async (req, res) => {
  try {
    const { class: classId, date, attendance } = req.body;

    const updated = await Attendance.findOneAndUpdate(
      { class: classId, date: new Date(date) },
      {
        attendance: attendance.map((a) => ({
          student: a.student,
          present: a.present,
        })),
      },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Attendance not found" });
    }

    res.json(updated);
  } catch (err) {
    console.error("Update Attendance Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


exports.getAttendance = async (req, res) => {
  try {
    const { classId, date } = req.query;

    if (!classId || !date) {
      return res.status(400).json({ message: "Class and date required" });
    }

    const attendance = await Attendance.findOne({
      class: classId,
      date: new Date(date),
    }).populate("attendance.student", "member_id member_name");

    if (!attendance) {
      return res.json(null);
    }

    res.json(attendance);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date is required" });
    }

    const start = new Date(date);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const records = await Attendance.find({
      date: {
        $gte: start,
        $lte: end,
      },
    }).select("class date");

    res.json(records);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
