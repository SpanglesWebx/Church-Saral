const mongoose = require("mongoose");

const MenFellowshipSchema = new mongoose.Schema(
{
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Members",
    required: true,
    unique: true
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("MenFellowship", MenFellowshipSchema);