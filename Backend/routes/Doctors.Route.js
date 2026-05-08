const express = require("express");
const {
  getAllDoctors,
  createTables,
  findById,
  findIfExists,
  addDoctor,
  updatePass,
  updateDoctorById,
  addAvailableTimes,
} = require("../models/Doctor.model");
const { getDoctorQueue, completeQueueItem } = require("../models/Queue.model");
const { getPatientReports } = require("../models/Report.model");
const { getAppointmentFromPatient } = require("../models/Appointment.model");
const { findByStudentId } = require("../models/Patient.model");
const { getPatientLabHistory } = require("../models/Lab.model");
require("dotenv").config();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { updatePassword: updateStaffPassword } = require("../models/Staff.model");
const { logAction } = require("../models/AuditLog.model");
const { authenticate } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    await createTables();
    const doctors = await getAllDoctors();
    res.status(200).send(doctors);
  } catch (error) {
    console.log(error);
    res.status(400).send({ error: "Something went wrong" });
  }
});

router.post("/register", async (req, res) => {
  try {
    await createTables();
    const doctor = await findIfExists(req.body.email);
    if (doctor.length > 0) {
      return res.send({
        message: "Doctor already exists",
      });
    }
    const value = req.body;
    console.log(value);
    await addDoctor(value);
    const data = await findIfExists(req.body.email);
    const email = data[0].email;
    console.log(email);
    return res.send({ email, message: "Registered" });
  } catch (error) {
    res.send({ message: "error" });
  }
});

router.post("/login", async (req, res) => {
  const { docID, password } = req.body;
  try {
    const doctor = await findById(docID);
    if (
      doctor &&
      doctor.length > 0 &&
      docID == doctor[0].id &&
      password == doctor[0].password
    ) {
      const token = jwt.sign({ doctorID: doctor[0].id }, process.env.KEY, {
        expiresIn: "24h",
      });
      res.send({
        message: "Successful",
        user: { ...doctor[0], userType: "doctor" },
        token: token,
      });
    } else {
      res.send({ message: "Wrong credentials" });
    }
  } catch (error) {
    console.log({ message: "Error" });
    console.log(error);
  }
});

router.post("/availability", async (req, res) => {
  console.log(req.body);
  const docId = req.body.id;
  const startMorningTime = req.body.MAS?.trim() || null;
  const endMorningTime = req.body.MAE?.trim() || null;
  const startEveningTime = req.body.EAS?.trim() || null;
  const endEveningTime = req.body.EAE?.trim() || null;

  const isValidTime = (value) => /^\d{2}:\d{2}$/.test(value);
  const toMinutes = (value) => {
    if (!value || !isValidTime(value)) return null;
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const hasMorning = startMorningTime || endMorningTime;
  const hasEvening = startEveningTime || endEveningTime;

  if (!hasMorning && !hasEvening) {
    return res.status(400).send({ message: "No availability provided" });
  }

  if (
    (startMorningTime && !endMorningTime) ||
    (!startMorningTime && endMorningTime)
  ) {
    return res
      .status(400)
      .send({ message: "Morning start and end time are required" });
  }

  if (
    (startEveningTime && !endEveningTime) ||
    (!startEveningTime && endEveningTime)
  ) {
    return res
      .status(400)
      .send({ message: "Evening start and end time are required" });
  }

  if (
    startMorningTime &&
    (!isValidTime(startMorningTime) || !isValidTime(endMorningTime))
  ) {
    return res.status(400).send({ message: "Invalid morning time format" });
  }

  if (
    startEveningTime &&
    (!isValidTime(startEveningTime) || !isValidTime(endEveningTime))
  ) {
    return res.status(400).send({ message: "Invalid evening time format" });
  }

  if (
    startMorningTime &&
    toMinutes(startMorningTime) > toMinutes(endMorningTime)
  ) {
    return res
      .status(400)
      .send({ message: "Morning end time must be after start" });
  }

  if (
    startEveningTime &&
    toMinutes(startEveningTime) > toMinutes(endEveningTime)
  ) {
    return res
      .status(400)
      .send({ message: "Evening end time must be after start" });
  }
  try {
    const doctor = await findById(docId);
    if (doctor.length > 0) {
      const times = [];
      let currentTime = startMorningTime;

      if (startMorningTime && endMorningTime) {
        while (currentTime <= endMorningTime) {
          times.push(currentTime);
          const [hours, minutes] = currentTime.split(":");
          const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
          const newTime = totalMinutes + 15;
          const newHours = Math.floor(newTime / 60);
          const newMinutes = newTime % 60;
          currentTime = `${newHours.toString().padStart(2, "0")}:${newMinutes
            .toString()
            .padStart(2, "0")}`;
        }
      }

      currentTime = startEveningTime;
      if (startEveningTime && endEveningTime) {
        while (currentTime <= endEveningTime) {
          times.push(currentTime);
          const [hours, minutes] = currentTime.split(":");
          const totalMinutes = parseInt(hours) * 60 + parseInt(minutes);
          const newTime = totalMinutes + 15;
          const newHours = Math.floor(newTime / 60);
          const newMinutes = newTime % 60;
          currentTime = `${newHours.toString().padStart(2, "0")}:${newMinutes
            .toString()
            .padStart(2, "0")}`;
          console.log(currentTime);
        }
      }

      if (times.length === 0) {
        return res.status(400).send({ message: "No valid availability slots" });
      }
      console.log(times);
      await addAvailableTimes(docId, times);
      res.send({
        message: "Successful",
        user: { ...doctor[0], userType: "doctor" },
      });
    } else {
      res.status(404).send({ message: "Doctor not found" });
    }
  } catch (error) {
    console.log({ message: "Available times error" });
    console.log(error);
  }
});

router.patch("/:doctorId", async (req, res) => {
  const id = req.params.doctorId;
  const { password, ...profileUpdates } = req.body;
  try {
    if (password) {
      console.log(`DEBUG: Updating password for ${id}`);
      
      // 1. Update Doctor table (Plain text as per existing design)
      await updatePass(password, id);
      console.log(`DEBUG: Updated Doctor table password for ${id}`);

      // 2. Sync to Staff table (Hashed)
      const hashedPassword = await bcrypt.hash(password, 10);
      await updateStaffPassword(id, hashedPassword);
      console.log(`DEBUG: Synced password update for DOCTOR ${id} to Staff table.`);

      const doctor = await findById(id);
      if (doctor[0]?.password === password) {
        return res.status(200).send({
          message: "password updated",
          user: { ...doctor[0], userType: "doctor" },
        });
      }
      return res.send({ message: "password not updated" });
    }

    // 1. Fetch existing doctor data to preserve fields
    const currentDoctor = await findById(id);
    if (!currentDoctor || currentDoctor.length === 0) {
      return res.status(404).send({ message: "doctor not found" });
    }
    const existingData = currentDoctor[0];
    console.log("DEBUG: Existing Doctor Data:", existingData);

    // 2. Merge existing data with updates
    const mergedData = {
        name: profileUpdates.name || existingData.name,
        phonenum: profileUpdates.phonenum || existingData.phonenum,
        email: profileUpdates.email || existingData.email,
        age: profileUpdates.age || existingData.age,
        gender: profileUpdates.gender || existingData.gender,
        bloodgroup: profileUpdates.bloodgroup || existingData.bloodgroup,
        dob: profileUpdates.dob || existingData.dob,
        address: profileUpdates.address || existingData.address,
        education: profileUpdates.education || existingData.education,
        department: profileUpdates.department || existingData.department,
        fees: profileUpdates.fees || existingData.fees,
    };

    const updated = await updateDoctorById(id, mergedData);
    if (!updated) {
      return res.status(404).send({ message: "doctor not found" });
    }
    return res.status(200).send({
      message: "profile updated",
      user: { ...updated, userType: "doctor" },
    });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "error" });
  }
});

// GET Doctor's specific queue
router.get("/queue/:doctorId", async (req, res) => {
  try {
    const queue = await getDoctorQueue(req.params.doctorId);
    res.status(200).send(queue);
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error fetching doctor queue" });
  }
});

// GET Comprehensive Consultation Data
router.get("/consultation/*", async (req, res) => {
  try {
    const studentId = req.params[0];
    console.log("Consultation requested for studentId (wildcard):", studentId);
    const patientDetails = await findByStudentId(studentId);
    if (!patientDetails || patientDetails.length === 0) {
      return res.status(404).send({ message: "Patient not found" });
    }
    const patient = patientDetails[0];
    const patientStudentId = patient.studentid || patient.studentID;

    // 2. Fetch Medical History (Reports)
    const history = await getPatientReports(patientStudentId);

    // 3. Fetch Lab Results
    const labResults = await getPatientLabHistory(patientStudentId);

    // 4. Fetch Appointment History
    const appointments = await getAppointmentFromPatient(patientStudentId);

    res.status(200).send({
      patient,
      history,
      labResults,
      appointments,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error fetching consultation data" });
  }
});

// Complete Consultation
router.patch("/consultation/complete/:queueId", authenticate, async (req, res) => {
  try {
    await completeQueueItem(req.params.queueId);
    
    // Log Action
    if (req.user && req.user.id) {
        await logAction(req.user.id, "COMPLETE_CONSULTATION", "queue", req.params.queueId);
    }

    res.status(200).send({ message: "Consultation completed" });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error completing consultation" });
  }
});

module.exports = router;
