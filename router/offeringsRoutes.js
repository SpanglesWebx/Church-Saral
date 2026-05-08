// routes/offeringsRoutes.js
const router = require("express").Router();
const {
  createOffering,
  getOfferings,
 getOfferingTypes,
   addBagOffering,
  getBagOfferings,
  getBagSubCategories,
   updateOfferingStatus,
   getCoverSubCategories,
} = require("../controllers/offeringController");





const {
  addCoverOffering,
  getCoverList,
  getCoverByMember
} = require("../controllers/coverController.js");

router.post("/", createOffering);
router.get("/", getOfferings);
router.get("/types", getOfferingTypes);
router.put("/status", updateOfferingStatus);



/* BAG */
router.post("/bag/add", addBagOffering);
router.get("/bag/list", getBagOfferings);     
router.get("/bag/subcategories", getBagSubCategories);


router.get("/cover/subcategories", getCoverSubCategories)
// CREATE / ADD COVER OFFERING
router.post(
  "/cover-add",
  // auth,   // 👈 uncomment if auth required
  addCoverOffering
);

// GET COVER OFFERING LIST
router.get(
  "/cover-list",
  // auth,   // 👈 uncomment if auth required
  getCoverList
);


router.get(
  "/cover-by-member",
  // auth,   // 👈 uncomment if auth required
  getCoverByMember
);


module.exports = router;
