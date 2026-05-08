require("dotenv").config();
const { addPatient } = require("./models/Patient.model");
const { createAppointment } = require("./models/Appointment.model");

const testPatient2 = {
    name: "John Doe (Student 2)",
    phonenum: "5550199222",
    email: "student2@test.com",
    password: "Student@123",
    age: 22,
    gender: "M",
    bloodgroup: "B+",
    dob: "2002-05-20",
    address: "AASTU Hostels, Block B"
};

const testAppointment2 = {
    patientid: 2,
    date: new Date().toISOString().split('T')[0],
    time: "14:30",
    problem: "Persistent cough and fatigue",
    doctorid: 1
};

async function seedSecond() {
    try {
        console.log("Seeding Second Patient (ID: 2)...");
        await addPatient(testPatient2);

        console.log("Seeding Appointment for Student 2 (ID: 2)...");
        await createAppointment(testAppointment2);

        console.log("------------------------------------------");
        console.log("SUCCESS: Second patient and appointment seeded!");
        console.log("Patient 2 Login: ID 2, Pass: Student@123");
        console.log("------------------------------------------");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding second patient:", error);
        process.exit(1);
    }
}

seedSecond();
