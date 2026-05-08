// controllers/EndeavourClassController.js
const mongoose = require("mongoose");
const EndeavourClass = require("../Schema/EndeavourClass");
const Member = require("../Schema/memberSchema");

// ➤ Create new class
exports.createClass = async (req, res) => {
  try {

    const { teacherId, class_name, section_name, ...rest } = req.body;

    /* ------------------------------
       FIND TEACHER
    ------------------------------ */

    const teacher = await Member.findOne({ member_id: teacherId });

    if (!teacher) {
      return res.status(404).json({
        message: "Teacher not found"
      });
    }

    /* ------------------------------
       CHECK TEACHER ALREADY ASSIGNED
    ------------------------------ */

    const teacherExists = await EndeavourClass.findOne({
      teacher: teacher._id
    });

    if (teacherExists) {
      return res.status(400).json({
        message: "This teacher is already assigned to another class"
      });
    }

    /* ------------------------------
       CHECK DUPLICATE CLASS + SECTION
    ------------------------------ */

    const classExists = await EndeavourClass.findOne({
      class_name: class_name.trim(),
      section_name: section_name.trim()
    });

    if (classExists) {
      return res.status(400).json({
        message: `Class ${class_name} - ${section_name} already exists`
      });
    }

    /* ------------------------------
       CREATE CLASS
    ------------------------------ */

    const newClass = new EndeavourClass({

      class_name: class_name.trim(),
      section_name: section_name.trim(),

      ...rest,

      teacher: teacher._id  // store ObjectId
    });

    await newClass.save();

    res.status(201).json({
      message: "Class created successfully",
      class: newClass
    });

  } catch (error) {

    console.error("Error creating Endeavour class:", error);

    res.status(500).json({
      message: "Server error"
    });

  }
};



// ➤ Get classes with filters & pagination
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

    if (search) {
      q.$or = [
        { class_name: { $regex: search, $options: "i" } },
        { section_name: { $regex: search, $options: "i" } },
      ];
    }


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
      EndeavourClass.find(q)
        .populate("teacher", "member_id member_name member_tamil_name")
        .populate("students", "member_id member_name dob")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(perPage),

      EndeavourClass.countDocuments(q),
    ]);

    res.json({
      classes: items,
      page: pageNum,
      totalPages: Math.ceil(totalCount / perPage),
      totalCount,
    });
  } catch (error) {
    console.error("Error fetching Endeavour classes:", error);
    res.status(500).json({ message: error.message });
  }
};

// ➤ Delete class
exports.deleteClass = async (req, res) => {
  try {
    await EndeavourClass.findByIdAndDelete(req.params.id);
    res.json({ message: "Class deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// ➤ Get available teachers (exclude already assigned)
exports.getTeachersForDropdown = async (req, res) => {
  try {
    const { search = "", classId = null } = req.query;

    // 🔥 Get assigned teacher IDs
    const classes = await EndeavourClass.find().select("teacher");
    const assignedTeacherIds = classes.map(c => c.teacher?.toString());

    let currentClassTeacher = null;

    // 🔥 If editing, allow current teacher
    if (classId) {
      const currentClass = await EndeavourClass.findById(classId);
      currentClassTeacher = currentClass?.teacher?.toString();
    }

    const query = {
      status: "Active",
      ...(search && {
        $or: [
          { member_name: { $regex: search, $options: "i" } },
          { member_id: { $regex: search, $options: "i" } },
        ],
      }),
    };

    const members = await Member.find(query)
      .select("member_id member_name member_tamil_name")
      .sort({ member_name: 1 });

    const formatted = members.map(m => ({
      _id: m._id,
      member_id: m.member_id,
      member_name: m.member_name,
      assigned:
        assignedTeacherIds.includes(m._id.toString()) &&
        m._id.toString() !== currentClassTeacher,
    }));

    res.json(formatted);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};


// ➤ Get teachers with classes
exports.getTeachersWithClasses = async (req, res) => {
  try {
    const classes = await EndeavourClass.find()
      .populate("teacher", "member_id member_name")
      .select("class_name section_name teacher");

    const teachers = classes.map((c) => ({
      class_name: c.class_name,
      section_name: c.section_name,
      teacher: c.teacher
    }));

    res.status(200).json(teachers);

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get teachers with details + pagination + search
exports.getTeachersWithDetails = async (req, res) => {
  try {
    let { page = 1, limit = 10, search = "" } = req.query;
    page = parseInt(page);
    limit = parseInt(limit);

    const classes = await EndeavourClass.find().lean();

    let results = await Promise.all(
      classes.map(async (c) => {

        if (!c.teacher) return null;

        const teacherMember = await Member.findById(
          c.teacher,
          "member_id member_name member_tamil_name primary_contact"
        );

        if (!teacherMember) return null;

        return {
          teacher_id: teacherMember.member_id,
          teacher_name: teacherMember.member_name,
          teacher_tamil_name: teacherMember.member_tamil_name,
          mobile_number: teacherMember.primary_contact,
          class_name: c.class_name,
          section_name: c.section_name,
          class_id: c._id,
        };
      })
    );

    results = results.filter(Boolean);

    // Search
    if (search) {
      const lowerSearch = search.toLowerCase();
      results = results.filter(
        (t) =>
          t.teacher_name?.toLowerCase().includes(lowerSearch) ||
          t.teacher_id?.toLowerCase().includes(lowerSearch) ||
          t.class_name?.toLowerCase().includes(lowerSearch)
      );
    }

    // Pagination
    const total = results.length;
    const totalPages = Math.ceil(total / limit);
    const start = (page - 1) * limit;
    const paginated = results.slice(start, start + limit);

    res.json({
      teachers: paginated,
      total,
      totalPages,
      page,
    });

  } catch (error) {
    console.error("Error fetching teacher details:", error);
    res.status(500).json({ message: error.message });
  }
};


// ➤ Update class
exports.updateClass = async (req, res) => {
  try {
    const { id } = req.params;
    const { teacherId, ...rest } = req.body;

    let updateData = { ...rest };

    if (teacherId) {
      const teacher = await Member.findOne({ member_id: teacherId });

      if (!teacher) {
        return res.status(404).json({ message: "Teacher not found" });
      }

      // 🔥 Store ObjectId directly
      updateData.teacher = teacher._id;
    }

    const updatedClass = await EndeavourClass.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    )
      .populate("teacher", "member_id member_name member_tamil_name");

    if (!updatedClass) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(updatedClass);
  } catch (error) {
    console.error("Error updating Endeavour class:", error);
    res.status(500).json({ message: error.message });
  }
};


// ➤ Get eligible students

exports.getEligibleStudents = async (req, res) => {
  try {
    const { page = 1, limit = 25, search = "" } = req.query;

    const pageNum = Math.max(parseInt(page), 1);
    const perPage = Math.max(parseInt(limit), 1);
    const skip = (pageNum - 1) * perPage;

    const classData = await EndeavourClass.findById(req.params.classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    // 🔥 Get all classes
    const allClasses = await EndeavourClass.find().select("students");

    // 🔥 Collect all enrolled student IDs
    const alreadyEnrolledIds = allClasses.flatMap(c => c.students);

    // 🔥 Build query
    const query = {
      dob: { $gte: classData.year_from, $lte: classData.year_to },
      _id: { $nin: alreadyEnrolledIds },   // ✅ FIXED HERE
      status: "Active",
      ...(search && {
        $or: [
          { member_name: { $regex: search, $options: "i" } },
          { member_id: { $regex: search, $options: "i" } },
        ],
      }),
    };

    const [members, totalCount] = await Promise.all([
      Member.find(query)
        .select("member_id member_name member_tamil_name dob father_name present_address age")
        .skip(skip)
        .limit(perPage),

      Member.countDocuments(query),
    ]);

    res.json({
      data: members,
      totalPages: Math.ceil(totalCount / perPage),
      totalCount,
      page: pageNum,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};







// ➤ Add/Update students in class
exports.addStudentsToClass = async (req, res) => {
  try {
    const { classId } = req.params;
    const { students } = req.body;

    if (!Array.isArray(students)) {
      return res.status(400).json({ message: "Students must be an array" });
    }

    const classData = await EndeavourClass.findById(classId);
    if (!classData) {
      return res.status(404).json({ message: "Class not found" });
    }

    if (students.length > classData.max_students) {
      return res.status(400).json({
        message: `Maximum ${classData.max_students} students allowed`,
      });
    }

    // 🔥 Convert member_id → ObjectId
    const memberIds = students.map(s => s.member_id);

    const members = await Member.find({
      member_id: { $in: memberIds },
      status: "Active",
    });

    if (members.length !== students.length) {
      return res.status(400).json({
        message: "One or more students are invalid or inactive",
      });
    }

    // =====================================
    // 🔥 REMOVED STUDENTS LOGIC
    // =====================================

    const oldStudentIds = classData.students.map(id => id.toString());

    const newStudentIds = members.map(m => m._id.toString());

    // Find removed students
    const removedIds = oldStudentIds.filter(
      id => !newStudentIds.includes(id)
    );

    // Push into removed_students
    removedIds.forEach(id => {
      classData.removed_students.push({
        student: id,
        removedAt: new Date(),
      });
    });

    // =====================================
    // 🔥 UPDATE CURRENT STUDENTS
    // =====================================

    classData.students = members.map(m => m._id);

    await classData.save();

    const populated = await classData.populate(
      "students teacher removed_students.student",
      "member_id member_name"
    );

    res.json({
      message: "Students updated successfully",
      class: populated,
    });

  } catch (err) {
    console.error("Error updating students:", err);
    res.status(500).json({ message: err.message });
  }
};


exports.getSingleClass = async (req, res) => {
  try {
    const cls = await EndeavourClass.findById(req.params.id)
      .populate("teacher", "member_id member_name member_tamil_name")
      .populate("students", "member_id member_name dob");

    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(cls);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


// ➤ Get class with students
exports.getClassWithStudents = async (req, res) => {
  try {
    const cls = await EndeavourClass.findById(req.params.classId)
      .populate("teacher", "member_id member_name")
      .populate("students", "member_id member_name dob");

    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(cls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};


// ➤ Get all students for classes taught by a teacher
exports.getStudentsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;

    // 1️⃣ Find teacher by member_id
    const teacher = await Member.findOne({ member_id: teacherId });

    if (!teacher) {
      return res.status(404).json({ message: "Teacher not found" });
    }

    // 2️⃣ Get classes taught by teacher
    const classes = await EndeavourClass.find({ teacher: teacher._id })
      .populate("students", "member_id member_name dob age");

    if (!classes.length) {
      return res.json({ students: [] });
    }

    // 3️⃣ Collect students
    const students = [];

    classes.forEach((cls) => {
      (cls.students || []).forEach((student) => {
        students.push({
          _id: student._id,
          member_id: student.member_id,
          member_name: student.member_name,
          dob: student.dob,
          age: student.age,
          class_id: cls._id,
          class_name: cls.class_name,
          section_name: cls.section_name,
        });
      });
    });

    res.json({
      teacher: {
        _id: teacher._id,
        member_id: teacher.member_id,
        member_name: teacher.member_name,
      },
      totalStudents: students.length,
      students,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getSingleClass = async (req, res) => {
  try {
    const cls = await EndeavourClass.findById(req.params.id)
      .populate("teacher", "member_id member_name member_tamil_name")
      .populate("students", "member_id member_name dob");

    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(cls);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};

// Controller: getEventClassGroups.js
exports.getEventClassGroups = async (req, res) => {
  try {
    const classes = await EndeavourClass.find().select("class_name");

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


exports.getClassById = async (req, res) => {
  try {
    const { id } = req.params;

    // ✅ Prevent invalid ObjectId crash
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        message: "Invalid Class ID",
      });
    }

    const cls = await EndeavourClass.findById(id)
      .populate("students", "member_id member_name")
      .populate("teacher", "member_name");

    if (!cls) {
      return res.status(404).json({ message: "Class not found" });
    }

    res.json(cls);
  } catch (err) {
    console.error("Get Class Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// exports.getClassById = async (req, res) => {
//   try {
//     const { id } = req.params;

//     const cls = await require("../Schema/EndeavourClass")
//       .findById(id)
//       .populate("students", "member_id member_name")
//       .populate("teacher", "member_name");

//     if (!cls) {
//       return res.status(404).json({ message: "Class not found" });
//     }

//     res.json(cls);
//   } catch (err) {
//     console.error("Get Class Error:", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };