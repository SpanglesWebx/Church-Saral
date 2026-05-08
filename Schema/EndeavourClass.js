const mongoose = require("mongoose");

const EndeavourClassSchema = new mongoose.Schema(
  {
    class_name: { type: String, required: true },
    section_name: { type: String, required: true },
    year_from: { type: Date, required: true },
    year_to: { type: Date, required: true },

    // ✅ Proper Reference (like SundayClass)
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Members",
      required: true,
    },

    // ✅ Students as ObjectIds
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Members",
      }
    ],

    // ✅ Removed students tracking
    removed_students: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Members",
        },
        removedAt: {
          type: Date,
          default: Date.now,
        }
      }
    ],

    max_students: { type: Number, required: true },
    notes: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("EndeavourClass", EndeavourClassSchema);
