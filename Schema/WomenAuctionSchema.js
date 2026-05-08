const mongoose = require("mongoose");

const WomenAuctionSchema = new mongoose.Schema(
{
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Members",
    required: true
  },

  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Members",
    required: true
  },

  item: {
    type: String,
    required: true
  },

  amount: {
    type: Number,
    required: true
  },

  payment_status: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid"
  },

  totalPaid: {
    type: Number,
    default: 0
  },

  balance: {
    type: Number,
    default: 0
  },

  payments: [
    {
      amountPaid: Number,
      date: { type: Date, default: Date.now },
      balanceAfter: Number
    }
  ]
},
{ timestamps: true }
);

module.exports = mongoose.model("WomenAuction", WomenAuctionSchema);