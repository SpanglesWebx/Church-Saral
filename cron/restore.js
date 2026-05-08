const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

/* ================================
   📁 BACKUP ROOT
================================ */
const BACKUP_ROOT = path.resolve(__dirname, "../backup");

/* ================================
   📅 DATE HELPERS
================================ */
const getDateFolder = () => {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  return ist.toISOString().split("T")[0];
};

const getYesterdayFolder = () => {
  const now = new Date();
  const ist = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  ist.setDate(ist.getDate() - 1);
  return ist.toISOString().split("T")[0];
};

/* ================================
   🔄 RESTORE COLLECTION
================================ */
const restoreCollection = async (model, colName) => {
  const today = getDateFolder();
  const yesterday = getYesterdayFolder();

  const todayPath = path.join(BACKUP_ROOT, today, `${colName}.json`);
  const yesterdayPath = path.join(BACKUP_ROOT, yesterday, `${colName}.json`);

  let filePath = null;

  if (fs.existsSync(todayPath)) {
    filePath = todayPath;
    console.log(`🔄 Restore TODAY → ${colName}`);
  } else if (fs.existsSync(yesterdayPath)) {
    filePath = yesterdayPath;
    console.log(`🔄 Restore YESTERDAY → ${colName}`);
  } else {
    console.log(`⚠️ No backup for ${colName}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (!Array.isArray(data) || data.length === 0) return;

  try {
    await model.insertMany(data, { ordered: false });
    console.log(`♻️ Restored: ${colName}`);
  } catch {
    console.log(`⚠️ Partial restore: ${colName}`);
  }
};

/* ================================
   🚀 MAIN RESTORE ONLY
================================ */
module.exports = async () => {
  try {
    console.log("🌅 Restore started...");

    const modelNames = mongoose.modelNames();

    for (const modelName of modelNames) {
      const model = mongoose.model(modelName);
      const colName = model.collection.name;

      const count = await model.countDocuments();

      if (count === 0) {
        console.log(`⚠️ ${colName} empty → restoring`);
        await restoreCollection(model, colName);
      }
    }

    console.log("✅ Restore completed");

  } catch (err) {
    console.error("❌ Restore Failed:", err);
  }
};