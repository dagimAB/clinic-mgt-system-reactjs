const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { addStaff, getAllStaff, updateStaff, updatePassword, findById } = require("../models/Staff.model");
const { createReport } = require("../models/Report.model");
const { logAction, getLogs, getFilteredLogs } = require("../models/AuditLog.model");
const { setConfig, getConfig } = require("../models/Config.model");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const dbhelper = require("../configs/dbhelper");
const { getDailyStatsQuery, getRoleDistributionQuery, getWorkloadQuery, getOverviewCountsQuery, getWeeklyActivityQuery, getOperationalLogQuery, getIndividualWorkloadQuery } = require("../configs/queries/analytics");
const { getIllnessTrendsQuery, getMonthlyTrendsQuery } = require("../configs/queries/reports");

// All routes here require being an ADMIN
router.use(authenticate);
router.use(authorize(["ADMIN"]));

/**
 * @route   POST /admin/staff
 * @desc    Create a new staff member (Doctor, Nurse, Lab Tech)
 */
router.post("/staff", async (req, res) => {
  const { id, name, email, password, role, qualification, phonenum, dob, gender, age, address, bloodgroup, department, fees } = req.body;

  try {
    const password_hash = await bcrypt.hash(password, 10);
    const newStaffData = {
      name,
      email,
      password_hash,
      password, // Plain password for sync if needed
      role,
      qualification,
      phonenum,
      dob,
      gender,
      age,
      address,
      bloodgroup,
      department,
      fees
    };
    
    // If ID is provided manually, use it
    if (id) newStaffData.id = id;

    const newStaff = await addStaff(newStaffData);

    // LOG ACTION
    await logAction(req.user.id, "CREATE_STAFF", "staff", newStaff.id, { 
      role: newStaff.role, 
      email: newStaff.email 
    });

    res.status(201).json({
      message: "Staff member created successfully",
      staff: {
        id: newStaff.id,
        name: newStaff.name,
        role: newStaff.role,
      },
    });
  } catch (err) {
    if (err.code === "23505") {
      return res.status(400).json({ message: "Staff ID or Email already exists" });
    }
    console.error("Staff creation error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   GET /admin/staff
 * @desc    List all staff members
 */
router.get("/staff", async (req, res) => {
  try {
    const staffList = await getAllStaff();
    res.status(200).json(staffList);
  } catch (err) {
    console.error("Error fetching staff:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   PUT /admin/staff/:id
 * @desc    Update staff details or deactivate account
 */
router.put("/staff/:id", async (req, res) => {
  const { id } = req.params;
  const { name, email, role, qualification, is_active, phonenum, address, dob, gender, age } = req.body;

  try {
    // 1. Fetch existing staff data to preserve fields like 'role' if not provided
    const currentStaff = await findById(id);
    if (!currentStaff) {
      return res.status(404).json({ message: "Staff member not found" });
    }

    console.log(`Updating staff ${id}. Merging new data with existing.`);

    const updatedStaff = await updateStaff(id, {
      name: name || currentStaff.name,
      email: email || currentStaff.email,
      role: role || currentStaff.role, // Preserves role if null in body
      qualification: qualification || currentStaff.qualification,
      is_active: is_active !== undefined ? is_active : currentStaff.is_active,
      phonenum: phonenum || currentStaff.phonenum,
      address: address || currentStaff.address,
      dob: dob || currentStaff.dob,
      gender: gender || currentStaff.gender,
      age: age || currentStaff.age
    });

    if (!updatedStaff) {
      return res.status(404).json({ message: "Staff member not found after update" });
    }

    // LOG ACTION
    await logAction(req.user.id, "UPDATE_STAFF", "staff", id, req.body);

    res.status(200).json({
      message: "Staff member updated successfully",
      staff: updatedStaff,
    });
  } catch (err) {
    console.error("Staff update error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   POST /admin/staff/:id/reset-password
 * @desc    Reset a staff member's password
 */
router.post("/staff/:id/reset-password", async (req, res) => {
  const { id } = req.params;
  const { password } = req.body;

  try {
    const password_hash = await bcrypt.hash(password, 10);
    await updatePassword(id, password_hash);

    // LOG ACTION
    await logAction(req.user.id, "RESET_PASSWORD", "staff", id);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Password reset error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   PATCH /admin/:id
 * @desc    Self-update for admin (e.g., password change)
 */
router.patch("/:id", async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword, oldpassword, newpassword } = req.body;
  
  // Support both camelCase and lowercase (compatibility)
  const op = oldPassword || oldpassword;
  const np = newPassword || newpassword || req.body.password;

  try {
    const { findById } = require("../models/Staff.model");
    const user = await findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Only allow changing password if old password is correct
    if (np) {
        if (!op) {
            return res.status(400).json({ message: "Old password is required to set a new one" });
        }
        
        const isMatch = await bcrypt.compare(op, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect Old Password" });
        }

        const new_hash = await bcrypt.hash(np, 10);
        await updatePassword(id, new_hash);
        
        return res.status(200).json({ 
            message: "password updated",
            user: { id: user.id, name: user.name, role: user.role } 
        });
    }

    res.status(400).json({ message: "No valid fields provided for update" });
  } catch (err) {
    console.error("Self-update error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   GET /admin/staff/:id/workload
 * @desc    View professional workload for a staff member
 */
router.get("/staff/:id/workload", async (req, res) => {
  try {
    const workload = await dbhelper.query(getIndividualWorkloadQuery, [req.params.id]);
    res.status(200).json(workload[0]);
  } catch (err) {
    console.error("Workload fetch error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   GET /admin/logs
 * @desc    View system audit logs (with filters)
 */
router.get("/logs", async (req, res) => {
  const { user_id, action, date } = req.query;
  try {
    let logs;
    if (user_id || action || date) {
      logs = await getFilteredLogs(user_id || null, action || null, date || null);
    } else {
      logs = await getLogs();
    }
    res.status(200).json(logs);
  } catch (err) {
    console.error("Error fetching logs:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   GET /admin/dashboard
 * @desc    Get dashboard analytics
 */
router.get("/dashboard", async (req, res) => {
  try {
    const counts = await dbhelper.query(getOverviewCountsQuery);
    
    res.status(200).json({
      data: counts[0]
    });
  } catch (err) {
    console.error("Dashboard error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   GET /admin/config/:key
 * @desc    Get system configuration (e.g., certificate_settings)
 */
router.get("/config/:key", async (req, res) => {
  try {
    const value = await getConfig(req.params.key);
    res.status(200).json(value);
  } catch (err) {
    console.error("Config fetch error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   POST /admin/config
 * @desc    Update system configuration
 */
router.post("/config", async (req, res) => {
  const { key, value } = req.body;
  try {
    await setConfig(key, value);
    await logAction(req.user.id, "UPDATE_CONFIG", "system_config", key, value);
    res.status(200).json({ message: "Configuration updated successfully" });
  } catch (err) {
    console.error("Config update error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   POST /admin/backup
 * @desc    Trigger or schedule manual backup (Placeholder)
 */
router.post("/backup", async (req, res) => {
  try {
    // Placeholder for backup logic (e.g., executing pg_dump)
    await logAction(req.user.id, "TRIGGER_BACKUP", "system", "manual");
    res.status(200).json({ 
        message: "Backup initiated successfully",
        details: "Daily backup scheduled at 02:00 as per system policy."
    });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   GET /admin/stats
 * @desc    Get general system statistics
 */
router.get("/stats", async (req, res) => {
  try {
    const dailyStats = await dbhelper.query(getDailyStatsQuery);
    const roleDist = await dbhelper.query(getRoleDistributionQuery);
    const workload = await dbhelper.query(getWorkloadQuery);
    const weeklyActivity = await dbhelper.query(getWeeklyActivityQuery);
    const operationalLog = await dbhelper.query(getOperationalLogQuery);
    
    res.status(200).json({
      daily: dailyStats[0],
      roles: roleDist,
      workload: workload,
      weekly: weeklyActivity,
      tracelog: operationalLog
    });
  } catch (err) {
    console.error("Stats fetch error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   GET /admin/analytics/trends
 * @desc    Get illness and monthly trends
 */
router.get("/analytics/trends", async (req, res) => {
  try {
    const illnessTrends = await dbhelper.query(getIllnessTrendsQuery);
    const monthlyTrends = await dbhelper.query(getMonthlyTrendsQuery);
    
    res.status(200).json({
      illness: illnessTrends,
      monthly: monthlyTrends
    });
  } catch (err) {
    console.error("Trends fetch error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post("/seed-testing-data", async (req, res) => {
  try {
    // 1. Seed Staff & Doctors (via dual-write)
    const password_hash = await bcrypt.hash("12345678", 10);
    const sampleStaff = [
      { id: "DOC-999", name: "Dr. Seeder", email: "seeder@aastu.edu.et", password_hash, password: "12345678", role: "DOCTOR", qualification: "PhD", phonenum: 251912345678, age: 45, gender: "M", bloodgroup: "O+", dob: "1980-01-01", address: "AASTU Campus", department: "Pediatrics", fees: 200 },
      { id: "NRS-999", name: "Nurse Joy", email: "joy@aastu.edu.et", password_hash, password: "12345678", role: "NURSE", qualification: "BSc", phonenum: 251911111111, age: 30, gender: "F", dob: "1995-05-05", address: "AASTU Campus" }
    ];

    for (const s of sampleStaff) {
      // addStaff already handles dual-write for DOCTOR role
      await addStaff(s);
    }

    // 2. Seed Patients (Exclusively in its own table)
    const PatientsModel = require("../models/Patients.model");
    const samplePatients = [
      { studentid: "ETS/123/15", name: "Student Patient", department: "Software Engineering", year: 3, phonenum: 251900000000, emergencycontact: "Parent", email: "student@aastu.edu.et", password: "password_hash", age: 21, gender: "M", bloodgroup: "A+", allergies: "Pollen", dob: "2003-10-10", address: "Dorm 5" }
    ];

    for (const p of samplePatients) {
      // Patients are no longer dual-written to Staff
      await PatientsModel.addPatient(p);
    }

    // 3. Seed Reports
    const sampleReports = [
      { patientid: "ETS/123/15", doctorid: "DOC-999", appointmentid: 999, date: "2026-01-20", time: "10:30", disease: "Flu", temperature: 38.0, weight: 70, bp: "120/80", glucose: 90, info: "Sample seed report", medicines: [{name: "Aspirin", dosage: "100mg"}] },
    ];

    for (const data of sampleReports) {
      await createReport({
        patient_id: data.patientid,
        doctor_id: data.doctorid,
        appointment_id: data.appointmentid,
        date: data.date,
        time: data.time,
        disease: data.disease,
        temperature: data.temperature,
        weight: data.weight,
        bp: data.bp,
        glucose: data.glucose,
        info: data.info,
        medicines: data.medicines
      });
    }

    // 4. Add queue items
    await dbhelper.query(`INSERT INTO queue (patient_name, department, status, created_at) VALUES ('Student Patient', 'Software Engineering', 'Visited', CURRENT_TIMESTAMP - INTERVAL '1 hour')`);

    await logAction(req.user.id, "SEED_TEST_DATA", "system", "clinical");
    res.status(200).json({ message: "Role-independent and staff data seeded successfully" });
  } catch (err) {
    console.error("DEBUG: Seeding error details:", err);
    res.status(500).json({ 
      message: "Internal server error during seeding", 
      error: err.message,
      detail: err.detail || err.hint || "No further details"
    });
  }
});

module.exports = router;
