const mongoose = require("mongoose");

const OpeningBalanceSchema = new mongoose.Schema(
  {
    account_type: {
      type: String,
      required: true,
    },

    
    ledger_code: {
      type: String,
      required: true,
    },

    ledger_name: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    as_on_date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OpeningBalance", OpeningBalanceSchema);