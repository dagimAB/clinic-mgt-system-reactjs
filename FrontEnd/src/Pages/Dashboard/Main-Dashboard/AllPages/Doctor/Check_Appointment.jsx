import { useEffect } from "react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import CollapsibleTable from "../../../../../Components/Table/CollapsibleTable";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {
  DeleteAppointment,
  GetAppointments,
  GetPatients,
  GetDoctorDetails,
} from "../../../../../Redux/Datas/action";
import Sidebar from "../../GlobalFiles/Sidebar";

const notify = (text) => toast(text);

const Check_Appointment = () => {
  const { data } = useSelector((store) => store.auth);
  const { patients } = useSelector((store) => store.data.patients);
  const { doctors } = useSelector((store) => store.data.doctors);
  const { appointments } = useSelector((store) => store.data.appointments);
  console.log(appointments);
  const patient =
    data.user.userType === "patient"
      ? patients.find((patient) => patient.id === appointments.patientid)
      : appointments.map((appointment) => {
        return patients.find(
          (patient) => patient.id === appointment.patientid
        );
      });

  const doctor =
    data.user.userType === "patient"
      ? appointments.map((appointment) => {
        return doctors.find((doctor) => doctor.id === appointment.doctorid);
      })
      : doctors.find((doctor) => doctor.id === data.user.id);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    if (data.user?.userType) {
      dispatch(GetAppointments(data.user.userType, data.user.id));
      dispatch(GetPatients());
      dispatch(GetDoctorDetails());
    }
  }, [data.user]);

  const createData = (
    id,
    patient_name,
    doctor_name,
    date,
    time,
    phonenum,
    department,
    problem,
    buttonText
  ) => {
    return {
      id,
      patient_name,
      doctor_name,
      date,
      time,
      buttonText,
      details: [{ phonenum, department, problem }],
    };
  };

  const columns = [
    {
      userType: data.user?.userType,
      label: data.user?.userType === "patient" ? "Doctor Name" : "Patient Name",
      key: data.user?.userType === "patient" ? "doctor_name" : "patient_name",
      align: "left",
    },
    { label: "Date", key: "date", align: "right" },
    { label: "Time", key: "time", align: "right" },
    {
      label:
        data.user?.userType === "patient"
          ? "Cancel Appointment"
          : data.user?.userType === "nurse"
            ? "Status"
            : "Generate Report",
      align: "right",
    },
  ];

  const datas = appointments.map((appointment, index) => {
    return data.user.userType === "patient"
      ? createData(
        appointment.id,
        doctor[index].name,
        appointment.date,
        appointment.time,
        doctor[index].phonenum,
        doctor[index].department,
        doctor[index].fees,
        appointment.problem,
        "Cancel"
      )
      : createData(
        appointment.id,
        patient[index].name,
        appointment.date,
        appointment.time,
        patient[index].phonenum,
        doctor.department,
        doctor.fees,
        appointment.problem,
        "Generate Report"
      );
  });

  const clicked = (index) => {
    let appointment;
    data.user.userType === "patient"
      ? dispatch(DeleteAppointment(index)).then((res) => {
        console.log(res);
        if (res.message === "successful") {
          notify("Appointment Cancelled");
        }
      })
      : (appointment = appointments.find(
        (appointment) => appointment.id === index
      ));
    console.log(appointment);
    if (appointment !== undefined) {
      return navigate("/createreport", { state: appointment });
    }
  };
  useEffect(() => {
    dispatch(GetAppointments(data.user.userType, data.user.id));
  }, []);

  if (data?.isAuthenticated === false) {
    return <Navigate to={"/"} />;
  }

  if (data?.user.userType === "admin") {
    return <Navigate to={"/dashboard"} />;
  }

  return (
    <>
      <ToastContainer />
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <div className="Payment_Page">
            <h1 style={{ marginBottom: "2rem" }}>Appointment Details</h1>
            <div className="patientBox">
              {appointments.length > 0 ? (
                <CollapsibleTable
                  data={datas}
                  columns={columns}
                  onDelete={clicked}
                />
              ) : (
                <div style={{ padding: "2rem", textAlign: "center" }}>
                  <h3>No Appointments Found</h3>
                  <p>You need an active appointment to generate a lab request.</p>
                  <p>Please run <code>node seed_full_workflow.js</code> in the Backend folder to set up test data.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Check_Appointment;
