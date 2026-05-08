const express = require("express");
const router = express.Router();

const {
  getCategories,
  addCategory,
  deleteCategory,
  getLedgers,
  saveLedgers,
  getNextLedgerCode,
  getBankLedgers,
  setDepreciation,
  setLedgerDepreciation,
  toggleCategoryStatus,
  toggleLedgerStatus,
  downloadLedgerCategoryReport
} = require("../controllers/ledgerController.js");

// CATEGORY ROUTES
router.get("/categories", getCategories);
router.post("/categories/add", addCategory);
router.get("/bank-ledgers", getBankLedgers);
router.get("/download-ledger-report", downloadLedgerCategoryReport);
router.get("/ledgers/:categoryId/next-code", getNextLedgerCode);
router.delete("/categories/:id", deleteCategory);

// LEDGER ROUTES
router.get("/ledgers/:categoryId", getLedgers);
router.post("/ledgers/:categoryId/save", saveLedgers);

router.post("/set-depreciation", setDepreciation);
router.post("/set-ledger-depreciation", setLedgerDepreciation);

router.patch("/category/:categoryId/status", toggleCategoryStatus);
router.patch("/ledger/:categoryId/:ledgerCode/status", toggleLedgerStatus);

module.exports = router;
