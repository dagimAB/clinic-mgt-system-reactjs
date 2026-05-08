const createTableQuery = `CREATE TABLE IF NOT EXISTS patients (
  id VARCHAR(50) PRIMARY KEY,

  studentID VARCHAR(50) UNIQUE,
  name VARCHAR(255) NOT NULL,
  department VARCHAR(255),
  year INT,
  phoneNum BIGINT NOT NULL,
  emergencyContact VARCHAR(255),
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  age INT,
  gender CHAR(1),
  bloodGroup VARCHAR(3),
  allergies TEXT,
  DOB DATE,
  address VARCHAR(255),
  docID VARCHAR(50),
  FOREIGN KEY (docID) REFERENCES doctors(id)
);`;

const findCredQuery = `SELECT id,password,email FROM patients WHERE id = $1;`;

const getCredsWithEmailQuery = `SELECT id,password FROM patients WHERE email = $1;`;

const addQuery = `INSERT INTO patients (
    id,
    studentID,
    name,
    department,
    year,
    phoneNum,
    emergencyContact,
    email,
    password,
    age,
    gender,
    bloodGroup,
    allergies,
    DOB,
    address
  )
VALUES (
    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
  );
  `;

const findByStudentIDQuery = `SELECT * FROM patients WHERE LOWER(TRIM(studentID)) = LOWER(TRIM($1));`;

const updatePhoneQuery = `UPDATE patients SET phoneNum = $1 WHERE studentID = $2;`;

const findIfExistsQuery = `SELECT email FROM patients WHERE email = $1;`;

const getAllQuery = `SELECT * FROM patients;`;

const countPatientQuery = `SELECT COUNT(*) FROM patients;`;

const updatePassQuery = ` UPDATE patients SET password = $1 WHERE id = $2;`;
const findByStudentIdQuery = `SELECT * FROM patients WHERE studentID = $1;`;

module.exports = {
  findIfExistsQuery,
  createTableQuery,
  findCredQuery,
  getAllQuery,
  addQuery,
  getCredsWithEmailQuery,
  countPatientQuery,
  updatePassQuery,
  findByStudentIDQuery,
  updatePhoneQuery,
  findByStudentIdQuery,
};
