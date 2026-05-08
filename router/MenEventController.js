
const { MenEvent, MenEventBy } = require("../Schema/MenEventSchema");
const MenEventPrize = require("../Schema/MenEventPrizeSchema");

exports.addEvent = async (req, res) => {
    try {

        const {
            eventBy,
            eventName,
            venue,
            description,
            eventDate,
            registerBefore,
            competitions = []
        } = req.body;

        if (!eventBy || !eventName || !venue || !eventDate) {
            return res.status(400).json({
                status: "Failed",
                message: "Required fields missing"
            });
        }

        const event = new MenEvent({
            eventBy,
            eventName,
            venue,
            description,
            eventDate,
            registerBefore,
            menCompetitions: competitions
        });

        await event.save();

        res.status(201).json({
            status: "Success",
            message: "Men Event created successfully",
            event
        });

    } catch (err) {

        res.status(500).json({
            status: "Failed",
            message: err.message
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

        if (startDate || endDate) {
            filter.eventDate = {};
            if (startDate) filter.eventDate.$gte = new Date(startDate);
            if (endDate) filter.eventDate.$lte = new Date(endDate);
        }

        const total = await MenEvent.countDocuments(filter);

        const events = await MenEvent.find(filter)
            .populate("eventBy", "name")
            .populate("menCompetitions.participants.member", "member_name member_id")
            .sort({ createdAt: -1 })
            .skip((page - 1) * limit)
            .limit(Number(limit));

        res.json({
            status: "Success",
            events,
            totalPages: Math.ceil(total / limit)
        });

    } catch (err) {
        res.status(500).json({ status: "Failed", message: "Server error" });
    }
};






exports.getEventById = async (req, res) => {
    try {

        const event = await MenEvent.findById(req.params.id)
            .populate("eventBy", "name")
            .populate("menCompetitions.participants.member", "member_name member_id");

        if (!event) {
            return res.status(404).json({
                status: "Failed",
                message: "Event not found"
            });
        }

        res.json({
            status: "Success",
            event
        });

    } catch (err) {

        res.status(500).json({
            status: "Failed",
            message: "Server error"
        });

    }
};



exports.updateEvent = async (req, res) => {
    try {

        const { id } = req.params;

        const {
            eventBy,
            eventName,
            venue,
            description,
            eventDate,
            registerBefore,
            competitions = []
        } = req.body;

        const event = await MenEvent.findById(id);

        if (!event) {
            return res.status(404).json({
                status: "Failed",
                message: "Event not found"
            });
        }

        event.eventBy = eventBy;
        event.eventName = eventName;
        event.venue = venue;
        event.description = description;
        event.eventDate = eventDate;
        event.registerBefore = registerBefore;

        if (competitions.length) {
            event.menCompetitions = competitions;
        }

        await event.save();

        res.json({
            status: "Success",
            message: "Event updated successfully",
            event
        });

    } catch (err) {

        res.status(500).json({
            status: "Failed",
            message: err.message
        });

    }
};



exports.getAllEventBys = async (req, res) => {
    try {

        const eventBys = await MenEventBy.find().sort({ name: 1 });

        res.status(200).json({
            status: "Success",
            eventBys
        });

    } catch (err) {

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
                message: "Names must be array"
            });
        }

        names = names.map(n => n.trim()).filter(Boolean);

        await MenEventBy.deleteMany({
            name: { $nin: names }
        });

        const existingDocs = await MenEventBy.find({
            name: { $in: names }
        });

        const existingNames = existingDocs.map(e => e.name);

        const newNames = names.filter(n => !existingNames.includes(n));

        if (newNames.length) {
            await MenEventBy.insertMany(
                newNames.map(n => ({ name: n }))
            );
        }

        const eventBys = await MenEventBy.find().sort({ name: 1 });

        res.status(200).json({
            status: "Success",
            eventBys
        });

    } catch (err) {

        res.status(500).json({
            status: "Failed",
            message: "Internal Server Error"
        });

    }
};





exports.addParticipants = async (req, res) => {
    try {

        const { eventId, participants } = req.body;

        const event = await MenEvent.findById(eventId);

        if (!event) {
            return res.status(404).json({
                status: "Failed",
                message: "Event not found"
            });
        }

        for (const item of participants) {

            const competition = event.menCompetitions.id(item.competitionId);

            if (!competition) continue;

            item.members.forEach(m => {

                const exists = competition.participants.some(
                    p => String(p.member) === String(m.member)
                );

                if (!exists) {
                    competition.participants.push({
                        member: m.member,
                        prize: ""
                    });
                }

            });

        }

        await event.save();

        res.json({
            status: "Success",
            message: "Participants added successfully"
        });

    } catch (err) {
        res.status(500).json({
            status: "Failed",
            message: "Error adding participants"
        });
    }
};


exports.updateParticipants = async (req, res) => {
    try {

        const { eventId, competitionId, participants } = req.body;

        const event = await MenEvent.findById(eventId);

        const comp = event.menCompetitions.id(competitionId);

        comp.participants = participants;

        await event.save();

        res.json({
            status: "Success",
            message: "Participants updated"
        });

    } catch (err) {
        res.status(500).json({
            status: "Failed",
            message: "Update failed"
        });
    }
};




exports.assignPrizes = async (req, res) => {

    try {

        const { eventId, competitionId, prizes } = req.body;

        const event = await MenEvent.findById(eventId);

        const comp = event.menCompetitions.id(competitionId);

        prizes.forEach(prize => {

            const participant = comp.participants.find(
                p => String(p.member) === String(prize.member)
            );

            if (participant) {
                participant.prize = prize.prize;
            }

        });

        await event.save();

        res.json({
            status: "Success",
            message: "Prizes assigned successfully"
        });

    } catch (err) {

        res.status(500).json({
            status: "Failed",
            message: "Failed to assign prizes"
        });

    }

};




exports.getPrizeList = async (req, res) => {

    try {

        const prizes = await MenEventPrize
            .find()
            .sort({ prizeName: 1 });

        res.json({
            status: "Success",
            prizes: prizes.map(p => p.prizeName)
        });

    } catch (err) {

        res.status(500).json({
            status: "Failed",
            message: "Failed to fetch prizes"
        });

    }

};



exports.addPrizeTypes = async (req, res) => {

  try {

    const { prizes } = req.body;

    await MenEventPrize.deleteMany({});

    const docs = prizes.map(p => ({
      prizeName: p.trim()
    }));

    await MenEventPrize.insertMany(docs);

    res.json({
      status: "Success",
      message: "Prize list Saved successfully"
    });

  } catch (err) {

    res.status(500).json({
      status: "Failed",
      message: "Failed to Save prizes"
    });

  }

};