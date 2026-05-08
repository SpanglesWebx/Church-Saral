




const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SundayClass",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    totalStudents: {
      type: Number,
      required: true,
    },

    presentCount: {
      type: Number,
      required: true,
    },

    absentCount: {
      type: Number,
      required: true,
    },

    totalOffering: {
      type: Number,
      default: 0,
    },

    attendance: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Members", 
          required: true,
        },
        present: {
          type: Boolean,
          default: false,
        },
        amount: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  { timestamps: true }
);

// 🔥 Prevent duplicate attendance per class per day
AttendanceSchema.index({ class: 1, date: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", AttendanceSchema);
