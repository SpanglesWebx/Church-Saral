


const mongoose = require("mongoose");

const transferDetailSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Members",
    required: true
  },
  old_relationship: {
    type: String,
    required: true
  },

  new_relationship: {
    type: String,
    required: true
  },

  old_family_id: {
    type: String,
    required: true
  },

  family_changed_at: {
    type: Date,
    required: true
  },

  child_label: {
    type: String,
    default: ""
  }

}, { _id: false });


const familySchema = new mongoose.Schema({
  family_id: {
    type: String,
    required: true,
    unique: true
  },

  head: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Members",
    required: true
  },

    family_photo: {
    type: String,
    default: ""
  },

  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members"
    }
  ],

  transfer_details: [transferDetailSchema]

}, { timestamps: true });

module.exports = mongoose.model("Family", familySchema);
