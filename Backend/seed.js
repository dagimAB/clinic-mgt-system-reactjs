const bcrypt = require("bcrypt");
const { addStaff, initialize } = require("./models/Staff.model");
const db = require("./configs/db");
require("dotenv").config();

async function seedAdmin() {
  const adminData = {
    id: "ADM-001",
    name: "System Admin",
    email: "admin@aastu.edu.et",
    password_hash: await bcrypt.hash("12345678", 10),
    role: "ADMIN",
    qualification: "System Administrator"
  };

  try {
    console.log("Initializing Staff table...");
    await initialize();
    console.log("Seeding initial admin user...");
    await addStaff(adminData);
    console.log("✅ Admin user 'ADM-001' created successfully.");
    console.log("Email: admin@aastu.edu.et");
    console.log("Password: 12345678");
  } catch (err) {
    if (err.code === '23505') {
        console.log("ℹ️ Admin user already exists.");
    } else {
        console.error("❌ Error seeding admin:", err.message);
    }
  } finally {
    await db.end();
    process.exit();
  }
}

seedAdmin();
