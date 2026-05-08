

const express = require("express");
const router = express.Router();
const controller = require("../controllers/MenEventController");

// Event CRUD
router.post("/add", controller.addEvent);
router.get("/all", controller.getAllEvents);
router.get("/:id", controller.getEventById);
router.put("/update/:id", controller.updateEvent);

// EventBy
router.get("/eventBy/all", controller.getAllEventBys);
router.post("/eventBy/save", controller.saveEventBys);

// Participants
router.post("/participants/add", controller.addParticipants);
router.put("/participants/update", controller.updateParticipants);

// Prizes
router.get("/prizes/list", controller.getPrizeList);
router.post("/prizes/add", controller.addPrizeTypes);
router.put("/prizes/add", controller.assignPrizes);

module.exports = router;