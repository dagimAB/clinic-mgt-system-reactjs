/**
 * Render Post-Deploy Initialization Wrapper
 * Ensures database tables exist before starting the server
 * Safe to run multiple times (idempotent)
 */

require("dotenv").config();
const fs = require("fs");
const path = require("path");

// Flag to track if we've already tried init in this process
let initAttempted = false;

async function ensureTablesExist() {
  if (initAttempted) return; // Prevent double-init in same process
  initAttempted = true;

  const db = require("./configs/db");

  try {
    console.log("🔍 Checking if database tables exist...");

    // Quick health check: try a simple query
    await db.query("SELECT 1");
    console.log("✅ Database is accessible");

    // Try to detect if tables are already initialized
    const result = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'staff'
      );
    `);

    if (result.rows && result.rows[0] && result.rows[0].exists) {
      console.log(
        "ℹ️  Database tables already exist. Skipping initialization.",
      );
      return;
    }

    console.log("⏳ Initializing database tables...");

    // Import and run table initializers
    const StaffModel = require("./models/Staff.model");
    await StaffModel.initialize(true); // silent=true to reduce logs

    console.log("✅ Database tables initialized successfully");
  } catch (err) {
    console.warn(
      "⚠️  Pre-flight database check encountered an issue:",
      err.message,
    );
    console.warn(
      "⏭️  Continuing anyway - tables may initialize during server startup",
    );
    // Don't exit; let the server startup handle it gracefully
  }
}

// Run initialization before starting server
async function main() {
  try {
    await ensureTablesExist();
    console.log("🚀 Starting SHMS backend...");

    // Now start the actual server
    require("./index");
  } catch (err) {
    console.error("❌ Fatal error during startup:", err);
    process.exit(1);
  }
}

main();
