const mongoose = require("mongoose");

const HouseSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Members",
    default: null
  },

  name: {
    type: String,
    trim: true
  },

  address: {
    type: String,
    trim: true
  },

  isMember: {
    type: Boolean,
    default: true
  },

  offering: {
    type: Number,
    default: 0
  }

}, { _id: false });

const AttendeeSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Members",
    default: null
  },

  name: String,

  isMember: {
    type: Boolean,
    default: true
  },

  status: {
    type: String,
    enum: ["present", "absent"],
    default: "absent"
  }

}, { _id: false });

const WomenActivitySchema = new mongoose.Schema({

  date: {
    type: Date,
    required: true
  },

  activityType: {
    type: String,
    enum: ["house-visit", "weekly-prayer", "church-prayer", "other"],
    required: true
  },

  title: String,
  churchName: String,
  churchLocation: String,
  customTitle: String,

  leader: {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      default: null
    },
    name: String
  },

  notes: String,

  houses: [HouseSchema],

  attendees: [AttendeeSchema],

  totalOffering: {
    type: Number,
    default: 0
  },

  status: {
    type: String,
    enum: ["Planned", "Completed", "Cancelled"],
    default: "Planned"
  }

}, { timestamps: true });

module.exports = mongoose.model("WomenActivity", WomenActivitySchema);