const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

/* ================================
   📁 BACKUP ROOT
================================ */
const BACKUP_ROOT = path.resolve(__dirname, "../backup");

if (!fs.existsSync(BACKUP_ROOT)) {
  fs.mkdirSync(BACKUP_ROOT, { recursive: true });
}

/* ================================
   🔥 LOAD ALL SCHEMAS
================================ */
const schemaPath = path.join(__dirname, "../Schema");

fs.readdirSync(schemaPath).forEach(file => {
  if (file.endsWith(".js")) {
    require(path.join(schemaPath, file));
  }
});

console.log("✅ Schemas loaded:", mongoose.modelNames());

/* ================================
   📅 GET TODAY / YESTERDAY
================================ */
const getDateFolder = () => {
  const now = new Date();

  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  return ist.toISOString().split("T")[0];
};

const getYesterdayFolder = () => {
  const now = new Date();

  const ist = new Date(
    now.toLocaleString("en-US", { timeZone: "Asia/Kolkata" })
  );

  ist.setDate(ist.getDate() - 1);

  return ist.toISOString().split("T")[0];
};

/* ================================
   📂 CREATE DAILY FOLDER
================================ */
const getTodayBackupDir = () => {
  const today = getDateFolder();
  const dir = path.join(BACKUP_ROOT, today);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  return dir;
};

/* ================================
   💾 SAVE COLLECTION
================================ */
const saveCollection = (dir, name, data) => {
  const filePath = path.join(dir, `${name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`💾 Saved: ${name}`);
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

  // 🔥 PRIORITY 1: TODAY BACKUP
  if (fs.existsSync(todayPath)) {
    filePath = todayPath;
    console.log(`🔄 Restoring from TODAY backup: ${colName}`);
  }
  // 🔥 PRIORITY 2: YESTERDAY BACKUP
  else if (fs.existsSync(yesterdayPath)) {
    filePath = yesterdayPath;
    console.log(`🔄 Restoring from YESTERDAY backup: ${colName}`);
  } else {
    console.log(`⚠️ No backup found for ${colName}`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filePath, "utf-8"));

  if (!Array.isArray(data) || data.length === 0) return;

  try {
    await model.insertMany(data, { ordered: false });
    console.log(`♻️ Restored: ${colName}`);
  } catch (err) {
    console.log(`⚠️ Partial restore: ${colName}`);
  }
};

/* ================================
   🚀 MAIN FUNCTION
================================ */
module.exports = async () => {
  try {
    console.log("📦 Backup + Restore started...");

    const modelNames = mongoose.modelNames();
    const todayDir = getTodayBackupDir();

    let totalDocs = 0;

    // 🔥 CHECK TOTAL DB DATA
    for (const modelName of modelNames) {
      const model = mongoose.model(modelName);
      const count = await model.countDocuments();
      totalDocs += count;
    }

    // 🔥 FULL DB EMPTY → RESTORE ALL
    if (totalDocs === 0) {
      console.log("🚨 FULL DB EMPTY → RESTORING ALL");

      for (const modelName of modelNames) {
        const model = mongoose.model(modelName);
        const colName = model.collection.name;

        await restoreCollection(model, colName);
      }
    }

    // 🔥 LOOP EACH COLLECTION
    for (const modelName of modelNames) {
      const model = mongoose.model(modelName);
      const colName = model.collection.name;

      let docs = await model.find({}).lean();

      // 🔥 IF COLLECTION EMPTY → RESTORE
      if (docs.length === 0) {
        console.log(`⚠️ ${colName} empty → restoring`);

        await restoreCollection(model, colName);

        docs = await model.find({}).lean();
      }

      // 🔥 SAVE TODAY BACKUP
      saveCollection(todayDir, colName, docs);
    }

    console.log("✅ Backup + Restore completed");

  } catch (err) {
    console.error("❌ Error:", err);
  }
};