const dbhelper = require("../configs/dbhelper");
const {
  createReportsTable,
  createReportQuery: createReportQueryNew,
  getAllReportsQuery: getAllReportsQueryNew,
  getReportsByUserQuery,
} = require("../configs/queries/reports");

const {
  getLastReportIdQuery,
  countReportQuery,
  createReportQuery,
  getDoctorReportQuery,
  getPatientReportQuery,
  getAllReportsQuery,
  createReportTableQuery,
  updateReportQuery,
  updateReportByDoctorQuery,
} = require("../configs/queries/report");

const initialize = async () => {
  try {
    await dbhelper.query(createReportsTable);
    console.log("✅ Reports table initialized successfully.");
  } catch (err) {
    console.error("❌ Failed to initialize Reports table:", err.message);
  }
};

const createReport = async (reportData) => {
  const values = [
    reportData.patient_id || reportData.patientid,
    reportData.doctor_id || reportData.doctorid,
    reportData.appointment_id || null,
    reportData.date,
    reportData.time,
    reportData.disease,
    reportData.temperature || null,
    reportData.weight || null,
    reportData.bp || null,
    reportData.glucose || null,
    reportData.info || null,
    JSON.stringify(reportData.medicines || []),
    reportData.treatment_plan || null,
    reportData.follow_up_date || null,
    reportData.recommendations || null,
  ];
  const result = await dbhelper.query(createReportQueryNew, values);
  return result[0];
};

const getAllReports = async () => {
  return dbhelper.query(getAllReportsQueryNew);
};

const getReportsByUser = async (userId) => {
  return dbhelper.query(getReportsByUserQuery, [userId]);
};

const createTables = () => {
  return dbhelper.query(createReportTableQuery, []).then((result) => {
    return result;
  });
};

const countReport = () => {
  return dbhelper.query(countReportQuery, []).then((result) => {
    return result[0];
  });
};

const getLastReportId = () => {
  return dbhelper.query(getLastReportIdQuery, []).then((result) => {
    return result[0];
  });
};

const getDoctorReports = (id) => {
  return dbhelper.query(getDoctorReportQuery, [id]).then((result) => {
    return result;
  });
};

const getPatientReports = (studentId) => {
  //get the patient id from from patient table using studentId
  // patient id is not same as studentId
  return dbhelper
    .query("SELECT id FROM patients WHERE studentid = $1", [studentId])
    .then(async (result) => {
      if (result.length === 0) {
        return [];
      }
      const patientId = result[0].id;
      return dbhelper
        .query(getPatientReportQuery, [patientId])
        .then((reports) => {
          return reports;
        });
    });
}


const getAllReportsLegacy = () => {
  return dbhelper.query(getAllReportsQuery, []).then((result) => {
    return result;
  });
};

const updateReport = async (id, reportData, doctorId = null) => {
  const values = [
    id,
    reportData.disease,
    reportData.temperature,
    reportData.weight,
    reportData.bp,
    reportData.glucose,
    reportData.info,
    JSON.stringify(reportData.medicines || []),
    reportData.treatment_plan || null,
    reportData.follow_up_date || null,
    reportData.recommendations || null,
  ];

  if (doctorId) {
    const doctorValues = [...values, doctorId];
    const result = await dbhelper.query(
      updateReportByDoctorQuery,
      doctorValues,
    );
    return result[0];
  }

  const result = await dbhelper.query(updateReportQuery, values);
  return result[0];
};

module.exports = {
  initialize,
  createReport,
  getAllReports,
  getReportsByUser,
  createTables,
  countReport,
  getLastReportId,
  getDoctorReports,
  getPatientReports,
  getAllReportsLegacy,
  updateReport,
};
