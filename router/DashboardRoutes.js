// routes/dashboardRoutes.js
const express = require("express");
const router = express.Router();
const controller = require("../controllers/DashboardController");

// router.get("/offerings/:member_id", controller.getOfferingsByMember);
router.get("/member-name/:member_id", controller.getMemberName);
router.get("/family-head/:memberId", controller.getFamilyIfHead);
router.get("/family-member/:memberId", controller.getFamilyByMember);

router.get("/profile/:memberId", controller.getProfile);
router.get("/daily-verse/:memberId", controller.getDailyVerse);
router.get("/member/:memberId", controller.getMemberProfileFull);

router.get("/upcoming/:memberId", controller.getUpcomingDashboardItems);
router.get("/notifications", controller.getNotifications);


router.get(
  "/member-offerings/:memberId",
  controller.getMemberYearlyOfferings
);


module.exports = router;
