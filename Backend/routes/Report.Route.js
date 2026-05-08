const express = require("express");
const router = express.Router();
const {
  createReport,
  getAllReports,
  getReportsByUser,
  updateReport,
} = require("../models/Report.model");
const { authenticate, authorize } = require("../middlewares/authMiddleware");
const { logAction } = require("../models/AuditLog.model");

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /reports
 * @desc    Create a new clinical report
 * @access  DOCTOR, ADMIN
 */
router.post("/", authorize(["DOCTOR", "ADMIN"]), async (req, res) => {
  try {
    const report = await createReport({
      ...req.body,
      doctor_id: req.body.doctor_id || req.body.doctorid || req.user.id,
      patient_id: req.body.patient_id || req.body.patientid,
      appointment_id: req.body.appointment_id || req.body.appointmentid,
    });

    await logAction(req.user.id, "CREATE_REPORT", "reports", report.id, {
      disease: report.disease,
      patient_id: report.patient_id
    });

    res.status(201).json({ message: "successful", report });
  } catch (err) {
    console.error("Report creation error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   PATCH /reports/:id
 * @desc    Update an existing clinical report
 * @access  DOCTOR (own), ADMIN
 */
router.patch("/:id", authorize(["DOCTOR", "ADMIN"]), async (req, res) => {
  try {
    const reportId = req.params.id;
    const isDoctor = req.user.role === "DOCTOR";
    const updated = await updateReport(
      reportId,
      req.body,
      isDoctor ? req.user.id : null,
    );

    if (!updated) {
      return res
        .status(404)
        .json({ message: "Report not found or not permitted." });
    }

    await logAction(req.user.id, "UPDATE_REPORT", "reports", reportId);

    res.status(200).json({ message: "updated", report: updated });
  } catch (err) {
    console.error("Report update error:", err.message);
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   GET /reports
 * @desc    Get all reports (Admin only)
 */
router.get("/", authorize(["ADMIN"]), async (req, res) => {
  try {
    const reports = await getAllReports();
    res.status(200).json({ data: reports });
  } catch (err) {
    res.status(500).json({ message: "Internal server error" });
  }
});

/**
 * @route   GET /reports/:userType/:id
 * @desc    Get reports for a specific user (Doctor/Patient)
 */
router.get(
  "/:userType/:id",
  authorize(["DOCTOR", "ADMIN", "PATIENT"]),
  async (req, res) => {
    try {
      const reports = await getReportsByUser(req.params.id);
      res.status(200).json({ data: reports });
    } catch (err) {
      res.status(500).json({ message: "Internal server error" });
    }
  },
);

module.exports = router;
