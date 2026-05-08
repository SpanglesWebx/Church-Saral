// const mongoose = require("mongoose");

// const MenAuctionPaymentSchema = new mongoose.Schema(
//   {
//     menAuctionId: { type: mongoose.Schema.Types.ObjectId, ref: "MenAuction" },
//     buyerId: { type: String },
//     buyerName: { type: String },
//     buyerPhone: { type: String },
//     sellerId: { type: String },
//     sellerName: { type: String },
//     item: { type: String },
//     amountPaid: { type: Number },
//     balanceAfter: { type: Number },
//     date: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("MenAuctionPayment", MenAuctionPaymentSchema);




const mongoose = require("mongoose");

const MenAuctionPaymentSchema = new mongoose.Schema(
{
  menAuctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "MenAuction",
    required: true
  },

  buyer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Members",
    required: true
  },

  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Members",
    required: true
  },

  amountPaid: {
    type: Number,
    required: true
  },

  balanceAfter: {
    type: Number,
    required: true
  },

  date: {
    type: Date,
    default: Date.now
  }
},
{ timestamps: true }
);

module.exports = mongoose.model("MenAuctionPayment", MenAuctionPaymentSchema);