

//router/familyRouter.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const { createFamilyHead, getFamilies, getFamilyById, uploadFamilyPhoto } = require("../controllers/Family");

// multer configuration
const storage = multer.memoryStorage();

const upload = multer({ storage });

router.post("/create-family-head", createFamilyHead);
router.get("/list", getFamilies);


router.get("/:family_id", getFamilyById);

router.post(
  "/:family_id/upload-photo",
  upload.single("photo"),
  uploadFamilyPhoto
);


module.exports = router;
 