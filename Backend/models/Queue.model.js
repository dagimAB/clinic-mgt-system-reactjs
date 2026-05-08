const dbhelper = require("../configs/dbhelper");
const { 
  createTableQuery, 
  addToQueueQuery, 
  assignDoctorQuery, 
  getActiveQueueQuery, 
  getDoctorQueueQuery,
  completeQueueItemQuery,
  deleteQueueItemQuery,
  updateQueueItemQuery,
  checkActiveInQueueQuery
} = require("../configs/queries/queue");

const initialize = async () => {
  try {
    await dbhelper.query(createTableQuery);
    console.log("✅ Queue table initialized successfully.");
  } catch (err) {
    console.error("❌ Failed to initialize Queue table:", err.message);
  }
};

const getPublicQueue = async () => {
  // Use getActiveQueueQuery for public queue display
  return await dbhelper.query(getActiveQueueQuery);
};



const createTable = () => {
  return dbhelper.query(createTableQuery, []).then((result) => {
    return result;
  });
};

const assignDoctor = (doctor_id, id) => {
  return dbhelper.query(assignDoctorQuery, [doctor_id, id]).then((result) => {
    return result;
  });
};

const getActiveQueue = () => {
  return dbhelper.query(getActiveQueueQuery).then((result) => {
    return result;
  });
};

const addToQueue = (student_id, chief_complaint, priority, doctor_id = null) => {
  const status = doctor_id ? 'Assigned' : 'Checked-In';
  return dbhelper.query(addToQueueQuery, [student_id, chief_complaint, priority, doctor_id, status]).then((result) => {
    return result;
  });
};

const getDoctorQueue = (doctor_id) => {
  return dbhelper.query(getDoctorQueueQuery, [doctor_id]).then((result) => {
    return result;
  });
};

const completeQueueItem = (id) => {
  return dbhelper.query(completeQueueItemQuery, [id]).then((result) => {
    return result;
  });
};

const deleteQueueItem = (id) => {
  return dbhelper.query(deleteQueueItemQuery, [id]).then((result) => {
    return result;
  });
};

const updateQueueItem = (id, chief_complaint, priority) => {
  return dbhelper.query(updateQueueItemQuery, [chief_complaint, priority, id]).then((result) => {
    return result;
  });
};

const checkActiveInQueue = (student_id) => {
  return dbhelper.query(checkActiveInQueueQuery, [student_id]).then((result) => {
    return result;
  });
};

module.exports = {
  initialize,
  getPublicQueue,
  addToQueue,
  createTable,
  assignDoctor,
  getActiveQueue,
  getDoctorQueue,
  completeQueueItem,
  deleteQueueItem,
  updateQueueItem,
  checkActiveInQueue,
};
