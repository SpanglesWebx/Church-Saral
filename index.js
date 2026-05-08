const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config({ path: __dirname + "/.env" });

const auth = require("./models/auth");
const path = require("path");
const fs = require("fs");

// socket
const http = require("http");





// ROUTES

const login = require("./router/loginRoutes");
const sundayClassRoutes = require("./router/sundayClassRoutes");
const SundayClassTagRoutes = require("./router/SundayClassTagRoutes");

const memberSearchRoutes = require("./router/memberSearchRoutes");
const attendanceRoutes = require("./router/attendanceRoutes");
const endeavourRoutes = require("./router/EndeavourClassRoutes");
const endeavourClassTagRoutes = require("./router/endeavourClassTagRoutes");
const endeavourAuctionRoutes = require("./router/endeavourAuctionRoutes");
const endeavourAttendanceRouter = require("./router/endeavourAttendanceRoutes");
const menFellowshipRoutes = require("./router/menFellowshipRoutes");
const womenFellowshipRoutes = require("./router/womenFellowshipRoutes");
const categoryRouter = require("./router/categoryRouter");
const menactivityRoutes = require("./router/menactivityRoutes");
const womenactivityRoutes = require("./router/womenActivityRoutes");
const menAuctionRoutes = require("./router/menAuctionRoutes");
const womenAuctionRoutes = require("./router/WomenAuctionRoutes");
const choirRoutes = require("./router/choirRoutes");
const choirSubscriptionRoutes = require("./router/choirSubscriptionRoutes");
const choirMasterRoutes = require("./router/choirMasterRoutes");
const endeavourEventRoutes = require("./router/endeavourEventRoutes");
const endeavourPrize = require("./router/endeavourPrize");
const sundaySchoolEventRoutes = require("./router/sundaySchoolEventRoutes");
const sundaySchoolPrizeRoutes = require("./router/sundayschoolPrize");
const womenEventRoutes = require("./router/womenEventRoutes");
const womenEventPrizeRoutes = require("./router/womenPrize");
const sundayschoolexams = require("./router/sundayExamRoutes");
const endeavourExamRoutes = require("./router/endeavourExamRoutes");
const dashboardRoutes = require("./router/DashboardRoutes");
const studentAuctionRoutes = require("./router/studentAuctionRoutes");


const offeringsRoutes = require("./router/offeringsRoutes");

// bottom routes
const zoneRoutes = require("./router/zoneRouter");
const memberRoutes = require("./router/memberRouter.js");
const familyRoutes = require("./router/familyRouter");
const pastorRoutes = require("./router/pastorRouter");
const sundayEndDashRoutes = require("./router/SundaySclandEndeavourDashRoutes");
const bibleSentenceRoutes = require("./router/bibleSentenceRoutes");
const notificationRoutes = require("./router/NotificationRoutes");



const app = express();
const server = http.createServer(app);

const uploadDir = path.join(__dirname, "uploads/expense");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// middleware
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));
app.use(cors());

const PORT = process.env.PORT || 5001;


let isBackupRunning = false;
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log("✅ DataBase Connected");
    console.log("📦 Connected to MongoDB Database:", mongoose.connection.name);

    const cron = require("node-cron");

    const runBackup = require("./cron/backup");   // full backup + restore
    const runRestore = require("./cron/restore"); // restore only

    /* ================================
       🕕 6 PM → BACKUP + RESTORE
    ================================= */
    cron.schedule("0 18 * * *", async () => {


      // cron.schedule("* * * * *", async () => {
      if (isBackupRunning) {
        console.log("⏳ Backup already running...");
        return;
      }

      try {
        isBackupRunning = true;

        console.log("🕕 Running 6PM Backup + Restore...");
        await runBackup();

      } catch (err) {
        console.error("❌ Backup Error:", err);
      } finally {
        isBackupRunning = false;
      }

    }, {
      timezone: "Asia/Kolkata"
    });


    /* ================================
       🌅 7 AM → ONLY RESTORE
    ================================= */
    cron.schedule("0 7 * * *", async () => {

      console.log("🌅 Running 7AM Restore Only...");

      try {
        await runRestore();
      } catch (err) {
        console.error("❌ Restore Error:", err);
      }

    }, {
      timezone: "Asia/Kolkata"
    });

  })
  .catch((err) => {
    console.log("❌ MongoDB connection error:", err);
  });


// ROOT
app.get("/", (req, res) => {
  res.send("Server Running");
});

// LOGIN ROUTE
app.use("/api", login);

// FILES
app.use("/api/uploads", express.static(path.join(__dirname, "uploads")));
app.use("/member-photo-uploads", express.static("uploads"));
app.use("/uploads/pastors", express.static("uploads/pastors"));

// AUTH MIDDLEWARE
app.use("/api", auth.authenticateUser);

// ROUTES
app.use("/api/sunday-classes", sundayClassRoutes);
app.use("/api/sunday-class-tags", SundayClassTagRoutes);
app.use("/api/member-search", memberSearchRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/student-auctions", studentAuctionRoutes);
app.use("/api/endeavour-classes", endeavourRoutes);
app.use("/api/endeavour-class-tags", endeavourClassTagRoutes);
app.use("/api/endeavour-auctions", endeavourAuctionRoutes);
app.use("/api/endeavour-attendance", endeavourAttendanceRouter);
app.use("/api/mens-fellowship", menFellowshipRoutes);
app.use("/api/men-events", require("./router/MenEventRoutes"));
app.use("/api/womens-fellowship", womenFellowshipRoutes);
app.use("/api/categories", categoryRouter);
app.use("/api/men-activities", menactivityRoutes);
app.use("/api/women-activities", womenactivityRoutes);
app.use("/api/men-auctions", menAuctionRoutes);
app.use("/api/women-auctions", womenAuctionRoutes);
app.use("/api/choir-members", choirRoutes);
app.use("/api/choir-subscription", choirSubscriptionRoutes);
app.use("/api/choir-masters", choirMasterRoutes);

app.use("/api/endeavour-events", endeavourEventRoutes);
app.use("/api/endeavour/prizes", endeavourPrize);
app.use("/api/sundayschool-events", sundaySchoolEventRoutes);
app.use("/api/sundayschool/prizes", sundaySchoolPrizeRoutes);
app.use("/api/women-events", womenEventRoutes);
app.use("/api/women/prizes", womenEventPrizeRoutes);
app.use("/api/sundayschool-exams", sundayschoolexams);
app.use("/api/endeavour-exams", endeavourExamRoutes);


app.use("/api/offerings", offeringsRoutes);

// DASHBOARD
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/dashboard", sundayEndDashRoutes);
app.use("/api/Dashboard", require("./router/RoleBasedDashRoutes.js"));
app.use("/api/auctions", require("./router/AuctionRoutes.js"));

app.use("/api/bills", require("./router/BillRoutes"));




// OTHER ROUTES
app.use("/api/zones", zoneRoutes);

app.use("/api/new-members", memberRoutes);
app.use("/api/family", familyRoutes);
app.use("/api/pastors", pastorRoutes);
app.use("/api/bible-sentences", bibleSentenceRoutes);
app.use("/api/notifications", notificationRoutes);

app.use("/api/reports", require("./router/ReportsRoutes.js"));


app.use("/api/santha", require("./router/SanthaRoutes.js"));


// General Accounts

app.use("/api/ledger-category", require("./router/ledgerRouter.js"));
app.use("/api/ledger-search", require("./router/ledgerSearchRouter.js"));

app.use("/api/opening-balance", require("./router/OpenningBalanceRoutes.js"));


app.use("/api/marriage", require("./router/MarriageRoutes.js"));


app.use("/api/cemetery", require("./router/CemeteryRoutes.js"));


app.listen(PORT, () => {
  console.log("🚀 Server running on port", PORT);
});

