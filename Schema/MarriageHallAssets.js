const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  itemName: { type: String, required: true },
  quantity: { type: Number, required: true }
},{ _id:false });

const CategorySchema = new mongoose.Schema({
  categoryId:   { type: mongoose.Schema.Types.ObjectId, required:true },
  categoryName: { type: String, required:true },
  items: [ItemSchema]
},{ _id:false });

const MarriageHallAssetsSchema = new mongoose.Schema({
  hallId:   { type: mongoose.Schema.Types.ObjectId, ref:"MarriageHall", required:true, unique:true },
  hallName: { type: String, required:true },
  categories: [CategorySchema]
},{ timestamps:true });

module.exports = mongoose.model("MarriageHallAssets", MarriageHallAssetsSchema);
