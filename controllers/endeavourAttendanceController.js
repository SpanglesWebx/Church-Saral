// controllers/endeavourAttendanceController.js
const EndeavourAttendance = require("../Schema/EndeavourAttendance");
const EndeavourClass = require("../Schema/EndeavourClass");

exports.addAttendance = async (req, res) => {
  try {
    const { class: classId, date, attendance } = req.body;

    if (!classId || !date || !Array.isArray(attendance)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const normalizedDate = new Date(date);

    const totalStudents = attendance.length;
    const presentCount = attendance.filter(a => a.present === true).length;
    const absentCount = totalStudents - presentCount;

    const totalOffering = attendance.reduce(
      (sum, a) => sum + (a.present ? Number(a.amount || 0) : 0),
      0
    );

    const newRecord = new EndeavourAttendance({
      class: classId,
      date: normalizedDate,
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

    await newRecord.save();

    res.status(201).json({
      message: "Attendance saved successfully",
      data: newRecord,
    });

  } catch (err) {

    if (err.code === 11000) {
      return res.status(400).json({
        message: "Attendance already exists for this class on this date",
      });
    }

    console.error("Endeavour Attendance Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Update attendance
exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, attendance } = req.body;

    const attendanceArray = Array.isArray(attendance)
      ? attendance
      : Object.keys(attendance).map((member_id) => ({
          member_id,
          present: attendance[member_id],
        }));

    const updated = await EndeavourAttendance.findOneAndUpdate(
      { class: id, date },
      { attendance: attendanceArray },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Attendance not found" });

    res.json(updated);
  } catch (err) {
    console.error("Error updating Endeavour attendance:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ✅ Get attendance
exports.getAttendance = async (req, res) => {
  try {
    const { classId, date } = req.query;

    if (!classId || !date) {
      return res.status(400).json({ message: "Class and date required" });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const attendance = await EndeavourAttendance.findOne({
      class: classId,
      date: { $gte: start, $lte: end },
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
