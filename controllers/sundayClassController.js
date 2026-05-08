
const mongoose = require("mongoose");
const SundayClass = require("../Schema/SundayClass");
const Member = require("../Schema/memberSchema"); // you already have this

// Create new class
// CREATE CLASS
exports.createClass = async (req, res) => {
  try {
    const {
      teacherId,
      class_name,
      section_name,
      year_from,
      year_to,
      max_students,
      notes,
    } = req.body;

    // ✅ Validate teacher by ObjectId
    const teacher = await Member.findById(teacherId);
    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    const newClass = new SundayClass({
      class_name,
      section_name,
      year_from,
      year_to,
      max_students,
      notes,
      teacher: teacher._id,  // ✅ Save ObjectId only
    });

    await newClass.save();

    res.status(201).json({
      message: "Class created successfully",
      data: newClass,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};



// Get all classes
// Get classes with filters & pagination
exports.getClasses = async (req, res) => {
  try {
    const {
      search = "",
      from = "",
      to = "",
      page = 1,
      limit = 10,
    } = req.query;

    const q = {};

    // TEXT SEARCH
    if (search) {
      // Find matching teachers first
      const matchingTeachers = await Member.find({
        $or: [
          { member_name: { $regex: search, $options: "i" } },
          { member_id: { $regex: search, $options: "i" } },
        ],
      }).select("_id");

      const teacherIds = matchingTeachers.map(t => t._id);

      q.$or = [
        { class_name: { $regex: search, $options: "i" } },
        { section_name: { $regex: search, $options: "i" } },
        { teacher: { $in: teacherIds } }, // 🔥 correct way
      ];
    }

    // DATE RANGE
    if (from || to) {
      const fromDate = from ? new Date(from) : new Date("1900-01-01");
      const toDate = to ? new Date(to) : new Date("2999-12-31");

      q.$and = [
        { year_to: { $gte: fromDate } },
        { year_from: { $lte: toDate } },
      ];
    }

    const pageNum = Math.max(parseInt(page, 10) || 1, 1);
    const perPage = Math.max(parseInt(limit, 10) || 10, 1);
    const skip = (pageNum - 1) * perPage;

    const [items, totalCount] = await Promise.all([
      SundayClass.find(q)
        .populate("teacher", "member_id member_name")
        .populate("students", "member_id member_name dob")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage),

      SundayClass.countDocuments(q)
    ]);

    res.json({
      classes: items,
      page: pageNum,
      totalPages: Math.ceil(totalCount / perPage),
      totalCount
    });

  } catch (error) {
    console.error("Error fetching classes:", error);
    res.status(500).json({ message: error.message });
  }
};



// Delete class
exports.deleteClass = async (req, res) => {
  try {
    await SundayClass.findByIdAndDelete(req.params.id);
    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all teachers with their classes
exports.getTeachersWithClasses = async (req, res) => {
  try {
    const classes = await SundayClass.find();
    const teachers = classes.map(c => ({
      class_name: c.class_name,
      section_name: c.section_name,
      teacher: c.teacher,
    }));
    res.json(teachers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


exports.getTeachersWithDetails = async (req, res) => {
  try {
    let { page = 1, limit = 25, search = "" } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    const skip = (page - 1) * limit;

    // Build search condition
    let matchStage = {};

    if (search) {
      matchStage = {
        $or: [
          { "teacher.member_name": { $regex: search, $options: "i" } },
          { "teacher.member_tamil_name": { $regex: search, $options: "i" } },
          { "teacher.member_id": { $regex: search, $options: "i" } },
          { "teacher.primary_contact": { $regex: search, $options: "i" } },
          { class_name: { $regex: search, $options: "i" } },
          { section_name: { $regex: search, $options: "i" } },
        ],
      };
    }

    const teachers = await SundayClass.find()
      .populate({
        path: "teacher",
        select:
          "member_id member_name member_tamil_name primary_contact",
      })
      .lean();

    // Map response
    let results = teachers.map((c) => ({
      teacher_id: c.teacher?.member_id,
      teacher_name: c.teacher?.member_name,
      teacher_tamil_name: c.teacher?.member_tamil_name,
      mobile_number: c.teacher?.primary_contact,
      class_name: c.class_name,
      section_name: c.section_name,
      class_id: c._id,
    }));

    // Apply search
    if (search) {
      const regex = new RegExp(search, "i");
      results = results.filter(
        (t) =>
          regex.test(t.teacher_name || "") ||
          regex.test(t.teacher_tamil_name || "") ||
          regex.test(t.teacher_id || "") ||
          regex.test(t.mobile_number || "") ||
          regex.test(t.class_name || "") ||
          regex.test(t.section_name || "")
      );
    }

    const total = results.length;

    const paginated = results.slice(skip, skip + limit);

    res.json({
      teachers: paginated,
      totalPages: Math.ceil(total / limit),
      total,
      page,
      limit,
    });
  } catch (error) {
    console.error("Error fetching teacher details:", error);
    res.status(500).json({ message: error.message });
  }
};



// Update Sunday Class
exports.updateSundayClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId, ...rest } = req.body;

    const updateData = { ...rest };

    if (teacherId) {
      // validate teacher exists
      const teacherExists = await Member.findById(teacherId);
      if (!teacherExists) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      updateData.teacher = teacherId; // ✅ store ObjectId
    }

    const updatedClass = await SundayClass.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate("teacher", "member_id member_name");

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(updatedClass);

  } catch (error) {
    console.error("Error updating class:", error);
    res.status(500).json({ message: "Server error" });
  }
};




exports.getEligibleStudents = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = "" } = req.query;
    const skip = (page - 1) * limit;

    const classData = await SundayClass.findById(req.params.classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // // 🔥 Get students from ALL classes
    // const allClasses = await SundayClass.find().select("students");

    // const alreadyEnrolledIds = allClasses.flatMap(c => c.students);

      // 🔥 Get all students already enrolled in ANY class
    const alreadyEnrolledIds = await SundayClass.distinct("students");

    const query = {
      status: "Active",
      dob: {
        $gte: classData.year_from,
        $lte: classData.year_to,
      },
      _id: { $nin: alreadyEnrolledIds },
    };

    if (search) {
      query.$or = [
        { member_name: { $regex: search, $options: "i" } },
        { member_id: { $regex: search, $options: "i" } },
      ];
    }

    const total = await Member.countDocuments(query);

    const members = await Member.find(query)
      .sort({ member_name: 1 })
      .skip(skip)
      .limit(Number(limit));

    res.json({
      data: members,
      totalPages: Math.ceil(total / limit),
    });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};




exports.addStudentsToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { students } = req.body;

    if (!Array.isArray(students)) {
      return res.status(400).json({ message: "Students must be an array" });
    }

    const classData = await SundayClass.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (students.length > classData.max_students) {
      return res.status(400).json({
        message: `Maximum ${classData.max_students} students allowed`,
      });
    }

    // extract member_ids ONLY
    const memberIds = students.map((s) => s.member_id);

    // fetch fresh data from DB
    const validMembers = await Member.find({
      member_id: { $in: memberIds },
      status: "Active",
    }).select("_id");

    if (validMembers.length !== memberIds.length) {
      return res.status(400).json({
        message: "One or more students are invalid or inactive",
      });
    }


    
    // current students in DB
    const currentStudentIds = classData.students.map(id => id.toString());

    // new selected students
    const newStudentIds = validMembers.map(m => m._id.toString());

    // 🔥 Find removed students
    const removedIds = currentStudentIds.filter(
      id => !newStudentIds.includes(id)
    );

    // 🔥 Add removed students to history
    removedIds.forEach(id => {
      classData.removed_students.push({
        student: id,
        removedAt: new Date()
      });
    });

    // 🔥 Update students list
    classData.students = newStudentIds;



    await classData.save();

    res.json({
      message: "Students updated successfully",
      students: classData.students,
    });
  } catch (err) {
    console.error("Error updating students:", err);
    res.status(500).json({ message: err.message });
  }
};




exports.getClassWithStudents = async (req, res) => {
  try {
    const classData = await SundayClass.findById(req.params.classId)
      .populate("students", "member_id member_name dob")
      .populate("teacher", "member_id member_name");

    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(classData);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};



// ➤ Get all students for classes taught by a teacher
exports.getStudentsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params; // this is member_id like MBR00001

    // 🔥 Step 1: Find teacher document
    const teacher = await Member.findOne({ member_id: teacherId });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // 🔥 Step 2: Find classes using teacher ObjectId
    const classes = await SundayClass.find({
      teacher: teacher._id,
    }).populate("students", "member_id member_name dob");

    // 🔥 Step 3: Attach class info to students
    const students = classes.flatMap((cls) =>
      (cls.students || []).map((s) => ({
        ...s.toObject(),
        class_id: cls._id,
        class_name: cls.class_name,
        section_name: cls.section_name,
      }))
    );

    res.json({ students });

  } catch (err) {
    console.error("Error fetching teacher's students:", err);
    res.status(500).json({ message: err.message });
  }
};






exports.getEventClassGroups = async (req, res) => {
  try {
    const classes = await SundayClass.find().select("class_name");

    // Extract unique base names before hyphen (like "Primary", "Junior")
    const classGroups = [...new Set(
      classes.map(c => c.class_name.split("-")[0].trim())
    )];

    res.json(classGroups);
  } catch (err) {
    console.error("Error fetching event class groups:", err);
    res.status(500).json({ message: "Failed to fetch class groups" });
  }
};