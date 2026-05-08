
      

const mongoose = require("mongoose");

const ChoirSubscriptionSchema = new mongoose.Schema(
  {
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      required: true,
      index: true
    },

    year: {
      type: Number,
      required: true
    },

    totalAmount: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["Completed", "Pending"],
      default: "Pending"
    },

    statusUpdatedAt: {
      type: Date
    },

    subscriptions: [
      {
        amount: { type: Number, required: true },
        date: { type: Date, required: true }
      }
    ]
  },
  { timestamps: true }
);

// 🔥 Compound unique index
ChoirSubscriptionSchema.index({ member: 1, year: 1 }, { unique: true });

module.exports = mongoose.model("ChoirSubscription", ChoirSubscriptionSchema);
