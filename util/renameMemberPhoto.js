const fs = require("fs");
const path = require("path");

exports.renameMemberPhoto = ({
  oldPhotoPath,
  newMemberId,
  memberName
}) => {
  if (!oldPhotoPath) return "";

  const uploadsDir = path.join("uploads", "memberPhotos");

  const ext = path.extname(oldPhotoPath); // .jpg / .png
  const safeName = memberName.replace(/\s+/g, "");
  const newFileName = `${newMemberId}(${safeName})${ext}`;

  const oldAbs = path.join(uploadsDir, path.basename(oldPhotoPath));
  const newAbs = path.join(uploadsDir, newFileName);

  if (fs.existsSync(oldAbs)) {
    fs.renameSync(oldAbs, newAbs);
    return `uploads/memberPhotos/${newFileName}`;
  }

  return oldPhotoPath;
};
