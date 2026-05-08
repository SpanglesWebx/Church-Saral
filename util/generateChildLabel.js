
// // utils/generateChildLabel.js
// const Member = require("../Schema/memberSchema");

// async function generateChildLabel(family_id) {
//   const children = await Member.find(
//     {
//       family_id,
//       relationship: { $in: ["Son", "Daughter"] },
//       child_label: { $ne: "" }
//     },
//     { child_label: 1 }
//   ).lean();

//   let maxCharCode = 64; // before 'A'

//   for (const c of children) {
//     const code = c.child_label.charCodeAt(0);
//     if (code > maxCharCode) maxCharCode = code;
//   }

//   return String.fromCharCode(maxCharCode + 1); // next letter
// }

// module.exports = generateChildLabel;




// utils/generateChildLabel.js
const Family = require("../Schema/familySchema");

async function generateChildLabel(family_id, session) {
  const family = await Family.findOne({ family_id }).session(session);

  if (!family) {
    throw new Error("Family not found");
  }

  // Increment label
  const nextCharCode = family.last_child_label.charCodeAt(0) + 1;
  const nextLabel = String.fromCharCode(nextCharCode);

  family.last_child_label = nextLabel;
  await family.save({ session });

  return nextLabel;
}

module.exports = generateChildLabel;




