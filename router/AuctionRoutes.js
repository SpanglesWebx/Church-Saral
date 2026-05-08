const express = require("express");
const router = express.Router();

const {
  createAuction,
  getAuctions
} = require("../controllers/AuctionController.js");

router.post("/sunday-auction", createAuction);
router.get("/sunday-auction", getAuctions);

module.exports = router;