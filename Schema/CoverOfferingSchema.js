


const mongoose = require("mongoose");

const MonthSchema = new mongoose.Schema(
  {
    month: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    }
  },
  { _id: false }
);

const EntrySchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      required: true
    },

    /* used for non-month offertory */
    amount: {
      type: Number,
      default: null
    },

    /* used for monthly offertory */
    months: {
      type: [MonthSchema],
      default: []
    }

  },
  { _id: false }
);

const CoverOfferingSchema = new mongoose.Schema(
  {
    offertoryType: {
      type: String,
      required: true
    },


    transId: {
      type: String,
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    day: {
      type: String,
      required: true
    },

    financialYear: {
      type: String,
      default: null
    },

    entries: [EntrySchema]

  },
  { timestamps: true }
);

CoverOfferingSchema.index({
  date: 1,
  offertoryType: 1,
  "entries.member": 1,
  "entries.months.month": 1
});

module.exports = mongoose.model("CoverOffering", CoverOfferingSchema);