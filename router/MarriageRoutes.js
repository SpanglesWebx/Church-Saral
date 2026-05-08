const express = require("express");
const router = express.Router();

const controller = require("../controllers/MarriageHallController");
const bookingController = require("../controllers/MarriageHallBookingController");
const kitchenController = require("../controllers/MarriageHallKitchenAssetsController.js");
const assetsController = require("../controllers/MarriageHallAssetsController");

// ================= HALL =================

// Create Hall
router.post("/halls", controller.createHall);

// Get All Halls (with pagination + search)
router.get("/halls", controller.getHalls);

// Update Hall
router.put("/halls/:id", controller.updateHall);

// ================= CATEGORY =================

// Create Category (global)
router.post("/hall-categories", controller.createCategory);

// Get Categories
router.get("/hall-categories", controller.getCategories);

// ================= CATEGORY PRICE =================

// Add / Update category prices
router.put("/halls/:id/add-prices", controller.addOrUpdatePrices);

// Delete category from hall
router.delete("/halls/:hallId/delete-category/:categoryId", controller.deleteCategoryFromHall);




// ================= BOOKING =================

// Create Booking
router.post("/bookings", bookingController.createBooking);

// Get Bookings (with filters)
router.get("/bookings", bookingController.getBookings);

router.put("/bookings/:id",bookingController.updateBooking);

router.get("/bookings/:id", bookingController.getBookingById);

router.post("/bookings/:bookingId/issue-kitchen", bookingController.issueKitchenAssets);

router.post("/bookings/:id/add-payment", bookingController.addPayment);
router.post("/bookings/:id/update-kitchen-assets", bookingController.updateKitchenAssets);
router.post("/bookings/:id/add-fine", bookingController.addFine);




// ================= MARRIAGE HALL KITCHEN ASSETS =================


router.get("/hall/kitchen-assets", kitchenController.getKitchenAssets);
router.post("/hall/kitchen-assets", kitchenController.createKitchenAsset);



// ================= MARRIAGE HALL ISSUED ASSETS =================
router.get("/issued-assets", bookingController.getIssuedAssets);






// ================= HALL ASSETS CATEGORY =================


// Category
router.post("/hall-assets/category", assetsController.createCategory);
router.get("/hall-assets/category", assetsController.getCategories);

// Add Item to Category
router.post("/hall-assets/category/:categoryId/item", assetsController.addItemToCategory);

// ================= HALL ASSETS (MAIN) =================

// Add / Update Hall Asset
router.post("/hall-assets/add", assetsController.addHallAsset);

// Get Hall Assets
router.get("/hall-assets", assetsController.getHallAssets);
router.get("/hall-assets/:id", assetsController.getHallAssetById);


module.exports = router;