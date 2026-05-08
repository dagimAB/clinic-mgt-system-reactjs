const express = require("express");
const {
  createAppointment,
  getAppointmentFromPatient,
  getAppointmentFromDoctor,
  deleteAppointment,
  findById,
  getAllAppointments,
} = require("../models/Appointment.model");
const { getDoctorCredFromEmail } = require("../models/Doctor.model");
const router = express.Router();

router.get("/:userType/:id", async (req, res) => {
  const id = req.params.id;
  const userType = req.params.userType;
  try {
    const appointments =
      userType === "doctor"
        ? await getAppointmentFromDoctor(id)
        : userType === "patient"
          ? await getAppointmentFromPatient(id)
          : await getAllAppointments();
    res.status(200).send({ message: "successful", data: appointments });
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "error" });
  }
});

router.post("/create", async (req, res) => {
  const payload = req.body;

  try {
    let doctorId = payload.doctorid || payload.docid; // Check direct ID first

    if (!doctorId && payload.docemail) {
      const doctor = await getDoctorCredFromEmail(payload.docemail);
      if (doctor.length > 0) {
        doctorId = doctor[0].id;
      }
    }

    if (doctorId) {
      // Construct explicit object to match SQL query param order: $1 patientid, $2 date, $3 time, $4 problem, $5 doctorid
      const appointmentData = {
        patientid: payload.patientid,
        date: payload.date,
        time: payload.time,
        problem: payload.problem,
        doctorid: doctorId
      };

      console.log("Creating appointment:", appointmentData);
      await createAppointment(appointmentData);
      res.status(200).send({ message: "Successful" });
    } else {
      res.status(400).send({ message: "Doctor ID not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send(error);
  }
});

router.delete("/:appointmentId", async (req, res) => {
  const id = req.params.appointmentId;
  try {
    const appointment = await findById(id);
    if (appointment.length > 0) {
      await deleteAppointment(id);
      res.status(200).send({ message: "successful" });
    }
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "error" });
  }
});

module.exports = router;
