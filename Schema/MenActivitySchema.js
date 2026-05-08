// models/MenActivity.js
const mongoose = require("mongoose");

const HouseSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      default: null
    },

    name: {
      type: String
    },

    address: {
      type: String
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

const AttendeeSchema = new mongoose.Schema(
  {
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

const MenActivitySchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    activityType: {
      type: String,
      enum: ["house-visit", "weekly-prayer", "church-prayer", "other"],
      required: true,
    },
    title: { type: String }, // weekly prayer
    churchName: { type: String }, // church prayer
    churchLocation: { type: String }, // church prayer
    customTitle: { type: String }, // other
    leader: {
      member: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Members",
        default: null
      },
      name: String
    },
    notes: { type: String },
    houses: [HouseSchema], // only for house-visit
    attendees: [AttendeeSchema],
    totalOffering: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["Planned", "Completed", "Cancelled"],
      default: "Planned",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MenActivity", MenActivitySchema);
