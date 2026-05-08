import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Table, Button, Card, Tag, Modal, Form, Input, DatePicker, TimePicker, Select, Space, Typography, Tooltip, Avatar, Empty } from "antd";
import { CalendarOutlined, PlusOutlined, UserOutlined, ClockCircleOutlined, DeleteOutlined } from "@ant-design/icons";
import { GetAppointments, CreateBooking, GetPatients, DeleteAppointment } from "../../../../../Redux/Datas/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { Search } = Input;

const DoctorAppointments = () => {
    const dispatch = useDispatch();
    const { data } = useSelector((store) => store.auth);
    const { appointments: appointmentsData } = useSelector((store) => store.data);
    const { patients } = useSelector((store) => store.data.patients);

    // Safety check: Ensure appointments is an array
    const appointments = appointmentsData?.appointments || [];
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const [searchText, setSearchText] = useState("");

    // Fetch Initial Data
    useEffect(() => {
        if (data?.user?.id) {
            dispatch(GetAppointments("doctor", data.user.id));
            dispatch(GetPatients());
        }
    }, [dispatch, data]);

    const handleCreate = async (values) => {
        setLoading(true);

        const payload = {
            patientid: values.patientid,
            date: values.date.format("YYYY-MM-DD"),
            time: values.time.format("HH:mm"),
            problem: values.problem,
            doctorid: data.user.id, // Direct ID passing favored by Backend
        };

        const res = await dispatch(CreateBooking(payload));
        setLoading(false);
        if (res?.message === "successful" || res?.message === "Successful") {
            toast.success("Appointment Scheduled Successfully");
            setIsModalOpen(false);
            form.resetFields();
            dispatch(GetAppointments("doctor", data.user.id));
        } else {
            toast.error("Failed to schedule appointment");
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to cancel this appointment?")) {
            await dispatch(DeleteAppointment(id));
            toast.info("Appointment Cancelled");
            dispatch(GetAppointments("doctor", data.user.id));
        }
    };

    // Filter appointments
    const filteredAppointments = appointments?.filter(app =>
        app.patient_name?.toLowerCase().includes(searchText.toLowerCase()) ||
        app.patientid?.toLowerCase().includes(searchText.toLowerCase()) ||
        app.problem?.toLowerCase().includes(searchText.toLowerCase())
    ) || [];

    const columns = [
        {
            title: "Date & Time",
            key: "datetime",
            render: (r) => (
                <Space direction="vertical" size={0}>
                    <Text strong><CalendarOutlined /> {new Date(r.date).toLocaleDateString()}</Text>
                    <Text type="secondary" style={{ fontSize: '12px' }}><ClockCircleOutlined /> {r.time}</Text>
                </Space>
            ),
            sorter: (a, b) => new Date(a.date) - new Date(b.date),
        },
        {
            title: "Patient",
            key: "patient",
            render: (r) => (
                <Space>
                    <Avatar style={{ backgroundColor: '#1890ff' }} icon={<UserOutlined />} />
                    <div>
                        <Text strong display="block">{r.patient_name || "Unknown"}</Text>
                        <br />
                        <Tag color="cyan">{r.patientid}</Tag>
                    </div>
                </Space>
            ),
        },
        {
            title: "Problem / Reason",
            dataIndex: "problem",
            key: "problem",
            render: (text) => (
                <Tooltip title={text}>
                    <Text style={{ maxWidth: '200px' }} ellipsis>{text}</Text>
                </Tooltip>
            )
        },
        {
            title: "Status",
            key: "status",
            render: (r) => {
                const isPast = new Date(r.date) < new Date();
                return <Tag color={isPast ? "default" : "geekblue"}>{isPast ? "Completed" : "Upcoming"}</Tag>;
            }
        },
        {
            title: "Action",
            key: "action",
            render: (r) => (
                <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(r.id)}
                >
                    Cancel
                </Button>
            )
        }
    ];

    return (
        <div className="container">
            <Sidebar />
            <div className="AfterSideBar">
                <ToastContainer />
                <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                        <div>
                            <Title level={2} style={{ margin: 0 }}>My Appointments</Title>
                            <Text type="secondary">Manage your consultation schedule</Text>
                        </div>
                        <Button
                            type="primary"
                            size="large"
                            icon={<PlusOutlined />}
                            onClick={() => setIsModalOpen(true)}
                            style={{ borderRadius: '6px' }}
                        >
                            Schedule Appointment
                        </Button>
                    </div>

                    <Card style={{ borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                        <div style={{ marginBottom: '16px', display: 'flex', gap: '10px' }}>
                            <Search
                                placeholder="Search appointments..."
                                onChange={e => setSearchText(e.target.value)}
                                style={{ width: 300 }}
                                allowClear
                            />
                        </div>

                        <Table
                            columns={columns}
                            dataSource={filteredAppointments}
                            rowKey="id"
                            pagination={{ pageSize: 8 }}
                            locale={{ emptyText: <Empty description="No appointments found" /> }}
                        />
                    </Card>
                </div>

                <Modal
                    title="Schedule New Appointment"
                    open={isModalOpen}
                    onCancel={() => setIsModalOpen(false)}
                    footer={null}
                    centered
                >
                    <Form form={form} layout="vertical" onFinish={handleCreate}>
                        <Form.Item name="patientid" label="Patient" rules={[{ required: true, message: 'Please select a patient' }]}>
                            <Select
                                showSearch
                                placeholder="Search by name or ID"
                                optionFilterProp="children"
                                filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                options={patients?.map(p => ({
                                    value: p.studentid, // Using StudentID as backend expects varchar/string
                                    label: `${p.name} (${p.studentid})`
                                }))}
                            />
                        </Form.Item>

                        <div style={{ display: 'flex', gap: '16px' }}>
                            <Form.Item name="date" label="Date" style={{ flex: 1 }} rules={[{ required: true }]}>
                                <DatePicker style={{ width: '100%' }} disabledDate={current => current && current < dayjs().startOf('day')} />
                            </Form.Item>
                            <Form.Item name="time" label="Time" style={{ flex: 1 }} rules={[{ required: true }]}>
                                <TimePicker format="HH:mm" style={{ width: '100%' }} />
                            </Form.Item>
                        </div>

                        <Form.Item name="problem" label="Problem / Reason" rules={[{ required: true }]}>
                            <Input.TextArea rows={3} placeholder="Brief description of the issue..." />
                        </Form.Item>

                        <Form.Item>
                            <Button type="primary" htmlType="submit" block size="large" loading={loading} style={{ marginTop: '8px' }}>
                                Confirm Booking
                            </Button>
                        </Form.Item>
                    </Form>
                </Modal>
            </div>
        </div>
    );
};

export default DoctorAppointments;
