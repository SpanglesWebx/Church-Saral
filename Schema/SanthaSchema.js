const mongoose = require("mongoose");

const MonthSchema = new mongoose.Schema(
  {
    month: { type: String, required: true },
    amount: { type: Number, required: true },
  },
  { _id: false }
);

const EntrySchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },
    months: {
      type: [MonthSchema],
      default: [],
    },
  },
  { _id: false }
);

const SanthaSchema = new mongoose.Schema(
  {
    date: { type: Date, required: true },
    day: { type: String, required: true },
    transId: {
      type: String,
      required: true
    },

    entries: [EntrySchema],
  },
  { timestamps: true }
);

SanthaSchema.index({ date: 1 });
SanthaSchema.index({ "entries.member": 1 });

module.exports = mongoose.model("Santha", SanthaSchema);