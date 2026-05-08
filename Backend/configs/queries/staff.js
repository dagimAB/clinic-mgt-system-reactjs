const createStaffTable = `
CREATE TABLE IF NOT EXISTS staff (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('ADMIN', 'NURSE', 'DOCTOR', 'LAB_TECH')),
    qualification VARCHAR(255),
    phonenum VARCHAR(20),
    dob DATE,
    gender VARCHAR(10),
    age INTEGER,
    address TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`;

const addStaffQuery = `
    INSERT INTO staff (id, name, email, password_hash, role, qualification, phonenum, dob, gender, age, address)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
    RETURNING *;
`;

const findByEmailQuery = `SELECT * FROM staff WHERE email = $1;`;

const findByIdQuery = `SELECT * FROM staff WHERE id = $1;`;

const getAllStaffQuery = `SELECT * FROM staff ORDER BY created_at DESC;`;

const updateStaffQuery = `
    UPDATE staff 
    SET name = $2, email = $3, role = $4, qualification = $5, is_active = $6, phonenum = $7, dob = $8, gender = $9, age = $10, address = $11
    WHERE id = $1
    RETURNING *;
`;

const countStaffByRoleQuery = `SELECT COUNT(*) AS count FROM staff WHERE role = $1;`;

const updatePasswordQuery = `UPDATE staff SET password_hash = $2 WHERE id = $1;`;

module.exports = {
  createStaffTable,
  addStaffQuery,
  findByEmailQuery,
  findByIdQuery,
  getAllStaffQuery,
  updateStaffQuery,
  countStaffByRoleQuery,
  updatePasswordQuery,
};
