// controllers/endeavourExamController.js

const EndeavourExam = require("../Schema/endeavourExamSchema");
const EndeavourExamBy = require("../Schema/endeavourExamBySchema");
const EndeavourClass = require("../Schema/EndeavourClass");
const Member = require("../Schema/memberSchema");


exports.createEndeavourExam = async (req, res) => {
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

      const sections = await EndeavourClass.find({
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

    const examDoc = new EndeavourExam({

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
      message: "Endeavour Exam created successfully",
      exam: examDoc
    });

  }
  catch (error) {

    console.error("Create Endeavour exam error:", error);

    res.status(500).json({
      success: false,
      message: "Server error while creating exam"
    });

  }
};


// Get all Endeavour Exams
exports.getEndeavourExams = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", startDate, endDate } = req.query;

    const query = {};

    if (search) {
      query.examName = { $regex: search, $options: "i" };
    }

    if (startDate || endDate) {
      query.examDate = {};
      if (startDate) query.examDate.$gte = new Date(startDate);
      if (endDate) query.examDate.$lte = new Date(endDate);
    }

    const total = await EndeavourExam.countDocuments(query);
    const exams = await EndeavourExam.find(query)
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
exports.getEndeavourExamById = async (req, res) => {
  try {

    const exam = await EndeavourExam.findById(req.params.id)
      .populate("examBy", "name");

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found"
      });
    }

    res.status(200).json({ exam });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to fetch exam"
    });

  }
};

// Add Exam By (Organizers)
exports.addEndeavourExamBy = async (req, res) => {
  try {
    let { name } = req.body;
    const names = Array.isArray(name)
      ? name.map(n => n.trim()).filter(Boolean)
      : [name.trim()].filter(Boolean);

    if (!names.length) {
      return res.status(400).json({ status: "Failed", message: "Exam By name(s) required" });
    }

    const existingDocs = await EndeavourExamBy.find({ name: { $in: names } });
    const existingNames = existingDocs.map(d => d.name);
    const newNames = names.filter(n => !existingNames.includes(n));

    if (!newNames.length) {
      return res.status(400).json({ status: "Failed", message: "All Exam Bys already exist" });
    }

    const examBys = await EndeavourExamBy.insertMany(newNames.map(n => ({ name: n })));
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

// Update Exam By
exports.updateEndeavourExamBy = async (req, res) => {
  try {
    let { names } = req.body;
    if (!Array.isArray(names)) return res.status(400).json({ status: "Failed", message: "names must be an array" });

    names = names.map(n => n.trim()).filter(Boolean);

    await EndeavourExamBy.deleteMany({ name: { $nin: names } });

    const existingDocs = await EndeavourExamBy.find({ name: { $in: names } });
    const existingNames = existingDocs.map(d => d.name);
    const newNames = names.filter(n => !existingNames.includes(n));
    if (newNames.length) {
      await EndeavourExamBy.insertMany(newNames.map(n => ({ name: n })));
    }

    const allExamBys = await EndeavourExamBy.find().sort({ name: 1 });
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

// Get Exam By List
exports.getEndeavourExamByList = async (req, res) => {
  try {
    const examBys = await EndeavourExamBy.find().sort({ name: 1 });
    res.status(200).json({ examBys });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch Exam By list" });
  }
};



exports.updateEndeavourExam = async (req, res) => {
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
       VALIDATION
    ========================= */

    if (!examName?.trim()) {
      return res.status(400).json({
        success: false,
        message: "Exam name is required"
      });
    }

    if (!examDate || !registerBefore || !examcenter?.trim()) {
      return res.status(400).json({
        success: false,
        message: "All required fields must be provided"
      });
    }

    if (!examBy || !Array.isArray(examBy) || !examBy.length) {
      return res.status(400).json({
        success: false,
        message: "Exam By must be selected"
      });
    }

    const exam = await EndeavourExam.findById(id);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    /* =========================
       CLEAN CLASS EXAMS
    ========================= */

    const cleanedClass = classExams
      .map(c => ({
        className: c.className,
        portion: c.portion?.trim()
      }))
      .filter(c => c.className && c.portion);

    if (!cleanedClass.length) {
      return res.status(400).json({
        success: false,
        message: "At least one class exam portion is required"
      });
    }

    /* =========================
       MERGE CLASS EXAMS
    ========================= */

    let mergedClassExams = [];

    for (const incoming of cleanedClass) {

      const baseName = incoming.className.split(" - ")[0].trim();

      const sections = await EndeavourClass.find({
        class_name: { $regex: `^${baseName}`, $options: "i" }
      });

      if (!sections.length) {

        mergedClassExams.push({
          className: incoming.className,
          portion: incoming.portion,
          participants: [],
          _id: exam.classExams.find(
            ce => ce.className === incoming.className
          )?._id
        });

      } else {

        for (const sec of sections) {

          const fullName = `${sec.class_name} - ${sec.section_name}`;

          const existing = exam.classExams.find(
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

    exam.examName = examName.trim();
    exam.examDate = examDate;
    exam.registerBefore = registerBefore;
    exam.examcenter = examcenter.trim();
    exam.description = description?.trim();
    exam.examBy = examBy;
    exam.classExams = mergedClassExams;
    exam.teacherExam = teacherExam?.trim();

    await exam.save();

    res.status(200).json({
      success: true,
      message: "Endeavour Exam updated successfully",
      exam
    });

  } catch (err) {

    console.error("Failed to update Endeavour Exam:", err);

    res.status(500).json({
      success: false,
      message: "Failed to update exam"
    });

  }
};



// Get Exams by Teacher


exports.getEndeavourExamsByTeacher = async (req, res) => {
  try {

    const { teacherId } = req.params;
    const { search = "", startDate, endDate, page = 1, limit = 10 } = req.query;

    /* =========================
       FIND TEACHER MEMBER
    ========================= */

    const teacher = await Member.findOne({ member_id: teacherId });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    /* =========================
       FIND CLASSES HANDLED BY TEACHER
    ========================= */

    const classes = await EndeavourClass.find({
      teacher: teacher._id
    }).lean();

    if (!classes.length) {
      return res.status(200).json({
        success: true,
        total: 0,
        totalPages: 1,
        exams: []
      });
    }

    const classNames = classes.map(
      c => `${c.class_name} - ${c.section_name}`
    );

    /* =========================
       BUILD FILTER
    ========================= */

    const filter = {
      "classExams.className": { $in: classNames }
    };

    if (search) {
      filter.examName = { $regex: search, $options: "i" };
    }

    if (startDate || endDate) {
      filter.examDate = {};
      if (startDate) filter.examDate.$gte = new Date(startDate);
      if (endDate) filter.examDate.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const total = await EndeavourExam.countDocuments(filter);

    const exams = await EndeavourExam.find(filter)
      .populate("examBy", "name")
      .populate("teacherDetails.teacher", "member_name member_id")
      .populate("classExams.participants.member", "member_name member_id")
      .sort({ examDate: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    /* =========================
       FILTER ONLY TEACHER CLASSES
    ========================= */

    const filteredExams = exams.map(exam => ({
      ...exam,
      classExams: exam.classExams.filter(
        ce => classNames.includes(ce.className)
      )
    }));

    return res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      exams: filteredExams
    });

  } catch (err) {

    console.error("Error fetching exams for teacher:", err);

    res.status(500).json({
      success: false,
      message: "Server error while fetching teacher exams",
      error: err.message
    });

  }
};

// Add Exam Participants




exports.addEndeavourExamParticipants = async (req, res) => {
  try {

    const { examId, className, participants } = req.body;

    if (!examId || !className || !participants) {
      return res.status(400).json({
        message: "Missing required fields"
      });
    }

    const exam = await EndeavourExam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found"
      });
    }

    const classExam = exam.classExams.find(
      c => c.className === className
    );

    if (!classExam) {
      return res.status(404).json({
        message: "Class not found in exam"
      });
    }

    const formattedParticipants = [];

    for (const p of participants) {

      const member = await Member.findOne({
        member_id: p.member_id
      });

      if (!member) continue;

      const alreadyExists = classExam.participants.find(
        pr => pr.member.toString() === member._id.toString()
      );

      if (!alreadyExists) {

        formattedParticipants.push({
          member: member._id,
          class_name: p.class_name,
          section_name: p.section_name,
          marks: null
        });

      }

    }

    classExam.participants = formattedParticipants;

    await exam.save();

    res.status(200).json({
      success: true,
      message: "Participants saved successfully"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Failed to save participants"
    });

  }
};

// Add Marks
exports.addEndeavourMarks = async (req, res) => {
  try {

    const { examId, className, marksData } = req.body;

    if (!examId || !className || !marksData) {
      return res.status(400).json({
        success: false,
        message: "Invalid request data"
      });
    }

    const exam = await EndeavourExam.findById(examId)
      .populate("classExams.participants.member", "member_id");

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    const classExam = exam.classExams.find(
      cls => cls.className === className
    );

    if (!classExam) {
      return res.status(404).json({
        success: false,
        message: "Class not found in exam"
      });
    }

    marksData.forEach(student => {

      const memberId =
        student.member?.member_id || student.member_id;

      const participant = classExam.participants.find(
        p => p.member?.member_id === memberId
      );

      if (participant) {
        participant.marks = student.marks ?? 0;
      }

    });

    await exam.save();

    res.status(200).json({
      success: true,
      hasMarks: true,
      message: "Marks saved successfully!"
    });

  } catch (error) {

    console.error("Add marks error:", error);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }
};

// Add Teacher

exports.addEndeavourTeacher = async (req, res) => {
  try {

    const { examId, teacher } = req.body;

    if (!examId || !teacher?.teacherId || !teacher?.className) {
      return res.status(400).json({
        success: false,
        message: "Exam ID and teacher info required."
      });
    }

    const member = await Member.findOne({
      member_id: teacher.teacherId
    });

    if (!member) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    const exam = await EndeavourExam.findById(examId);

    if (!exam) {
      return res.status(404).json({
        success: false,
        message: "Exam not found"
      });
    }

    const alreadyEnrolled = exam.teacherDetails.some(
      t =>
        t.teacher.toString() === member._id.toString() &&
        t.className === teacher.className
    );

    if (alreadyEnrolled) {
      return res.status(400).json({
        success: false,
        message: "Teacher already enrolled"
      });
    }

    exam.teacherDetails.push({
      teacher: member._id,
      className: teacher.className
    });

    await exam.save();

    res.status(200).json({
      success: true,
      message: "Teacher enrolled successfully"
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }
};

// Update Marks
exports.updateEndeavourMarks = async (req, res) => {
  try {

    const { examId, className, marksData } = req.body;

    if (!examId || !className || !Array.isArray(marksData)) {
      return res.status(400).json({
        message: "Invalid request data"
      });
    }

    const exam = await EndeavourExam.findById(examId)
      .populate("classExams.participants.member", "member_id");

    if (!exam) {
      return res.status(404).json({
        message: "Exam not found"
      });
    }

    const classExam = exam.classExams.find(
      cls => cls.className === className
    );

    if (!classExam) {
      return res.status(404).json({
        message: "Class not found in exam"
      });
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
      success: true,
      message: "Marks updated successfully!"
    });

  } catch (error) {

    console.error("Error updating marks:", error);

    res.status(500).json({
      message: "Internal server error"
    });

  }
};
