const createLabTestRequestTable = `CREATE TABLE IF NOT EXISTS lab_test_requests (
  id SERIAL PRIMARY KEY,
  patient_id VARCHAR(50) NOT NULL,
  doctor_id VARCHAR(50) NOT NULL,
  test_type VARCHAR(255) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending',
  priority VARCHAR(50) DEFAULT 'Normal',
  notes TEXT,
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (patient_id) REFERENCES patients(id),
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);`;

const createLabRecordTable = `CREATE TABLE IF NOT EXISTS lab_records (
  id SERIAL PRIMARY KEY,
  request_id INTEGER NOT NULL,
  technologist_id VARCHAR(50) NOT NULL,
  result_value TEXT NOT NULL,
  critical_flag BOOLEAN DEFAULT FALSE,
  submission_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  is_locked BOOLEAN DEFAULT TRUE,
  reviewed_by_doctor BOOLEAN DEFAULT FALSE,
  FOREIGN KEY (request_id) REFERENCES lab_test_requests(id),
  FOREIGN KEY (technologist_id) REFERENCES laboratory_technologists(id)
);`;

const addRequestQuery = `INSERT INTO lab_test_requests (patient_id, doctor_id, test_type, priority, notes)
VALUES ($1, $2, $3, $4, $5) RETURNING id;`;

const getPendingRequestsQuery = `SELECT lr.*, p.name as patient_name, p.studentid, d.name as doctor_name 
FROM lab_test_requests lr
JOIN patients p ON lr.patient_id = p.id
JOIN doctors d ON lr.doctor_id = d.id
WHERE lr.status = 'Pending';`;

const getRequestByIdQuery = `SELECT * FROM lab_test_requests WHERE id = $1;`;

const updateRequestStatusQuery = `UPDATE lab_test_requests SET status = $1 WHERE id = $2;`;

const addLabRecordQuery = `INSERT INTO lab_records (request_id, technologist_id, result_value, critical_flag)
VALUES ($1, $2, $3, $4) RETURNING id;`;

const getRecordsByPatientQuery = `SELECT lrec.*, lreq.test_type, lreq.request_date, lreq.notes, lt.name as technologist_name, p.studentid
FROM lab_records lrec
JOIN lab_test_requests lreq ON lrec.request_id = lreq.id
JOIN laboratory_technologists lt ON lrec.technologist_id = lt.id
JOIN patients p ON lreq.patient_id = p.id
WHERE p.id = $1;`;

const getRecordByIdQuery = `SELECT * FROM lab_records WHERE id = $1;`;

const lockRecordQuery = `UPDATE lab_records SET is_locked = TRUE WHERE id = $1;`;

const reviewRecordQuery = `UPDATE lab_records SET reviewed_by_doctor = TRUE WHERE id = $1;`;

const getRecordsByDoctorQuery = `
SELECT 
    lreq.id as request_id,
    lreq.test_type,
    lreq.status as request_status,
    lreq.priority,
    lreq.notes,
    lreq.request_date,
    p.name as patient_name,
    p.studentid as patient_student_id,
    lrec.id as record_id,
    lrec.result_value,
    lrec.critical_flag,
    lrec.submission_date,
    lrec.reviewed_by_doctor,
    lt.name as technologist_name
FROM lab_test_requests lreq
JOIN patients p ON lreq.patient_id = p.id
LEFT JOIN lab_records lrec ON lreq.id = lrec.request_id
LEFT JOIN laboratory_technologists lt ON lrec.technologist_id = lt.id
WHERE lreq.doctor_id = $1
ORDER BY lreq.request_date DESC;
`;

module.exports = {
  createLabTestRequestTable,
  createLabRecordTable,
  addRequestQuery,
  getPendingRequestsQuery,
  getRequestByIdQuery,
  updateRequestStatusQuery,
  addLabRecordQuery,
  getRecordsByPatientQuery,
  getRecordByIdQuery,
  lockRecordQuery,
  reviewRecordQuery,
  getRecordsByDoctorQuery
};
