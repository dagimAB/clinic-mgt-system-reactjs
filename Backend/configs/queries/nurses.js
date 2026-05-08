const createNursesTable = `
CREATE TABLE IF NOT EXISTS nurses (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    phonenum BIGINT NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL DEFAULT 'Nurse@123',
    age INTEGER NOT NULL,
    gender CHAR(1) NOT NULL,
    address VARCHAR(255) NOT NULL,
    qualification VARCHAR(255) NOT NULL
);
`;

const addNurseQuery = `
    INSERT INTO nurses (id, name, phonenum, email, password, age, gender, address, qualification)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
`;

const updateNurseQuery = `
    UPDATE nurses 
    SET name = $2, phonenum = $3, age = $4, gender = $5, address = $6, qualification = $7
    WHERE email = $1
    RETURNING *;
`;

const findNurseByEmailQuery = `SELECT * FROM nurses WHERE email = $1;`;

const findNurseByIdQuery = `SELECT * FROM nurses WHERE id = $1;`;

const updateNurseByIdQuery = `
    UPDATE nurses 
    SET name = $2, phonenum = $3, email = $4, age = $5, gender = $6, address = $7, qualification = $8
    WHERE id = $1
    RETURNING *;
`;

const getAllNursesQuery = `SELECT * FROM nurses;`;

module.exports = {
  createNursesTable,
  addNurseQuery,
  updateNurseQuery,
  findNurseByEmailQuery,
  findNurseByIdQuery,
  updateNurseByIdQuery,
  getAllNursesQuery,
};
