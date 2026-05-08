
//middleware/uploadMemberPhoto.js
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: "uploads/memberPhotos",
  filename: (req, file, cb) => {
    const tempName =
      "TMP_" + Date.now() + path.extname(file.originalname);
    cb(null, tempName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/jpg"];
  allowed.includes(file.mimetype)
    ? cb(null, true)
    : cb(new Error("Invalid file type"), false);
};

module.exports = multer({ storage, fileFilter });
