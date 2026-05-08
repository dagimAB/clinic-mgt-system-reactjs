const createReportTableQuery = `CREATE TABLE IF NOT EXISTS reports (
  id VARCHAR(50) PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  doctor_id VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  disease TEXT,
  temperature VARCHAR(20),
  weight VARCHAR(20),
  bp VARCHAR(20),
  glucose VARCHAR(20),
  info TEXT,
  FOREIGN KEY (patient_id) REFERENCES patients(studentid),
  FOREIGN KEY (doctor_id) REFERENCES staff(id)
);`;

const countReportQuery = `SELECT COUNT(*) FROM reports;`;

const createReportQuery = `INSERT INTO reports (
    patient_id,
    doctor_id,
    date,
    time,
    disease,
    temperature,
    weight,
    bp,
    glucose,
    info
  )
VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
  )`;

const getLastReportIdQuery = `SELECT id
from reports
ORDER BY id DESC
LIMIT 1;`;

const getPatientReportQuery = `SELECT s.name as doctor_name,
reports.*
FROM reports
JOIN staff s ON reports.doctor_id = s.id
WHERE reports.patient_id = $1
ORDER BY reports.date DESC, reports.time DESC;`;

const getDoctorReportQuery = `SELECT p.name,
reports.*
FROM reports
JOIN patients p ON reports.patient_id = p.studentid
WHERE reports.doctor_id = $1
ORDER BY reports.date DESC, reports.time DESC;`;

const getAllReportsQuery = `SELECT p.name as patient_name, s.name as doctor_name,
reports.*
FROM reports
JOIN patients p ON reports.patient_id = p.studentid
JOIN staff s ON reports.doctor_id = s.id;`;

const updateReportQuery = `UPDATE reports
SET disease = $2,
    temperature = $3,
    weight = $4,
    bp = $5,
    glucose = $6,
    info = $7,
    medicines = $8,
    treatment_plan = $9,
    follow_up_date = $10,
    recommendations = $11
WHERE id = $1
RETURNING *;`;

const updateReportByDoctorQuery = `UPDATE reports
SET disease = $2,
    temperature = $3,
    weight = $4,
    bp = $5,
    glucose = $6,
    info = $7,
    medicines = $8,
    treatment_plan = $9,
    follow_up_date = $10,
    recommendations = $11
WHERE id = $1 AND doctor_id = $12
RETURNING *;`;

module.exports = {
  getLastReportIdQuery,
  countReportQuery,
  createReportQuery,
  getDoctorReportQuery,
  getPatientReportQuery,
  getAllReportsQuery,
  createReportTableQuery,
  updateReportQuery,
  updateReportByDoctorQuery,
};
