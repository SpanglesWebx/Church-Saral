const Member = require("../Schema/memberSchema");

const { SundaySchoolEvent } = require("../Schema/sundaysclEventSchema");
const SundaySchoolClass = require("../Schema/SundayClass");
const SundayExam = require("../Schema/sundayExamSchema");
const Attendance = require("../Schema/Attendance");


const EndeavourClass = require("../Schema/EndeavourClass");
const EndeavourExam = require("../Schema/endeavourExamSchema");
const { EndeavourEvent } = require("../Schema/endeavourEventSchema");
const EndeavourAttendance = require("../Schema/EndeavourAttendance");



exports.getSundaySchoolDashboard = async (req, res) => {
  try {

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    /* --------------------------------
       PARALLEL DATABASE CALLS
    -------------------------------- */

    const [
      totalClasses,
      teacherIds,
      studentAgg,
      eventsThisMonth,
      recentExam,
      recentEvent
    ] = await Promise.all([

      // total classes
      SundaySchoolClass.countDocuments(),

      // teachers (distinct ObjectId)
      SundaySchoolClass.distinct("teacher"),

      // total students (aggregation)
      SundaySchoolClass.aggregate([
        {
          $project: {
            studentCount: { $size: "$students" }
          }
        },
        {
          $group: {
            _id: null,
            totalStudents: { $sum: "$studentCount" }
          }
        }
      ]),

      // events this month
      SundaySchoolEvent.countDocuments({
        eventDate: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      }),

      // recent exam
      SundayExam.findOne()
        .sort({ createdAt: -1 })
        .select("examName examDate examcenter"),

      // recent event
      SundaySchoolEvent.findOne()
        .sort({ createdAt: -1 })
        .select("eventName eventDate venue")
    ]);

    const totalStudents =
      studentAgg.length > 0 ? studentAgg[0].totalStudents : 0;

    const totalTeachers = teacherIds.length;

    /* --------------------------------
       RESPONSE
    -------------------------------- */

    res.json({
      totalStudents,
      totalClasses,
      totalTeachers,
      eventsThisMonth,
      announcements: {
        exam: recentExam,
        event: recentEvent
      }
    });

  } catch (error) {

    console.error("Dashboard Error:", error);

    res.status(500).json({
      message: error.message
    });

  }
};



exports.getSundaySclTeacherDashboard = async (req, res) => {

    try {

        const { teacherId } = req.params;

        if (!teacherId) {
            return res.status(400).json({
                message: "Invalid teacher id"
            });
        }

        /* -----------------------------
         GET TEACHER CLASS
      ----------------------------- */

        const Member = require("../Schema/memberSchema");

        // 🔹 Find member using member_id
        const teacherMember = await Member.findOne({ member_id: teacherId });

        if (!teacherMember) {
            return res.status(404).json({
                message: "Teacher not found"
            });
        }

        // 🔹 Now find class using ObjectId
        const teacherClass = await SundaySchoolClass.findOne({
            teacher: teacherMember._id
        })
            .populate("teacher", "member_name member_id")
            .populate("students", "member_name member_id");

        if (!teacherClass) {
            return res.status(404).json({
                message: "Teacher class not found"
            });
        }

        const totalStudents = teacherClass.students.length;

        const className = `${teacherClass.class_name} - ${teacherClass.section_name}`;
        /* -----------------------------
           RECENT EVENTS
        ----------------------------- */

        const events = await SundaySchoolEvent.find({
            "classEvents.className": className
        })
            .sort({ eventDate: -1 })
            .limit(2)
            .select("eventName eventDate venue");

        /* -----------------------------
           RECENT EXAMS
        ----------------------------- */

        const exams = await SundayExam.find({
            "classExams.className": className
        })
            .sort({ examDate: -1 })
            .limit(2)
            .select("examName examDate examcenter");

        /* -----------------------------
           TODAY ATTENDANCE
        ----------------------------- */

        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        const attendance = await Attendance.findOne({
            class: teacherClass._id,
            date: { $gte: startOfDay, $lte: endOfDay }
        })
            .populate("attendance.student", "member_name member_id");

        let attendanceData = {
            marked: false,
            present: 0,
            absent: 0,
            totalOffering: 0,
            students: []
        };

        if (attendance) {

            const presentCount = attendance.attendance.filter(a => a.present).length;

            attendanceData = {
                marked: true,
                present: presentCount,
                absent: attendance.attendance.length - presentCount,
                totalOffering: attendance.totalOffering,
                students: attendance.attendance
            };

        }

        /* -----------------------------
           RESPONSE
        ----------------------------- */

        res.json({
            class: teacherClass,
            totalStudents,
            events,
            exams,
            attendance: attendanceData
        });

    } catch (error) {

        console.error("Teacher dashboard error:", error);

        res.status(500).json({
            message: "Dashboard error"
        });

    }

};







exports.getEndeavourDashboard = async (req, res) => {
  try {

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    /* --------------------------------
       PARALLEL DATABASE CALLS
    -------------------------------- */

    const [
      totalClasses,
      teacherIds,
      studentAgg,
      eventsThisMonth,
      recentExam,
      recentEvent
    ] = await Promise.all([

      // total classes
      EndeavourClass.countDocuments(),

      // teachers (distinct ObjectId)
      EndeavourClass.distinct("teacher"),

      // total students (aggregation)
      EndeavourClass.aggregate([
        {
          $project: {
            studentCount: { $size: "$students" }
          }
        },
        {
          $group: {
            _id: null,
            totalStudents: { $sum: "$studentCount" }
          }
        }
      ]),

      // events this month
      EndeavourEvent.countDocuments({
        eventDate: {
          $gte: startOfMonth,
          $lte: endOfMonth
        }
      }),

      // recent exam
      EndeavourExam.findOne()
        .sort({ createdAt: -1 })
        .select("examName examDate examcenter"),

      // recent event
      EndeavourEvent.findOne()
        .sort({ createdAt: -1 })
        .select("eventName eventDate venue")
    ]);

    const totalStudents =
      studentAgg.length > 0 ? studentAgg[0].totalStudents : 0;

    const totalTeachers = teacherIds.length;

    /* --------------------------------
       RESPONSE
    -------------------------------- */

    res.json({
      totalStudents,
      totalClasses,
      totalTeachers,
      eventsThisMonth,
      announcements: {
        exam: recentExam,
        event: recentEvent
      }
    });

  } catch (error) {

    console.error("Endeavour Dashboard Error:", error);

    res.status(500).json({
      message: error.message
    });

  }
};



exports.getEndeavourTeacherDashboard = async (req, res) => {

  try {

    const { teacherId } = req.params;

    if (!teacherId) {
      return res.status(400).json({
        message: "Invalid teacher id"
      });
    }

    /* ----------------------------------
       GET TEACHER MEMBER
    ---------------------------------- */

    const teacherMember = await Member.findOne({
      member_id: teacherId
    });

    if (!teacherMember) {
      return res.status(404).json({
        message: "Teacher not found"
      });
    }

    /* ----------------------------------
       GET TEACHER CLASS
    ---------------------------------- */

    const teacherClass = await EndeavourClass.findOne({
      teacher: teacherMember._id
    })
      .populate("teacher", "member_name member_id")
      .populate("students", "member_name member_id");

    if (!teacherClass) {
      return res.status(404).json({
        message: "Teacher class not found"
      });
    }

    const totalStudents = teacherClass.students.length;

    const className = `${teacherClass.class_name} - ${teacherClass.section_name}`;

    /* ----------------------------------
       RECENT EVENTS
    ---------------------------------- */

    const events = await EndeavourEvent.find({
      "classEvents.className": className
    })
      .sort({ eventDate: -1 })
      .limit(2)
      .select("eventName eventDate venue");

    /* ----------------------------------
       RECENT EXAMS
    ---------------------------------- */

    const exams = await EndeavourExam.find({
      "classExams.className": className
    })
      .sort({ examDate: -1 })
      .limit(2)
      .select("examName examDate examcenter");

    /* ----------------------------------
       TODAY ATTENDANCE
    ---------------------------------- */

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const attendance = await EndeavourAttendance.findOne({
      class: teacherClass._id,
      date: { $gte: startOfDay, $lte: endOfDay }
    })
      .populate("attendance.student", "member_name member_id");

    let attendanceData = {
      marked: false,
      present: 0,
      absent: 0,
      totalOffering: 0,
      students: []
    };

    if (attendance) {

      const presentCount = attendance.attendance.filter(
        a => a.present
      ).length;

      attendanceData = {
        marked: true,
        present: presentCount,
        absent: attendance.attendance.length - presentCount,
        totalOffering: attendance.totalOffering,
        students: attendance.attendance
      };

    }

    /* ----------------------------------
       RESPONSE
    ---------------------------------- */

    res.json({
      class: teacherClass,
      totalStudents,
      events,
      exams,
      attendance: attendanceData
    });

  } catch (error) {

    console.error("Endeavour Teacher Dashboard error:", error);

    res.status(500).json({
      message: "Dashboard error"
    });

  }

};

