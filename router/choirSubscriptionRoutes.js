const express = require("express");
const router = express.Router();

const {
  addChoirSubscription,
  getChoirSubscriptions,
  getChoirSubscriptionByMemberId,
  addChoirSubscriptionRequiredAmount,
 getChoirSubscriptionRequiredAmounts,
} = require("../controllers/choirSubscriptionController");

router.post("/add", addChoirSubscription);
router.get("/", getChoirSubscriptions);
router.get("/by-member", getChoirSubscriptionByMemberId);



/* ---------------- REQUIRED AMOUNT ROUTES ---------------- */

router.post("/required-amount", addChoirSubscriptionRequiredAmount);
router.get("/required-amount", getChoirSubscriptionRequiredAmounts);


module.exports = router;
      