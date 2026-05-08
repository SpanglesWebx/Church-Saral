// const mongoose = require("mongoose");

// const WomenAuctionPaymentSchema = new mongoose.Schema(
//   {
//     womenAuctionId: { type: mongoose.Schema.Types.ObjectId, ref: "WomenAuction" },
//     buyerId: { type: String },
//     buyerName: { type: String },
//     buyerPhone: { type: String },

//     sellerId: { type: String },
//     sellerName: { type: String },

//     item: { type: String },
//     amountPaid: { type: Number, required: true },
//     balanceAfter: { type: Number, required: true },
//     date: { type: Date, default: Date.now },
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("WomenAuctionPayment", WomenAuctionPaymentSchema);




const mongoose = require("mongoose");

const WomenAuctionPaymentSchema = new mongoose.Schema(
{
  womenAuctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "WomenAuction",
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

module.exports = mongoose.model("WomenAuctionPayment", WomenAuctionPaymentSchema);