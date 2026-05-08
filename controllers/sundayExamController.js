const SundayExam = require("../Schema/sundayExamSchema");
const SundayExamBy = require("../Schema/SundayExamBySchema");
const SundaySchoolClass = require("../Schema/SundayClass");
const Member = require("../Schema/memberSchema");



// ✅ Create a new Sunday School Exam
exports.createSundayExam = async (req, res) => {
  try {

    const {
      examName,
      examDate,
      registerBefore,
      examcenter,
      description,
      examBy,
      classExams = [],
      teacherExam
    } = req.body;

    /* =========================
       REQUIRED FIELD VALIDATION
    ========================= */

    if (!examName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Exam name is required"
      });
    }

    if (!examDate) {
      return res.status(400).json({
        success: false,
        message: "Exam date is required"
      });
    }

    if (!registerBefore) {
      return res.status(400).json({
        success: false,
        message: "Register before date is required"
      });
    }

    if (!examcenter?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Exam center is required"
      });
    }

    if (!examBy || !Array.isArray(examBy) || examBy.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Exam By must be selected"
      });
    }

    /* =========================
       DATE VALIDATION
    ========================= */

    const exam = new Date(examDate);
    const register = new Date(registerBefore);

    if (register > exam) {
      return res.status(400).json({
        success: false,
        message: "Register before must be earlier than exam date"
      });
    }

    /* =========================
       CLASS EXAM VALIDATION
    ========================= */

    const cleanedClass = classExams
      .map(c => ({
        className: c.className,
        portion: c.portion?.trim()
      }))
      .filter(c => c.className && c.portion);

    if (cleanedClass.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one class exam portion is required"
      });
    }

    /* =========================
       DUPLICATE CLASS CHECK
    ========================= */

    const classSet = new Set();

    for (const c of cleanedClass) {
      if (classSet.has(c.className)) {
        return res.status(400).json({
          success: false,
          message: `${c.className} selected multiple times`
        });
      }
      classSet.add(c.className);
    }

    /* =========================
       EXPAND CLASS SECTIONS
    ========================= */

    let expandedClassExams = [];

    for (const cls of cleanedClass) {

      const baseName = cls.className.split(" - ")[0].trim();

      const sections = await SundaySchoolClass.find({
        class_name: { $regex: `^${baseName}`, $options: "i" }
      });

      if (!sections.length) {
        expandedClassExams.push(cls);
      } else {
        sections.forEach(sec => {
          expandedClassExams.push({
            className: `${sec.class_name} - ${sec.section_name}`,
            portion: cls.portion
          });
        });
      }
    }

    /* =========================
       CREATE EXAM
    ========================= */

    const examDoc = new SundayExam({
      examName: examName.trim(),
      examDate,
      registerBefore,
      examcenter: examcenter.trim(),
      description: description?.trim(),
      examBy,
      classExams: expandedClassExams,
      teacherExam: teacherExam?.trim()
    });

    await examDoc.save();

    res.status(201).json({
      success: true,
      message: "Sunday School Exam created successfully",
      exam: examDoc
    });

  } catch (error) {

    console.error("Create exam error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating exam"
    });

  }
};


// Get all Sunday Exams
exports.getSundayExams = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", startDate, endDate } = req.query;

    const query = {};

    // Search by exam name
    if (search) {
      query.examName = { $regex: search, $options: "i" };
    }

    // Filter by date range
    if (startDate || endDate) {
      query.examDate = {};
      if (startDate) query.examDate.$gte = new Date(startDate);
      if (endDate) query.examDate.$lte = new Date(endDate);
    }

    const total = await SundayExam.countDocuments(query);
    const exams = await SundayExam.find(query)
      .sort({ examDate: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .populate("examBy", "name")
      .populate("teacherDetails.teacher", "member_name member_id")
      .populate("classExams.participants.member", "member_name member_id");

    res.status(200).json({
      exams,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch exams" });
  }
};

// Get single exam by ID
exports.getSundayExamById = async (req, res) => {
  try {
    const exam = await SundayExam.findById(req.params.id);
    if (!exam) return res.status(404).json({ message: "Exam not found" });
    res.status(200).json({ exam });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch exam" });
  }
};


exports.addExamBy = async (req, res) => {
  try {
    let { name } = req.body;
    const names = Array.isArray(name)
      ? name.map(n => n.trim()).filter(Boolean)
      : [name.trim()].filter(Boolean);

    if (!names.length) {
      return res.status(400).json({ status: "Failed", message: "Exam By name(s) required" });
    }

    const existingDocs = await SundayExamBy.find({ name: { $in: names } });
    const existingNames = existingDocs.map(d => d.name);
    const newNames = names.filter(n => !existingNames.includes(n));

    if (!newNames.length) {
      return res.status(400).json({ status: "Failed", message: "All Exam Bys already exist" });
    }

    const examBys = await SundayExamBy.insertMany(newNames.map(n => ({ name: n })));
    res.status(201).json({
      status: "Success",
      message: `Added ${examBys.length} Exam By(s)`,
      examBys,
      duplicates: existingNames
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};


exports.updateExamBy = async (req, res) => {
  try {
    let { names } = req.body; // array of names
    if (!Array.isArray(names)) return res.status(400).json({ status: "Failed", message: "names must be an array" });

    names = names.map(n => n.trim()).filter(Boolean);

    // Remove Exam Bys not in the new list
    await SundayExamBy.deleteMany({ name: { $nin: names } });

    // Add new Exam Bys
    const existingDocs = await SundayExamBy.find({ name: { $in: names } });
    const existingNames = existingDocs.map(d => d.name);
    const newNames = names.filter(n => !existingNames.includes(n));
    if (newNames.length) {
      await SundayExamBy.insertMany(newNames.map(n => ({ name: n })));
    }

    const allExamBys = await SundayExamBy.find().sort({ name: 1 });
    res.status(200).json({
      status: "Success",
      message: "Exam Bys updated successfully",
      examBys: allExamBys
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};


exports.getExamByList = async (req, res) => {
  try {
    const examBys = await SundayExamBy.find().sort({ name: 1 });
    res.status(200).json({ examBys });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch Exam By list" });
  }
};



exports.updateSundayExam = async (req, res) => {
  try {

    const { id } = req.params;

    const {
      examName,
      examDate,
      registerBefore,
      examcenter,
      description,
      examBy,
      classExams = [],
      teacherExam
    } = req.body;

    /* =========================
       REQUIRED FIELD VALIDATION
    ========================= */

    if (!examName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Exam name is required"
      });
    }

    if (!examDate) {
      return res.status(400).json({
        success: false,
        message: "Exam date is required"
      });
    }

    if (!registerBefore) {
      return res.status(400).json({
        success: false,
        message: "Register before date is required"
      });
    }

    if (!examcenter?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Exam center is required"
      });
    }

    if (!examBy || !Array.isArray(examBy) || examBy.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Exam By must be selected"
      });
    }

    /* =========================
       DATE VALIDATION
    ========================= */

    const exam = new Date(examDate);
    const register = new Date(registerBefore);

    if (register > exam) {
      return res.status(400).json({
        success: false,
        message: "Register before must be earlier than exam date"
      });
    }

    /* =========================
       CLASS EXAM VALIDATION
    ========================= */

    const cleanedClass = classExams
      .map(c => ({
        className: c.className,
        portion: c.portion?.trim()
      }))
      .filter(c => c.className && c.portion);

    if (cleanedClass.length === 0) {
      return res.status(400).json({
        success: false,
        message: "At least one class exam portion is required"
      });
    }

    /* =========================
       DUPLICATE CLASS CHECK
    ========================= */

    const classSet = new Set();

    for (const c of cleanedClass) {
      if (classSet.has(c.className)) {
        return res.status(400).json({
          success: false,
          message: `${c.className} selected multiple times`
        });
      }
      classSet.add(c.className);
    }

    /* =========================
       FETCH EXAM
    ========================= */

    const examDoc = await SundayExam.findById(id);

    if (!examDoc) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    /* =========================
       MERGE CLASS EXAMS
    ========================= */

    let mergedClassExams = [];

    for (const incoming of cleanedClass) {

      const baseName = incoming.className.split(" - ")[0].trim();

      const sections = await SundaySchoolClass.find({
        class_name: { $regex: `^${baseName}`, $options: "i" }
      });

      if (!sections.length) {

        mergedClassExams.push({
          className: incoming.className,
          portion: incoming.portion,
          participants: [],
          _id: examDoc.classExams.find(
            ce => ce.className === incoming.className
          )?._id
        });

      } else {

        for (const sec of sections) {

          const fullName = `${sec.class_name} - ${sec.section_name}`;

          const existing = examDoc.classExams.find(
            ce => ce.className === fullName
          );

          if (!mergedClassExams.find(ce => ce.className === fullName)) {

            mergedClassExams.push({
              className: fullName,
              portion: incoming.portion,
              participants: existing ? existing.participants : [],
              _id: existing?._id
            });

          }

        }

      }

    }

    /* =========================
       UPDATE EXAM
    ========================= */

    examDoc.examName = examName.trim();
    examDoc.examDate = examDate;
    examDoc.registerBefore = registerBefore;
    examDoc.examcenter = examcenter.trim();
    examDoc.description = description?.trim();
    examDoc.examBy = examBy;
    examDoc.classExams = mergedClassExams;
    examDoc.teacherExam = teacherExam?.trim();

    await examDoc.save();

    res.status(200).json({
      success: true,
      message: "Sunday School Exam updated successfully",
      exam: examDoc
    });

  } catch (err) {

    console.error("Update exam error:", err);

    res.status(500).json({
      success: false,
      message: "Server error while updating exam"
    });

  }
};



exports.getExamsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { search = "", startDate, endDate, page = 1, limit = 25 } = req.query;

    const teacher = await Member.findOne({ member_id: teacherId });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    // 🔹 Find classes handled by teacher
    const classes = await SundaySchoolClass.find({
      teacher: teacher._id
    }).lean();

    const classNames = classes.map(
      c => `${c.class_name} - ${c.section_name}`
    );

    const filter = {
      "classExams.className": { $in: classNames }
    };

    // search
    if (search) {
      filter.examName = { $regex: search, $options: "i" };
    }

    // date filter
    if (startDate || endDate) {
      filter.examDate = {};
      if (startDate) filter.examDate.$gte = new Date(startDate);
      if (endDate) filter.examDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const total = await SundayExam.countDocuments(filter);

    const exams = await SundayExam.find(filter)
      .populate("examBy", "name")
      .populate("classExams.participants.member", "member_name member_id")
      .populate("teacherDetails.teacher", "member_name member_id")
      .sort({ examDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    return res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      exams
    });

  } catch (err) {
    console.error("Error fetching exams for teacher:", err);
    res.status(500).json({
      success: false,
      message: "Server error while fetching teacher exams",
      error: err.message,
    });
  }
};

exports.addExamParticipants = async (req, res) => {
  try {
    const { examId, className, participants } = req.body;

    if (!examId || !className || !participants) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const exam = await SundayExam.findById(examId);
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const classExam = exam.classExams.find(c => c.className === className);
    if (!classExam) {
      return res.status(404).json({ message: "Class not found in this exam" });
    }

    // 🔹 Convert member_id → ObjectId
    const formattedParticipants = [];

    for (const p of participants) {
      const member = await Member.findOne({ member_id: p.member_id });

      if (!member) continue;

      formattedParticipants.push({
        member: member._id,
        class_name: p.class_name,
        section_name: p.section_name,
        marks: null
      });
    }

    classExam.participants = formattedParticipants;

    await exam.save();

    res.status(200).json({
      success: true,
      message: "Participants added successfully"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to save participants",
      error: err.message
    });
  }
};

exports.addMarks = async (req, res) => {
  try {
    const { examId, className, marksData } = req.body;

    if (!examId || !className || !Array.isArray(marksData)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const exam = await SundayExam.findById(examId)
      .populate("classExams.participants.member", "member_id");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const classExam = exam.classExams.find(
      cls => cls.className === className
    );

    if (!classExam) {
      return res.status(404).json({ message: "Class not found in exam" });
    }

    marksData.forEach(student => {
      const participant = classExam.participants.find(
        p => p.member?.member_id === student.member_id
      );

      if (participant) {
        participant.marks = student.marks ?? 0;
      }
    });

    await exam.save();

    res.json({
      message: "Marks saved successfully!",
      hasMarks: true
    });

  } catch (error) {
    console.error("Error saving marks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.addTeacher = async (req, res) => {
  try {
    const { examId, teacher } = req.body;

    if (!examId || !teacher?.teacherId || !teacher?.className) {
      return res.status(400).json({
        success: false,
        message: "Exam ID and teacher info required."
      });
    }

    // 🔹 Find teacher member
    const member = await Member.findOne({ member_id: teacher.teacherId });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    const exam = await SundayExam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    // 🔹 Prevent duplicate enrollment
    const alreadyEnrolled = exam.teacherDetails.some(
      t =>
        t.teacher.toString() === member._id.toString() &&
        t.className === teacher.className
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: "Teacher already enrolled for this class."
      });
    }

    // 🔹 Save teacher ObjectId
    exam.teacherDetails.push({
      teacher: member._id,
      className: teacher.className
    });

    await exam.save();

    res.status(200).json({
      success: true,
      message: "Teacher enrolled successfully!"
    });

  } catch (err) {
    console.error("Add teacher error:", err);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
};

exports.updateMarks = async (req, res) => {
  try {
    const { examId, className, marksData } = req.body;

    if (!examId || !className || !Array.isArray(marksData)) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    const exam = await SundayExam.findById(examId)
      .populate("classExams.participants.member", "member_id");

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" });
    }

    const classExam = exam.classExams.find(
      cls => cls.className === className
    );

    if (!classExam) {
      return res.status(404).json({ message: "Class not found in exam" });
    }

    marksData.forEach(student => {
      const participant = classExam.participants.find(
        p => p.member?.member_id === student.member_id
      );

      if (participant) {
        participant.marks = student.marks ?? 0;
      }
    });

    await exam.save();

    res.json({ message: "Marks updated successfully!" });

  } catch (error) {
    console.error("Error updating marks:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
