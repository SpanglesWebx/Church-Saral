const express = require("express");
const router = express.Router();

const {
  addOpeningBalance,
  getCurrentAssetLedgers,
  listOpeningBalances,
} = require("../controllers/OpenningBalanceController");

// 🔥 dropdown API
router.get("/ledgers/current-assets", getCurrentAssetLedgers);

// create
router.post("/add", addOpeningBalance);

// list
router.get("/list", listOpeningBalances);

module.exports = router;