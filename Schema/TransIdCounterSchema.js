const mongoose = require("mongoose");

const TransIdCounterSchema = new mongoose.Schema({
  date: {
    type: String, // YYYY-MM-DD
    required: true,
  },
  type: {
    type: String, // Bag / Cover / Santha
    required: true,
  },
  seq: {
    type: Number,
    default: 0,
  },
});

// ✅ UNIQUE COMBINATION
TransIdCounterSchema.index({ date: 1, type: 1 }, { unique: true });

module.exports =
  mongoose.models.TransIdCounter ||
  mongoose.model("TransIdCounter", TransIdCounterSchema);