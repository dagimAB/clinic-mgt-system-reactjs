import React, { useState } from "react";
import { Table, Input, Button, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { getLabHistory } from "../../../../../Redux/Datas/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import Topbar from "../../GlobalFiles/Topbar";

const { Search } = Input;

const Lab_History = () => {
    const dispatch = useDispatch();
    const [patientId, setPatientId] = useState("");
    const { data: authData } = useSelector((store) => store.auth);
    const { labHistory, loading } = useSelector((store) => store.data);

    const onSearch = (value) => {
        if (!value) {
            return message.warning("Please enter a Student/Patient ID");
        }
        setPatientId(value);
        dispatch(getLabHistory(value));
    };

    if (authData?.isAuthenticated === false) {
        return <Navigate to={"/"} />;
    }

    if (authData?.user.userType !== "lab_technologist" && authData?.user.userType !== "doctor") {
        return <Navigate to={"/dashboard"} />;
    }

    const columns = [
        {
            title: "Student ID",
            dataIndex: "studentid",
            key: "studentid",
            render: (text) => <b style={{ color: "#1890ff" }}>{text}</b>
        },
        { title: "Test Type", dataIndex: "test_type", key: "test_type" },
        { title: "Reason", dataIndex: "notes", key: "notes" },
        { title: "Result", dataIndex: "result_value", key: "result_value" },
        {
            title: "Critical",
            dataIndex: "critical_flag",
            key: "critical_flag",
            render: (critical) => (critical ? <span style={{ color: "red", fontWeight: "bold" }}>YES</span> : "No"),
        },
        {
            title: "Technologist",
            dataIndex: "technologist_name",
            key: "technologist_name"
        },
        {
            title: "Date",
            dataIndex: "submission_date",
            key: "submission_date",
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: "Doctor Review",
            dataIndex: "reviewed_by_doctor",
            key: "reviewed_by_doctor",
            render: (reviewed) => (reviewed ? "Reviewed" : "Pending Review"),
        },
    ];

    return (
        <>
            <div className="container">
                <Sidebar />
                <div className="AfterSideBar">
                    <Topbar />
                    <div className="Payment_Page">
                        <div className="patientBox">
                            <h2 style={{ marginBottom: "1rem" }}>Laboratory History Search</h2>
                            <Search
                                placeholder="Enter Student ID (e.g., ETS0110/16)"
                                allowClear
                                enterButton="Search History"
                                size="large"
                                onSearch={onSearch}
                                style={{ marginBottom: "2rem", maxWidth: "400px" }}
                            />

                            {patientId && (
                                <>
                                    <h3>History for Patient ID: {patientId}</h3>
                                    <Table
                                        columns={columns}
                                        dataSource={labHistory}
                                        loading={loading}
                                        rowKey="id"
                                    />
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Lab_History;
