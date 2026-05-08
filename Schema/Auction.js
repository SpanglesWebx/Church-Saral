const mongoose = require("mongoose");

/* ==============================
   PERSON SCHEMA (Seller / Buyer)
================================*/

const PersonSchema = new mongoose.Schema(
  {
    isMember: {
      type: Boolean,
      required: true,
      default: true,
    },

    // If Member
    member: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      default: null,
    },

    // If Non Member
    name: {
      type: String,
      default: null,
    },

    phone: {
      type: String,
      default: null,
    },
  },
  { _id: false }
);

/* ==============================
   MAIN AUCTION SCHEMA
================================*/

const AuctionSchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },

    day: {
      type: String,
      required: true,
    },

    seller: {
      type: PersonSchema,
      required: true,
    },

    buyer: {
      type: PersonSchema,
      required: true,
    },

    item: {
      type: String,
      required: true,
    },

    amount: {
      type: Number,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Auction", AuctionSchema);