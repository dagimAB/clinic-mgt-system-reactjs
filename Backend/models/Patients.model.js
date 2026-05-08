const dbhelper = require('../configs/dbhelper');
const { createPatientsTable, addPatientQuery, findPatientByEmailQuery, findPatientByIdQuery, getAllPatientsQuery, updatePatientQuery } = require('../configs/queries/patients');

const PatientsModel = {
  init: async () => {
    try {
      await dbhelper.query(createPatientsTable);
      console.log('Patients table initialized');
    } catch (err) {
      console.error('Error initializing Patients table:', err.message);
    }
  },

  addPatient: async (patient) => {
    const values = [
      patient.studentid,
      patient.name,
      patient.department,
      patient.year,
      patient.phonenum,
      patient.emergencycontact,
      patient.email,
      patient.password,
      patient.age,
      patient.gender,
      patient.bloodgroup,
      patient.allergies || null,
      patient.dob,
      patient.address,
      patient.docid || null
    ];
    const result = await dbhelper.query(addPatientQuery, values);
    return result[0];
  },

  findByEmail: async (email) => {
    const result = await dbhelper.query(findPatientByEmailQuery, [email]);
    return result[0];
  },

  findById: async (id) => {
    const result = await dbhelper.query(findPatientByIdQuery, [id]);
    return result[0];
  },

  getAll: async () => {
    return await dbhelper.query(getAllPatientsQuery);
  },

  updatePatient: async (email, patient) => {
    const values = [
      email,
      patient.studentid,
      patient.name,
      patient.department,
      patient.year,
      patient.phonenum,
      patient.emergencycontact,
      patient.age,
      patient.gender,
      patient.bloodgroup,
      patient.allergies || null,
      patient.dob,
      patient.address,
      patient.docid || null
    ];
    const result = await dbhelper.query(updatePatientQuery, values);
    return result[0];
  }
};

module.exports = PatientsModel;
