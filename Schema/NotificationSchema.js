
const mongoose = require("mongoose");

const notificationItemSchema = new mongoose.Schema({
  message: String,
  date: Date
});

const notificationSchema = new mongoose.Schema({
  heading: String,

  items: [notificationItemSchema],

  status: {
    type: String,
    enum: ["Active", "Inactive"],
    default: "Active"
  },

 seenBy: {
  type: [
    {
      memberId: { type: String, index: true },
      seenAt: Date
    }
  ],
  default: []
}

}, { timestamps: true });

notificationSchema.index({ status:1, createdAt:-1 });

module.exports = mongoose.model("Notification", notificationSchema);