const fs = require("fs");
const path = require("path");
const db = require("./configs/db");
require("dotenv").config();

async function runInit() {
  const sqlPath = path.join(__dirname, "init_db.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");

  try {
    console.log("Running init_db.sql to create tables and views...");
    await db.query(sql);
    console.log("✅ Database schema created/verified successfully.");
  } catch (err) {
    console.error("❌ Failed to create tables:", err.message);
    throw err;
  } finally {
    await db.end();
    console.log("Database connection closed.");
  }
}

runInit().catch(() => process.exit(1));
