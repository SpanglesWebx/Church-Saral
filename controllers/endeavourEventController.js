const mongoose = require("mongoose");
const { EndeavourEvent, EndeavourEventBy } = require("../Schema/endeavourEventSchema");
const EndeavourClass = require("../Schema/EndeavourClass");
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
      teacherCompEvents = []
    } = req.body;

    /* =============================
       VALIDATION
    ============================= */

    const errors = {};

    if (!eventBy) errors.eventBy = "Event By is required";
    if (!eventName?.trim()) errors.eventName = "Event Name is required";
    if (!eventDate) errors.eventDate = "Event Date is required";
    if (!registerBefore) errors.registerBefore = "Register Before date is required";
    if (!venue?.trim()) errors.venue = "Venue is required";

    // Date validation
    if (eventDate && registerBefore) {
      if (new Date(registerBefore) > new Date(eventDate)) {
        errors.registerBefore = "Register Before cannot be after Event Date";
      }
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        status: "Failed",
        message: "Please fix validation errors",
        errors
      });
    }

    /* =============================
       CLEAN CLASS EVENTS
    ============================= */

    const cleanedClassEvents = (classEvents || [])
      .map(cls => ({
        className: cls.className,
        competitions: (cls.competitions || [])
          .filter(c => c.competition?.trim() && c.title?.trim())
          .map(c => ({
            competition: c.competition.trim(),
            title: c.title.trim(),
            participants: []
          }))
      }))
      .filter(cls => cls.className && cls.competitions.length > 0);


    /* =============================
       CLEAN TEACHER EVENTS
    ============================= */

    const cleanedTeacherEvents = (teacherCompEvents || [])
      .filter(c => c.competition?.trim() && c.title?.trim())
      .map(c => ({
        competition: c.competition.trim(),
        title: c.title.trim(),
        participants: []
      }));


    /* =============================
       SAVE EVENT
    ============================= */

    const event = new EndeavourEvent({
      eventBy,
      eventName: eventName.trim(),
      eventDate,
      registerBefore,
      venue: venue.trim(),
      description: description?.trim() || "",

      studentCompetitions,
      teacherCompetitions,

      classEvents: cleanedClassEvents,
      teacherCompEvents: cleanedTeacherEvents
    });

    await event.save();

    res.status(201).json({
      status: "Success",
      message: "Event created successfully",
      event
    });

  } catch (error) {

    console.error("Add Event Error:", error);

    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error"
    });

  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const { search = "", startDate, endDate, page = 1, limit = 10 } = req.query;

    const filter = {};

    if (search) {
      filter.eventName = { $regex: search, $options: "i" };
    }

    if (startDate && endDate) {
      filter.eventDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate),
      };
    } else if (startDate) {
      filter.eventDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.eventDate = { $lte: new Date(endDate) };
    }

    const total = await EndeavourEvent.countDocuments(filter);

    const events = await EndeavourEvent.find(filter)
      .populate("eventBy", "name")
      .populate(
        "classEvents.competitions.participants.member",
        "member_id member_name"
      )
      .populate(
        "teacherCompEvents.participants.member",
        "member_id member_name"
      )
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

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
      message: "Internal Server Error",
    });
  }
};


// 🟢 Get single event by ID
exports.getEventById = async (req, res) => {
  try {
    const event = await EndeavourEvent.findById(req.params.id)
      .populate("eventBy", "name")
      .populate(
        "classEvents.competitions.participants.member",
        "member_id member_name"
      )
      .populate(
        "teacherCompEvents.participants.member",
        "member_id member_name"
      )
      .lean();

    if (!event) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found",
      });
    }

    res.status(200).json({
      status: "Success",
      event,
    });

  } catch (err) {
    console.error("Error fetching event:", err);
    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};


// 🟣 Add new Event By
exports.addEventBy = async (req, res) => {
  try {
    let { name } = req.body;

    // ✅ Normalize input: allow single string or array
    const names = Array.isArray(name)
      ? name.map((n) => n.trim()).filter(Boolean)
      : [name.trim()].filter(Boolean);

    if (names.length === 0) {
      return res.status(400).json({ status: "Failed", message: "Event By name(s) required" });
    }

    // ✅ Find duplicates (existing in DB)
    const existingDocs = await EndeavourEventBy.find({ name: { $in: names } });
    const existingNames = existingDocs.map((d) => d.name);
    const newNames = names.filter((n) => !existingNames.includes(n));

    if (newNames.length === 0) {
      return res.status(400).json({ status: "Failed", message: "All provided Event Bys already exist" });
    }

    // ✅ Insert all new EventBys
    const eventBys = await EndeavourEventBy.insertMany(
      newNames.map((n) => ({ name: n }))
    );

    res.status(201).json({
      status: "Success",
      message: `Added ${eventBys.length} new Event By record(s)`,
      eventBys,
      duplicates: existingNames, // optional: send back skipped ones
    });
  } catch (err) {
    console.error("Error adding Event By:", err);
    res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};


// 🟣 Get all Event Bys
exports.getAllEventBys = async (req, res) => {
  try {
    const eventBys = await EndeavourEventBy.find().sort({ name: 1 });
    res.status(200).json({ status: "Success", eventBys });
  } catch (err) {
    console.error("Error fetching Event Bys:", err);
    res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};






exports.updateEvent = async (req, res) => {
  try {
    const eventId = req.params.id;

    if (!eventId) {
      return res.status(400).json({
        status: "Failed",
        message: "Event ID is required",
      });
    }

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

    // ---------------------------
    // BASIC VALIDATION
    // ---------------------------
    if (
      !eventBy?.trim() ||
      !eventName?.trim() ||
      !eventDate ||
      !registerBefore ||
      !venue?.trim() ||
      !description?.trim()
    ) {
      return res.status(400).json({
        status: "Failed",
        message: "All required fields must be provided",
      });
    }

    // Date validation
    const eventDateObj = new Date(eventDate);
    const registerDateObj = new Date(registerBefore);

    if (isNaN(eventDateObj) || isNaN(registerDateObj)) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid date format",
      });
    }

    if (registerDateObj > eventDateObj) {
      return res.status(400).json({
        status: "Failed",
        message: "Register before date cannot be after event date",
      });
    }

    // ---------------------------
    // CLEAN CLASS EVENTS
    // ---------------------------
    classEvents = (classEvents || [])
      .map((cls) => ({
        ...cls,
        competitions: (cls.competitions || []).filter(
          (c) => c?.competition && c?.title
        ),
      }))
      .filter((cls) => cls?.className && cls.competitions.length > 0);

    // ---------------------------
    // CLEAN TEACHER EVENTS
    // ---------------------------
    teacherCompEvents = (teacherCompEvents || []).filter(
      (t) => t?.competition && t?.title
    );

    // ---------------------------
    // EXPAND GROUPED CLASSES
    // ---------------------------
    let expandedClassEvents = [];

    for (const cls of classEvents) {
      const sections = await EndeavourClass.find({
        class_name: cls.className,
      });

      if (sections.length === 0) {
        expandedClassEvents.push(cls);
      } else {
        sections.forEach((sec) => {
          expandedClassEvents.push({
            className: `${sec.class_name} - ${sec.section_name || ""}`,
            competitions: cls.competitions,
          });
        });
      }
    }

    // ---------------------------
    // UPDATE EVENT
    // ---------------------------
    const updatedEvent = await EndeavourEvent.findByIdAndUpdate(
      eventId,
      {
        eventBy,
        eventName,
        eventDate: eventDateObj,
        registerBefore: registerDateObj,
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
        status: "Failed",
        message: "Event not found",
      });
    }

    res.status(200).json({
      status: "Success",
      message: "Event updated successfully",
      event: updatedEvent,
    });
  } catch (err) {
    console.error("Error updating event:", err);

    res.status(500).json({
      status: "Failed",
      message: err.message || "Internal Server Error",
    });
  }
};



exports.getEventsByTeacher = async (req, res) => {
  try {

    const { teacherId } = req.params;
    const { search = "", startDate, endDate, page = 1, limit = 10 } = req.query;

    /* ===============================
       1️⃣ GET TEACHER OBJECTID
    =============================== */

    const teacher = await Member.findOne({ member_id: teacherId }).select("_id");

    if (!teacher) {
      return res.status(404).json({
        success: false,
        message: "Teacher not found"
      });
    }

    /* ===============================
       2️⃣ GET TEACHER CLASSES
    =============================== */

    const classes = await EndeavourClass.find({
      teacher: teacher._id
    })
      .select("class_name section_name")
      .lean();

    if (!classes.length) {
      return res.status(200).json({
        success: true,
        total: 0,
        totalPages: 1,
        events: []
      });
    }

    /* ===============================
       3️⃣ BUILD CLASS NAMES
    =============================== */

    const classNames = classes.map(
      (c) => `${c.class_name} - ${c.section_name}`
    );

    /* ===============================
       4️⃣ BUILD FILTER
    =============================== */

    const filter = {
      classEvents: {
        $elemMatch: {
          className: { $in: classNames }
        }
      }
    };

    if (search) {
      filter.$or = [
        { eventName: { $regex: search, $options: "i" } },
        { venue: { $regex: search, $options: "i" } }
      ];
    }

    if (startDate || endDate) {

      filter.eventDate = {};

      if (startDate) {
        filter.eventDate.$gte = new Date(startDate);
      }

      if (endDate) {
        filter.eventDate.$lte = new Date(endDate);
      }
    }

    /* ===============================
       5️⃣ PAGINATION
    =============================== */

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const total = await EndeavourEvent.countDocuments(filter);

    const events = await EndeavourEvent.find(filter)
      .populate("eventBy", "name")
      .populate("classEvents.competitions.participants.member", "member_id member_name")
      .populate("teacherCompEvents.participants.member", "member_id member_name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    /* ===============================
       6️⃣ FILTER ONLY TEACHER CLASSES
    =============================== */

    const filteredEvents = events.map(event => ({
      ...event,
      classEvents: event.classEvents.filter(ce =>
        classNames.includes(ce.className)
      )
    }));

    /* ===============================
       7️⃣ RESPONSE
    =============================== */

    res.status(200).json({
      success: true,
      total,
      totalPages: Math.ceil(total / limit),
      events: filteredEvents
    });

  } catch (error) {

    console.error("Error fetching teacher events:", error);

    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};



exports.addParticipants = async (req, res) => {
  try {
    const { eventId, className, participants } = req.body;

    if (!eventId || !className || !Array.isArray(participants)) {
      return res.status(400).json({
        status: "Failed",
        message: "eventId, className and participants are required",
      });
    }

    const event = await EndeavourEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found",
      });
    }

    const classBlock = event.classEvents.find(
      (c) => c.className.trim().toLowerCase() === className.trim().toLowerCase()
    );

    if (!classBlock) {
      return res.status(404).json({
        status: "Failed",
        message: `Class ${className} not found in event`,
      });
    }

    for (const block of participants) {

      const { competitionId, students } = block;

      const comp = classBlock.competitions.id(competitionId);

      if (!comp) continue;

      for (const stu of students) {

        const memberDoc = await Member.findOne({ member_id: stu.member_id });

        if (!memberDoc) continue;

        const exists = comp.participants.some(
          (p) => String(p.member) === String(memberDoc._id)
        );

        if (!exists) {

          await EndeavourEvent.updateOne(
            {
              _id: eventId,
              "classEvents.className": className,
              "classEvents.competitions._id": competitionId
            },
            {
              $push: {
                "classEvents.$[class].competitions.$[comp].participants": {
                  member: memberDoc._id,
                  class_name: stu.class_name,
                  section_name: stu.section_name
                }
              }
            },
            {
              arrayFilters: [
                { "class.className": className },
                { "comp._id": competitionId }
              ]
            }
          );

        }

      }

    }

    res.status(200).json({
      status: "Success",
      message: "Participants added successfully",
    });

  } catch (err) {

    console.error("addParticipants error:", err);

    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
      error: err.message,
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

    const eventDoc = await EndeavourEvent.findById(eventId);

    if (!eventDoc) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found",
      });
    }

    const classBlock = eventDoc.classEvents.find(
      (c) => String(c.className) === String(className)
    );

    if (!classBlock) {
      return res.status(404).json({
        status: "Failed",
        message: "Class not found",
      });
    }

    const comp = classBlock.competitions.find(
      (c) => String(c._id) === String(competitionId)
    );

    if (!comp) {
      return res.status(404).json({
        status: "Failed",
        message: "Competition not found",
      });
    }

    // Convert incoming member_ids to ObjectIds
    const newMemberIds = [];

    for (const p of participants) {

      const memberDoc = await Member.findOne({ member_id: p.member_id });

      if (!memberDoc) continue;

      newMemberIds.push(String(memberDoc._id));

      const exists = comp.participants.find(
        (pp) => String(pp.member) === String(memberDoc._id)
      );

      if (!exists) {
        comp.participants.push({
          member: memberDoc._id,
          prize: p.prize || "",
        });
      }

    }

    // 🔥 Remove unchecked participants
    comp.participants = comp.participants.filter((p) =>
      newMemberIds.includes(String(p.member))
    );

    await eventDoc.save();

    const updatedEvent = await EndeavourEvent.findById(eventId)
      .populate("eventBy", "name")
      .populate("classEvents.competitions.participants.member")
      .populate("teacherCompEvents.participants.member");

    res.status(200).json({
      status: "Success",
      message: "Participants updated successfully",
      event: updatedEvent,
    });

  } catch (err) {

    console.error("Error updating participants:", err);

    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });

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

    const event = await EndeavourEvent.findById(eventId);
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

    if (!eventId || !className || !competitionId || !Array.isArray(prizes)) {
      return res.status(400).json({
        status: "Failed",
        message: "eventId, className, competitionId and prizes are required",
      });
    }

    const event = await EndeavourEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found",
      });
    }

    const classBlock = event.classEvents.find(
      (c) => String(c.className) === String(className)
    );

    if (!classBlock) {
      return res.status(404).json({
        status: "Failed",
        message: "Class not found",
      });
    }

    const competition = classBlock.competitions.find(
      (c) => String(c._id) === String(competitionId)
    );

    if (!competition) {
      return res.status(404).json({
        status: "Failed",
        message: "Competition not found",
      });
    }

    for (const { member_id, prize } of prizes) {

      const memberDoc = await Member.findOne({ member_id });

      if (!memberDoc) continue;

      const participant = competition.participants.find(
        (p) => String(p.member) === String(memberDoc._id)
      );

      if (participant) {
        participant.prize = prize || "None";
      }
    }

    await event.save();

    const updatedEvent = await EndeavourEvent.findById(eventId)
      .populate("eventBy", "name")
      .populate("classEvents.competitions.participants.member")
      .populate("teacherCompEvents.participants.member");

    res.status(200).json({
      status: "Success",
      message: "Prizes updated successfully",
      event: updatedEvent,
    });

  } catch (err) {
    console.error("Error updating prizes:", err);
    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

exports.addTeachers = async (req, res) => {
  try {
    const { eventId, teachers } = req.body;

    const event = await EndeavourEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    for (const t of teachers) {
      const member = await Member.findOne({ member_id: t.teacherId });

      if (!member) continue;

      let comp = event.teacherCompEvents.find(
        (c) => c.competition === t.competition
      );

      // create competition block if not exists
      if (!comp) {
        event.teacherCompEvents.push({
          competition: t.competition,
          title: t.competition,
          participants: [],
        });

        comp = event.teacherCompEvents[event.teacherCompEvents.length - 1];
      }

      const exists = comp.participants.some(
        (p) => String(p.member) === String(member._id)
      );

      if (!exists) {
        comp.participants.push({
          member: member._id,
        });
      }
    }

    await event.save();
    const updatedEvent = await EndeavourEvent.findById(eventId)
      .populate("eventBy", "name")
      .populate("classEvents.competitions.participants.member");

    res.json({
      success: true,
      message: "Teacher enrolled successfully",
      event: updatedEvent,
    });

  } catch (err) {
    console.error("Teacher enrollment error:", err);
    res.status(500).json({ message: err.message });
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
    await EndeavourEventBy.deleteMany({ name: { $nin: names } });

    // 2️⃣ Find existing Event Bys in the DB
    const existingDocs = await EndeavourEventBy.find({ name: { $in: names } });
    const existingNames = existingDocs.map((d) => d.name);

    // 3️⃣ Add new Event Bys that do not exist yet
    const newNames = names.filter((n) => !existingNames.includes(n));
    const addedEventBys = await EndeavourEventBy.insertMany(
      newNames.map((n) => ({ name: n }))
    );

    // 4️⃣ Return updated list
    const allEventBys = await EndeavourEventBy.find().sort({ name: 1 });

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

    const event = await EndeavourEvent.findById(eventId);
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

    if (!eventId || !competitionId || !Array.isArray(participants)) {
      return res.status(400).json({
        status: "Failed",
        message: "eventId, competitionId and participants are required",
      });
    }

    const eventDoc = await EndeavourEvent.findById(eventId);

    if (!eventDoc) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found",
      });
    }

    const comp = eventDoc.teacherCompEvents.find(
      (c) => String(c._id) === String(competitionId)
    );

    if (!comp) {
      return res.status(404).json({
        status: "Failed",
        message: "Teacher competition not found",
      });
    }

    const updatedParticipants = [];

    for (const p of participants) {

      const memberDoc = await Member.findOne({ member_id: p.member_id });

      if (!memberDoc) continue;

      updatedParticipants.push({
        member: memberDoc._id,
        prize: p.prize || "",
      });
    }

    comp.participants = updatedParticipants;

    await eventDoc.save();

    const updatedEvent = await EndeavourEvent.findById(eventId)
      .populate("eventBy", "name")
      .populate("teacherCompEvents.participants.member");

    return res.status(200).json({
      status: "Success",
      message: "Teacher participants updated successfully",
      event: updatedEvent,
    });

  } catch (err) {
    console.error("Error updating teacher participants:", err);
    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};

// Update prizes for teacher competition (partial update by member_id)
exports.addPrizesForTeacher = async (req, res) => {
  try {
    const { eventId, competitionId, prizes } = req.body;

    if (!eventId || !competitionId || !Array.isArray(prizes)) {
      return res.status(400).json({
        status: "Failed",
        message: "eventId, competitionId and prizes are required",
      });
    }

    const event = await EndeavourEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found",
      });
    }

    const competition = event.teacherCompEvents.find(
      (c) => String(c._id) === String(competitionId)
    );

    if (!competition) {
      return res.status(404).json({
        status: "Failed",
        message: "Teacher competition not found",
      });
    }

    for (const { member_id, prize } of prizes) {

      const memberDoc = await Member.findOne({ member_id });

      if (!memberDoc) continue;

      const participant = competition.participants.find(
        (p) => String(p.member) === String(memberDoc._id)
      );

      if (participant) {
        participant.prize = prize || "";
      }
    }

    await event.save();

    const updatedEvent = await EndeavourEvent.findById(eventId)
      .populate("eventBy", "name")
      .populate("teacherCompEvents.participants.member");

    res.status(200).json({
      status: "Success",
      message: "Teacher prizes updated successfully",
      event: updatedEvent,
    });

  } catch (err) {
    console.error("Error updating teacher prizes:", err);
    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
    });
  }
};
