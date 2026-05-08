const mongoose = require("mongoose");

// ✅ Participant schema for Endeavour Exam
const participantSchema = new mongoose.Schema({
  member: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Members",
    required: true
  },
  class_name: { type: String, required: true },
  section_name: { type: String },
  marks: { type: Number, default: null }
});

// ✅ Class exam schema for Endeavour Exam
const classExamSchema = new mongoose.Schema({
  className: { type: String, required: true },
  portion: { type: String, required: true },
  participants: [participantSchema],
});

// ✅ Main Endeavour Exam schema
const endeavourExamSchema = new mongoose.Schema({
  examName: { type: String, required: true },
  examDate: { type: Date, required: true },
  registerBefore: { type: Date, required: true },
  examcenter: { type: String, required: true },
  description: { type: String },
  examBy: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EndeavourExamBy",
      required: true,
    },
  ],
  classExams: [classExamSchema],
  teacherExam: { type: String }, // teacher portion
  teacherDetails: [
    {
      teacher: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Members",
        required: true
      },
      className: { type: String, required: true }
    }
  ],
}, { timestamps: true });

// ✅ Export EndeavourExam model
module.exports = mongoose.model("EndeavourExam", endeavourExamSchema);
