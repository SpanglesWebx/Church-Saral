// utils/relabelChildrenByDOB.js
const Member = require("../Schema/memberSchema");

async function relabelChildrenByDOB(family_id, session) {
  const children = await Member.find(
    {
      family_id,
      relationship: { $in: ["Son", "Daughter"] },
      dob: { $ne: "" }
    },
    null,
    { session }           // ✅ correct
  ).sort({ dob: 1 });     // elder first

  let code = 65; // A
  for (const child of children) {
    child.child_label = String.fromCharCode(code++);
    await child.save({ session }); // ✅ correct
  }
}

module.exports = relabelChildrenByDOB;
