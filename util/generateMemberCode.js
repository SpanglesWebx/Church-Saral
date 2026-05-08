



// // utils/generateMemberCode.js

const Counter = require("../Schema/CounterSchema");

// REAL GENERATION (INCREMENT)
async function generateMemberCode(session) {
  const counter = await Counter.findByIdAndUpdate(
    { _id: "memberId" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true, session }
  );

  const number = counter.seq;
  return `MBR${String(number).padStart(5, "0")}`;
}

// PREVIEW ONLY (NO INCREMENT)
async function previewMemberCode() {
  const counter = await Counter.findById("memberId");

  const next = (counter?.seq || 0) + 1;

  return `MBR${String(next).padStart(5, "0")}`;
}

module.exports = {
  generateMemberCode,
  previewMemberCode
};