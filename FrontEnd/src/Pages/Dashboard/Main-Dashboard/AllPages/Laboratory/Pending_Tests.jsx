import React, { useEffect, useState } from "react";
import { Table, Button, Modal, Form, Input, Checkbox, message } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { Navigate } from "react-router-dom";
import { getPendingRequests, submitLabRecord } from "../../../../../Redux/Datas/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import Topbar from "../../GlobalFiles/Topbar";

const Pending_Tests = () => {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [form] = Form.useForm();

    const { data: authData } = useSelector((store) => store.auth);
    const { labRequests, loading } = useSelector((store) => store.data);

    useEffect(() => {
        if (authData?.token) {
            dispatch(getPendingRequests(authData.token));
        }
    }, [dispatch, authData.token]);

    const handleOpenModal = (record) => {
        setSelectedRequest(record);
        setIsModalOpen(true);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
        setSelectedRequest(null);
        form.resetFields();
    };

    const onFinish = (values) => {
        const payload = {
            request_id: selectedRequest.id,
            result_value: values.result_value,
            critical_flag: values.critical_flag || false,
        };

        dispatch(submitLabRecord(payload, authData.token)).then((res) => {
            if (res) {
                message.success("Results submitted successfully!");
                setIsModalOpen(false);
                form.resetFields();
                dispatch(getPendingRequests(authData.token));
            } else {
                message.error("Failed to submit results.");
            }
        });
    };

    if (authData?.isAuthenticated === false) {
        return <Navigate to={"/"} />;
    }

    if (authData?.user.userType !== "lab_technologist") {
        return <Navigate to={"/dashboard"} />;
    }

    const columns = [
        {
            title: "Student ID",
            dataIndex: "studentid",
            key: "studentid",
            render: (text) => <b style={{ color: "#1890ff" }}>{text || "N/A"}</b>
        },
        { title: "Patient Name", dataIndex: "patient_name", key: "patient_name" },
        { title: "Doctor", dataIndex: "doctor_name", key: "doctor_name" },
        { title: "Test Type", dataIndex: "test_type", key: "test_type" },
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            render: (priority) => {
                let color = "green";
                if (priority === "Urgent") color = "orange";
                if (priority === "Emergency") color = "red";
                return <span style={{ color, fontWeight: "bold" }}>{priority}</span>;
            }
        },
        {
            title: "Requested",
            dataIndex: "request_date",
            key: "request_date",
            render: (text) => new Date(text).toLocaleString(),
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Button
                    type="primary"
                    className="premium-button"
                    style={{ borderRadius: "5px", background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)", border: "none" }}
                    onClick={() => handleOpenModal(record)}
                >
                    Enter Results
                </Button>
            ),
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
                            <h2 style={{ marginBottom: "1rem" }}>Pending Lab Requests</h2>
                            <Table
                                columns={columns}
                                dataSource={labRequests}
                                loading={loading}
                                rowKey="id"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <Modal
                title={
                    <div style={{ paddingBottom: "10px", borderBottom: "1px solid #f0f0f0" }}>
                        <span style={{ fontSize: "1.2rem", fontWeight: "bold", color: "#262626" }}>Test Submission</span>
                        <div style={{ fontSize: "0.9rem", color: "#8c8c8c", marginTop: "4px" }}>
                            {selectedRequest?.test_type} for {selectedRequest?.patient_name} ({selectedRequest?.studentid})
                        </div>
                    </div>
                }
                open={isModalOpen}
                onCancel={handleCancel}
                footer={null}
                width={600}
                centered
                bodyStyle={{ paddingTop: "20px" }}
            >
                <div style={{ marginBottom: "20px", padding: "15px", backgroundColor: "#f9f9f9", borderRadius: "8px", borderLeft: "4px solid #1890ff" }}>
                    <h4 style={{ margin: "0 0 8px 0", color: "#1890ff", fontSize: "0.9rem", textTransform: "uppercase" }}>Reason for Test</h4>
                    <p style={{ margin: 0, fontSize: "1rem", fontStyle: "italic", color: "#595959" }}>
                        "{selectedRequest?.notes || "No specific reason provided by the doctor."}"
                    </p>
                </div>

                <Form form={form} layout="vertical" onFinish={onFinish}>
                    <Form.Item
                        label={<span style={{ fontWeight: "600" }}>Laboratory Findings & Results</span>}
                        name="result_value"
                        rules={[{ required: true, message: "Please provide detailed findings" }]}
                    >
                        <Input.TextArea
                            rows={6}
                            placeholder="Type numerical values, observations, and interpretation here..."
                            style={{ borderRadius: "6px" }}
                        />
                    </Form.Item>

                    <Form.Item name="critical_flag" valuePropName="checked">
                        <Checkbox style={{ color: "#ff4d4f", fontWeight: "500" }}>
                            Flag as CRITICAL FINDING (Immediate attention required)
                        </Checkbox>
                    </Form.Item>

                    <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
                        <Button style={{ flex: 1, height: "45px", borderRadius: "6px" }} onClick={handleCancel}>
                            Cancel
                        </Button>
                        <Button
                            type="primary"
                            htmlType="submit"
                            style={{ flex: 2, height: "45px", borderRadius: "6px", background: "linear-gradient(135deg, #1890ff 0%, #096dd9 100%)", border: "none", fontWeight: "bold" }}
                            loading={loading}
                        >
                            Complete & Submit Results
                        </Button>
                    </div>
                    <p style={{ textAlign: "center", color: "#bfbfbf", fontSize: "0.85rem", marginTop: "15px" }}>
                        🔒 Once submitted, this record will be locked and sent to the doctor.
                    </p>
                </Form>
            </Modal>
        </>
    );
};

export default Pending_Tests;
