const express = require("express");
const router = express.Router();
const {
  createSentence,
  getSentences,
  updateSentence,
} = require("../controllers/bibleSentenceController");

router.post("/", createSentence);
router.get("/", getSentences);
router.put("/:id", updateSentence);

module.exports = router;