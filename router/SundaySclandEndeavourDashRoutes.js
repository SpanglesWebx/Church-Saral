const express = require("express");
const router = express.Router();

const {
  getSundaySchoolDashboard,
  getSundaySclTeacherDashboard,
  getEndeavourDashboard,
  getEndeavourTeacherDashboard,
} = require("../controllers/SundaySclandEndeavourDashController");


//SundayScl
router.get("/sundayscl", getSundaySchoolDashboard);
router.get("/sundayscl/teacher/:teacherId", getSundaySclTeacherDashboard);



router.get("/endeavour", getEndeavourDashboard);
router.get("/endeavour/teacher/:teacherId", getEndeavourTeacherDashboard);

module.exports = router;   



