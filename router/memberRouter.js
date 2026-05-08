
const express = require("express");
const router = express.Router();
const {
  getMembersList,
  addNewMember,
  getMemberById,
  getNextIds,
  searchFamilyHead,
  previewMemberId,
  updateMember,
  previewUpgradeMemberId,
  previewTransferFamily,
   downloadMembersPDF
} = require("../controllers/Member");

const upload = require("../middleware/uploadMemberPhoto");




router.get("/", getMembersList);

// PREVIEW MEMBER ID  ✅
router.get("/preview-member-id", previewMemberId);

router.get(
  "/preview-upgrade-member-id",
  previewUpgradeMemberId
);

router.get(
  "/preview-transfer-family",
 
  previewTransferFamily
);



// NEXT IDS
router.get("/next-ids", getNextIds);

// SEARCH FAMILY HEAD
router.get("/search-head", searchFamilyHead);

router.get("/download-pdf", downloadMembersPDF);


// CREATE MEMBER
router.post(
  "/add",
  upload.single("photo"),
  addNewMember
);

router.put(
  "/update/:id",
  upload.single("photo"),
  updateMember
);




router.get("/:id", getMemberById);





module.exports = router;






