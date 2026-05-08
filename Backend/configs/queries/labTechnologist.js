const createCredTable = `CREATE TABLE IF NOT EXISTS laboratory_technologists (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phoneNum BIGINT NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL DEFAULT 'Lab@123',
  age INTEGER NOT NULL,
  gender CHAR(1) NOT NULL,
  DOB DATE,
  address VARCHAR(255) NOT NULL
);`;

const countLabTechQuery = `SELECT COUNT(*) FROM laboratory_technologists;`;

const findCredQuery = `SELECT * FROM laboratory_technologists WHERE id = $1;`;

const getCredsWithEmailQuery = `SELECT id,password FROM laboratory_technologists WHERE email = $1;`;

const addQuery = `INSERT INTO laboratory_technologists (
    id, name, phoneNum, email, age, gender, DOB, address)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8);`;

const findIfExistsQuery = `SELECT email FROM laboratory_technologists WHERE email = $1;`;

const updatePassQuery = ` UPDATE laboratory_technologists SET password = $1 WHERE id = $2;`;

const getAllQuery = `SELECT * FROM laboratory_technologists;`;

const findLabTechByIdQuery = `SELECT * FROM laboratory_technologists WHERE id = $1;`;

const updateLabTechByIdQuery = `
    UPDATE laboratory_technologists 
    SET name = $2, phoneNum = $3, email = $4, age = $5, gender = $6, DOB = $7, address = $8
    WHERE id = $1
    RETURNING *;
`;

module.exports = {
    createCredTable,
    findIfExistsQuery,
    findCredQuery,
    findLabTechByIdQuery,
    updateLabTechByIdQuery,
    addQuery,
    getCredsWithEmailQuery,
    countLabTechQuery,
    updatePassQuery,
    getAllQuery,
};
