const createTableQuery = `CREATE TABLE IF NOT EXISTS queue (
  id SERIAL PRIMARY KEY,
  student_id VARCHAR(50) NOT NULL,
  patient_id VARCHAR(50), -- if they are already in the patients table
  chief_complaint TEXT,
  priority VARCHAR(20) DEFAULT 'Normal', -- Normal, Urgent, Emergency
  doctor_id VARCHAR(50),
  status VARCHAR(20) DEFAULT 'Checked-In', -- Checked-In, In-Consultation, Completed
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (student_id) REFERENCES patients(id), -- Assuming student_id maps to patients.id for now
  FOREIGN KEY (doctor_id) REFERENCES doctors(id)
);`;

const addToQueueQuery = `INSERT INTO queue (student_id, chief_complaint, priority, doctor_id, status) VALUES ($1, $2, $3, $4, $5) RETURNING *;`;

const assignDoctorQuery = `UPDATE queue SET doctor_id = $1, status = 'Assigned' WHERE id = $2 RETURNING *;`;

const getActiveQueueQuery = `SELECT q.*, 
                             p.studentid, 
                             p.name as patient_name, 
                             p.department as patient_dept, 
                             p.year as patient_year, 
                             d.name as doctor_name
                             FROM queue q 
                             JOIN patients p ON q.student_id = p.id 
                             LEFT JOIN doctors d ON q.doctor_id = d.id
                             WHERE q.status != 'Completed'
                             ORDER BY 
                                CASE 
                                  WHEN q.priority = 'Emergency' THEN 1
                                  WHEN q.priority = 'Urgent' THEN 2
                                  ELSE 3
                                END, 
                                q.created_at ASC;`;

const getDoctorQueueQuery = `SELECT q.*, 
                              p.name as patient_name, 
                              p.studentid, 
                              p.department as patient_dept, 
                              p.year as patient_year
                              FROM queue q 
                              JOIN patients p ON q.student_id = p.id 
                              WHERE q.doctor_id = $1 AND q.status != 'Completed'
                              ORDER BY created_at ASC;`;

const completeQueueItemQuery = `UPDATE queue SET status = 'Completed' WHERE id = $1;`;
const deleteQueueItemQuery = `DELETE FROM queue WHERE id = $1;`;
const updateQueueItemQuery = `UPDATE queue SET chief_complaint = $1, priority = $2 WHERE id = $3 RETURNING *;`;
const checkActiveInQueueQuery = `SELECT * FROM queue WHERE student_id = $1 AND status != 'Completed';`;

module.exports = {
  createTableQuery,
  addToQueueQuery,
  assignDoctorQuery,
  getActiveQueueQuery,
  getDoctorQueueQuery,
  completeQueueItemQuery,
  deleteQueueItemQuery,
  updateQueueItemQuery,
  checkActiveInQueueQuery,
};
