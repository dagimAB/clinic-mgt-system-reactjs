const express = require("express");
const {
    getAllLabTechs,
    createTables,
    findCred,
    findIfExists,
    addLabTech,
    getLabTechCredsFromEmail,
    updatePass,
    findById,
    updateLabTechById
} = require("../models/LabTechnologist.model");
const bcrypt = require("bcrypt");
const { updatePassword: updateStaffPassword } = require("../models/Staff.model");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const router = express.Router();

// GET all technologists
router.get("/", async (req, res) => {
    try {
        await createTables();
        const result = await getAllLabTechs();
        res.status(200).send(result);
    } catch (error) {
        res.status(400).send({ error: error.message });
    }
});

// REGISTER a new technologist
router.post("/register", async (req, res) => {
    try {
        await createTables();
        const exists = await findIfExists(req.body.email);
        if (exists.length > 0) {
            return res.status(400).send({ message: "Technologist already exists" });
        }
        await addLabTech(req.body);
        const data = await findIfExists(req.body.email);
        res.status(201).send({ email: data[0].email, message: "Registered Successfully" });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// LOGIN technologist
router.post("/login", async (req, res) => {
    const { id, password } = req.body;
    try {
        const user = await findCred(id);
        if (user && user.length > 0 && password === user[0].password) {
            const token = jwt.sign({ labTechID: user[0].id }, process.env.KEY, {
                expiresIn: "24h",
            });
            res.send({
                message: "Login Successful",
                user: { ...user[0], userType: "lab_technologist" },
                token: token,
            });
        } else {
            res.status(401).send({ message: "Wrong credentials" });
        }
    } catch (error) {
        res.status(500).send({ message: error.message });
    }
});

// Update profile/password
router.patch("/:id", async (req, res) => {
    const { id } = req.params;
    const { password, ...profileUpdates } = req.body;
    try {
        if (password) {
            // 1. Update LabTech table
            await updatePass(password, id);

             // 2. Sync to Staff table
            const hashedPassword = await bcrypt.hash(password, 10);
            await updateStaffPassword(id, hashedPassword);
            console.log(`✅ Synced password update for LAB TECH ${id} to Staff table.`);

            const currentLab = await findById(id);
            res.status(200).send({ 
                message: "password updated",
                user: { ...currentLab[0], userType: "lab_technologist" }
            });
            return;
        }

        // 1. Fetch existing data
        const currentLab = await findById(id);
        if (!currentLab || currentLab.length === 0) {
            return res.status(404).send({ message: "Technologist not found" });
        }
        const existingData = currentLab[0];

        // 2. Merge data
        const mergedData = {
            name: profileUpdates.name || existingData.name,
            phoneNum: profileUpdates.phonenum || profileUpdates.phoneNum || existingData.phonenum || existingData.phonenum,
            email: profileUpdates.email || existingData.email,
            age: profileUpdates.age || existingData.age,
            gender: profileUpdates.gender || existingData.gender,
            DOB: profileUpdates.dob || profileUpdates.DOB || existingData.dob || existingData.dob,
            address: profileUpdates.address || existingData.address
        };

        const updated = await updateLabTechById(id, mergedData);
        if (!updated) {
            return res.status(404).send({ message: "Update failed" });
        }

        res.status(200).send({ 
            message: "profile updated",
            user: { ...updated, userType: "lab_technologist" }
        });

    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;
