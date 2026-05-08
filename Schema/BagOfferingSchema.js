// server/Schema/BagOfferingSchema.js
const mongoose = require("mongoose");

const BagOfferingSchema = new mongoose.Schema(
  {
    offeringType: {
      type: String,
      enum: ["Bag"],
      default: "Bag",
    },

    transId: {  
      type: String,
      required: true,
    },
    subCategory: {
      type: String,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    day: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);




module.exports =
  mongoose.models.BagOffering ||
  mongoose.model("BagOffering", BagOfferingSchema);
