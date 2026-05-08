
const express = require("express");
const router = express.Router();
const dashCtrl = require("../controllers/RoleBasedDashController.js");

router.get("/churchadmin/member-count", dashCtrl.getMemberCount);
router.get("/churchadmin/family-count", dashCtrl.getFamilyCount);


router.get("/admin/member-count", dashCtrl.getMemberCount);
router.get("/admin/family-count", dashCtrl.getFamilyCount);

module.exports = router;