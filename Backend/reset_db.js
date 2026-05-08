require("dotenv").config();
const db = require("./configs/db");
const { createTables: createAdminTables } = require("./models/Admin.model");
const { createTables: createDoctorTables } = require("./models/Doctor.model");
const { createTable: createPatientTable } = require("./models/Patient.model");
const { createTable: createAmbulanceTable } = require("./models/Ambulance.model");
const { createTables: createLabTechTables } = require("./models/LabTechnologist.model");
const { createTables: createLabTables } = require("./models/Lab.model");
const { createTable: createAppointmentTable } = require("./models/Appointment.model");
const { createTables: createReportTable } = require("./models/Report.model");

const tables = [
    "lab_records",
    "lab_test_requests",
    "medication",
    "reports",
    "appointments",
    "patients",
    "laboratory_technologists",
    "ambulances",
    "doctors",
    "admins"
];

async function resetDB() {
    console.log("=== SHMS DATABASE RESET IN PROGRESS ===\n");

    try {
        console.log("Dropping existing tables...");
        for (const table of tables) {
            await db.query(`DROP TABLE IF EXISTS ${table} CASCADE`);
            console.log(`- Dropped ${table}`);
        }
        console.log("\nAll tables dropped successfully.\n");

        console.log("Reinitializing tables with new schema...");
        await createAdminTables();
        await createDoctorTables();
        await createPatientTable();
        await createAmbulanceTable();
        await createLabTechTables();
        await createLabTables();
        await createAppointmentTable();
        await createReportTable();
        console.log("Tables reinitialized successfully.\n");

        console.log("------------------------------------------");
        console.log("SUCCESS: Database has been reset!");
        console.log("You can now run 'node seed_full_workflow.js' safely.");
        console.log("------------------------------------------");
        process.exit(0);
    } catch (error) {
        console.error("CRITICAL ERROR during database reset:", error);
        process.exit(1);
    }
}

resetDB();
