require("dotenv").config();
const { addDoctor, createTables } = require("./models/Doctor.model");

const testDoctor = {
    name: "Dr. Test Smith",
    phoneNum: 9876543210,
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

async function seed() {
    try {
        console.log("Checking tables...");
        await createTables();

        console.log("Adding test doctor...");
        await addDoctor(testDoctor);

        console.log("------------------------------------------");
        console.log("SUCCESS: Doctor registered!");
        console.log("Login ID: 1");
        console.log("Password: Doctor@123");
        console.log("------------------------------------------");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seed();
