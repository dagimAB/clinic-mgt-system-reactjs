const dbhelper = require("../configs/dbhelper");
const {
  countAppoinmentQuery,
  createAppointmentQuery,
  getAppointmentFromPatientQuery,
  getAppointmentFromDoctorQuery,
  deleteAppointmentQuery,
  findByIDQuery,
  getAllAppointmentsQuery,
  createAppointmentQueryTable,
} = require("../configs/queries/appointment");

const createTable = () => {
  return dbhelper.query(createAppointmentQueryTable, []).then((result) => {
    return result;
  });
};

const countAppointment = () => {
  return dbhelper.query(countAppoinmentQuery, []).then((result) => {
    console.log(result, "in db helper");
    return result[0];
  });
};

const findById = (id) => {
  return dbhelper.query(findByIDQuery, [id]).then((result) => {
    console.log(result, "in db helper");
    return result;
  });
};

const deleteAppointment = (id) => {
  return dbhelper.query(deleteAppointmentQuery, [id]).then((result) => {
    console.log(result, "in db helper");
    return result;
  });
};

const getAppointmentFromPatient = (id) => {
  return dbhelper.query(getAppointmentFromPatientQuery, [id]).then((result) => {
    //console.log(result, "in db helper");
    return result;
  });
};

const getAppointmentFromDoctor = (id) => {
  return dbhelper.query(getAppointmentFromDoctorQuery, [id]).then((result) => {
    // console.log(result, "in db helper");
    return result;
  });
};

const getAllAppointments = () => {
  return dbhelper.query(getAllAppointmentsQuery, []).then((result) => {
    return result;
  });
};
const createAppointment = (data) => {
  // Explicitly map values to match query: patientid, date, time, problem, doctorid
  const values = [
    data.patientid || data.patientID,
    data.date,
    data.time,
    data.notes || data.problem || "",
    data.doctorid || data.doctorID
  ];
  return dbhelper.query(createAppointmentQuery, values).then((result) => {
    return result;
  });
};

const updateAppointment = (id, data) => {
  const values = [
    data.date,
    data.time,
    data.notes || data.problem || "",
    data.doctorID,
    id // Last param for WHERE clause
  ];
  const updateQuery = `UPDATE appointments SET date=$1, time=$2, problem=$3, doctorid=$4 WHERE id=$5`;
  return dbhelper.query(updateQuery, values).then((result) => {
    return result;
  });
};

module.exports = {
  getAppointmentFromPatient,
  createAppointment,
  countAppointment,
  getAppointmentFromDoctor,
  deleteAppointment,
  findById,
  getAllAppointments,
  createTable,
  updateAppointment
};
