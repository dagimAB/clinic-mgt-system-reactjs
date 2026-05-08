const createPatientsTable = `
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    studentid VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    year INTEGER NOT NULL,
    phonenum BIGINT NOT NULL,
    emergencycontact VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    age INTEGER NOT NULL,
    gender CHAR(1) NOT NULL,
    bloodgroup VARCHAR(3) NOT NULL,
    allergies TEXT,
    dob DATE NOT NULL,
    address VARCHAR(255) NOT NULL,
    docid INTEGER REFERENCES doctors(id)
);
`;

const addPatientQuery = `
    INSERT INTO patients (studentid, name, department, year, phonenum, emergencycontact, email, password, age, gender, bloodgroup, allergies, dob, address, docid)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
    RETURNING *;
`;

const updatePatientQuery = `
    UPDATE patients 
    SET studentid = $2, name = $3, department = $4, year = $5, phonenum = $6, emergencycontact = $7, age = $8, gender = $9, bloodgroup = $10, allergies = $11, dob = $12, address = $13, docid = $14
    WHERE email = $1
    RETURNING *;
`;

const findPatientByEmailQuery = `SELECT * FROM patients WHERE email = $1;`;

const findPatientByIdQuery = `SELECT * FROM patients WHERE studentid = $1;`;

const getAllPatientsQuery = `SELECT * FROM patients;`;

module.exports = {
  createPatientsTable,
  addPatientQuery,
  findPatientByEmailQuery,
  findPatientByIdQuery,
  getAllPatientsQuery,
  updatePatientQuery,
};
