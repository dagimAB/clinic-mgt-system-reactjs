import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import {
  getConsultationData,
  updateReport,
} from "../../../../../Redux/Datas/action";
import {
  Tabs,
  Card,
  Typography,
  Descriptions,
  Tag,
  Table,
  Timeline,
  Badge,
  Alert,
  Skeleton,
  Button,
  Row,
  Col,
  Space,
  Divider,
  Modal,
  Form,
  Input,
} from "antd";
import {
  HistoryOutlined,
  ExperimentOutlined,
  CalendarOutlined,
  UserOutlined,
  ArrowLeftOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
} from "@ant-design/icons";
import Sidebar from "../../GlobalFiles/Sidebar";

const { Title, Text, Paragraph } = Typography;
const { TabPane } = Tabs;

const PatientHistoryView = () => {
  const params = useParams();
  const studentId = params["*"];
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { data } = useSelector((store) => store.auth);
  const { consultationData, loading } = useSelector((store) => store.data);
  const [selectedRecord, setSelectedRecord] = React.useState(null);
  const [isEditing, setIsEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [editForm] = Form.useForm();

  const normalizeMedicines = (medicines) => {
    if (!medicines) return [];
    if (Array.isArray(medicines)) return medicines;
    if (typeof medicines === "string") {
      try {
        const parsed = JSON.parse(medicines);
        return Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        return [];
      }
    }
    if (typeof medicines === "object") {
      return Array.isArray(medicines) ? medicines : [];
    }
    return [];
  };

  useEffect(() => {
    if (studentId && data?.token) {
      dispatch(getConsultationData(studentId, data.token));
    }
  }, [studentId, data.token, dispatch]);

  useEffect(() => {
    if (selectedRecord) {
      editForm.setFieldsValue({
        disease: selectedRecord.disease,
        temperature: selectedRecord.temperature,
        weight: selectedRecord.weight,
        bp: selectedRecord.bp,
        glucose: selectedRecord.glucose,
        info: selectedRecord.info,
        treatment_plan: selectedRecord.treatment_plan,
        follow_up_date: selectedRecord.follow_up_date,
        recommendations: selectedRecord.recommendations,
      });
    }
  }, [selectedRecord, editForm]);

  const handleSave = async () => {
    try {
      const values = await editForm.validateFields();
      setSaving(true);
      const medicinesPayload = normalizeMedicines(selectedRecord?.medicines);
      const payload = {
        ...values,
        medicines: medicinesPayload,
      };
      const res = await dispatch(updateReport(selectedRecord.id, payload));
      if (res?.message === "updated") {
        await dispatch(getConsultationData(studentId, data.token));
        setIsEditing(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar" style={{ padding: "40px" }}>
          <Skeleton active avatar paragraph={{ rows: 15 }} />
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
            message="Patient Record Not Found"
            description={`Unable to load history for ${studentId}.`}
            type="error"
            showIcon
            action={
              <Button
                type="primary"
                onClick={() => navigate("/patientdetails")}
              >
                Back
              </Button>
            }
          />
        </div>
      </div>
    );
  }

  const { patient, history, labResults, appointments } = consultationData;

  return (
    <div className="container">
      <Sidebar />
      <div className="AfterSideBar">
        <div
          style={{
            padding: "24px",
            minHeight: "100vh",
            backgroundColor: "#f8fafc",
          }}
        >
          {/* Back Button & Header */}
          <Space
            direction="vertical"
            style={{ width: "100%", marginBottom: "24px" }}
          >
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={() => navigate("/patientdetails")}
              style={{ borderRadius: "6px" }}
            >
              Back to Patient List
            </Button>
            <Card
              style={{ borderRadius: "12px", borderTop: "4px solid #1890ff" }}
            >
              <Row align="middle" gutter={24}>
                <Col span={16}>
                  <Space size="large">
                    <div
                      style={{
                        backgroundColor: "#e6f7ff",
                        padding: "16px",
                        borderRadius: "50%",
                      }}
                    >
                      <UserOutlined
                        style={{ fontSize: "40px", color: "#1890ff" }}
                      />
                    </div>
                    <div>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "10px",
                        }}
                      >
                        <Title level={2} style={{ margin: 0 }}>
                          {patient.name}
                        </Title>
                        <Tag color="blue" style={{ fontSize: "14px" }}>
                          {patient.studentid || patient.studentID}
                        </Tag>
                      </div>
                      <Text type="secondary" style={{ fontSize: "16px" }}>
                        {patient.department} | Year {patient.year} |{" "}
                        {patient.gender} | Age: {patient.age}
                      </Text>
                    </div>
                  </Space>
                </Col>
                <Col span={8} style={{ textAlign: "right" }}>
                  <Space direction="vertical" align="end">
                    <Tag
                      color="red"
                      style={{ fontSize: "14px", padding: "4px 12px" }}
                    >
                      Blood Group: {patient.bloodGroup}
                    </Tag>
                    {patient.allergies && (
                      <Alert
                        message={`Allergies: ${patient.allergies}`}
                        type="warning"
                        showIcon
                        style={{ padding: "4px 12px", borderRadius: "6px" }}
                      />
                    )}
                  </Space>
                </Col>
              </Row>
            </Card>
          </Space>

          {/* Main Content Tabs */}
          <Card
            style={{ borderRadius: "12px", minHeight: "600px" }}
            bodyStyle={{ padding: "24px" }}
          >
            <Tabs
              defaultActiveKey="reports"
              size="large"
              animated={{ inkBar: true, tabPane: true }}
            >
              {/* Consultation Reports Tab */}
              <TabPane
                tab={
                  <span>
                    <HistoryOutlined /> Consultation History
                  </span>
                }
                key="reports"
              >
                {history?.length > 0 ? (
                  <Timeline mode="left" style={{ marginTop: "24px" }}>
                    {history.map((h, i) => (
                      <Timeline.Item
                        key={i}
                        label={
                          <Text strong>
                            {new Date(h.date).toLocaleDateString()}
                          </Text>
                        }
                        color="blue"
                      >
                        <Card
                          size="small"
                          hoverable
                          style={{
                            marginBottom: "16px",
                            borderRadius: "8px",
                            borderLeft: "4px solid #1890ff",
                          }}
                          onClick={() => setSelectedRecord(h)}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginBottom: "8px",
                            }}
                          >
                            <Title
                              level={5}
                              style={{ margin: 0, color: "#1890ff" }}
                            >
                              {h.disease}
                            </Title>
                            <Text type="secondary">
                              {h.time} | Dr. {h.doctor_name || "Staff"}
                            </Text>
                          </div>
                          <Paragraph>
                            <strong>Treatment:</strong> {h.treatment_plan}
                          </Paragraph>
                          {normalizeMedicines(h.medicines).length > 0 && (
                            <div style={{ marginTop: "8px" }}>
                              <Text strong>Prescribed:</Text>
                              <Space style={{ marginLeft: "8px" }} wrap>
                                {normalizeMedicines(h.medicines).map(
                                  (m, mi) => (
                                    <Tag key={mi} color="purple">
                                      {m.name} ({m.dosage})
                                    </Tag>
                                  ),
                                )}
                              </Space>
                            </div>
                          )}
                          {h.recommendations && (
                            <Paragraph
                              style={{ marginTop: "8px", fontStyle: "italic" }}
                            >
                              <Text type="secondary">
                                Doc's Note: {h.recommendations}
                              </Text>
                            </Paragraph>
                          )}
                        </Card>
                      </Timeline.Item>
                    ))}
                  </Timeline>
                ) : (
                  <Alert
                    message="No consultation records found."
                    type="info"
                    showIcon
                  />
                )}
              </TabPane>

              {/* Lab History Tab */}
              <TabPane
                tab={
                  <span>
                    <ExperimentOutlined /> Lab History
                  </span>
                }
                key="labs"
              >
                <Table
                  dataSource={labResults}
                  rowKey="id"
                  columns={[
                    {
                      title: "Test Type",
                      dataIndex: "test_type",
                      key: "test_type",
                      render: (text, record) => (
                        <Space>
                          <Text strong>{text}</Text>
                          {record.critical_flag && (
                            <Tag color="error">ABNORMAL</Tag>
                          )}
                        </Space>
                      ),
                    },
                    {
                      title: "Result",
                      dataIndex: "result_value",
                      key: "result_value",
                    },
                    {
                      title: "Date",
                      dataIndex: "submission_date",
                      key: "submission_date",
                      render: (date) => new Date(date).toLocaleDateString(),
                    },
                    {
                      title: "Status",
                      dataIndex: "reviewed_by_doctor",
                      key: "status",
                      render: (reviewed) =>
                        reviewed ? (
                          <Badge status="success" text="Reviewed" />
                        ) : (
                          <Badge status="processing" text="Pending Review" />
                        ),
                    },
                  ]}
                  style={{ marginTop: "20px" }}
                />
              </TabPane>

              {/* Appointment History Tab */}
              <TabPane
                tab={
                  <span>
                    <CalendarOutlined /> Appointments
                  </span>
                }
                key="appointments"
              >
                <Table
                  dataSource={appointments}
                  rowKey="id"
                  columns={[
                    { title: "Date", dataIndex: "date", key: "date" },
                    { title: "Time", dataIndex: "time", key: "time" },
                    { title: "Problem", dataIndex: "problem", key: "problem" },
                    {
                      title: "Status",
                      key: "status",
                      render: (r) => {
                        const appDate = new Date(r.date);
                        const isPast = appDate < new Date();
                        return isPast ? (
                          <Tag icon={<CheckCircleOutlined />} color="default">
                            Past Visit
                          </Tag>
                        ) : (
                          <Tag
                            icon={<ClockCircleOutlined />}
                            color="processing"
                          >
                            Upcoming
                          </Tag>
                        );
                      },
                    },
                  ]}
                  style={{ marginTop: "20px" }}
                />
              </TabPane>
            </Tabs>
          </Card>

          {/* Detailed Record Modal */}
          <Modal
            title={
              <Space>
                <HistoryOutlined /> Detailed Medical Report
              </Space>
            }
            visible={!!selectedRecord}
            onCancel={() => {
              setSelectedRecord(null);
              setIsEditing(false);
            }}
            footer={[
              <Button
                key="close"
                onClick={() => {
                  setSelectedRecord(null);
                  setIsEditing(false);
                }}
              >
                Close
              </Button>,
              data?.user?.userType === "doctor" &&
                (isEditing ? (
                  <Button
                    key="save"
                    type="primary"
                    loading={saving}
                    onClick={handleSave}
                  >
                    Save Changes
                  </Button>
                ) : (
                  <Button
                    key="edit"
                    type="primary"
                    onClick={() => setIsEditing(true)}
                  >
                    Edit Report
                  </Button>
                )),
            ]}
            width={700}
            bodyStyle={{ padding: "24px" }}
          >
            {selectedRecord && !isEditing && (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "20px",
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Card
                      size="small"
                      title="Session Info"
                      style={{ backgroundColor: "#fafafa" }}
                    >
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Date">
                          {new Date(selectedRecord.date).toLocaleDateString()}
                        </Descriptions.Item>
                        <Descriptions.Item label="Time">
                          {selectedRecord.time}
                        </Descriptions.Item>
                        <Descriptions.Item label="Doctor">
                          Dr. {selectedRecord.doctor_name || "Staff"}
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                  <Col span={12}>
                    <Card
                      size="small"
                      title="Vitals & Diagnosis"
                      style={{ backgroundColor: "#fafafa" }}
                    >
                      <Descriptions column={1} size="small">
                        <Descriptions.Item label="Diagnosis">
                          <Tag color="blue">{selectedRecord.disease}</Tag>
                        </Descriptions.Item>
                        <Descriptions.Item label="Temp">
                          {selectedRecord.temperature}°C
                        </Descriptions.Item>
                        <Descriptions.Item label="Weight">
                          {selectedRecord.weight}kg
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>

                <div>
                  <Text strong>
                    <HistoryOutlined /> Clinical Findings & Info:
                  </Text>
                  <div
                    style={{
                      padding: "12px",
                      border: "1px solid #f0f0f0",
                      borderRadius: "8px",
                      marginTop: "8px",
                      backgroundColor: "#fff",
                    }}
                  >
                    <Paragraph style={{ margin: 0 }}>
                      {selectedRecord.info || "No detailed notes provided."}
                    </Paragraph>
                  </div>
                </div>

                <div>
                  <Text strong>
                    <ExperimentOutlined /> Treatment Plan:
                  </Text>
                  <div
                    style={{
                      padding: "12px",
                      border: "1px solid #f0f0f0",
                      borderRadius: "8px",
                      marginTop: "8px",
                      backgroundColor: "#e6f7ff",
                    }}
                  >
                    <Paragraph style={{ margin: 0 }}>
                      {selectedRecord.treatment_plan ||
                        "No treatment plan recorded."}
                    </Paragraph>
                  </div>
                </div>

                <div>
                  <Text strong>
                    <Badge status="processing" /> Prescribed Medication:
                  </Text>
                  <div style={{ marginTop: "8px" }}>
                    {normalizeMedicines(selectedRecord.medicines).length > 0 ? (
                      <Table
                        size="small"
                        pagination={false}
                        dataSource={normalizeMedicines(
                          selectedRecord.medicines,
                        )}
                        columns={[
                          { title: "Medicine", dataIndex: "name", key: "name" },
                          {
                            title: "Dosage",
                            dataIndex: "dosage",
                            key: "dosage",
                          },
                        ]}
                      />
                    ) : (
                      <Text type="secondary">No medication prescribed.</Text>
                    )}
                  </div>
                </div>

                {selectedRecord.recommendations && (
                  <Alert
                    message="Doctor's Recommendations"
                    description={selectedRecord.recommendations}
                    type="info"
                    showIcon
                  />
                )}
              </div>
            )}

            {selectedRecord && isEditing && (
              <Form layout="vertical" form={editForm}>
                <Row gutter={16}>
                  <Col span={12}>
                    <Form.Item
                      label="Diagnosis"
                      name="disease"
                      rules={[
                        { required: true, message: "Diagnosis is required" },
                      ]}
                    >
                      <Input placeholder="Diagnosis" />
                    </Form.Item>
                  </Col>
                  <Col span={12}>
                    <Form.Item label="Follow-up Date" name="follow_up_date">
                      <Input type="date" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Temperature" name="temperature">
                      <Input placeholder="e.g. 37.5" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="Weight" name="weight">
                      <Input placeholder="e.g. 70" />
                    </Form.Item>
                  </Col>
                  <Col span={8}>
                    <Form.Item label="BP" name="bp">
                      <Input placeholder="e.g. 120/80" />
                    </Form.Item>
                  </Col>
                </Row>
                <Row gutter={16}>
                  <Col span={8}>
                    <Form.Item label="Glucose" name="glucose">
                      <Input placeholder="e.g. 5.6" />
                    </Form.Item>
                  </Col>
                  <Col span={16}>
                    <Form.Item label="Clinical Notes" name="info">
                      <Input.TextArea
                        rows={3}
                        placeholder="Clinical findings..."
                      />
                    </Form.Item>
                  </Col>
                </Row>
                <Form.Item label="Treatment Plan" name="treatment_plan">
                  <Input.TextArea rows={3} placeholder="Treatment plan..." />
                </Form.Item>
                <Form.Item label="Recommendations" name="recommendations">
                  <Input.TextArea rows={2} placeholder="Recommendations..." />
                </Form.Item>
              </Form>
            )}
          </Modal>
        </div>
      </div>
    </div>
  );
};

export default PatientHistoryView;
