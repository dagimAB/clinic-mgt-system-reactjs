import React from "react";
import { Route, Routes } from "react-router-dom";
import DLogin from "../Pages/Dashboard/Dashboard-Login/DLogin";
import DSignup from "../Pages/Dashboard/Dashboard-Login/Signup/DSignup";
import AddStaff from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/AddStaff";
import ManageStaff from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/ManageStaff";
import AllReport from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/AllReport";
import CheckAppointment from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/Check_Appointment";
import CreateReport from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/Create_Report";

import PatientDetails from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/Patient_Details";
import PatientHistoryView from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/PatientHistoryView";
import DoctorLabDashboard from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/DoctorLabDashboard";
import DoctorPatientQueue from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/DoctorPatientQueue";
import ConsultationView from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/ConsultationView";
import DoctorAppointments from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/DoctorAppointments";
import BookAppointment from "../Pages/Dashboard/Main-Dashboard/AllPages/Patient/Book_Appointment";
import PatientProfile from "../Pages/Dashboard/Main-Dashboard/AllPages/Patient/Patient_Profile";
import AdminProfile from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/Admin_Profile";
import FrontPage from "../Pages/Dashboard/Main-Dashboard/GlobalFiles/FrontPage";

import SystemConfig from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/SystemConfig";
import AuditLogs from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/AuditLogs";
import AdminAnalytics from "../Pages/Dashboard/Main-Dashboard/AllPages/Admin/AdminAnalytics";
import SignupDetails from "../Pages/Dashboard/Dashboard-Login/Signup/SignupDetails";
import MainPortal from "../Pages/MainPortal/MainPortal";
import QueueScreen from "../Pages/MainPortal/QueueScreen";
import AIAssistant from "../Pages/AI/AIAssistant";
import Registration from "../Pages/Dashboard/Main-Dashboard/AllPages/Nurse/Registration";
import Queue from "../Pages/Dashboard/Main-Dashboard/AllPages/Nurse/Queue";
import CertificatesPage from "../Pages/Dashboard/Main-Dashboard/AllPages/Nurse/CertificatesPage";
import Appointments from "../Pages/Dashboard/Main-Dashboard/AllPages/Nurse/Appointments";
import DoctorProfile from "../Pages/Dashboard/Main-Dashboard/AllPages/Doctor/Doctor_Profile";
import NurseProfile from "../Pages/Dashboard/Main-Dashboard/AllPages/Nurse/Nurse_Profile";
import LabTechProfile from "../Pages/Dashboard/Main-Dashboard/AllPages/Laboratory/LabTech_Profile";
import PendingTests from "../Pages/Dashboard/Main-Dashboard/AllPages/Laboratory/Pending_Tests";
import LabHistory from "../Pages/Dashboard/Main-Dashboard/AllPages/Laboratory/Lab_History";
const AllRoutes = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainPortal />} />
        <Route path="/login" element={<DLogin />} />
        <Route path="/queue" element={<QueueScreen />} />
        <Route path="/ai-assistant" element={<AIAssistant />} />
        <Route path="/signup" element={<DSignup />} />
        <Route path="/adddetails" element={<SignupDetails />} />
        <Route path="/dashboard" element={<FrontPage />} />
        <Route path="/addstaff" element={<AddStaff />} />
        <Route path="/managestaff" element={<ManageStaff />} />
        <Route path="/adminprofile" element={<AdminProfile />} />

        <Route path="/systemsetup" element={<SystemConfig />} />
        <Route path="/auditlogs" element={<AuditLogs />} />
        <Route path="/analytics" element={<AdminAnalytics />} />
        {/* ******************** Doctor Part ************************* */}
        <Route path="/doctorprofile" element={<DoctorProfile />} />
        <Route path="/reports" element={<AllReport />} />
        <Route path="/checkappointment" element={<CheckAppointment />} />
        <Route path="/createreport" element={<CreateReport />} />
        <Route path="/patientdetails" element={<PatientDetails />} />

        <Route path="/doctor/lab" element={<DoctorLabDashboard />} />
        <Route path="/doctor/queue" element={<DoctorPatientQueue />} />
        <Route path="/doctor/consultation/*" element={<ConsultationView />} />
        <Route path="/doctor/patient-history/*" element={<PatientHistoryView />} />
        <Route path="/doctor/appointments" element={<DoctorAppointments />} />
        {/* ******************** Patient Part ************************* */}
        <Route path="/bookappointment" element={<BookAppointment />} />
        <Route path="/patientprofile" element={<PatientProfile />} />
        {/* ******************** Nurse Part ************************* */}
        <Route path="/registration" element={<Registration />} />
        <Route path="/queuemanagement" element={<Queue />} />
        <Route path="/certificates" element={<CertificatesPage />} />
        <Route path="/appointments" element={<Appointments />} />
        <Route path="/nurseprofile" element={<NurseProfile />} />

        {/* ******************** Laboratory Part ************************* */}
        <Route path="/lab/pending" element={<PendingTests />} />
        <Route path="/lab/history" element={<LabHistory />} />
        <Route path="/labtechprofile" element={<LabTechProfile />} />
      </Routes>
    </>
  );
};

export default AllRoutes;
