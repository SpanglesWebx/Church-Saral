const mongoose = require("mongoose");

const cemeterySchema = new mongoose.Schema({

  cemeteryName: {
    type: String,
    required: true,
    trim: true,
  },

  cemeteryLocation: {
    type: String,
    required: true,
    trim: true,
  },

  plots: {
    type: [[String]], // 2D array: rows of plot IDs like ["A1", "B1"]
    default: [],
  },

  numberOfAvailablePlots: { type: Number, default: 0 },


  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Cemetery", cemeterySchema);
  