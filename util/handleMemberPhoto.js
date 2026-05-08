const fs = require("fs");
const path = require("path");
const { buildPhotoName } = require("./photoName");

module.exports = function handleMemberPhoto(req, member_id, data) {
  if (!req.file) return "";

  const newFileName = buildPhotoName({
    memberId: member_id,
    memberName: data.member_name,
    memberType: data.member_type,
    originalName: req.file.originalname,
  });

  const oldPath = path.join("uploads/memberPhotos", req.file.filename);
  const newPath = path.join("uploads/memberPhotos", newFileName);

  fs.renameSync(oldPath, newPath);

  return `uploads/memberPhotos/${newFileName}`;
};
