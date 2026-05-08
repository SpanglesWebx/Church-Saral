// controllers/WomenEventController.js
const { WomenEvent, WomenEventBy } = require("../Schema/womenEventSchema");
const WomenFellowship = require("../Schema/WomenFellowship");
const mongoose = require("mongoose");

exports.addEvent = async (req, res) => {
  try {

    const {
      eventBy,
      eventName,
      eventDate,
      registerBefore,
      venue,
      description,
      competitions = []
    } = req.body;

    /* =============================
       BASIC VALIDATION
    ============================== */

    if (!eventBy)
      return res.status(400).json({
        status: "Failed",
        message: "Event By is required"
      });

    if (!eventName?.trim())
      return res.status(400).json({
        status: "Failed",
        message: "Event Name is required"
      });

    if (!venue?.trim())
      return res.status(400).json({
        status: "Failed",
        message: "Venue is required"
      });

    if (!eventDate)
      return res.status(400).json({
        status: "Failed",
        message: "Event Date is required"
      });

    /* =============================
       CREATE EVENT
    ============================== */

    const event = new WomenEvent({
      eventBy,
      eventName: eventName.trim(),
      eventDate,
      registerBefore,
      venue: venue.trim(),
      description: description?.trim() || "",
      womenCompetitions: competitions
    });

    await event.save();

    return res.status(201).json({
      status: "Success",
      message: "Event created successfully",
      event
    });

  } catch (err) {

    console.error("Women Event Create Error:", err);

    return res.status(500).json({
      status: "Failed",
      message: err.message || "Server error"
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
      filter.eventDate = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    } else if (startDate) {
      filter.eventDate = { $gte: new Date(startDate) };
    } else if (endDate) {
      filter.eventDate = { $lte: new Date(endDate) };
    }

    const total = await WomenEvent.countDocuments(filter);

    const events = await WomenEvent.find(filter)
      .populate("eventBy", "name")
      .populate({
        path: "womenCompetitions.participants.member",
        model: "Members",
        select: "member_name member_id member_tamil_name"
      })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit))
      .lean();

    res.status(200).json({
      status: "Success",
      total,
      totalPages: Math.ceil(total / limit) || 1,
      currentPage: Number(page),
      events
    });

  } catch (err) {

    console.error("Error fetching women events:", err);

    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error"
    });

  }
};


exports.getEventById = async (req, res) => {

  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid Event ID"
      });
    }

    const event = await WomenEvent.findById(id)
      .populate("eventBy", "name")
      .populate(
        "womenCompetitions.participants.member",
        "member_name member_id member_tamil_name"
      );

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

    console.error("Error fetching women event by id:", err);

    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error"
    });

  }

};



exports.saveEventBys = async (req, res) => {
  try {

    let { names } = req.body;

    if (!Array.isArray(names)) {
      return res.status(400).json({
        status: "Failed",
        message: "Names must be an array"
      });
    }

    // clean values
    names = names.map(n => n.trim()).filter(Boolean);

    if (names.length === 0) {
      return res.status(400).json({
        status: "Failed",
        message: "At least one Event By required"
      });
    }

    /* =========================
       REMOVE DELETED
    ========================== */

    await WomenEventBy.deleteMany({
      name: { $nin: names }
    });

    /* =========================
       FIND EXISTING
    ========================== */

    const existingDocs = await WomenEventBy.find({
      name: { $in: names }
    });

    const existingNames = existingDocs.map(e => e.name);

    /* =========================
       ADD NEW
    ========================== */

    const newNames = names.filter(
      n => !existingNames.includes(n)
    );

    if (newNames.length) {
      await WomenEventBy.insertMany(
        newNames.map(n => ({ name: n }))
      );
    }

    /* =========================
       FINAL RESULT
    ========================== */

    const eventBys = await WomenEventBy
      .find()
      .sort({ name: 1 });

    res.status(200).json({
      status: "Success",
      message: "Event By list saved successfully",
      eventBys
    });

  } catch (err) {

    console.error("EventBy Save Error:", err);

    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error"
    });

  }
};

exports.addEventBy = async (req, res) => {
  try {
    let { name } = req.body;

    const names = Array.isArray(name)
      ? name.map((n) => n.trim()).filter(Boolean)
      : [name && name.toString().trim()].filter(Boolean);

    if (names.length === 0) {
      return res.status(400).json({ status: "Failed", message: "Event By name(s) required" });
    }

    const existingDocs = await WomenEventBy.find({ name: { $in: names } });
    const existingNames = existingDocs.map((d) => d.name);
    const newNames = names.filter((n) => !existingNames.includes(n));

    if (newNames.length === 0) {
      return res.status(400).json({ status: "Failed", message: "All provided Event Bys already exist" });
    }

    const eventBys = await WomenEventBy.insertMany(newNames.map((n) => ({ name: n })));

    res.status(201).json({
      status: "Success",
      message: `Added ${eventBys.length} new Event By record(s)`,
      eventBys,
      duplicates: existingNames,
    });
  } catch (err) {
    console.error("Error adding Event By:", err);
    res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};


exports.getAllEventBys = async (req, res) => {
  try {
    const eventBys = await WomenEventBy.find().sort({ name: 1 });
    res.status(200).json({ status: "Success", eventBys });
  } catch (err) {
    console.error("Error fetching Event Bys:", err);
    res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};


exports.updateEvent = async (req, res) => {
  try {

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        status: "Failed",
        message: "Invalid Event ID"
      });
    }

    const {
      eventBy,
      eventName,
      eventDate,
      registerBefore,
      venue,
      description,
      competitions
    } = req.body;

    /* ===============================
       VALIDATION
    =============================== */

    if (!eventBy) {
      return res.status(400).json({
        status: "Failed",
        message: "Event By is required"
      });
    }

    if (!eventName || !eventName.trim()) {
      return res.status(400).json({
        status: "Failed",
        message: "Event Name is required"
      });
    }

    if (!venue || !venue.trim()) {
      return res.status(400).json({
        status: "Failed",
        message: "Venue is required"
      });
    }

    if (!eventDate) {
      return res.status(400).json({
        status: "Failed",
        message: "Event Date is required"
      });
    }

    /* ===============================
       FIND EVENT
    =============================== */

    const event = await WomenEvent.findById(id);

    if (!event) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found"
      });
    }

    /* ===============================
       DATE VALIDATION
    =============================== */

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const eventDateObj = new Date(eventDate);
    const registerDateObj = registerBefore ? new Date(registerBefore) : null;

    if (eventDateObj < today) {
      return res.status(400).json({
        status: "Failed",
        message: "Event date cannot be in the past"
      });
    }

    if (registerDateObj && registerDateObj > eventDateObj) {
      return res.status(400).json({
        status: "Failed",
        message: "Register Before must be before Event Date"
      });
    }

    /* ===============================
       UPDATE EVENT
    =============================== */

    event.eventBy = eventBy;
    event.eventName = eventName.trim();
    event.eventDate = eventDate;
    event.registerBefore = registerBefore;
    event.venue = venue.trim();
    event.description = description?.trim() || "";

    if (Array.isArray(competitions)) {
      event.womenCompetitions = competitions;
    }

    await event.save();

    return res.status(200).json({
      status: "Success",
      message: "Event updated successfully",
      event
    });

  } catch (err) {

    console.error("Women Event Update Error:", err);

    return res.status(500).json({
      status: "Failed",
      message: "Server error while updating event"
    });

  }
};


exports.addParticipants = async (req, res) => {
  try {

    const { eventId, participants } = req.body;

    if (!eventId || !Array.isArray(participants)) {
      return res.status(400).json({
        status: "Failed",
        message: "eventId and participants array are required"
      });
    }

    const eventDoc = await WomenEvent.findById(eventId);

    if (!eventDoc) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found"
      });
    }

    const errors = [];

    for (const block of participants) {

      const { competitionId, members } = block;

      if (!competitionId) {
        errors.push({ competitionId: null, message: "CompetitionId missing" });
        continue;
      }

      if (!Array.isArray(members) || members.length === 0) {
        errors.push({ competitionId, message: "Members array empty" });
        continue;
      }

      const competition = eventDoc.womenCompetitions.id(competitionId);

      if (!competition) {
        errors.push({ competitionId, message: "Competition not found" });
        continue;
      }

      if (!Array.isArray(competition.participants)) {
        competition.participants = [];
      }

      for (const mem of members) {

        if (!mem.member) continue;

        const alreadyExists = competition.participants.some(
          (p) => String(p.member) === String(mem.member)
        );

        if (!alreadyExists) {
          competition.participants.push({
            member: mem.member,
            prize: mem.prize || ""
          });
        }

      }

    }

    await eventDoc.save();

    return res.status(200).json({
      status: "Success",
      message: errors.length ? "Participants added with some errors" : "Participants added successfully",
      errors
    });

  } catch (err) {

    console.error("Women addParticipants error:", err);

    return res.status(500).json({
      status: "Failed",
      message: "Internal Server Error",
      error: err.message
    });

  }
};




exports.updateParticipants = async (req, res) => {
  try {

    const { eventId, competitionId, participants } = req.body;

    if (!eventId || !competitionId || !Array.isArray(participants)) {
      return res.status(400).json({
        status: "Failed",
        message: "eventId, competitionId and participants are required"
      });
    }

    const eventDoc = await WomenEvent.findById(eventId);

    if (!eventDoc) {
      return res.status(404).json({ status: "Failed", message: "Event not found" });
    }

    const comp = eventDoc.womenCompetitions.id(competitionId);

    if (!comp) {
      return res.status(404).json({ status: "Failed", message: "Competition not found" });
    }

    comp.participants = participants.map(p => ({
      member: p.member,
      prize: p.prize || ""
    }));

    await eventDoc.save();

    res.status(200).json({
      status: "Success",
      message: "Participants updated successfully",
      event: eventDoc
    });

  } catch (err) {

    console.error("Women updateParticipants error:", err);

    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error"
    });

  }
};


exports.getParticipants = async (req, res) => {

  try {

    const { eventId, competitionId } = req.query;

    if (!eventId || !competitionId) {
      return res.status(400).json({
        status: "Failed",
        message: "eventId and competitionId required"
      });
    }

    const event = await WomenEvent.findById(eventId)
      .populate("womenCompetitions.participants.member", "member_name member_id");

    if (!event) {
      return res.status(404).json({ status: "Failed", message: "Event not found" });
    }

    const competition = event.womenCompetitions.id(competitionId);

    if (!competition) {
      return res.status(404).json({ status: "Failed", message: "Competition not found" });
    }

    res.status(200).json({
      status: "Success",
      participants: competition.participants
    });

  } catch (err) {

    console.error("Women getParticipants error:", err);

    res.status(500).json({
      status: "Failed",
      message: "Internal Server Error"
    });

  }

};



exports.addPrizes = async (req, res) => {

  try {

    const { eventId, competitionId, prizes } = req.body;

    if (!eventId || !competitionId || !Array.isArray(prizes)) {
      return res.status(400).json({
        status: "Failed",
        message: "eventId, competitionId and prizes required"
      });
    }

    const event = await WomenEvent.findById(eventId);

    if (!event) {
      return res.status(404).json({
        status: "Failed",
        message: "Event not found"
      });
    }

    const competition = event.womenCompetitions.id(competitionId);

    if (!competition) {
      return res.status(404).json({
        status: "Failed",
        message: "Competition not found"
      });
    }

    prizes.forEach(({ member, prize }) => {

      const participant = competition.participants.find(
        p => String(p.member) === String(member)
      );

      if (participant) {
        participant.prize = prize || "";
      }

    });

    await event.save();

    res.json({
      status: "Success",
      message: "Prizes updated successfully",
      event
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      status: "Failed",
      message: "Server error"
    });

  }

};


exports.updateEventBys = async (req, res) => {
  try {
    let { names } = req.body;
    if (!Array.isArray(names)) {
      return res.status(400).json({ status: "Failed", message: "names must be an array" });
    }

    names = names.map((n) => n.trim()).filter(Boolean);

    // Delete eventBys not in the new list
    await WomenEventBy.deleteMany({ name: { $nin: names } });

    // Find existing
    const existingDocs = await WomenEventBy.find({ name: { $in: names } });
    const existingNames = existingDocs.map((d) => d.name);

    // Add new ones
    const newNames = names.filter((n) => !existingNames.includes(n));
    const addedEventBys = newNames.length ? await WomenEventBy.insertMany(newNames.map((n) => ({ name: n }))) : [];

    const allEventBys = await WomenEventBy.find().sort({ name: 1 });

    res.status(200).json({
      status: "Success",
      message: "Event Bys updated successfully",
      eventBys: allEventBys,
    });
  } catch (err) {
    console.error("Error updating Event Bys (women):", err);
    res.status(500).json({ status: "Failed", message: "Internal Server Error" });
  }
};

module.exports = exports;
