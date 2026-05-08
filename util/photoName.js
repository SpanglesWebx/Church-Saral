const path = require("path");

exports.buildPhotoName = ({
  memberId,
  memberName,
  memberType,
  originalName,
}) => {
  const ext = path.extname(originalName);

  // 🔥 convert MBR00001/2 → MBR00001-2
  const safeMemberId = memberId.replace("/", "-");

  // remove unsafe characters from name
  const safeName = memberName.replace(/[^a-zA-Z0-9 ]/g, "").trim();

  return `${safeMemberId}(${safeName})${ext}`;
};
