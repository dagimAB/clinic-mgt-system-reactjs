const createDoctorsTable = `
CREATE TABLE IF NOT EXISTS doctors (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phonenum BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL DEFAULT 'Doctor@123',
    age INTEGER NOT NULL,
    gender CHAR(1) NOT NULL,
    bloodgroup VARCHAR(3) NOT NULL,
    dob DATE NOT NULL,
    address VARCHAR(255) NOT NULL,
    education VARCHAR(255) NOT NULL,
    department VARCHAR(255) NOT NULL,
    availability TIME[] NOT NULL DEFAULT ARRAY['10:00:00'::time, '10:15:00'::time, '11:00:00'::time, '11:15:00'::time, '11:30:00'::time, '11:45:00'::time, '14:30:00'::time, '14:45:00'::time, '15:00:00'::time, '15:15:00'::time, '16:00:00'::time],
    fees INTEGER NOT NULL
);
`;

const addDoctorQuery = `
    INSERT INTO doctors (name, phonenum, email, password, age, gender, bloodgroup, dob, address, education, department, fees)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
    RETURNING *;
`;

const updateDoctorQuery = `
    UPDATE doctors 
    SET name = $2, phonenum = $3, age = $4, gender = $5, bloodgroup = $6, dob = $7, address = $8, education = $9, department = $10, fees = $11
    WHERE email = $1
    RETURNING *;
`;

const findDoctorByIdQuery = `SELECT * FROM doctors WHERE id = $1;`;

const updateDoctorByIdQuery = `
    UPDATE doctors
    SET name = $2,
        phonenum = $3,
        age = $4,
        gender = $5,
        bloodgroup = $6,
        dob = $7,
        address = $8,
        education = $9,
        department = $10,
        fees = $11
    WHERE id = $1
    RETURNING *;
`;

const updateDoctorPasswordQuery = `
    UPDATE doctors
    SET password = $2
    WHERE id = $1
    RETURNING *;
`;

const updateDoctorAvailabilityQuery = `
    UPDATE doctors
    SET availability = $2
    WHERE id = $1
    RETURNING *;
`;

const findDoctorByEmailQuery = `SELECT * FROM doctors WHERE email = $1;`;

const getAllDoctorsQuery = `SELECT * FROM doctors;`;

module.exports = {
  createDoctorsTable,
  addDoctorQuery,
  findDoctorByEmailQuery,
  getAllDoctorsQuery,
  updateDoctorQuery,
  findDoctorByIdQuery,
  updateDoctorByIdQuery,
  updateDoctorPasswordQuery,
  updateDoctorAvailabilityQuery,
};
