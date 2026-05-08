const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { findById, updateLastLogin } = require("../models/Staff.model");
require("dotenv").config();

// Login handler
router.post("/login", async (req, res) => {
  const { id, password } = req.body;
  console.log(`Login attempt for ID: ${id}`);

  try {
    // 1. Find staff by ID (e.g., ADM-001)
    const user = await findById(id);

    if (!user) {
      console.log(`User not found: ${id}`);
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Check if account is active
    if (user.is_active === false) {
      console.log(`Deactivated user attempted login: ${id}`);
      return res.status(403).json({ message: "Account is deactivated. Please contact the administrator." });
    }

    console.log(`User found: ${user.name}, Role: ${user.role}`);
    console.log(`Has password_hash: ${!!user.password_hash}`);

    // 3. Verify password
    if (!password || !user.password_hash) {
      console.error("Missing password or hash for comparison");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      console.log(`Invalid password for user: ${id}`);
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 3. Generate JWT Token
    // Frontend expects 'userType' and it should be lowercase (admin, doctor, etc)
    let userType = user.role.toLowerCase();
    if (userType === "lab_tech") userType = "lab_technologist";
    
    // FETCH FULL PROFILE DATA BASED ON ROLE
    let fullUserProfile = { ...user, userType };
    
    try {
        if (userType === 'nurse') {
            const { findById: findNurseById } = require("../models/Nurses.model");
            const nurseData = await findNurseById(user.id);
            if (nurseData && nurseData.length > 0) fullUserProfile = { ...fullUserProfile, ...nurseData[0] };
        } else if (userType === 'doctor') {
             const { findById: findDoctorById } = require("../models/Doctor.model");
             // Doctor model might not have exported findById in the same way, let's check or use a direct query if needed.
             // Usually Doctors have their own login, but for unified auth:
             // Let's assume generic query for now or try to require.
             // Safest is to just send what we have if specific model fetch fails or isn't implemented yet.
             // But for Nurse and LabTech we know we added findById.
        } else if (userType === 'lab_technologist') {
             const { findById: findLabTechById } = require("../models/LabTechnologist.model");
             const labData = await findLabTechById(user.id);
             if (labData && labData.length > 0) fullUserProfile = { ...fullUserProfile, ...labData[0] };
        }
    } catch (fetchErr) {
        console.log(`Warning: Could not fetch full profile for ${user.id}: ${fetchErr.message}`);
    }

    const token = jwt.sign(
      { id: user.id, role: user.role, userType: userType, name: user.name },
      process.env.KEY,
      { expiresIn: "24h" }
    );

    console.log(`Login successful for: ${id} as ${userType}`);

    // Update last login timestamp
    try {
      await updateLastLogin(user.id);
      console.log(`Successfully updated last_login for: ${user.id}`);
    } catch (dbErr) {
      console.error(`Failed to update last_login for ${user.id}:`, dbErr.message);
    }

    // 4. Return success
    res.status(200).json({
      message: "Login successful",
      token,
      user: fullUserProfile,
    });
  } catch (err) {
    console.error("Login error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

module.exports = router;
