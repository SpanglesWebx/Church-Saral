// Schema/ChoirSubscriptionAmountSchema.js
const mongoose = require("mongoose");

const ChoirSubscriptionAmountSchema = new mongoose.Schema(
  {
     year: {
      type: Number,
      required: true,
      unique: true   // 🔥 One required amount per year
    },
    requiredAmount: {
      type: Number,
      required: true
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ChoirSubscriptionAmount",
  ChoirSubscriptionAmountSchema
);
