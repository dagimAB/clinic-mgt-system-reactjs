const dbhelper = require("../configs/dbhelper");
const {
  createCertificatesTableQuery,
  createCertificateQuery,
  getCertificatesForNurseQuery,
  getCertificatesForStudentQuery,
  getCertificatesForDoctorQuery,
} = require("../configs/queries/certificate");

const initialize = async () => {
  try {
    await dbhelper.query(createCertificatesTableQuery);
    console.log("✅ Certificates table initialized successfully.");
  } catch (err) {
    console.error("❌ Failed to initialize Certificates table:", err.message);
  }
};

const createCertificate = (data) => {
  const { student_id, doctor_id, type, issue_date, content, medical_justification, duration_days } = data;
  return dbhelper.query(createCertificateQuery, [
    student_id,
    doctor_id,
    type,
    issue_date || new Date(),
    content,
    medical_justification || null,
    duration_days || null,
  ]).then((result) => {
    return result[0];
  });
};

const getCertificatesForNurse = () => {
  return dbhelper.query(getCertificatesForNurseQuery, []).then((result) => {
    return result;
  });
};

const getCertificatesForStudent = (student_id) => {
  return dbhelper.query(getCertificatesForStudentQuery, [student_id]).then((result) => {
    return result;
  });
};

const getCertificatesForDoctor = (doctor_id) => {
  return dbhelper.query(getCertificatesForDoctorQuery, [doctor_id]).then((result) => {
    return result;
  });
};

module.exports = {
  initialize,
  createCertificate,
  getCertificatesForNurse,
  getCertificatesForStudent,
  getCertificatesForDoctor,
};
