const createCertificatesTableQuery = `
  CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    doctor_id VARCHAR(50) NOT NULL,
    type VARCHAR(100) NOT NULL,
    issue_date DATE NOT NULL,
    content TEXT,
    medical_justification TEXT,
    duration_days INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`;

const createCertificateQuery = `
  INSERT INTO certificates (student_id, doctor_id, type, issue_date, content, medical_justification, duration_days)
  VALUES ($1, $2, $3, $4, $5, $6, $7)
  RETURNING *;
`;

const getCertificatesForNurseQuery = `
  SELECT c.*, p.name as patient_name, p.studentid as student_display_id, d.name as doctor_name, p.department, p.year
  FROM certificates c
  JOIN patients p ON c.student_id = p.id
  JOIN doctors d ON c.doctor_id = d.id
  ORDER BY c.issue_date DESC, c.id DESC;
`;

const getCertificatesForStudentQuery = `
  SELECT c.*, d.name as doctor_name
  FROM certificates c
  JOIN doctors d ON c.doctor_id = d.id
  WHERE c.student_id = $1
  ORDER BY c.issue_date DESC;
`;

const getCertificatesForDoctorQuery = `
  SELECT c.*, p.name as student_name
  FROM certificates c
  JOIN patients p ON c.student_id = p.id
  WHERE c.doctor_id = $1
  ORDER BY c.issue_date DESC;
`;

module.exports = {
  createCertificatesTableQuery,
  createCertificateQuery,
  getCertificatesForNurseQuery,
  getCertificatesForStudentQuery,
  getCertificatesForDoctorQuery,
};
