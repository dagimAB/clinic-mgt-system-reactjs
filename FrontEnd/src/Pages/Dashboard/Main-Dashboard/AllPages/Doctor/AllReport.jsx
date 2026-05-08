import { Table } from "antd";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../../GlobalFiles/Sidebar";
import {
  GetPatients,
  GetDoctorDetails,
  GetAllReports,
} from "../../../../../Redux/Datas/action";

const AllReport = () => {
  const dispatch = useDispatch();

  const { data: { user } } = useSelector((state) => state.auth);
  const { patients } = useSelector((store) => store.data.patients);
  const { doctors } = useSelector((store) => store.data.doctors);
  const { reports } = useSelector((store) => store.data.reports);

  useEffect(() => {
    if (user?.userType) {
      dispatch(GetPatients());
      dispatch(GetDoctorDetails());
      dispatch(GetAllReports(user.userType, user.id));
    }
  }, [user]);

  const reportColumns = [
    { title: "Patient Name", dataIndex: "patient_name", key: "patient_name" },
    { title: "Doctor Name", dataIndex: "doctor_name", key: "doctor_name" },
    { title: "Date", dataIndex: "date", key: "date", render: (date) => date ? new Date(date).toLocaleDateString() : "N/A" },
    { title: "Time", dataIndex: "time", key: "time" },
    { title: "Disease", dataIndex: "disease", key: "disease" },
    { title: "Temperature(F°)", dataIndex: "temperature", key: "temperature" },
    { title: "Info", dataIndex: "info", key: "info" },
  ];

  const dataSource = (reports || []).map((report, index) => ({
    ...report,
    key: report.id || index,
  }));

  return (
    <>
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <h1 style={{ color: "rgb(184 191 234)" }}>Reports</h1>
          <div>
            {user?.userType !== "admin" ? (
              <div className="patientDetails">
                <div className="patientBox">
                  <Table columns={reportColumns} dataSource={dataSource} />
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

export default AllReport;
