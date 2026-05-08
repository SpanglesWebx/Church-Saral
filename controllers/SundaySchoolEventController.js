const mongoose = require("mongoose");
const { SundaySchoolEvent, SundaySchoolEventBy } = require("../Schema/sundaysclEventSchema");
const SundaySchoolClass = require("../Schema/SundayClass");
const Member = require("../Schema/memberSchema");







exports.addEvent = async (req, res) => {
  try {
    let {
      eventBy,
      eventName,
      eventDate,
      registerBefore,
      venue,
      description,
      studentCompetitions = [],
      teacherCompetitions = [],
      classEvents = [],
      teacherCompEvents = [],
    } = req.body;

    /* ===============================
       🔹 Basic Sanitization
    ================================*/
    eventBy = eventBy?.trim();
    eventName = eventName?.trim();
    venue = venue?.trim();
    description = description?.trim();

    /* ===============================
       🔴 Required Field Validation
    ================================*/
    if (!eventBy)
      return res.status(400).json({ message: "Event By is required" });

    if (!eventName)
      return res.status(400).json({ message: "Event Name is required" });

    if (!eventDate)
      return res.status(400).json({ message: "Event Date is required" });

    if (!registerBefore)
      return res.status(400).json({ message: "Register Before date is required" });

    if (!venue)
      return res.status(400).json({ message: "Venue is required" });

    if (!description)
      return res.status(400).json({ message: "Description is required" });

    /* ===============================
       🔴 Date Validation
    ================================*/
    if (new Date(registerBefore) > new Date(eventDate)) {
      return res.status(400).json({
        message: "Register Before date cannot be after Event Date",
      });
    }

    /* ===============================
       🔴 Clean Class Events
    ================================*/
    classEvents = classEvents
      .map((cls) => ({
        className: cls.className?.trim(),
        competitions: (cls.competitions || [])
          .map((c) => ({
            competition: c.competition?.trim(),
            title: c.title?.trim(),
            participants: []
          }))
          .filter((c) => c.competition && c.title),
      }))
      .filter((cls) => cls.className && cls.competitions.length > 0);

    /* ===============================
       🔴 Clean Teacher Competitions
    ================================*/
    teacherCompEvents = (teacherCompEvents || [])
      .map((t) => ({
        competition: t.competition?.trim(),
        title: t.title?.trim(),
        participants: []
      }))
      .filter((t) => t.competition && t.title);

    /* ===============================
       🔴 Ensure At Least One Competition Exists
    ================================*/
    if (
      classEvents.length === 0 &&
      teacherCompEvents.length === 0
    ) {
      return res.status(400).json({
        message: "At least one competition must be added",
      });
    }

    /* ===============================
       🔴 Expand Grouped Classes
    ================================*/
    let expandedClassEvents = [];

    for (const cls of classEvents) {
      const sections = await SundaySchoolClass.find({
        class_name: cls.className,
      });

      if (!sections.length) {
        expandedClassEvents.push(cls);
      } else {
        sections.forEach((sec) => {
          expandedClassEvents.push({
            className: `${sec.class_name}${sec.section_name ? ` - ${sec.section_name}` : ""
              }`,
            competitions: cls.competitions,
          });
        });
      }
    }

    /* ===============================
       ✅ Create Event
    ================================*/
    const event = new SundaySchoolEvent({
      eventBy,
      eventName,
      eventDate,
      registerBefore,
      venue,
      description,
      studentCompetitions,
      teacherCompetitions,
      classEvents: expandedClassEvents,
      teacherCompEvents,
    });

    await event.save();

    return res.status(201).json({
      status: "Success",
      message: "Event created successfully for all sections",
      event,
    });

  } catch (err) {
    console.error("Error adding Sunday School event:", err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const { search = "", startDate, endDate, page = 1, limit = 25 } = req.query;

    const filter = {};

    if (search) {
      filter.eventName = { $regex: search, $options: "i" };
    }

    if (startDate && endDate) {
      filter.eventDate = { $gte: new Date(startDate), $lte: new Date(endDate) };
    } else if (startDate) {
      filter.eventDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.eventDate = { $lte: new Date(endDate) };
    }

    const total = await SundaySchoolEvent.countDocuments(filter);

    const events = await SundaySchoolEvent.find(filter)
      .populate("eventBy", "name")

      // 🔹 Student participants
      .populate({
        path: "classEvents.competitions.participants.member",
        select: "member_id member_name"
      })

      // 🔹 Teacher participants
      .populate({
        path: "teacherCompEvents.participants.member",
        select: "member_id member_name"
      })

      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({
      status: "Success",
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: Number(page),
      events,
    });

  } catch (err) {
    console.error("Error fetching events:", err);
    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error"
    });
  }
};



// 🟢 Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await SundaySchoolEvent.findById(req.params.id)
      .populate("eventBy", "name")

      // 🔹 Populate student participants
      .populate({
        path: "classEvents.competitions.participants.member",
        select: "member_id member_name"
      })

      // 🔹 Populate teacher participants
      .populate({
        path: "teacherCompEvents.participants.member",
        select: "member_id member_name"
      });

    if (!event) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found"
      });
    }

    res.status(200).json({
      status: "Success",
      event
    });

  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error"
    });
  }
};


// 🟣 Add new Event By
exports.addEventBy = async (req, res) => {
  try {
    let { name, names } = req.body;

    // ✅ Accept both single string and array
    let finalNames = [];

    if (Array.isArray(names)) {
      finalNames = names
        .filter(n => typeof n === "string")
        .map(n => n.trim())
        .filter(Boolean);
    } else if (typeof name === "string") {
      finalNames = [name.trim()].filter(Boolean);
    }

    if (finalNames.length === 0) {
      return res.status(400).json({
        status: "Failed",
        message: "Event By name(s) required",
      });
    }

    // ✅ Check duplicates
    const existingDocs = await SundaySchoolEventBy.find({
      name: { $in: finalNames },
    });

    const existingNames = existingDocs.map((d) => d.name);

    const newNames = finalNames.filter(
      (n) => !existingNames.includes(n)
    );

    if (newNames.length === 0) {
      return res.status(400).json({
        status: "Failed",
        message: "All provided Event Bys already exist",
      });
    }

    // ✅ Insert new ones
    const eventBys = await SundaySchoolEventBy.insertMany(
      newNames.map((n) => ({ name: n }))
    );

    res.status(201).json({
      status: "Success",
      message: `Added ${eventBys.length} new Event By record(s)`,
      eventBys,
      duplicates: existingNames,
    });

  } catch (err) {
    console.error("Error adding Event By:", err);
    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};



// 🟣 Get all Event Bys
exports.getAllEventBys = async (req, res) => {
  try {
    const eventBys = await SundaySchoolEventBy.find().sort({ name: 1 });
    res.status(200).json({ status: "Success", eventBys });
  } catch (err) {
    console.error("Error fetching Event Bys:", err);
    res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};




exports.updateEvent = async (req, res) => {
  try {
    const { id } = req.params;

    let {
      eventBy,
      eventName,
      eventDate,
      registerBefore,
      venue,
      description,
      studentCompetitions = [],
      teacherCompetitions = [],
      classEvents = [],
      teacherCompEvents = [],
    } = req.body;

    /* ===============================
       🔹 Basic Sanitization
    ================================*/
    eventBy = eventBy?.trim();
    eventName = eventName?.trim();
    venue = venue?.trim();
    description = description?.trim();

    /* ===============================
       🔴 Required Field Validation
    ================================*/
    if (!eventBy)
      return res.status(400).json({ message: "Event By is required" });

    if (!eventName)
      return res.status(400).json({ message: "Event Name is required" });

    if (!eventDate)
      return res.status(400).json({ message: "Event Date is required" });

    if (!registerBefore)
      return res.status(400).json({ message: "Register Before date is required" });

    if (!venue)
      return res.status(400).json({ message: "Venue is required" });

    if (!description)
      return res.status(400).json({ message: "Description is required" });

    /* ===============================
       🔴 Date Validation
    ================================*/
    if (new Date(registerBefore) > new Date(eventDate)) {
      return res.status(400).json({
        message: "Register Before date cannot be after Event Date",
      });
    }

    /* ===============================
       🔴 Clean Class Events
    ================================*/
    classEvents = classEvents
      .map((cls) => ({
        className: cls.className?.trim(),
        competitions: (cls.competitions || [])
          .map((c) => ({
            competition: c.competition?.trim(),
            title: c.title?.trim(),
          }))
          .filter((c) => c.competition && c.title),
      }))
      .filter((cls) => cls.className && cls.competitions.length > 0);

    /* ===============================
       🔴 Clean Teacher Competitions
    ================================*/
    teacherCompEvents = (teacherCompEvents || [])
      .map((t) => ({
        competition: t.competition?.trim(),
        title: t.title?.trim(),
      }))
      .filter((t) => t.competition && t.title);

    /* ===============================
       🔴 Ensure At Least One Competition Exists
    ================================*/
    if (classEvents.length === 0 && teacherCompEvents.length === 0) {
      return res.status(400).json({
        message: "At least one competition must be added",
      });
    }

    /* ===============================
       🔴 Expand Grouped Classes
    ================================*/
    let expandedClassEvents = [];

    for (const cls of classEvents) {
      const sections = await SundaySchoolClass.find({
        class_name: cls.className,
      });

      if (!sections.length) {
        expandedClassEvents.push(cls);
      } else {
        sections.forEach((sec) => {
          expandedClassEvents.push({
            className: `${sec.class_name}${sec.section_name ? ` - ${sec.section_name}` : ""}`,
            competitions: cls.competitions,
          });
        });
      }
    }

    /* ===============================
       ✅ Update Event
    ================================*/
    const updatedEvent = await SundaySchoolEvent.findByIdAndUpdate(
      id,
      {
        eventBy,
        eventName,
        eventDate,
        registerBefore,
        venue,
        description,
        studentCompetitions,
        teacherCompetitions,
        classEvents: expandedClassEvents,
        teacherCompEvents,
      },
      { new: true, runValidators: true }
    );

    if (!updatedEvent) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    return res.status(200).json({
      status: "Success",
      message: "Event updated successfully",
      event: updatedEvent,
    });

  } catch (err) {
    console.error("Error updating Sunday School event:", err);

    return res.status(500).json({
      message: "Internal Server Error",
    });
  }
};



exports.getEventsByTeacher = async (req, res) => {
  try {
    const { teacherId } = req.params;
    const { search = "", startDate, endDate, page = 1, limit = 25 } = req.query;

    // 1️⃣ Convert member_id → ObjectId
    const teacher = await Member.findOne({ member_id: teacherId });

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found",
      });
    }

    // 2️⃣ Find classes taught by this teacher
    const classes = await SundaySchoolClass.find({
      teacher: teacher._id,
    }).lean();

    if (!classes.length) {
      return res.status(200).json({
        success: true,
        total: 0,
        totalPages: 1,
        events: [],
      });
    }

    // 3️⃣ Build class names
    const classNames = classes.map(
      (c) => `${c.class_name} - ${c.section_name}`
    );

    // 4️⃣ Event filter
    const filter = {
      classEvents: { $elemMatch: { className: { $in: classNames } } },
    };

    if (search) {
      filter.$or = [
        { eventName: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } },
      ];
    }

    if (startDate && endDate) {
      filter.eventDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await SundaySchoolEvent.countDocuments(filter);

    const events = await SundaySchoolEvent.find(filter)
      .populate("eventBy", "name")

      // 🔹 student participants
      .populate({
        path: "classEvents.competitions.participants.member",

        select: "member_id member_name"
      })

      // 🔹 teacher participants
      .populate({
        path: "teacherCompEvents.participants.member",

        select: "member_id member_name"
      })

      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    // 5️⃣ Filter classEvents for teacher classes only
    const filteredEvents = events.map((event) => ({
      ...event,
      classEvents: event.classEvents.filter((ce) =>
        classNames.includes(ce.className)
      ),
    }));

    return res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      events: filteredEvents,
    });

  } catch (error) {
    console.error("Error fetching teacher events:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};




exports.addParticipants = async (req, res) => {
  try {
    const { eventId, className, participants } = req.body;

    if (!eventId || !className || !participants?.length) {
      return res.status(400).json({
        status: "Failed",
        message: "eventId, className and participants are required",
      });
    }

    const event = await SundaySchoolEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found",
      });
    }

    // 1️⃣ Find class block
    const classBlock = event.classEvents.find(
      (c) => c.className === className
    );

    if (!classBlock) {
      return res.status(404).json({
        status: "Failed",
        message: "Class not found in this event",
      });
    }

    // 2️⃣ Loop competitions
    participants.forEach((block) => {
      const comp = classBlock.competitions.find(
        (c) => String(c._id) === String(block.competitionId)
      );

      if (!comp) return;

      block.students.forEach((stu) => {
        const exists = comp.participants.some(
          (p) => String(p.member) === String(stu.member)
        );

        if (!exists) {
          comp.participants.push({
            member: stu.member,
            class_name: stu.class_name,
            section_name: stu.section_name,
          });
        }
      });
    });

    await event.save();

    res.status(200).json({
      status: "Success",
      message: "Participants added successfully",
      event,
    });

  } catch (error) {
    console.error("Add participants error:", error);
    res.status(500).json({
      status: "Failed",
      message: "Server error",
    });
  }
};

exports.updateParticipants = async (req, res) => {
  try {
    const { eventId, className, competitionId, participants } = req.body;

    if (!eventId || !className || !competitionId || !Array.isArray(participants)) {
      return res.status(400).json({
        status: "Failed",
        message: "eventId, className, competitionId and participants are required",
      });
    }

    const eventDoc = await SundaySchoolEvent.findById(eventId);
    if (!eventDoc) return res.status(404).json({ status: "Failed", message: "Event not found" });

    const classBlock = eventDoc.classEvents.find((c) => c.className === className);
    if (!classBlock) return res.status(404).json({ status: "Failed", message: "Class not found" });

    const comp = classBlock.competitions.id(competitionId) ||
      classBlock.competitions.find((c) => String(c._id) === String(competitionId));

    if (!comp) return res.status(404).json({ status: "Failed", message: "Competition not found" });

    // Replace participants with updated list
    comp.participants = participants.map((p) => ({
      member_id: p.member_id,
      member_name: p.member_name,
      class_name: p.class_name,
      section_name: p.section_name,
      prize: p.prize || "None",
    }));

    await eventDoc.save();

    return res.status(200).json({ status: "Success", message: "Participants updated successfully" });
  } catch (err) {
    console.error("Error updating participants:", err);
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};



exports.getParticipants = async (req, res) => {
  try {
    const { eventId, className, competitionId } = req.query;

    if (!eventId || !className || !competitionId) {
      return res.status(400).json({
        status: "Failed",
        message: "eventId, className, and competitionId are required",
      });
    }

    const event = await SundaySchoolEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ status: "Failed", message: "Event not found" });
    }

    const classBlock = event.classEvents.find(c => c.className === className);
    if (!classBlock) {
      return res.status(404).json({ status: "Failed", message: "Class not found in this event" });
    }

    const competition = classBlock.competitions.id(competitionId) ||
      classBlock.competitions.find(c => String(c._id) === String(competitionId));

    if (!competition) {
      return res.status(404).json({ status: "Failed", message: "Competition not found" });
    }

    return res.status(200).json({
      status: "Success",
      participants: competition.participants || [],
    });
  } catch (err) {
    console.error("Error fetching participants:", err);
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

exports.addPrizes = async (req, res) => {
  try {

    const { eventId, className, competitionId, prizes } = req.body;

    const event = await SundaySchoolEvent.findById(eventId);

    const classBlock = event.classEvents.find(c => c.className === className);

    const competition = classBlock.competitions.id(competitionId);

    prizes.forEach(({ member_id, prize }) => {

      const participant = competition.participants.find(
        p => String(p.member) === String(member_id)
      );

      if (participant) {
        participant.prize = prize || "";
      }

    });

    await event.save();

    res.status(200).json({
      status: "Success",
      message: "Prizes updated successfully",
      event
    });

  } catch (err) {
    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error"
    });
  }
};

exports.addTeachers = async (req, res) => {
  try {
    const { eventId, teachers } = req.body;

    if (!eventId || !Array.isArray(teachers) || teachers.length === 0) {
      return res.status(400).json({
        status: "Failed",
        message: "eventId and teachers array are required",
      });
    }

    // load event as a Mongoose document (not lean) so we can modify & save
    const event = await SundaySchoolEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ status: "Failed", message: "Event not found" });
    }

    // ensure arrays exist
    if (!Array.isArray(event.teacherCompEvents)) event.teacherCompEvents = [];
    if (!Array.isArray(event.teacherCompetitions)) event.teacherCompetitions = [];

    const errors = [];

    for (const tRaw of teachers) {

      const competition = (tRaw.competition || "").trim();
      const teacherId = (tRaw.teacherId || "").trim();
      const teacherName = (tRaw.teacherName || "").trim();
      const title = (tRaw.title || competition).trim();

      if (!competition || !teacherId) continue;

      // 🔹 Convert member_id → ObjectId
      const teacherMember = await Member.findOne({ member_id: teacherId });

      if (!teacherMember) continue;

      let compEntry = event.teacherCompEvents.find(
        (c) => String(c.competition) === String(competition)
      );

      if (!compEntry) {
        compEntry = {
          competition,
          title,
          participants: [],
        };
        event.teacherCompEvents.push(compEntry);
      }

      const already = compEntry.participants.some(
        (p) => String(p.member) === String(teacherMember._id)
      );

      if (!already) {
        compEntry.participants.push({
          member: teacherMember._id,
          prize: "",
        });
      }
    }

    // Save document
    await event.save();

    const message = errors.length === 0
      ? "Teachers enrolled successfully"
      : "Teachers enrolled (partial errors exist)";

    return res.status(200).json({
      status: "Success",
      message,
      partialErrors: errors.length > 0 ? errors : undefined,
      event,
    });
  } catch (err) {
    console.error("Error enrolling teachers:", err);
    return res.status(500).json({ status: "Failed", message: "Internal Server Error", error: err.message });
  }
};



// 🟣 Update Event Bys: Add new & remove deleted
exports.updateEventBys = async (req, res) => {
  try {
    let { names } = req.body; // array of tags to keep
    if (!Array.isArray(names)) {
      return res.status(400).json({ status: "Failed", message: "names must be an array" });
    }

    // Trim and remove empty strings
    names = names.map((n) => n.trim()).filter(Boolean);

    // 1️⃣ Delete Event Bys that are NOT in the new list
    await SundaySchoolEventBy.deleteMany({ name: { $nin: names } });

    // 2️⃣ Find existing Event Bys in the DB
    const existingDocs = await SundaySchoolEventBy.find({ name: { $in: names } });
    const existingNames = existingDocs.map((d) => d.name);

    // 3️⃣ Add new Event Bys that do not exist yet
    const newNames = names.filter((n) => !existingNames.includes(n));
    const addedEventBys = await SundaySchoolEventBy.insertMany(
      newNames.map((n) => ({ name: n }))
    );

    // 4️⃣ Return updated list
    const allEventBys = await SundaySchoolEventBy.find().sort({ name: 1 });

    res.status(200).json({
      status: "Success",
      message: "Event Bys updated successfully",
      eventBys: allEventBys,
    });
  } catch (err) {
    console.error("Error updating Event Bys:", err);
    res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};


// Get teacher competition participants
exports.getTeacherParticipants = async (req, res) => {
  try {
    const { eventId, competitionId } = req.query;
    if (!eventId || !competitionId) {
      return res.status(400).json({ status: "Failed", message: "eventId and competitionId are required" });
    }

    const event = await SundaySchoolEvent.findById(eventId);
    if (!event) return res.status(404).json({ status: "Failed", message: "Event not found" });

    const comp = event.teacherCompEvents.id(competitionId) ||
      event.teacherCompEvents.find(c => String(c._id) === String(competitionId));

    if (!comp) return res.status(404).json({ status: "Failed", message: "Teacher competition not found" });

    return res.status(200).json({ status: "Success", participants: comp.participants || [], competition: comp });
  } catch (err) {
    console.error("Error fetching teacher participants:", err);
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

// Update teacher competition participants (replace list)
exports.updateTeacherParticipants = async (req, res) => {
  try {
    const { eventId, competitionId, participants } = req.body;
    // participants = [{ member_id, member_name, prize? }, ...]

    if (!eventId || !competitionId || !Array.isArray(participants)) {
      return res.status(400).json({
        status: "Failed",
        message: "eventId, competitionId and participants are required",
      });
    }

    const eventDoc = await SundaySchoolEvent.findById(eventId);
    if (!eventDoc) return res.status(404).json({ status: "Failed", message: "Event not found" });

    const comp = eventDoc.teacherCompEvents.id(competitionId) ||
      eventDoc.teacherCompEvents.find((c) => String(c._id) === String(competitionId));

    if (!comp) return res.status(404).json({ status: "Failed", message: "Teacher competition not found" });

    comp.participants = participants.map((p) => ({
      member_id: p.member_id,
      member_name: p.member_name,
      prize: p.prize || "",
    }));

    await eventDoc.save();

    return res.status(200).json({ status: "Success", message: "Teacher participants updated successfully", event: eventDoc });
  } catch (err) {
    console.error("Error updating teacher participants:", err);
    return res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

// Update prizes for teacher competition (partial update by member_id)
exports.addPrizesForTeacher = async (req, res) => {

  try {

    const { eventId, competitionId, prizes } = req.body;

    const event = await SundaySchoolEvent.findById(eventId);

    const competition = event.teacherCompEvents.id(competitionId);

    prizes.forEach(({ member_id, prize }) => {

      const participant = competition.participants.find(
        p => String(p.member) === String(member_id)
      );

      if (participant) {
        participant.prize = prize || "";
      }

    });

    await event.save();

    res.status(200).json({
      status: "Success",
      message: "Teacher prizes updated successfully",
      event
    });

  } catch (err) {

    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error"
    });

  }

};
