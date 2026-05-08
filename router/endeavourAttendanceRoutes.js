// routes/endeavourAttendanceRoutes.js 
const express = require("express");
const router = express.Router();
const {
  addAttendance,
  updateAttendance,
  getAttendance,
} = require("../controllers/endeavourAttendanceController");

// CRUD routes
router.post("/", addAttendance);
router.put("/:id", updateAttendance);    
router.get("/", getAttendance);

// Status by date
router.get("/status", async (req, res) => {
  try {
    const { date } = req.query;

    if (!date) {
      return res.status(400).json({ message: "Date required" });
    }

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);

    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const records = await require("../Schema/EndeavourAttendance")
      .find({
        date: { $gte: start, $lte: end },
      })
      .select("class date");

    res.json(records);

  } catch (err) {
    res.status(500).json({ message: "Error fetching attendance status" });
  }
});

module.exports = router; 
