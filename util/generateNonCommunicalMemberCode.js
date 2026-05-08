// util/generateNonCommunicalMemberCode.js
const Member = require("../Schema/memberSchema");

async function generateNonCommunicalMemberCode(headId) {
  const last = await Member.findOne({
    member_id: { $regex: `^${headId}-` }
  }).sort({ createdAt: -1 });

  let next = 1;
  if (last) {
    next = parseInt(last.member_id.split("-")[1]) + 1;
  }

  return `${headId}-${next}`;
}

module.exports = generateNonCommunicalMemberCode;
