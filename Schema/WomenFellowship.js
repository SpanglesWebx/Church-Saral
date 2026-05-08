const mongoose = require("mongoose");

const WomenFellowshipSchema = new mongoose.Schema(
{
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Members",
    required: true,
    unique: true // prevent duplicate women fellowship entries
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("WomenFellowship", WomenFellowshipSchema);