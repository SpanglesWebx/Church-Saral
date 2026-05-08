const mongoose = require("mongoose");

const cemeteryBookingSchema = new mongoose.Schema({
  cemeteryId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cemetery",
    required: true,
  },

  slotId: {
    type: String,
    required: true,
  },

  // ✅ BOOKING PERSON
  bookingPerson: {
    isMember: Boolean,

    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
    },

    nonMember: {
      name: String,
      tamilName: String,
      gender: String,
      phone: String,
      aadhar: String,
      permanentAddress: String,
      presentAddress: String,
    }
  },

  // ✅ BURIED PERSON (NEW STRUCTURE)
  buriedPerson: {
    isMember: Boolean,

    memberId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
    },

    nonMember: {
      name: String
    },

    name: String,
    buriedDate: Date,
  },

  slotCapacity: {
    type: Number,

  },

  slotClosed: {
    type: Boolean,
    default: false,
  },

  status: {
    type: String,
    enum: ["Reserved", "Buried", "Cancelled"],
    default: "Reserved",
  },

  bookedAt: {
    type: Date,
    default: Date.now,
  },

 
  reservedAt: {
    type: Date,
    default: null,
  },

  
  buriedAt: {
    type: Date,
    default: null,
  },


}, {
  timestamps: true
});

module.exports = mongoose.model("CemeteryBooking", cemeteryBookingSchema);