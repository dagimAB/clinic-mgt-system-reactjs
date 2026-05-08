import { Table, Descriptions, Input } from "antd";
import React from "react";
import { FaUserPlus, FaUserMd } from "react-icons/fa";
import patient from "../../../../img/patient.png";
import { useNavigate } from "react-router-dom";
import { FaAmbulance } from "react-icons/fa";
import { BsFillBookmarkCheckFill } from "react-icons/bs";
import { MdPayment } from "react-icons/md";
import { RiAdminLine, RiTestTubeFill } from "react-icons/ri";
import Sidebar from "./Sidebar";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  GetAllData,
  GetPatients,
  GetDoctorDetails,
  GetMedicineDetails,
  GetAppointments,
  GetAdminDetails,
  GetAllReports,
} from "../../../../Redux/Datas/action";

const FrontPage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [staffSearch, setStaffSearch] = React.useState("");
  const [patientSearch, setPatientSearch] = React.useState("");

  const patientColumns = [
    { title: "Student ID", dataIndex: "studentid", key: "studentid" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Dept", dataIndex: "department", key: "department" },
  ];

  const doctorColumns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Email", dataIndex: "email", key: "email" },
    { title: "Role", dataIndex: "role", key: "role" },
  ];

  const patientMedication = [
    { title: "Name", dataIndex: "name", key: "name" },
    { title: "Dosage", dataIndex: "dosage", key: "dosaage" },
    { title: "Frequency", dataIndex: "frequency", key: "frequency" },
    { title: "Duration", dataIndex: "duration", key: "duration" },
    { title: "Report Date&Time", dataIndex: "datetime", key: "dateTime" },
  ];

  useEffect(() => {
    dispatch(GetPatients());
    dispatch(GetDoctorDetails());
    dispatch(GetAllData());
    user?.userType === undefined ? navigate("/") : console.log("logged in");
    if (user?.userType !== "admin") {
      dispatch(GetAllReports(user?.userType, user?.id));
      dispatch(GetMedicineDetails(user?.id));
      dispatch(GetAppointments(user?.userType, user?.id));
      dispatch(GetAllReports(user?.userType, user?.id));
    } else {
      dispatch(GetAdminDetails());
    }
    // eslint-disable-next-line
  }, []);
  const {
    data: { user },
  } = useSelector((state) => state.auth);

  const { dashboard } = useSelector((store) => store.data);
  const data = dashboard?.data || {};

  const { patients } = useSelector((store) => store.data.patients);
  const { doctors } = useSelector((store) => store.data.doctors);
  const { medicines } = useSelector((store) => store.data.medicines);
  const reportCount = useSelector((store) => store.data.reports)?.reports
    ?.length;

  const filteredStaff = doctors?.filter(
    (s) =>
      s.name?.toLowerCase().includes(staffSearch.toLowerCase()) ||
      s.id?.toLowerCase().includes(staffSearch.toLowerCase()) ||
      s.email?.toLowerCase().includes(staffSearch.toLowerCase())
  );

  const filteredPatients = patients?.filter(
    (p) =>
      p.name?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.studentid?.toLowerCase().includes(patientSearch.toLowerCase()) ||
      p.email?.toLowerCase().includes(patientSearch.toLowerCase())
  );
  console.log(user);
  console.log(user?.id);
  console.log("userType", user?.userType);
  const details = patients?.find((patient) => {
    return patient.id === user?.id;
  });

  return (
    <div className="container">
      <Sidebar />
      <div className="AfterSideBar">
        <h1 style={{ color: "rgb(184 191 234)" }}>Overview</h1>
        <div className="maindiv">
          {user?.userType !== "patient" ? (
            <>
              <div className="two commondiv">
                {" "}
                <div>
                  <h1>{data?.patient}</h1>
                  <p>Patient</p>
                </div>
                <FaUserPlus className="overviewIcon" />
              </div>
              
              {user?.userType === "admin" ? (
                <>
                  <div className="one commondiv">
                    <div>
                      <h1>{data?.doctor}</h1>
                      <p>Doctor</p>
                    </div>
                    <FaUserMd className="overviewIcon" />
                  </div>
                  <div className="six commondiv">
                    {" "}
                    <div>
                      <h1>{data?.admin}</h1>
                      <p>Admin</p>
                    </div>
                    <RiAdminLine className="overviewIcon" />
                  </div>
                  <div className="five commondiv">
                    {" "}
                    <div>
                      <h1>{data?.lab_tech}</h1>
                      <p>Lab Technologist</p>
                    </div>
                    <RiTestTubeFill className="overviewIcon" />
                  </div>
                </>
              ) : (
                <div className="six commondiv">
                  {" "}
                  <div>
                    <h1>{data?.appointment}</h1>
                    <p>Appointment</p>
                  </div>
                  <BsFillBookmarkCheckFill className="overviewIcon" />
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* ************************************* */}
        {user?.userType === "patient" ? (
          <>
            <h2 style={{ color: "rgb(184 191 234)", margin: "1.5rem" }}>
              User Info
            </h2>
            <div className="profileContainer">
              <div className="profileImageContainer">
                <img
                  style={{ width: "9pc", height: "9pc" }}
                  src={patient}
                  alt="patient"
                ></img>
              </div>

              <Descriptions
                layout="vertical"
                bordered
                style={{ width: "100%" }}
                labelStyle={{ fontSize: "1rem", fontWeight: "bolder" }}
              >
                <Descriptions.Item label="Name">
                  {details?.name}
                </Descriptions.Item>
                <Descriptions.Item label="Telephone">
                  {details?.phonenum}
                </Descriptions.Item>
                <Descriptions.Item label="Address">
                  {details?.address}
                </Descriptions.Item>
                <Descriptions.Item label="Total Reports">
                  {reportCount}
                </Descriptions.Item>
                <Descriptions.Item label="Medicines Prescribed">
                  {medicines?.length}
                </Descriptions.Item>
              </Descriptions>
            </div>
            <div>
              <div className="patientDetails">
                <h1>My Medication</h1>
                <div className="patientBox">
                  <Table columns={patientMedication} dataSource={medicines} />
                </div>
              </div>
            </div>
          </>
        ) : null}

        <div>
          {user?.userType === "admin" ? (
            <div className="patientDetails">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Staff Details</h1>
                <Input.Search 
                  placeholder="Search staff..." 
                  style={{ width: 300 }} 
                  onChange={e => setStaffSearch(e.target.value)}
                />
              </div>
              <div className="patientBox">
                <Table columns={doctorColumns} dataSource={filteredStaff} rowKey="id" />
              </div>
            </div>
          ) : null}
          {user?.userType !== "patient" ? (
            <div className="patientDetails">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1>Patient Details</h1>
                <Input.Search 
                  placeholder="Search patients..." 
                  style={{ width: 300 }} 
                  onChange={e => setPatientSearch(e.target.value)}
                />
              </div>
              <div className="patientBox">
                <Table columns={patientColumns} dataSource={filteredPatients} rowKey="studentid" />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default FrontPage;
