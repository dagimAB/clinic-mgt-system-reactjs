require("dotenv").config();
const { addDoctor, createTables: createDoctorTables } = require("./models/Doctor.model");
const { addPatient, createTable: createPatientTable } = require("./models/Patient.model");
const { createAppointment, createTable: createAppointmentTable } = require("./models/Appointment.model");
const { addLabTech, createTables: createLabTechTables } = require("./models/LabTechnologist.model");
const { createTables: createLabTables } = require("./models/Lab.model");

const testDoctor = {
    name: "Dr. Test Smith",
    phoneNum: "9876543210",
    email: "doctor@test.com",
    age: 45,
    gender: "M",
    bloodGroup: "O+",
    DOB: "1979-05-15",
    address: "Doctor's Quarter, AASTU",
    education: "MD, Specialized in Surgery",
    department: "General Medicine",
    fees: 500
};

const testPatient = {
    studentid: "ETS0110/16",
    name: "Student Patient One",
    department: "Software Engineering",
    year: 3,
    phonenum: "1234567890",
    emergencycontact: "911911911",
    email: "patient@test.com",
    password: "Patient@123",
    age: 20,
    gender: "M",
    bloodgroup: "A+",
    allergies: "Peanuts",
    dob: "2004-01-01",
    address: "AASTU Dormitory"
};

const testAppointment = {
    patientid: 1,
    date: new Date().toISOString().split('T')[0],
    time: "10:00",
    problem: "Fever and headaches",
    doctorid: 1
};

const testTech = {
    name: "Test Lab Technologist",
    phoneNum: "1234567890",
    email: "lab@test.com",
    age: 30,
    gender: "M",
    DOB: "1994-01-01",
    address: "AASTU Campus Clinic"
};

async function seed() {
    try {
        console.log("Initializing all tables...");
        await createDoctorTables();
        await createPatientTable();
        await createAppointmentTable();
        await createLabTechTables();
        await createLabTables();

        console.log("Seeding Doctor (ID: 1)...");
        await addDoctor(testDoctor);

        console.log("Seeding Patient (ID: 1)...");
        await addPatient(testPatient);

        console.log("Seeding Appointment (ID: 1)...");
        await createAppointment(testAppointment);

        console.log("Seeding Lab Technologist (ID: 1)...");
        await addLabTech(testTech);

        console.log("------------------------------------------");
        console.log("SUCCESS: Full workflow data seeded!");
        console.log("Doctor Login: ID 1, Pass: Doctor@123");
        console.log("Lab Tech Login: ID 1, Pass: Lab@123");
        console.log("Patient Login: ID 1, Pass: Patient@123");
        console.log("------------------------------------------");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding workflow data:", error);
        process.exit(1);
    }
}

seed();
