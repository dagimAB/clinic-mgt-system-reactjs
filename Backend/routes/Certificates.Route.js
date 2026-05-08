const express = require("express");
const {
  createCertificate,
  getCertificatesForNurse,
  getCertificatesForStudent,
  getCertificatesForDoctor,
} = require("../models/Certificate.model");
const router = express.Router();

// Create Certificate (for Doctors)
router.post("/create", async (req, res) => {
  try {
    const certificate = await createCertificate(req.body);
    res.status(200).send({ message: "Successful", data: certificate });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error creating certificate" });
  }
});

// List Certificates (All for Nurse, Specific for Patient/Doctor)
router.get("/:userType/:id", async (req, res) => {
  const { userType, id } = req.params;
  try {
    let certificates;
    if (userType === "nurse") {
      certificates = await getCertificatesForNurse();
    } else if (userType === "patient") {
      certificates = await getCertificatesForStudent(id);
    } else if (userType === "doctor") {
      certificates = await getCertificatesForDoctor(id);
    } else {
      certificates = [];
    }
    res.status(200).send({ message: "Successful", data: certificates });
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error fetching certificates" });
  }
});

// Email Certificate
router.post("/email", async (req, res) => {
  const { to, subject, html } = req.body;
  try {
    const { sendEmail } = await import("../email.js"); // Dynamic import to avoid earlier requiring path issues
    const result = await sendEmail({ to, subject, html });
    if (result.success) {
      res.status(200).send({ message: "Email Sent Successfully" });
    } else {
      res.status(500).send({ message: "Failed to send email" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Error sending email" });
  }
});

module.exports = router;
