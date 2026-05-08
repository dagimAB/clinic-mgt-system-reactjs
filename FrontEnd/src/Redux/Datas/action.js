import * as types from "./types";
import axios from "axios";

const baseURL = process.env.REACT_APP_BASE_URL;
if (!baseURL) throw new Error("REACT_APP_BASE_URL is not defined in .env");

// CreateReport
export const CreateReport = (data) => async (dispatch) => {
  try {
    dispatch({ type: types.CREATE_REPORT_REQUEST });
    const res = await axios.post(
      `${baseURL}/reports`,
      data,
      {
        headers: { Authorization: localStorage.getItem("token") },
      },
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.log(error);
    dispatch({
      type: types.CREATE_REPORT_ERROR,
      payload: {
        message: error,
      },
    });
    return { message: error.response?.data?.message || error.message };
  }
};

// Update Report
export const updateReport = (reportId, data) => async (dispatch) => {
  try {
    const res = await axios.patch(
      `${baseURL}/reports/${reportId}`,
      data,
      {
        headers: { Authorization: localStorage.getItem("token") },
      },
    );
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

// GET DOCTOR DETAILS
export const GetDoctorDetails = () => async (dispatch) => {
  try {
    dispatch({ type: types.GET_DOCTOR_REQUEST });
    dispatch({ type: types.GET_DOCTOR_REQUEST });
    const res = await axios.get(`${baseURL}/doctors`, {
      headers: { Authorization: localStorage.getItem("token") },
    });
    console.log("this", res);
    const doctors = { doctors: res.data };
    dispatch({
      type: types.GET_DOCTOR_SUCCESS,
      payload: doctors,
    });
  } catch (error) {
    dispatch({
      type: types.GET_DOCTOR_ERROR,
      payload: {
        message: error,
      },
    });
  }
};

export const GetAdminDetails = () => async (dispatch) => {
  try {
    dispatch({ type: types.GET_ADMIN_REQUEST });
    const res = await axios.get(`${baseURL}/admin/staff`, {
      headers: { Authorization: localStorage.getItem("token") },
    });
    console.log(res.data);
    const admins = { admins: res.data };
    dispatch({
      type: types.GET_ADMIN_SUCCESS,
      payload: admins,
    });
  } catch (error) {
    dispatch({
      type: types.GET_ADMIN_ERROR,
      payload: {
        message: error,
      },
    });
  }
};

export const GetMedicineDetails = (patientid) => async (dispatch) => {
  try {
    dispatch({ type: types.GET_MEDICINE_REQUEST });
    const res = await axios.post(
      `${baseURL}/prescriptions/${patientid}`,
    );
    //axios.post
    console.log(res.data);
    const medicines = { medicines: res.data };
    dispatch({
      type: types.GET_MEDICINE_SUCCESS,
      payload: medicines,
    });
  } catch (error) {
    console.log(error);
  }
};

//CREATE BOOKING
export const CreateBooking = (data) => async (dispatch) => {
  try {
    dispatch({ type: types.CREATE_BOOKING_REQUEST });
    const res = await axios.post(
      `${baseURL}/appointments/create`,
      data,
    );
    console.log(res);
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

// GET ALL PATIENT
export const GetPatients = () => async (dispatch) => {
  try {
    dispatch({ type: types.GET_PATIENT_REQUEST });
    const res = await axios.get(`${baseURL}/patients`);
    console.log("pats", res);
    const patients = { patients: res.data };
    dispatch({
      type: types.GET_PATIENT_SUCCESS,
      payload: patients,
    });
  } catch (error) {
    dispatch({
      type: types.GET_PATIENT_ERROR,
      payload: {
        message: error,
      },
    });
  }
};

// GET ALL DATA
export const GetAllData = () => async (dispatch) => {
  try {
    dispatch({ type: types.GET_ALLDATA_REQUEST });
    const res = await axios.get(
      `${baseURL}/admin/dashboard`,
      {
        headers: { Authorization: localStorage.getItem("token") },
      },
    );
    console.log(res.data);
    dispatch({
      type: types.GET_ALLDATA_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    console.log(error);
  }
};

// GET ALL APPOINTMENT DETAILS
export const GetAppointments = (userType, id) => async (dispatch) => {
  if (!userType || !id) return;
  try {
    dispatch({ type: types.GET_APPOINTMENT_DETAILS_REQUEST });
    const res = await axios.get(
      `${baseURL}/appointments/${userType}/${id}`,
    );
    console.log("res", res.data);
    // return res.data;
    const appointments = { appointments: res.data.data };
    dispatch({
      type: types.GET_APPOINTMENT_DETAILS_SUCCESS,
      payload: appointments,
    });
  } catch (error) {
    console.log(error);
  }
};

// DELETE APPOINTMENTS
export const DeleteAppointment = (id) => async (dispatch) => {
  try {
    dispatch({ type: types.DELETE_APPOINTMENT_REQUEST });
    const res = await axios.delete(
      `${baseURL}/appointments/${id}`,
    );
    console.log(res.data);
    // return res.data;
    dispatch({
      type: types.DELETE_APPOINTMENT_SUCCESS,
      payload: id,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const GetAllReports = (userType, id) => async (dispatch) => {
  if (!userType || !id) return;
  try {
    dispatch({ type: types.GET_REPORTS_REQUEST });
    const res = await axios.get(
      `${baseURL}/reports/${userType}/${id}`,
      { headers: { Authorization: localStorage.getItem("token") } },
    );
    console.log("res", res.data);
    const reports = { reports: res.data.data };
    dispatch({
      type: types.GET_REPORTS_SUCCESS,
      payload: reports,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const CreateCertificate = (data) => async (dispatch) => {
  try {
    dispatch({ type: types.GET_CERTIFICATES_REQUEST }); // Reusing request type for simplicity or define CREATE_CERTIFICATE_REQUEST
    const res = await axios.post(
      `${baseURL}/certificates/create`,
      data,
      { headers: { Authorization: localStorage.getItem("token") } },
    );
    console.log(res);
    dispatch({
      type: types.CREATE_CERTIFICATE_SUCCESS,
      payload: res.data.data,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const GetAllCertificates = (userType, id) => async (dispatch) => {
  try {
    dispatch({ type: types.GET_CERTIFICATES_REQUEST });
    const res = await axios.get(
      `${baseURL}/certificates/${userType}/${id}`,
    );
    console.log("res", res.data);
    const certificates = { certificates: res.data.data };
    dispatch({
      type: types.GET_CERTIFICATES_SUCCESS,
      payload: certificates,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

// --- Laboratory Actions ---

export const getPendingRequests = (token) => async (dispatch) => {
  try {
    dispatch({ type: types.GET_PENDING_REQUESTS_REQUEST });
    const res = await axios.get(`${baseURL}/lab/requests/pending`, {
      headers: { Authorization: token },
    });
    dispatch({
      type: types.GET_PENDING_REQUESTS_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({ type: types.GET_PENDING_REQUESTS_ERROR });
  }
};

export const submitLabRecord = (data, token) => async (dispatch) => {
  try {
    dispatch({ type: types.SUBMIT_LAB_RECORD_REQUEST });
    const res = await axios.post(`${baseURL}/lab/record`, data, {
      headers: { Authorization: token },
    });
    dispatch({
      type: types.SUBMIT_LAB_RECORD_SUCCESS,
      payload: res.data,
    });
    return res.data;
  } catch (error) {
    dispatch({ type: types.SUBMIT_LAB_RECORD_ERROR });
  }
};

export const getLabHistory = (patientId) => async (dispatch) => {
  try {
    dispatch({ type: types.GET_LAB_HISTORY_REQUEST });
    const res = await axios.get(`${baseURL}/lab/history/${patientId}`);
    dispatch({
      type: types.GET_LAB_HISTORY_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({ type: types.GET_LAB_HISTORY_ERROR });
  }
};

export const createLabRequest = (data, token) => async (dispatch) => {
  try {
    const res = await axios.post(`${baseURL}/lab/request`, data, {
      headers: { Authorization: token },
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const reviewLabResult = (id, token) => async (dispatch) => {
  try {
    dispatch({ type: types.REVIEW_LAB_RECORD_REQUEST });
    const res = await axios.patch(
      `${baseURL}/lab/record/${id}/review`,
      {},
      {
        headers: { Authorization: token },
      },
    );
    dispatch({
      type: types.REVIEW_LAB_RECORD_SUCCESS,
      payload: id,
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};

export const getDoctorLabHistory = (doctorId, token) => async (dispatch) => {
  try {
    dispatch({ type: types.GET_DOCTOR_LAB_HISTORY_REQUEST });
    const res = await axios.get(`${baseURL}/lab/history/doctor/${doctorId}`, {
      headers: { Authorization: token },
    });
    dispatch({
      type: types.GET_DOCTOR_LAB_HISTORY_SUCCESS,
      payload: res.data,
    });
    return res.data;
  } catch (error) {
    dispatch({ type: types.GET_DOCTOR_LAB_HISTORY_ERROR });
    console.log(error);
  }
};

// Get all lab technicians
export const GetLabTechs = () => async (dispatch) => {
  try {
    dispatch({ type: types.GET_LAB_TECHS_REQUEST });
    const res = await axios.get(`${baseURL}/labtechs`);
    dispatch({
      type: types.GET_LAB_TECHS_SUCCESS,
      payload: res.data,
    });
    return res.data;
  } catch (error) {
    dispatch({ type: types.GET_LAB_TECHS_ERROR });
    console.log(error);
  }
};

// Get Doctor's Assigned Queue
export const getDoctorQueue = (doctorId, token) => async (dispatch) => {
  try {
    dispatch({ type: types.GET_DOCTOR_QUEUE_REQUEST });
    const res = await axios.get(`${baseURL}/doctors/queue/${doctorId}`, {
      headers: { Authorization: token },
    });
    dispatch({
      type: types.GET_DOCTOR_QUEUE_SUCCESS,
      payload: res.data,
    });
  } catch (error) {
    dispatch({ type: types.GET_DOCTOR_QUEUE_ERROR });
    console.log(error);
  }
};

// Get Full Consultation Data for a Patient
export const getConsultationData = (studentId, token) => async (dispatch) => {
  try {
    dispatch({ type: types.GET_CONSULTATION_DATA_REQUEST });
    const res = await axios.get(
      `${baseURL}/doctors/consultation/${encodeURIComponent(studentId)}`,
      {
        headers: { Authorization: token },
      },
    );
    dispatch({
      type: types.GET_CONSULTATION_DATA_SUCCESS,
      payload: res.data,
    });
    return res.data;
  } catch (error) {
    dispatch({ type: types.GET_CONSULTATION_DATA_ERROR });
    console.log(error);
  }
};

// Mark Consultation as Completed
export const completeConsultation = (queueId, token) => async (dispatch) => {
  try {
    dispatch({ type: types.COMPLETE_CONSULTATION_REQUEST });
    await axios.patch(
      `${baseURL}/doctors/consultation/complete/${queueId}`,
      {},
      {
        headers: { Authorization: token },
      },
    );
    dispatch({ type: types.COMPLETE_CONSULTATION_SUCCESS });
  } catch (error) {
    dispatch({ type: types.COMPLETE_CONSULTATION_ERROR });
    console.log(error);
  }
};
// Email Certificate
export const EmailCertificate = (data, token) => async (dispatch) => {
  try {
    const res = await axios.post(`${baseURL}/certificates/email`, data, {
      headers: { Authorization: token },
    });
    return res.data;
  } catch (error) {
    console.log(error);
  }
};
