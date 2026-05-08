const mongoose = require("mongoose");

/* -------------------------------
   STUDENT COMPETITION
--------------------------------*/

const competitionSchema = new mongoose.Schema({
  competition: { type: String, required: true },
  title: { type: String, required: true },

  participants: [
    {
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Members",
        required: true
      },

      class_name: { type: String, required: true },
      section_name: { type: String, required: true },

      prize: {
        type: String,
        trim: true,
        default: ""
      }
    }
  ]
});


/* -------------------------------
   TEACHER COMPETITION
--------------------------------*/

const teacherCompetitionSchema = new mongoose.Schema({
  competition: { type: String, required: true },
  title: { type: String, required: true },

  participants: [
    {
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Members",
        required: true
      },

      prize: {
        type: String,
        trim: true,
        default: ""
      }
    }
  ]
});


/* -------------------------------
   CLASS EVENTS
--------------------------------*/

const classEventSchema = new mongoose.Schema({
  className: { type: String, required: true },
  competitions: [competitionSchema]
});


/* -------------------------------
   EVENT BY
--------------------------------*/

const endeavourEventBySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
}, { timestamps: true });


/* -------------------------------
   MAIN EVENT
--------------------------------*/

const endeavourEventSchema = new mongoose.Schema({

  eventBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "EndeavourEventBy",
    required: true
  },

  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  registerBefore: { type: Date, required: true },
  venue: { type: String, required: true },
  description: { type: String, required: true },

  studentCompetitions: [{ type: String }],
  teacherCompetitions: [{ type: String }],

  classEvents: [classEventSchema],

  teacherCompEvents: [teacherCompetitionSchema]

}, { timestamps: true });


/* -------------------------------
   MODELS
--------------------------------*/

const EndeavourEvent = mongoose.model(
  "EndeavourEvent",
  endeavourEventSchema
);

const EndeavourEventBy = mongoose.model(
  "EndeavourEventBy",
  endeavourEventBySchema
);

module.exports = { EndeavourEvent, EndeavourEventBy };