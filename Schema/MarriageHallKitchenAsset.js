const mongoose = require("mongoose");

const MarriageHallKitchenAssetsSchema = new mongoose.Schema({
  itemName: { type: String, required: true, unique: true },

  totalQuantity: { type: Number, default: 0 },

  returned: { type: Number, default: 0 },
  damaged: { type: Number, default: 0 },
  missed: { type: Number, default: 0 },
  soldOut: { type: Number, default: 0 },

  soldTo: { type: String, default: "" },

  availableQuantity: { type: Number, default: 0 }

}, { timestamps: true });

module.exports = mongoose.model("MarriageHallKitchenAssets", MarriageHallKitchenAssetsSchema);
