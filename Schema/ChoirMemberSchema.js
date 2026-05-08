

const mongoose = require("mongoose");

const ChoirMemberSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      required: true,
      unique: true, // One member can be added only once
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChoirMembers", ChoirMemberSchema);
