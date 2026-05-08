const mongoose = require("mongoose");

const menEventPrizeSchema = new mongoose.Schema(
{
  prizeName: {
    type: String,
    required: true,
    unique: true,
    trim: true
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("MenEventPrize", menEventPrizeSchema);