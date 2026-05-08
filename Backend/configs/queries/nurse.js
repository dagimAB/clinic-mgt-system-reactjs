const createCredTable = `CREATE TABLE IF NOT EXISTS nurses (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phoneNum BIGINT NOT NULL,
  email VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL DEFAULT 'Nurse@123',
  age INTEGER NOT NULL,
  gender CHAR(1) NOT NULL,
  address VARCHAR(255) NOT NULL,
  qualification VARCHAR(255) NOT NULL
);`;

const findCredQuery = `SELECT id, password, email FROM nurses WHERE id = $1;`;

const countNurseQuery = `SELECT COUNT(*) FROM nurses;`;

const addQuery = `INSERT INTO nurses (
  name, phoneNum, email, age, gender, address, qualification)
  VALUES ($1, $2, $3, $4, $5, $6, $7);`;

const updatePassQuery = `UPDATE nurses SET password = $1 WHERE id = $2;`;

const getCredsWithEmailQuery = `SELECT id, password FROM nurses WHERE email = $1;`;

const getAllQuery = `SELECT * FROM nurses;`;

const findIfExistsQuery = `SELECT email FROM nurses WHERE email = $1;`;

module.exports = {
  findIfExistsQuery,
  createCredTable,
  findCredQuery,
  getAllQuery,
  addQuery,
  updatePassQuery,
  getCredsWithEmailQuery,
  countNurseQuery,
};
