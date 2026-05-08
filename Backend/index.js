const express = require("express");
require("dotenv").config();
const dns = require("dns");
const cors = require("cors");

// DNS Resolution Fix for Neon/IPv6 issues
const resolveHost = async () => {
  if (process.env.PG_HOST && process.env.PG_HOST !== 'localhost') {
    return new Promise((resolve) => {
      dns.resolve4(process.env.PG_HOST, (err, addresses) => {
        if (!err && addresses && addresses.length > 0) {
          console.log(`✅ Resolved ${process.env.PG_HOST} to ${addresses[0]}`);
          process.env.RESOLVED_PG_HOST = addresses[0];
        } else {
          console.warn(`⚠️ DNS resolution failed for ${process.env.PG_HOST}, using original hostname.`);
        }
        resolve();
      });
    });
  }
};

// Defer requires that depend on DB until after resolution
let authRouter, adminRouter, publicRouter, reportRouter, appointmentRouter, doctorRouter, patientRouter, reportsRouter, nurseRouter, certificateRouter, labTechRouter, labRouter, aiRouter, db;

const app = express();

const logInitStep = async (label, initializer) => {
  console.log(`➡️ Initializing ${label}...`);
  await initializer();
  console.log(`✅ ${label} initialized successfully.`);
};

const startServer = async () => {
  console.log("🚀 Starting SHMS backend initialization...");
  await resolveHost(); // Resolve IP first

  // Now load modules that interpret the config
  authRouter = require("./routes/Auth.Route");
  adminRouter = require("./routes/Admin.Route");
  publicRouter = require("./routes/Public.Route");
  reportRouter = require("./routes/Report.Route");
  appointmentRouter = require("./routes/Appointments.Route");
  doctorRouter = require("./routes/Doctors.Route");
  patientRouter = require("./routes/Patients.Route");
  reportsRouter = require("./routes/Reports.Route");
  nurseRouter = require("./routes/Nurses.Route");
  certificateRouter = require("./routes/Certificates.Route");
  labTechRouter = require("./routes/LabTechnologist.Route");
  labRouter = require("./routes/Lab.Route");
  aiRouter = require("./routes/AI.Route");

  db = require("./configs/db");

// Import table creation functions
// const { createTables: createAdminTables } = require("./models/Admin.model");
const { createTables: createDoctorTables } = require("./models/Doctor.model");
const { createTable: createPatientTable } = require("./models/Patient.model");
// const { createTable: createAmbulanceTable } = require("./models/Ambulance.model");
const { createTables: createNurseTables } = require("./models/Nurses.model");
const { createTable: createQueueTable } = require("./models/Queue.model");
const { createTables: createLabTechTables } = require("./models/LabTechnologist.model");
const { createTables: createLabTables } = require("./models/Lab.model");
const { createTable: createAppointmentTable } = require("./models/Appointment.model");
const { createTables: createReportTable } = require("./models/Report.model");

  app.use(express.json());
  app.use(cors());

  app.get("/", (req, res) => {
    res.send("SHMS Backend - Centralized Auth Active");
  });

  // Centralized Routes
  app.use("/auth", authRouter);
  app.use("/admin", adminRouter);
  app.use("/public", publicRouter);
  app.use("/reports", reportRouter);

  // Table Initializers
  const { initialize: initializeStaffTable } = require("./models/Staff.model");
  const { initialize: initializeAuditLogsTable } = require("./models/AuditLog.model");
  const { initialize: initializeConfigTable } = require("./models/Config.model");
  const { initialize: initializeQueueTable } = require("./models/Queue.model");
  const { initialize: initializeReportsTable } = require("./models/Report.model");
  const { initialize: initializeCertificateTable } = require("./models/Certificate.model");
  const { initialize: initializeAIChatTables } = require("./models/AIChat.model");
  // app.use("/ambulances", ambulanceRouter);
  app.use("/appointments", appointmentRouter);
  app.use("/doctors", doctorRouter);
  // app.use("/hospitals", hospitalRouter);
  app.use("/patients", patientRouter);
  // app.use("/prescriptions", prescriptionRouter);
  app.use("/reports", reportsRouter);
  app.use("/nurses", nurseRouter);
  app.use("/certificates", certificateRouter);
  app.use("/labtechs", labTechRouter);
  app.use("/lab", labRouter);
  app.use("/ai", aiRouter);


  app.listen(process.env.PORT || 3007, async () => {
    try {
      console.log("📡 Connecting to database...");
      const result = await db.query("SELECT NOW()");
      console.log("Connected to the database at", result.rows[0].now);
      console.log("Connected to DB successfully");

      // Initialize only the core tables
      await logInitStep("Staff table", initializeStaffTable);
      await logInitStep("Audit Logs table", initializeAuditLogsTable);
      await logInitStep("System Config table", initializeConfigTable);
      await logInitStep("Queue table", initializeQueueTable);
      await logInitStep("Reports table", initializeReportsTable);
      await logInitStep("Certificates table", initializeCertificateTable);
      await logInitStep("AI chat tables", initializeAIChatTables);

      // Schema cleanup: Ensure optional fields are nullable
      try {
        await db.query("ALTER TABLE patients ALTER COLUMN DOB DROP NOT NULL");
        await db.query("ALTER TABLE patients ALTER COLUMN bloodGroup DROP NOT NULL");
        await db.query("ALTER TABLE patients ALTER COLUMN allergies DROP NOT NULL");
        console.log("✅ Schema constraints updated successfully");
      } catch (e) {
        console.log("Note: Schema constraints update skipped or already applied");
      }

      // Initialize tables
      // await createAdminTables();
      await logInitStep("Doctor tables", createDoctorTables);
      await logInitStep("Patient table", createPatientTable);
      // await createAmbulanceTable();
      await logInitStep("Nurses table", createNurseTables);
      await logInitStep("Queue table", createQueueTable);
      await logInitStep("Lab technologist tables", createLabTechTables);
      await logInitStep("Lab tables", createLabTables);
      await logInitStep("Appointment table", createAppointmentTable);
      await logInitStep("Report table", createReportTable);

      console.log("🎉 SHMS tables initialized successfully");

    } catch (err) {
      console.error("Error connecting to the database:", err);
    }
    console.log(`🟢 Listening at port ${process.env.PORT || 3007}`);
  });
};

startServer().catch(err => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
