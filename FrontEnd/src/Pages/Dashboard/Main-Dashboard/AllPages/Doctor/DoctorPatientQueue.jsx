import React, { useEffect, useCallback } from "react";
import { Table, Tag, Button, Space, Card, Typography, Statistic, Row, Col, Badge } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { getDoctorQueue } from "../../../../../Redux/Datas/action";
import { ClockCircleOutlined, PlayCircleOutlined, TeamOutlined, DesktopOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../GlobalFiles/Sidebar";

const { Title, Text } = Typography;

const DoctorPatientQueue = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { doctorQueue, loading } = useSelector((state) => state.data);
    const { data } = useSelector((state) => state.auth);

    const fetchQueue = useCallback(() => {
        if (data?.user?.id) {
            dispatch(getDoctorQueue(data.user.id, data.token));
        }
    }, [data?.user?.id, data.token, dispatch]);

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000); // Poll every 30s
        return () => clearInterval(interval);
    }, [fetchQueue]);

    const handleStartConsultation = (record) => {
        navigate(`/doctor/consultation/${encodeURIComponent(record.studentid)}`, { state: { queueId: record.id } });
    };

    const columns = [
        {
            title: "Priority",
            dataIndex: "priority",
            key: "priority",
            width: 120,
            render: (priority) => {
                let color = priority === "Emergency" ? "volcano" : priority === "Urgent" ? "orange" : "green";
                return (
                    <Tag color={color} style={{ fontWeight: "bold", padding: "4px 12px", borderRadius: "4px" }}>
                        {priority?.toUpperCase()}
                    </Tag>
                );
            },
            sorter: (a, b) => {
                const priorityMap = { Emergency: 1, Urgent: 2, Normal: 3 };
                return priorityMap[a.priority] - priorityMap[b.priority];
            }
        },
        {
            title: "Patient Details",
            key: "patient",
            render: (_, record) => (
                <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: "16px" }}>{record.student_name}</Text>
                    <Text type="secondary">{record.studentid} | {record.student_dept} - Year {record.student_year}</Text>
                </Space>
            )
        },
        {
            title: "Chief Complaint",
            dataIndex: "chief_complaint",
            key: "chief_complaint",
            render: (text) => <Text style={{ fontStyle: "italic" }}>"{text}"</Text>
        },
        {
            title: "Waiting Time",
            dataIndex: "created_at",
            key: "wait_time",
            render: (time) => {
                const wait = Math.floor((new Date() - new Date(time)) / (1000 * 60));
                return (
                    <Space>
                        <ClockCircleOutlined style={{ color: wait > 60 ? "#ff4d4f" : "#1890ff" }} />
                        <Text type={wait > 60 ? "danger" : "secondary"}>{wait} mins</Text>
                    </Space>
                );
            }
        },
        {
            title: "Status",
            dataIndex: "status",
            key: "status",
            render: (status) => (
                <Badge
                    status={status === "Assigned" ? "processing" : "warning"}
                    text={status === "Assigned" ? "Waiting for Doctor" : status}
                />
            )
        },
        {
            title: "Action",
            key: "action",
            align: "right",
            render: (_, record) => (
                <Button
                    type="primary"
                    icon={<PlayCircleOutlined />}
                    size="large"
                    onClick={() => handleStartConsultation(record)}
                    style={{ borderRadius: "6px", boxShadow: "0 2px 8px rgba(24, 144, 255, 0.3)" }}
                >
                    Start Consultation
                </Button>
            ),
        },
    ];

    const emergencyCount = (doctorQueue || []).filter(q => q.priority === 'Emergency').length;
    const urgentCount = (doctorQueue || []).filter(q => q.priority === 'Urgent').length;

    return (
        <div className="container">
            <Sidebar />
            <div className="AfterSideBar">
                <div style={{ padding: "32px", minHeight: "100vh", backgroundColor: "#f6f8fa" }}>
                    <div style={{ marginBottom: "32px" }}>
                        <Title level={2}>Patient Consultation Queue</Title>
                        <Text type="secondary" style={{ fontSize: "16px" }}>Manage your assigned patients and start consultations.</Text>
                    </div>

                    <Row gutter={24} style={{ marginBottom: "32px" }}>
                        <Col span={6}>
                            <Card bordered={false} style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                <Statistic
                                    title="Waiting Patients"
                                    value={(doctorQueue || []).length}
                                    prefix={<TeamOutlined />}
                                    valueStyle={{ color: '#1890ff' }}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card bordered={false} style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                <Statistic
                                    title="Emergency"
                                    value={emergencyCount}
                                    prefix={<Badge status="error" />}
                                    valueStyle={{ color: '#ff4d4f' }}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card bordered={false} style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                <Statistic
                                    title="Urgent"
                                    value={urgentCount}
                                    prefix={<Badge status="warning" />}
                                    valueStyle={{ color: '#faad14' }}
                                />
                            </Card>
                        </Col>
                        <Col span={6}>
                            <Card bordered={false} style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}>
                                <Statistic
                                    title="Avg. Wait Time"
                                    value={12}
                                    suffix="mins"
                                    prefix={<ClockCircleOutlined />}
                                />
                            </Card>
                        </Col>
                    </Row>

                    <Card
                        bordered={false}
                        style={{ borderRadius: "16px", boxShadow: "0 8px 24px rgba(0,0,0,0.08)" }}
                        title={
                            <Space>
                                <DesktopOutlined />
                                <span style={{ fontSize: "18px", fontWeight: "600" }}>Active Waiting List</span>
                            </Space>
                        }
                    >
                        <Table
                            columns={columns}
                            dataSource={doctorQueue || []}
                            loading={loading}
                            rowKey="id"
                            pagination={{ pageSize: 10 }}
                            locale={{ emptyText: "No patients currently assigned to you." }}
                        />
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default DoctorPatientQueue;
