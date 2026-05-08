const dbhelper = require("../configs/dbhelper");
const {
    createLabTestRequestTable,
    createLabRecordTable,
    addRequestQuery,
    getPendingRequestsQuery,
    getRequestByIdQuery,
    updateRequestStatusQuery,
    addLabRecordQuery,
    getRecordsByPatientQuery,
    getRecordByIdQuery,
    lockRecordQuery,
    reviewRecordQuery,
    getRecordsByDoctorQuery
} = require("../configs/queries/lab");

const createTables = async () => {
    await dbhelper.query(createLabTestRequestTable);
    await dbhelper.query(createLabRecordTable);
    console.log("Lab tables initialized");
};

const createRequest = (patientId, doctorId, testType, priority, notes) => {
    return dbhelper.query(addRequestQuery, [patientId, doctorId, testType, priority, notes]);
};

const getPendingRequests = () => {
    return dbhelper.query(getPendingRequestsQuery);
};

const getRequestById = (id) => {
    return dbhelper.query(getRequestByIdQuery, [id]);
};

const updateRequestStatus = (status, id) => {
    return dbhelper.query(updateRequestStatusQuery, [status, id]);
};

const submitLabRecord = async (requestId, technologistId, resultValue, criticalFlag) => {
    // First, verify if the request is still pending
    const request = await dbhelper.query(getRequestByIdQuery, [requestId]);
    if (!request || request.length === 0 || request[0].status !== 'Pending') {
        throw new Error("Invalid or already processed request");
    }

    // Add record
    const result = await dbhelper.query(addLabRecordQuery, [requestId, technologistId, resultValue, criticalFlag]);

    // Update request status to Completed
    await dbhelper.query(updateRequestStatusQuery, ['Completed', requestId]);

    return result;
};

const getPatientLabHistory = (studentId) => {
      //get the patient id from from patient table using studentId
    // patient id is not same as studentId
    return dbhelper
      .query("SELECT id FROM patients WHERE studentid = $1", [studentId])
      .then(async (result) => {
        if (result.length === 0) {
          return [];
        }
        const patId = result[0].id;
        //get lab_test_requests records using patient id then fetch lab records using request id
        // first get the requests
        const requests = await dbhelper.query(
          "SELECT * FROM lab_test_requests WHERE patient_id = $1",
          [patId]
        );
        const labRecords = [];
        for (const req of requests) {
          const records = await dbhelper.query(
            "SELECT * FROM lab_records WHERE request_id = $1",
            [req.id]
          );
          for (const record of records) {
            labRecords.push({
              ...record,
              testType: req.test_type,
              requestDate: req.request_date,
              priority: req.priority,
              status: req.status,
            });
          }
        }
        return labRecords;
       

      });
    


};

const getRecordById = (id) => {
    return dbhelper.query(getRecordByIdQuery, [id]);
};

const reviewRecord = (id) => {
    return dbhelper.query(reviewRecordQuery, [id]);
};

const getDoctorLabHistory = (doctorId) => {
    return dbhelper.query(getRecordsByDoctorQuery, [doctorId]);
};

module.exports = {
    createTables,
    createRequest,
    getPendingRequests,
    getRequestById,
    updateRequestStatus,
    submitLabRecord,
    getPatientLabHistory,
    getRecordById,
    reviewRecord,
    getDoctorLabHistory
};
