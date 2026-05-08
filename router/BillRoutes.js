const express = require("express");
const router = express.Router();

const { getOverallBills, getIndividualBills, getFamilyBillDetails, downloadBillsPdf, downloadFamilyBillPdf } = require("../controllers/BillController.js");

router.get("/overall", getOverallBills);

router.get("/individual", getIndividualBills);

router.get("/family-details", getFamilyBillDetails);
router.get("/download-pdf", downloadBillsPdf);
router.get("/family-bill-pdf", downloadFamilyBillPdf);

module.exports = router;