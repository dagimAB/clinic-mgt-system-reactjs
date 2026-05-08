require("dotenv").config();
const { addLabTech, createTables } = require("./models/LabTechnologist.model");

const testTech = {
    name: "Test Lab Technologist",
    phoneNum: 1234567890,
    email: "lab@test.com",
    age: 30,
    gender: "M",
    DOB: "1994-01-01",
    address: "AASTU Campus Clinic"
};

async function seed() {
    try {
        console.log("Checking tables...");
        await createTables();

        console.log("Adding test laboratory technologist...");
        await addLabTech(testTech);

        console.log("------------------------------------------");
        console.log("SUCCESS: Lab Technologist registered!");
        console.log("Login ID: 1");
        console.log("Password: Lab@123");
        console.log("------------------------------------------");
        process.exit(0);
    } catch (error) {
        console.error("Error seeding database:", error);
        process.exit(1);
    }
}

seed();
