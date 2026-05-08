const router = require("express").Router();
const { addSantha, getSanthaMembers, getSanthaByMember, getSanthaReport,  getSanthaReportByMember } = require("../controllers/SanthaController");

router.post("/add", addSantha);
router.get("/list", getSanthaMembers);
router.get("/by-member", getSanthaByMember);

router.get("/report", getSanthaReport);
router.get("/report/:memberId", getSanthaReportByMember);

module.exports = router;