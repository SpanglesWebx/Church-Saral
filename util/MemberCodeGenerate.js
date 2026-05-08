
exports.generateNextId = async (Model, field, prefix) => {
  const last = await Model.findOne({ [field]: new RegExp(`^${prefix}`) })
    .sort({ [field]: -1 });

  if (!last) return `${prefix}00001`;

  const num = parseInt(last[field].replace(prefix, ""), 10) + 1;
  return prefix + String(num).padStart(5, "0");
};




exports.generateNextFamilyMemberId = (pastorId, familyMembers) => {
  const base = pastorId.split("/")[0]; // PTM00001
  const nextNumber = familyMembers.length + 2; // pastor is /1 → next is /2
  return `${base}/${nextNumber}`;
};

