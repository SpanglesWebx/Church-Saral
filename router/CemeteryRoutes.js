const express = require("express");
const router = express.Router();

const {
  addCemetery,
  getCemetery
} = require("../controllers/CemeteryController");



const {
  createBooking,
  getBookings,
  getReservedBookings,
  updateBurialBooking,
  getCemeteryReports
} = require("../controllers/CemeteryBookingController.js");


// ➕ Add Cemetery
router.post("/add", addCemetery);

// 📄 Get Cemetery (with pagination + search)
router.get("/", getCemetery);




router.post("/bookings", createBooking);


router.get("/bookings", getBookings);

router.put("/bookings/burial", updateBurialBooking);

router.get("/booking/reserved",getReservedBookings);

router.get("/reports", getCemeteryReports);

module.exports = router;