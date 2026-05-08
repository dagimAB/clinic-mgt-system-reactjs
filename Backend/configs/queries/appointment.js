const createAppointmentQueryTable = `CREATE TABLE IF NOT EXISTS appointments (
  id SERIAL PRIMARY KEY, -- Reverted to SERIAL for record table
  patientid VARCHAR(50) NOT NULL,
  date DATE NOT NULL,
  time TIME NOT NULL,
  problem TEXT,
  doctorid VARCHAR(50) NOT NULL,
  FOREIGN KEY (patientid) REFERENCES patients(studentid),
  FOREIGN KEY (doctorid) REFERENCES staff(id)
);`;

const countAppoinmentQuery = `SELECT COUNT(*) FROM appointments; `;

const createAppointmentQuery = `
INSERT INTO appointments (patientid, date, time, problem, doctorid)
VALUES (
    $1,
    $2,
    $3,
    $4,
    $5
  );`;

const getAppointmentFromPatientQuery = `
  SELECT a.*, s.name as doctor_name 
  FROM appointments a
  JOIN staff s ON a.doctorid = s.id
  WHERE a.patientid = $1;
`;

const getAppointmentFromDoctorQuery = `
  SELECT a.*, p.name as patient_name 
  FROM appointments a
  JOIN patients p ON a.patientid = p.studentid
  WHERE a.doctorid = $1;
`;

const findByIDQuery = `SELECT * FROM appointments WHERE id = $1;`;

const getAllAppointmentsQuery = `
  SELECT a.*, p.name as patient_name, s.name as doctor_name 
  FROM appointments a
  LEFT JOIN patients p ON a.patientid = p.studentid
  LEFT JOIN staff s ON a.doctorid = s.id;
`;

const deleteAppointmentQuery = `DELETE FROM appointments WHERE id = $1;`;

module.exports = {
  deleteAppointmentQuery,
  countAppoinmentQuery,
  createAppointmentQuery,
  getAppointmentFromPatientQuery,
  getAppointmentFromDoctorQuery,
  findByIDQuery,
  getAllAppointmentsQuery,
  createAppointmentQueryTable,
};
