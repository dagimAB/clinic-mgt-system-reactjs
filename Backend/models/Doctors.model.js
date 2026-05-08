const dbhelper = require('../configs/dbhelper');
const { createDoctorsTable, addDoctorQuery, findDoctorByEmailQuery, getAllDoctorsQuery, updateDoctorQuery } = require('../configs/queries/doctors');

const DoctorsModel = {
  init: async () => {
    try {
      await dbhelper.query(createDoctorsTable);
      console.log('Doctors table initialized');
    } catch (err) {
      console.error('Error initializing Doctors table:', err.message);
    }
  },

  addDoctor: async (doctor) => {
    const values = [
      doctor.name,
      doctor.phonenum,
      doctor.email,
      doctor.password || 'Doctor@123',
      doctor.age,
      doctor.gender,
      doctor.bloodgroup,
      doctor.dob,
      doctor.address,
      doctor.education,
      doctor.department,
      doctor.fees
    ];
    const result = await dbhelper.query(addDoctorQuery, values);
    return result[0];
  },

  findByEmail: async (email) => {
    const result = await dbhelper.query(findDoctorByEmailQuery, [email]);
    return result[0];
  },

  getAll: async () => {
    return await dbhelper.query(getAllDoctorsQuery);
  },

  updateDoctor: async (email, doctor) => {
    const values = [
      email,
      doctor.name,
      doctor.phonenum,
      doctor.age,
      doctor.gender,
      doctor.bloodgroup,
      doctor.dob,
      doctor.address,
      doctor.education,
      doctor.department,
      doctor.fees
    ];
    const result = await dbhelper.query(updateDoctorQuery, values);
    return result[0];
  }
};

module.exports = DoctorsModel;
