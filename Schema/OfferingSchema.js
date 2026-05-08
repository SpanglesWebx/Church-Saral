// Schema/OfferingSchema.js
const mongoose = require("mongoose");

const OfferingItemSchema = new mongoose.Schema(
  {
    offeringName: { type: String, required: true },
    status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
    
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false } // no separate _id needed for sub items
);

const OfferingSchema = new mongoose.Schema(
  {
    offeringType: {
      type: String,
      enum: ["Bag", "Cover"],
      required: true,
      unique: true, // ONE document per type
    },

    offerings: [OfferingItemSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offering", OfferingSchema);
