const mongoose = require("mongoose");

const menCompetitionSchema = new mongoose.Schema({
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

const menEventBySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true, trim: true }
}, { timestamps: true });

const menEventSchema = new mongoose.Schema({
  eventBy: { type: mongoose.Schema.Types.ObjectId, ref: "MenEventBy", required: true },
  eventName: { type: String, required: true },
  eventDate: { type: Date, required: true },
  registerBefore: { type: Date },
  venue: { type: String, required: true },
  description: { type: String },
  menCompetitions: [menCompetitionSchema]
}, { timestamps: true });

const MenEvent = mongoose.model("MenEvent", menEventSchema);
const MenEventBy = mongoose.model("MenEventBy", menEventBySchema);

module.exports = { MenEvent, MenEventBy };