const express = require("express");
const router = express.Router();

const {
  getBirthdayReport,
  getBirthdayPdf,
  getMarriageReport,
  getMarriagePdf,
  getOffertoryReport,
  getOffertoryReportPdf
} = require("../controllers/ReportsController");

router.get("/birthday", getBirthdayReport);
router.get("/birthday/pdf", getBirthdayPdf);

router.get("/marriage", getMarriageReport);
router.get("/marriage/pdf", getMarriagePdf);
router.get("/offertory-report", getOffertoryReport);
router.get("/offertory-report/pdf", getOffertoryReportPdf);

module.exports = router;