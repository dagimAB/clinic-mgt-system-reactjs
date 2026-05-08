const dbhelper = require('../configs/dbhelper');
const { createNursesTable, addNurseQuery, updateNurseQuery, findNurseByEmailQuery, getAllNursesQuery, findNurseByIdQuery, updateNurseByIdQuery } = require('../configs/queries/nurses');

const NursesModel = {
  init: async () => {
    try {
      await dbhelper.query(createNursesTable);
      console.log('Nurses table initialized');
    } catch (err) {
      console.error('Error initializing Nurses table:', err.message);
    }
  },

  addNurse: async (nurse) => {
    const values = [
      nurse.id,
      nurse.name,
      nurse.phonenum,
      nurse.email,
      nurse.password || 'Nurse@123',
      nurse.age,
      nurse.gender,
      nurse.address,
      nurse.qualification
    ];
    const result = await dbhelper.query(addNurseQuery, values);
    return result[0];
  },

  updateNurse: async (email, nurse) => {
    const values = [
      email,
      nurse.name,
      nurse.phonenum,
      nurse.age,
      nurse.gender,
      nurse.address,
      nurse.qualification
    ];
    const result = await dbhelper.query(updateNurseQuery, values);
    return result[0];
  },

  findByEmail: async (email) => {
    const result = await dbhelper.query(findNurseByEmailQuery, [email]);
    return result[0];
  },

  findById: async (id) => {
    const result = await dbhelper.query(findNurseByIdQuery, [id]);
    return result;
  },

  updateNurseById: async (id, nurse) => {
    const values = [
      id,
      nurse.name,
      nurse.phonenum,
      nurse.email,
      nurse.age,
      nurse.gender,
      nurse.address,
      nurse.qualification
    ];
    const result = await dbhelper.query(updateNurseByIdQuery, values);
    return result[0];
  },

  getAll: async () => {
    return await dbhelper.query(getAllNursesQuery);
  }
};

// Compatibility wrappers for old Nurse.model.js API
const createTables = async () => {
  return await NursesModel.init();
};

const findCred = async (id) => {
  // This function needs to find nurse by ID and return credentials
  // Since we don't have a findById query, we'll need to add it
  const query = 'SELECT * FROM nurses WHERE id = $1';
  const result = await dbhelper.query(query, [id]);
  return result;
};

const addNurse = async (nurse) => {
  return await NursesModel.addNurse(nurse);
};

const findIfExists = async (email) => {
  const result = await NursesModel.findByEmail(email);
  return result ? [result] : [];
};

const getNurseCredsFromEmail = async (email) => {
  const result = await NursesModel.findByEmail(email);
  return result ? [result] : [];
};

const getAllNurses = async () => {
  return await NursesModel.getAll();
};

const updatePass = async (password, id) => {
  const query = 'UPDATE nurses SET password = $1 WHERE id = $2';
  return await dbhelper.query(query, [password, id]);
};

module.exports = {
  ...NursesModel,
  createTables,
  findCred,
  addNurse,
  findIfExists,
  getNurseCredsFromEmail,
  getAllNurses,
  updatePass,
  findById: NursesModel.findById,
  updateNurseById: NursesModel.updateNurseById
};
