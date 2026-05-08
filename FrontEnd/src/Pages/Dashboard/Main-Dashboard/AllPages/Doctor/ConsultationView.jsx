import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import {
    CreateReport,
    createLabRequest,
    getConsultationData,
    completeConsultation,
    reviewLabResult,
} from "../../../../../Redux/Datas/action";
import { Modal, Form, Select, Input, Button, Tag, Collapse, Space, Divider, Typography, Card, Row, Col, Alert, Table, Skeleton } from "antd";
import {
    UserOutlined,
    HistoryOutlined,
    ExperimentOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    PlusOutlined,
    SafetyCertificateOutlined,
    WarningOutlined,
    ReloadOutlined,
} from "@ant-design/icons";
import Sidebar from "../../GlobalFiles/Sidebar";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import CertificateModal from "./Certificate_Modal";

const { Text, Title, Paragraph } = Typography;
const { Panel } = Collapse;
const { Option } = Select;

const ConsultationView = () => {
    const params = useParams();
    const studentId = params["*"];
    const location = useLocation();
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { queueId } = location.state || {};

    const { data } = useSelector((store) => store.auth);
    const { consultationData, loading } = useSelector((store) => store.data);

    const [isLabModalOpen, setIsLabModalOpen] = useState(false);
    const [isCertModalOpen, setIsCertModalOpen] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [labForm] = Form.useForm();
    const [reportForm] = Form.useForm();

    const [medicines, setMedicines] = useState([]);
    const [tempMed, setTempMed] = useState({ name: "", dosage: "", frequency: "", duration: "" });

    useEffect(() => {
        if (studentId && data?.token) {
            dispatch(getConsultationData(studentId, data.token));
        }
    }, [studentId, data.token, dispatch]);

    const handleAddMedicine = () => {
        if (!tempMed.name || !tempMed.dosage) {
            return toast.warning("Medicine name and dosage are required");
        }
        setMedicines([...medicines, { ...tempMed, key: Date.now() }]);
        setTempMed({ name: "", dosage: "", frequency: "", duration: "" });
    };

    const handleRemoveMedicine = (key) => {
        setMedicines(medicines.filter(m => m.key !== key));
    };

    const handleFinalizeConsultation = async (values) => {
        if (medicines.length === 0) {
            return toast.warning("Please prescribe at least one medicine or record 'None'");
        }

        setSubmitting(true);
        const payload = {
            patient_id: consultationData.patient.id,
            doctor_id: data.user.id,
            date: new Date().toISOString().split('T')[0],
            time: new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }),
            disease: values.disease,
            temperature: values.temperature,
            weight: values.weight,
            bp: values.bp,
            glucose: values.glucose,
            info: values.info,
            treatment_plan: values.treatment_plan,
            follow_up_date: values.follow_up_date?.format ? values.follow_up_date.format('YYYY-MM-DD') : values.follow_up_date,
            recommendations: values.recommendations,
            medicines: medicines,
            appointment_id: null, // This is for walk-in/queue consultations
        };

        try {
            const res = await dispatch(CreateReport(payload));
            if (res.message === "successful") {
                if (queueId) {
                    await dispatch(completeConsultation(queueId, data.token));
                }
                toast.success("Consultation finalized successfully!");
                setTimeout(() => navigate("/doctor/queue"), 2000);
            } else {
                toast.error(res.message || "Failed to save report");
            }
        } catch (error) {
            toast.error("An error occurred during finalization");
        } finally {
            setSubmitting(false);
        }
    };

    const handleLabRequestSubmit = async (values) => {
        const payload = {
            patient_id: consultationData.patient.id,
            test_type: values.test_type,
            priority: values.priority,
            notes: values.notes,
            doctorID: data.user.id
        };
        const res = await dispatch(createLabRequest(payload, data.token));
        if (res) {
            toast.success("Lab request sent successfully");
            setIsLabModalOpen(false);
            labForm.resetFields();
        } else {
            toast.error("Failed to send lab request");
        }
    };

    const handleMarkLabReviewed = async (id) => {
        const res = await dispatch(reviewLabResult(id, data.token));
        if (res) {
            toast.success("Result marked as reviewed");
            if (studentId) {
                dispatch(getConsultationData(studentId, data.token)); // Refresh with the current ID
            }
        }
    };

    if (loading) {
        return (
            <div className="container">
                <Sidebar />
                <div className="AfterSideBar" style={{ padding: "40px" }}>
                    <Card style={{ borderRadius: "12px" }}>
                        <Skeleton active avatar paragraph={{ rows: 10 }} />
                    </Card>
                </div>
            </div>
        );
    }

    if (!consultationData) {
        return (
            <div className="container">
                <Sidebar />
                <div className="AfterSideBar" style={{ padding: "40px" }}>
                    <Alert
                        message="Consultation Data Not Found"
                        description={`We couldn't retrieve the details for student ID: ${studentId}. Please ensure the student ID is correct and try again.`}
                        type="error"
                        showIcon
                        action={
                            <Button size="small" type="primary" onClick={() => navigate("/doctor/queue")}>
                                Back to Queue
                            </Button>
                        }
                    />
                </div>
            </div>
        );
    }

    const { patient, history, labResults } = consultationData;

    return (
        <div className="container">
            <Sidebar />
            <div className="AfterSideBar">
                <ToastContainer position="top-right" autoClose={3000} />
                <div style={{ padding: "24px", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>

                    {/* Header: Patient Profile */}
                    <Card style={{ marginBottom: "24px", borderRadius: "12px", borderTop: "4px solid #1890ff" }}>
                        <Row align="middle" gutter={24}>
                            <Col span={16}>
                                <Space size="large">
                                    <div style={{ backgroundColor: "#e6f7ff", padding: "12px", borderRadius: "50%" }}>
                                        <UserOutlined style={{ fontSize: "32px", color: "#1890ff" }} />
                                    </div>
                                    <div>
                                        <Title level={3} style={{ margin: 0 }}>{patient.name}</Title>
                                        <Text type="secondary">{patient.studentID} | {patient.department} - Year {patient.year}</Text>
                                    </div>
                                    <Divider type="vertical" style={{ height: "40px" }} />
                                    <div>
                                        <Tag color="red" style={{ fontSize: "14px", padding: "4px 12px" }}>Blood: {patient.bloodGroup}</Tag>
                                        <Tag color="orange" style={{ fontSize: "14px", padding: "4px 12px" }}>Age: {patient.age}</Tag>
                                    </div>
                                </Space>
                            </Col>
                            <Col span={8} style={{ textAlign: "right" }}>
                                <Alert
                                    message={<Text strong>Allergies: {patient.allergies || "None reported"}</Text>}
                                    type={patient.allergies ? "error" : "success"}
                                    showIcon
                                    icon={<WarningOutlined />}
                                />
                            </Col>
                        </Row>
                    </Card>

                    <Row gutter={24}>
                        {/* Left Column: History and Labs */}
                        <Col span={10}>
                            <Collapse defaultActiveKey={['1', '2']} expandIconPosition="right" style={{ background: "transparent", border: "none" }}>
                                <Panel
                                    header={<Space><HistoryOutlined /> Medical History</Space>}
                                    key="1"
                                    style={{ marginBottom: "16px", background: "#fff", borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                                >
                                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                                        {history?.length > 0 ? history.map((h, i) => (
                                            <div key={i} style={{ padding: "12px", borderBottom: i < history.length - 1 ? "1px solid #f0f0f0" : "none" }}>
                                                <Text strong>{h.disease}</Text>
                                                <Paragraph ellipsis={{ rows: 2 }} type="secondary" style={{ margin: "4px 0" }}>{h.treatment_plan}</Paragraph>
                                                <Text type="secondary" style={{ fontSize: "12px" }}>{new Date(h.date).toLocaleDateString()} | Dr. {h.doctor_name || "Staff"}</Text>
                                            </div>
                                        )) : <Text italic>No previous records found.</Text>}
                                    </div>
                                </Panel>

                                <Panel
                                    header={
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingRight: '20px' }}>
                                            <Space><ExperimentOutlined /> Laboratory Results</Space>
                                            <Button 
                                                size="small" 
                                                type="text" 
                                                icon={<ReloadOutlined spin={loading} />} 
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    dispatch(getConsultationData(studentId, data.token));
                                                    toast.info("Refreshing laboratory results...");
                                                }}
                                            />
                                        </div>
                                    }
                                    key="2"
                                    style={{ marginBottom: "16px", background: "#fff", borderRadius: "8px", border: "none", boxShadow: "0 2px 8px rgba(0,0,0,0.06)" }}
                                >
                                    <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                                        {labResults?.length > 0 ? labResults.map((lab, i) => (
                                            <Card
                                                key={i}
                                                size="small"
                                                style={{
                                                    marginBottom: "12px",
                                                    borderLeft: lab.critical_flag ? "4px solid #ff4d4f" : lab.reviewed_by_doctor ? "4px solid #52c41a" : "4px solid #faad14",
                                                    backgroundColor: lab.critical_flag ? "#fff1f0" : "#fff"
                                                }}
                                            >
                                                <div style={{ display: "flex", justifyContent: "space-between" }}>
                                                    <Text strong>{lab.test_type}</Text>
                                                    {lab.critical_flag && <Tag color="error" icon={<WarningOutlined />}>ABNORMAL</Tag>}
                                                </div>
                                                <Paragraph style={{ margin: "8px 0" }}>{lab.result_value}</Paragraph>
                                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12px" }}>
                                                    <Text type="secondary">{new Date(lab.submission_date).toLocaleDateString()}</Text>
                                                    {!lab.reviewed_by_doctor && (
                                                        <Button size="small" type="link" onClick={() => handleMarkLabReviewed(lab.id)}>Mark Reviewed</Button>
                                                    )}
                                                </div>
                                            </Card>
                                        )) : <Text italic>No lab results available.</Text>}
                                    </div>
                                </Panel>
                            </Collapse>
                        </Col>

                        {/* Right Column: Active Consultation Form */}
                        <Col span={14}>
                            <Card
                                title={<Space><FileTextOutlined /> Consultation Findings</Space>}
                                style={{ borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}
                                extra={
                                    <Space>
                                        <Button icon={<ExperimentOutlined />} onClick={() => setIsLabModalOpen(true)}>Request Lab</Button>
                                        <Button icon={<SafetyCertificateOutlined />} type="dashed" onClick={() => setIsCertModalOpen(true)}>Issue Certificate</Button>
                                    </Space>
                                }
                            >
                                <Form
                                    form={reportForm}
                                    layout="vertical"
                                    onFinish={handleFinalizeConsultation}
                                    initialValues={{
                                        date: new Date().toISOString().split('T')[0]
                                    }}
                                >
                                    <Row gutter={16}>
                                        <Col span={12}>
                                            <Form.Item name="disease" label="Diagnosis / Disease" rules={[{ required: true }]}>
                                                <Input placeholder="e.g. Acute Gastritis" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={12}>
                                            <Form.Item name="follow_up_date" label="Follow-up Date">
                                                <Input type="date" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Form.Item name="treatment_plan" label="Treatment Plan" rules={[{ required: true }]}>
                                        <Input.TextArea rows={3} placeholder="Describe the course of action..." />
                                    </Form.Item>

                                    <Form.Item name="recommendations" label="Recommendations">
                                        <Input.TextArea rows={2} placeholder="Lifestyle changes, diet, rest..." />
                                    </Form.Item>

                                    <Divider orientation="left" style={{ margin: "12px 0" }}>Vitals</Divider>
                                    <Row gutter={8}>
                                        <Col span={6}>
                                            <Form.Item name="temperature" label="Temp (°C)">
                                                <Input type="number" step="0.1" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item name="weight" label="Weight (kg)">
                                                <Input type="number" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item name="bp" label="BP (mmHg)">
                                                <Input placeholder="120/80" />
                                            </Form.Item>
                                        </Col>
                                        <Col span={6}>
                                            <Form.Item name="glucose" label="Glucose">
                                                <Input type="number" />
                                            </Form.Item>
                                        </Col>
                                    </Row>

                                    <Divider orientation="left" style={{ margin: "12px 0" }}>Prescription</Divider>
                                    <div style={{ background: "#f9f9f9", padding: "16px", borderRadius: "8px", marginBottom: "16px" }}>
                                        <Row gutter={8} align="bottom">
                                            <Col span={8}>
                                                <Text strong style={{ fontSize: "12px" }}>Medicine Name</Text>
                                                <Input value={tempMed.name} onChange={e => setTempMed({ ...tempMed, name: e.target.value })} placeholder="Paracetamol" />
                                            </Col>
                                            <Col span={5}>
                                                <Text strong style={{ fontSize: "12px" }}>Dosage</Text>
                                                <Select value={tempMed.dosage} onChange={v => setTempMed({ ...tempMed, dosage: v })} style={{ width: "100%" }}>
                                                    <Option value="1 pill">1 pill</Option>
                                                    <Option value="2 pills">2 pills</Option>
                                                    <Option value="5ml">5ml</Option>
                                                    <Option value="10ml">10ml</Option>
                                                </Select>
                                            </Col>
                                            <Col span={6}>
                                                <Text strong style={{ fontSize: "12px" }}>Frequency</Text>
                                                <Input value={tempMed.frequency} onChange={e => setTempMed({ ...tempMed, frequency: e.target.value })} placeholder="3x Daily" />
                                            </Col>
                                            <Col span={5}>
                                                <Button type="dashed" block icon={<PlusOutlined />} onClick={handleAddMedicine}>Add</Button>
                                            </Col>
                                        </Row>

                                        {medicines.length > 0 && (
                                            <Table
                                                size="small"
                                                pagination={false}
                                                dataSource={medicines}
                                                style={{ marginTop: "16px" }}
                                                columns={[
                                                    { title: "Med", dataIndex: "name" },
                                                    { title: "Dose", dataIndex: "dosage" },
                                                    { title: "Freq", dataIndex: "frequency" },
                                                    {
                                                        title: "",
                                                        key: "action",
                                                        render: (r) => <Button size="small" type="link" danger onClick={() => handleRemoveMedicine(r.key)}>Remove</Button>
                                                    }
                                                ]}
                                            />
                                        )}
                                    </div>

                                    <Form.Item name="info" label="Additional Clinical Notes">
                                        <Input.TextArea rows={2} placeholder="Internal notes (not in summary)..." />
                                    </Form.Item>

                                    <Form.Item style={{ textAlign: "center", marginTop: "24px" }}>
                                        <Button
                                            type="primary"
                                            htmlType="submit"
                                            size="large"
                                            loading={submitting}
                                            icon={<CheckCircleOutlined />}
                                            style={{ width: "100%", height: "48px", borderRadius: "8px", fontSize: "16px" }}
                                        >
                                            Finalize Consultation & Save Report
                                        </Button>
                                    </Form.Item>
                                </Form>
                            </Card>
                        </Col>
                    </Row>
                </div>
            </div>

            {/* Modals */}
            <Modal
                title={<Space><ExperimentOutlined /> New Lab Request</Space>}
                open={isLabModalOpen}
                onCancel={() => setIsLabModalOpen(false)}
                footer={null}
                centered
            >
                <Form form={labForm} layout="vertical" onFinish={handleLabRequestSubmit}>
                    <Form.Item name="test_type" label="Test Type" rules={[{ required: true }]}>
                        <Select placeholder="Select test">
                            <Option value="Blood Test">Blood Test</Option>
                            <Option value="Urine Test">Urine Test</Option>
                            <Option value="X-Ray">X-Ray</Option>
                            <Option value="ECG">ECG</Option>
                            <Option value="Ultrasound">Ultrasound</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="priority" label="Priority" initialValue="Normal">
                        <Select>
                            <Option value="Normal">Normal</Option>
                            <Option value="Urgent">Urgent</Option>
                            <Option value="Emergency">Emergency</Option>
                        </Select>
                    </Form.Item>
                    <Form.Item name="notes" label="Clinical Indication">
                        <Input.TextArea rows={3} placeholder="Why is this test needed?" />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block loading={loading}>Send to Lab</Button>
                    </Form.Item>
                </Form>
            </Modal>

            <CertificateModal
                visible={isCertModalOpen}
                onClose={() => setIsCertModalOpen(false)}
                patientId={patient.id}
                doctorId={data.user.id}
                token={data.token}
            />
        </div>
    );
};

export default ConsultationView;
