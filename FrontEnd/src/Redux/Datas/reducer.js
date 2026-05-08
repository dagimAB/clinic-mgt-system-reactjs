import * as types from "./types";

const initialState = {
  loading: false,
  error: false,
  reports: { reports: [] },
  doctors: { doctors: [] },
  patients: { patients: [] },
  medicines: { medicines: [] },
  dashboard: [],
  appointments: { appointments: [] },
  certificates: { certificates: [] },
  admins: { admins: [] },
  labRequests: [],
  labHistory: [],
  doctor_lab_history: [],
  labTechs: [],
  doctorQueue: [],
  consultationData: null,
};

export default function dataReducer(state = initialState, { type, payload }) {
  switch (type) {
    case types.GET_PATIENT_REQUEST:
    case types.GET_DOCTOR_REQUEST:
    case types.GET_ADMIN_REQUEST:
    case types.GET_APPOINTMENT_DETAILS_REQUEST:
    case types.GET_REPORTS_REQUEST:
    case types.GET_ALLDATA_REQUEST:
    case types.GET_PENDING_REQUESTS_REQUEST:
    case types.GET_LAB_HISTORY_REQUEST:
    case types.GET_DOCTOR_LAB_HISTORY_REQUEST:
    case types.GET_LAB_TECHS_REQUEST:
    case types.GET_DOCTOR_QUEUE_REQUEST:
    case types.GET_CONSULTATION_DATA_REQUEST:
    case types.COMPLETE_CONSULTATION_REQUEST:
      return {
        ...state,
        loading: true,
      };

    case types.GET_PATIENT_SUCCESS:
      return {
        ...state,
        loading: false,
        patients: payload,
      };
    case types.GET_DOCTOR_SUCCESS:
      return {
        ...state,
        loading: false,
        doctors: payload,
      };

    case types.GET_ADMIN_SUCCESS:
      return {
        ...state,
        loading: false,
        admins: payload,
      };

    case types.GET_MEDICINE_SUCCESS:
      return {
        ...state,
        loading: false,
        medicines: payload,
      };

    case types.GET_ALLDATA_SUCCESS:
      return {
        ...state,
        loading: false,
        dashboard: payload,
      };
    case types.DELETE_APPOINTMENT_SUCCESS:
      return {
        ...state,
        loading: false,
        appointments: {
          ...state.appointments,
          appointments: state.appointments.appointments.filter((ele) => ele.id !== payload),
        },
      };
    case types.GET_APPOINTMENT_DETAILS_SUCCESS:
      return {
        ...state,
        loading: false,
        appointments: payload,
      };
    case types.GET_REPORTS_SUCCESS:
      return {
        ...state,
        loading: false,
        reports: payload,
      };
    case types.GET_CERTIFICATES_SUCCESS:
      return {
        ...state,
        loading: false,
        certificates: payload,
      };

    // Laboratory cases
    case types.GET_PENDING_REQUESTS_SUCCESS:
      return {
        ...state,
        loading: false,
        labRequests: payload,
      };
    case types.GET_LAB_HISTORY_SUCCESS:
      return {
        ...state,
        loading: false,
        labHistory: payload,
      };
    case types.GET_DOCTOR_LAB_HISTORY_SUCCESS:
      return {
        ...state,
        loading: false,
        doctor_lab_history: payload,
      };
    case types.GET_LAB_TECHS_SUCCESS:
      return {
        ...state,
        loading: false,
        labTechs: payload,
      };
    case types.GET_DOCTOR_QUEUE_SUCCESS:
      return {
        ...state,
        loading: false,
        doctorQueue: payload || [],
      };
    case types.GET_CONSULTATION_DATA_SUCCESS:
      return {
        ...state,
        loading: false,
        consultationData: payload,
      };
    case types.COMPLETE_CONSULTATION_SUCCESS:
      return {
        ...state,
        loading: false,
      };

    case types.GET_PATIENT_ERROR:
    case types.GET_DOCTOR_ERROR:
    case types.GET_ADMIN_ERROR:
    case types.GET_APPOINTMENT_DETAILS_ERROR:
    case types.GET_REPORTS_ERROR:
    case types.GET_MEDICINE_ERROR:
    case types.GET_PENDING_REQUESTS_ERROR:
    case types.GET_LAB_HISTORY_ERROR:
    case types.GET_DOCTOR_LAB_HISTORY_ERROR:
    case types.SUBMIT_LAB_RECORD_ERROR:
    case types.GET_LAB_TECHS_ERROR:
    case types.GET_DOCTOR_QUEUE_ERROR:
    case types.GET_CONSULTATION_DATA_ERROR:
    case types.COMPLETE_CONSULTATION_ERROR:
      return {
        ...state,
        loading: false,
        error: true,
      };

    default:
      return state;
  }
}
