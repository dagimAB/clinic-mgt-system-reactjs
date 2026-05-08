import React, { useEffect, useState, useCallback } from "react";
import { Table, Tag, Button, Space, Card, Typography, Modal, Descriptions, Input, message, Tabs, Badge, Statistic, Row, Col, Form, Select } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getDoctorLabHistory, reviewLabResult, GetLabTechs, GetPatients, createLabRequest } from "../../../../../Redux/Datas/action";
import { SearchOutlined, EyeOutlined, CheckCircleOutlined, ClockCircleOutlined, AlertOutlined, HistoryOutlined, SendOutlined, PlusOutlined } from "@ant-design/icons";
import Sidebar from "../../GlobalFiles/Sidebar";

const { Title, Text } = Typography;
const { TabPane } = Tabs;
const { Option } = Select;

const DoctorLabDashboard = () => {
    const dispatch = useDispatch();
    const { doctor_lab_history, loading, labTechs } = useSelector((state) => state.data);
    const { patients } = useSelector((state) => state.data.patients);
    const { data } = useSelector((state) => state.auth);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
    const [selectedRecord, setSelectedRecord] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [form] = Form.useForm();
    const [submitting, setSubmitting] = useState(false);

    const fetchHistory = useCallback(() => {
        if (data?.user?.id) {
            dispatch(getDoctorLabHistory(data.user.id, data.token));
        }
    }, [data?.user?.id, data.token, dispatch]);

    useEffect(() => {
        fetchHistory();
        dispatch(GetLabTechs());
        dispatch(GetPatients());
    }, [fetchHistory, dispatch]);

    const handleViewDetails = (record) => {
        setSelectedRecord(record);
        setIsModalVisible(true);
    };

    const handleMarkReviewed = async (e, recordId) => {
        e.stopPropagation();
        try {
            await dispatch(reviewLabResult(recordId, data.token));
            message.success("Record marked as reviewed");
            fetchHistory();
            if (selectedRecord && selectedRecord.record_id === recordId) {
                setIsModalVisible(false);
            }
        } catch (error) {
            message.error("Failed to mark record as reviewed");
        }
    };

    const handleCreateRequest = async (values) => {
        setSubmitting(true);
        try {
            const requestData = {
                patient_id: values.patient_id,
                doctor_id: data.user.id,
                test_type: values.test_type,
                priority: values.priority,
                notes: values.notes || "",
                assigned_tech_id: values.lab_tech_id
            };
            await dispatch(createLabRequest(requestData, data.token));
            message.success("Lab request created successfully!");
            setIsCreateModalVisible(false);
            form.resetFields();
            fetchHistory();
        } catch (error) {
            message.error("Failed to create lab request");
        } finally {
            setSubmitting(false);
        }
    };

    // Filtered data based on categories
    const actionRequired = doctor_lab_history?.filter(item => item.record_id && !item.reviewed_by_doctor) || [];
    const sentToLab = doctor_lab_history?.filter(item => item.request_status === "Pending") || [];
    const totalHistory = doctor_lab_history || [];

    const columns = [
        {
            title: "Patient Name",
            dataIndex: "patient_name",
            key: "patient_name",
            render: (text, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong>{text}</Text>
                    <Text type="secondary" style={{ fontSize: "12px" }}>ID: {record.patient_student_id}</Text>
                </Space>
            )
        },
        {
            title: "Test Type",
            dataIndex: "test_type",
            key: "test_type",
            render: (text) => <Tag color="blue">{text}</Tag>,
        },
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            render: (priority) => {
                let color = priority === "Emergency" ? "volcano" : priority === "Urgent" ? "orange" : "green";
                return <Tag color={color}>{priority?.toUpperCase()}</Tag>;
            }
        },
        {
            title: "Status",
            dataIndex: "request_status",
            key: "request_status",
            render: (status, record) => {
                if (status === "Pending") return <Tag icon={<ClockCircleOutlined />} color="processing">Sent to Lab</Tag>;
                if (record.reviewed_by_doctor) return <Tag icon={<CheckCircleOutlined />} color="success">Reviewed</Tag>;
                return <Tag icon={<AlertOutlined />} color="warning">Responded (Unreviewed)</Tag>;
            }
        },
        {
            title: "Date",
            dataIndex: "request_date",
            key: "request_date",
            render: (date) => new Date(date).toLocaleDateString(),
            sorter: (a, b) => new Date(a.request_date) - new Date(b.request_date),
        },
        {
            title: "Action",
            key: "action",
            align: "right",
            render: (_, record) => (
                <Space size="middle">
                    {record.record_id && !record.reviewed_by_doctor && (
                        <Button
                            type="primary"
                            style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                            icon={<CheckCircleOutlined />}
                            onClick={(e) => handleMarkReviewed(e, record.record_id)}
                        >
                            Confirm
                        </Button>
                    )}
                    <Button
                        type="link"
                        icon={<EyeOutlined />}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleViewDetails(record);
                        }}
                    >
                        Details
                    </Button>
                </Space>
            ),
        },
    ];

    const generateTable = (tableData) => (
        <Table
            columns={columns}
            dataSource={tableData.filter(item =>
                item.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.patient_student_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                item.test_type?.toLowerCase().includes(searchTerm.toLowerCase())
            )}
            loading={loading}
            rowKey={(record) => record.request_id}
            onRow={(record) => ({
                onClick: () => handleViewDetails(record),
                style: { cursor: "pointer" }
            })}
            pagination={{ pageSize: 8 }}
            style={{ borderRadius: "8px" }}
        />
    );

    return (
        <div className="container">
            <Sidebar />
            <div className="AfterSideBar">
                <div style={{ padding: "24px", minHeight: "100vh", backgroundColor: "#f0f2f5" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
                        <Title level={2} style={{ margin: 0 }}>Laboratory Dashboard</Title>
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={() => setIsCreateModalVisible(true)}
                            style={{ backgroundColor: "#1890ff" }}
                        >
                            New Lab Request
                        </Button>
                    </div>

                    <Row gutter={16} style={{ marginBottom: "24px" }}>
                        <Col span={8}>
                            <Card bordered={false} style={{ borderRadius: "12px" }}>
                                <Statistic
                                    title="Action Required"
                                    value={actionRequired.length}
                                    valueStyle={{ color: '#faad14' }}
                                    prefix={<AlertOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card bordered={false} style={{ borderRadius: "12px" }}>
                                <Statistic
                                    title="Sent to Lab"
                                    value={sentToLab.length}
                                    valueStyle={{ color: '#1890ff' }}
                                    prefix={<SendOutlined />}
                                />
                            </Card>
                        </Col>
                        <Col span={8}>
                            <Card bordered={false} style={{ borderRadius: "12px" }}>
                                <Statistic
                                    title="Total Requests"
                                    value={totalHistory.length}
                                    prefix={<HistoryOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Card style={{ borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }}>
                        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                            <Input
                                placeholder="Search patient or test type..."
                                prefix={<SearchOutlined />}
                                style={{ width: 300 }}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <Tabs defaultActiveKey="1" type="card">
                            <TabPane
                                tab={
                                    <Badge count={actionRequired.length} offset={[10, 0]}>
                                        <span style={{ paddingRight: "15px" }}>Action Required</span>
                                    </Badge>
                                }
                                key="1"
                            >
                                {generateTable(actionRequired)}
                            </TabPane>
                            <TabPane tab="Sent to Lab" key="2">
                                {generateTable(sentToLab)}
                            </TabPane>
                            <TabPane tab="Full History" key="3">
                                {generateTable(totalHistory)}
                            </TabPane>
                        </Tabs>
                    </Card>

                    {/* Create Lab Request Modal */}
                    <Modal
                        title={<Title level={3}>Create New Lab Request</Title>}
                        visible={isCreateModalVisible}
                        onCancel={() => {
                            setIsCreateModalVisible(false);
                            form.resetFields();
                        }}
                        footer={null}
                        width={600}
                        centered
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={handleCreateRequest}
                        >
                            <Form.Item
                                name="patient_id"
                                label="Select Patient"
                                rules={[{ required: true, message: "Please select a patient" }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Search and select patient"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    size="large"
                                >
                                    {patients?.map((patient) => (
                                        <Option key={patient.id} value={patient.id}>
                                            {patient.name} ({patient.studentid})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="lab_tech_id"
                                label="Assign Lab Technician"
                                rules={[{ required: true, message: "Please select a lab technician" }]}
                            >
                                <Select
                                    showSearch
                                    placeholder="Select lab technician"
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
                                    }
                                    size="large"
                                >
                                    {labTechs?.map((tech) => (
                                        <Option key={tech.id} value={tech.id}>
                                            {tech.name} ({tech.email})
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="test_type"
                                label="Test Type"
                                rules={[{ required: true, message: "Please select a test type" }]}
                            >
                                <Select placeholder="Select test type" size="large">
                                    <Option value="Blood Test">Blood Test</Option>
                                    <Option value="Urine Test">Urine Test</Option>
                                    <Option value="X-Ray">X-Ray</Option>
                                    <Option value="MRI">MRI</Option>
                                    <Option value="CT Scan">CT Scan</Option>
                                    <Option value="ECG">ECG</Option>
                                    <Option value="Ultrasound">Ultrasound</Option>
                                    <Option value="CBC">Complete Blood Count (CBC)</Option>
                                    <Option value="Liver Function">Liver Function Test</Option>
                                    <Option value="Kidney Function">Kidney Function Test</Option>
                                    <Option value="Thyroid Panel">Thyroid Panel</Option>
                                    <Option value="Other">Other</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="priority"
                                label="Priority"
                                rules={[{ required: true, message: "Please select priority" }]}
                            >
                                <Select placeholder="Select priority" size="large">
                                    <Option value="Normal">Normal</Option>
                                    <Option value="Urgent">Urgent</Option>
                                    <Option value="Emergency">Emergency</Option>
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="notes"
                                label="Notes (Optional)"
                            >
                                <Input.TextArea
                                    rows={3}
                                    placeholder="Add any additional notes for the lab technician..."
                                />
                            </Form.Item>

                            <Form.Item>
                                <Space style={{ width: "100%", justifyContent: "flex-end" }}>
                                    <Button onClick={() => {
                                        setIsCreateModalVisible(false);
                                        form.resetFields();
                                    }}>
                                        Cancel
                                    </Button>
                                    <Button
                                        type="primary"
                                        htmlType="submit"
                                        loading={submitting}
                                        icon={<SendOutlined />}
                                    >
                                        Send to Lab
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Modal>

                    {/* View Details Modal */}
                    <Modal
                        title={<Title level={3}>Lab Report Details</Title>}
                        visible={isModalVisible}
                        onCancel={() => setIsModalVisible(false)}
                        footer={[
                            <Button key="close" onClick={() => setIsModalVisible(false)}>
                                Close
                            </Button>,
                            selectedRecord?.record_id && !selectedRecord?.reviewed_by_doctor && (
                                <Button
                                    key="review"
                                    type="primary"
                                    style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                                    icon={<CheckCircleOutlined />}
                                    onClick={(e) => handleMarkReviewed(e, selectedRecord.record_id)}
                                >
                                    Confirm & Review
                                </Button>
                            ),
                        ]}
                        width={750}
                        centered
                    >
                        {selectedRecord && (
                            <div style={{ padding: "12px" }}>
                                <Descriptions title="Request Information" bordered column={2}>
                                    <Descriptions.Item label="Patient Name">{selectedRecord.patient_name}</Descriptions.Item>
                                    <Descriptions.Item label="Student ID">{selectedRecord.patient_student_id}</Descriptions.Item>
                                    <Descriptions.Item label="Test Requested">{selectedRecord.test_type}</Descriptions.Item>
                                    <Descriptions.Item label="Priority">
                                        <Tag color={selectedRecord.priority === "Emergency" ? "volcano" : "blue"}>
                                            {selectedRecord.priority}
                                        </Tag>
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Request Date" span={2}>
                                        {new Date(selectedRecord.request_date).toLocaleString()}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="Doctor's Notes" span={2}>
                                        {selectedRecord.notes || "No notes provided"}
                                    </Descriptions.Item>
                                </Descriptions>

                                <div style={{ marginTop: "24px" }}>
                                    <Title level={4}>Laboratory Findings</Title>
                                    {selectedRecord.record_id ? (
                                        <Card size="small" style={{ backgroundColor: "#f9f9f9", borderLeft: selectedRecord.critical_flag ? "4px solid #f5222d" : "4px solid #52c41a" }}>
                                            <Descriptions bordered column={1}>
                                                <Descriptions.Item label="Result Value">
                                                    <Text strong style={{ fontSize: "18px" }}>{selectedRecord.result_value}</Text>
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Critical Flag">
                                                    {selectedRecord.critical_flag ?
                                                        <Tag color="error" icon={<AlertOutlined />}>CRITICAL</Tag> :
                                                        <Tag color="success">Normal Range</Tag>
                                                    }
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Submission Date">
                                                    {new Date(selectedRecord.submission_date).toLocaleString()}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="Technologist">
                                                    {selectedRecord.technologist_name}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    ) : (
                                        <div style={{ padding: "30px", textAlign: "center", background: "#f0f2f5", borderRadius: "8px" }}>
                                            <ClockCircleOutlined style={{ fontSize: "32px", color: "#faad14", marginBottom: "12px" }} />
                                            <br />
                                            <Text type="secondary" style={{ fontSize: "16px" }}>The laboratory has not yet submitted results for this test.</Text>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </Modal>
                </div>
            </div>
        </div>
    );
};

export default DoctorLabDashboard;
