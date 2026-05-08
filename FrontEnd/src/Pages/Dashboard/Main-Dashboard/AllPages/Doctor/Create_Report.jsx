import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import {
  DeleteAppointment,
  CreateReport,
  createLabRequest,
  GetPatients,
  getLabHistory,
  GetAllReports,
  reviewLabResult,
} from "../../../../../Redux/Datas/action";
import {
  Modal,
  Form,
  Select,
  Input,
  Button,
  Descriptions,
  Tag,
  Collapse,
  Typography,
  Table,
  Divider,
} from "antd";
import Sidebar from "../../GlobalFiles/Sidebar";
import "react-toastify/dist/ReactToastify.css";
import { toast, ToastContainer } from "react-toastify";
import "../Admin/CSS/Add_Doctor.css";
import Certificate_Modal from "./Certificate_Modal";

const { Text, Title } = Typography;
const { Panel } = Collapse;

const notify = (text) => toast(text);

const Create_Report = () => {
  const navigate = useNavigate();
  const { data } = useSelector((store) => store.auth);
  const { patients } = useSelector((store) => store.data.patients);
  const labHistory = useSelector((store) => store.data.labHistory || []);
  const previousReports = useSelector((store) => store.data.reports || []);

  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const creds = location.state;
  const dispatch = useDispatch();

  const [isLabModalOpen, setIsLabModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);
  const [labForm] = Form.useForm();

  const initmed = {
    name: "",
    dosage: "",
    frequency: "",
    duration: "",
  };
  const [med, setMed] = useState(initmed);
  const [medicines, setMedicines] = useState([]);

  const InitData = {
    patient_id: creds?.patientid,
    doctor_id: data?.user?.id,
    date: new Date().toISOString().split("T")[0],
    time: new Date().toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
    disease: "",
    temperature: "",
    weight: "",
    bp: "",
    glucose: "",
    info: "",
    treatment_plan: "",
    follow_up_date: "",
    recommendations: "",
    medicines: [],
  };

  const [reportValue, setReportValue] = useState(InitData);

  // Fetch contextual data
  useEffect(() => {
    if (creds?.patientid) {
      dispatch(GetPatients());
      dispatch(getLabHistory(creds.patientid));
      dispatch(GetAllReports("patient", creds.patientid));
    }
  }, [creds, dispatch]);

  const patient = patients?.find((p) => p.id === creds?.patientid);

  const HandleMedChange = (e) => {
    setMed({ ...med, [e.target.name]: e.target.value });
  };

  const HandleReportChange = (e) => {
    setReportValue({ ...reportValue, [e.target.name]: e.target.value });
  };

  const HandleMedAdd = (e) => {
    e.preventDefault();
    if (!med.name) return toast.warning("Medicine name is required");
    setMedicines([...medicines, med]);
    setMed(initmed);
  };

  const HandleReportSubmit = (e) => {
    e.preventDefault();
    let payload = {
      ...reportValue,
      medicines,
      appointment_id: creds?.id,
    };

    try {
      setLoading(true);
      dispatch(CreateReport(payload)).then((res) => {
        if (res.message === "successful") {
          dispatch(DeleteAppointment(creds?.id)).then((res) => {
            notify("Consultation Report Saved Sucessfully");
            setTimeout(() => {
              navigate("/checkappointment");
            }, 2000);
          });
        } else {
          setLoading(false);
          notify(res.message || "Something went Wrong");
        }
      });
    } catch (error) {
      console.log(error);
      setLoading(false);
    }
  };

  const handleLabReview = (labId) => {
    dispatch(reviewLabResult(labId, data.token)).then((res) => {
      if (res) {
        notify("Lab result marked as reviewed");
        dispatch(getLabHistory(creds.patientid));
      }
    });
  };

  const handleLabRequestSubmit = (values) => {
    const payload = {
      patient_id: creds?.patientid,
      test_type: values.test_type,
      priority: values.priority,
      notes: values.notes,
      doctorID: data?.user?.id,
    };
    dispatch(createLabRequest(payload, data.token)).then((res) => {
      if (res) {
        notify("Lab Request Sent Successfully");
        setIsLabModalOpen(false);
        labForm.resetFields();
      } else {
        notify("Failed to send Lab Request");
      }
    });
  };

  if (data?.isAuthenticated === false) {
    return <Navigate to={"/"} />;
  }

  if (data?.user.userType !== "doctor") {
    return <Navigate to={"/dashboard"} />;
  }

  return (
    <>
      <ToastContainer />
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <div className="Main_Add_Doctor_div" style={{ maxWidth: "1200px" }}>
            <h1>Patient Consultation</h1>

            {/* 1. Patient Summary (Read-Only) */}
            <Collapse
              defaultActiveKey={["1"]}
              ghost
              style={{ marginBottom: "1.5rem" }}
            >
              <Panel
                header={<Title level={4}>1. Patient Overview</Title>}
                key="1"
              >
                <Descriptions
                  bordered
                  column={{ xxl: 4, xl: 3, lg: 3, md: 2, sm: 1, xs: 1 }}
                >
                  <Descriptions.Item label="Name">
                    {patient?.name || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="ID">
                    {patient?.studentid || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Age/Gender">
                    {patient?.age} / {patient?.gender}
                  </Descriptions.Item>
                  <Descriptions.Item label="Department">
                    {patient?.department || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Year">
                    {patient?.year || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Blood Group">
                    <Tag color="red">{patient?.bloodgroup || "N/A"}</Tag>
                  </Descriptions.Item>
                  <Descriptions.Item label="Allergies" span={2}>
                    <Text type="danger" strong>
                      {patient?.allergies || "None reported"}
                    </Text>
                  </Descriptions.Item>
                </Descriptions>
              </Panel>
            </Collapse>

            {/* 2. Clinical Context */}
            <div
              style={{
                background: "#f0f5ff",
                padding: "1rem",
                borderRadius: "8px",
                marginBottom: "1.5rem",
              }}
            >
              <Title level={4}>2. Clinical Context</Title>
              <Collapse ghost>
                <Panel
                  header={`Current Symptoms (from Nurse): ${creds?.problem || "Not specified"}`}
                  key="2.1"
                >
                  <p>Initial assessment recorded by nurse: {creds?.problem}</p>
                </Panel>

                <Panel header="Laboratory History & Results" key="2.2">
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {labHistory.length > 0 ? (
                      labHistory.map((lab, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "8px",
                            borderBottom: "1px solid #eee",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div>
                            <Text strong>{lab.test_type}: </Text>
                            <Text>{lab.result_value}</Text>
                            {lab.critical_flag && (
                              <Tag color="error" style={{ marginLeft: "10px" }}>
                                CRITICAL
                              </Tag>
                            )}
                            {lab.reviewed_by_doctor && (
                              <Tag
                                color="success"
                                style={{ marginLeft: "10px" }}
                              >
                                Reviewed
                              </Tag>
                            )}
                            <div style={{ fontSize: "0.8rem", color: "#888" }}>
                              Date:{" "}
                              {new Date(
                                lab.submission_date || lab.created_at,
                              ).toLocaleDateString()}
                            </div>
                          </div>
                          {!lab.reviewed_by_doctor && (
                            <Button
                              size="small"
                              type="primary"
                              ghost
                              onClick={() => handleLabReview(lab.id)}
                            >
                              Mark Reviewed
                            </Button>
                          )}
                        </div>
                      ))
                    ) : (
                      <Text italic>No lab history found</Text>
                    )}
                  </div>
                </Panel>

                <Panel header="Previous Consultation History" key="2.3">
                  <div style={{ maxHeight: "200px", overflowY: "auto" }}>
                    {previousReports.length > 0 ? (
                      previousReports.map((report, i) => (
                        <div
                          key={i}
                          style={{
                            padding: "5px",
                            borderBottom: "1px solid #ddd",
                          }}
                        >
                          <Text strong>{report.disease}</Text>
                          <p style={{ margin: 0, fontSize: "0.9rem" }}>
                            {report.treatment_plan || "No plan recorded"}
                          </p>
                          <Text type="secondary" style={{ fontSize: "0.8rem" }}>
                            {new Date(report.date).toLocaleDateString()} by Dr.{" "}
                            {report.doctor_name || "Unknown"}
                          </Text>
                        </div>
                      ))
                    ) : (
                      <Text italic>First visit recorded in system</Text>
                    )}
                  </div>
                </Panel>
              </Collapse>
            </div>

            {/* 3. Medical Record Updates */}
            <Title level={4}>3. Medical Record Updates</Title>
            <form onSubmit={HandleReportSubmit}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: "20px",
                }}
              >
                <div>
                  <label>Diagnosis (Disease) *</label>
                  <input
                    type="text"
                    name="disease"
                    value={reportValue.disease}
                    onChange={HandleReportChange}
                    required
                    placeholder="Final Diagnosis"
                  />
                </div>
                <div>
                  <label>Follow-up Date</label>
                  <input
                    type="date"
                    name="follow_up_date"
                    value={reportValue.follow_up_date}
                    onChange={HandleReportChange}
                  />
                </div>
              </div>

              <div>
                <label>Treatment Plan *</label>
                <textarea
                  name="treatment_plan"
                  value={reportValue.treatment_plan}
                  onChange={HandleReportChange}
                  required
                  rows={3}
                  placeholder="Describe the treatment strategy..."
                />
              </div>

              <div>
                <label>Recommendations / Lifestyle Changes</label>
                <textarea
                  name="recommendations"
                  value={reportValue.recommendations}
                  onChange={HandleReportChange}
                  rows={2}
                  placeholder="Rest, avoid spicy food, etc."
                />
              </div>

              <Divider orientation="left">Vitals Recorded</Divider>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(4, 1fr)",
                  gap: "15px",
                }}
              >
                <div>
                  <label>Temp (°F)</label>
                  <input
                    type="number"
                    name="temperature"
                    value={reportValue.temperature}
                    onChange={HandleReportChange}
                    step="0.1"
                  />
                </div>
                <div>
                  <label>Weight (KG)</label>
                  <input
                    type="number"
                    name="weight"
                    value={reportValue.weight}
                    onChange={HandleReportChange}
                  />
                </div>
                <div>
                  <label>BP (mmHg)</label>
                  <input
                    type="text"
                    name="bp"
                    value={reportValue.bp}
                    onChange={HandleReportChange}
                    placeholder="120/80"
                  />
                </div>
                <div>
                  <label>Glucose</label>
                  <input
                    type="number"
                    name="glucose"
                    value={reportValue.glucose}
                    onChange={HandleReportChange}
                  />
                </div>
              </div>

              <Divider orientation="left">Prescription</Divider>
              <div
                style={{
                  background: "#fafafa",
                  padding: "1rem",
                  borderRadius: "5px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-end",
                    marginBottom: "1rem",
                  }}
                >
                  <div style={{ flex: 2 }}>
                    <label>Drug Name</label>
                    <input
                      type="text"
                      name="name"
                      value={med.name}
                      onChange={HandleMedChange}
                      placeholder="e.g. Paracetamol"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Dosage</label>
                    <select
                      name="dosage"
                      value={med.dosage}
                      onChange={HandleMedChange}
                    >
                      <option value="">Dosage</option>
                      <option value="1">1 pill</option>
                      <option value="2">2 pills</option>
                      <option value="3">3 pills</option>
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Frequency</label>
                    <input
                      type="text"
                      name="frequency"
                      value={med.frequency}
                      onChange={HandleMedChange}
                      placeholder="e.g. 2x Daily"
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label>Duration (Days)</label>
                    <input
                      type="number"
                      name="duration"
                      value={med.duration}
                      onChange={HandleMedChange}
                      placeholder="Days"
                    />
                  </div>
                  <button
                    type="button"
                    className="addbutton"
                    style={{
                      marginBottom: "10px",
                      height: "40px",
                      width: "80px",
                    }}
                    onClick={HandleMedAdd}
                  >
                    Add
                  </button>
                </div>

                {medicines.length > 0 && (
                  <Table
                    size="small"
                    pagination={false}
                    dataSource={medicines.map((m, i) => ({ ...m, key: i }))}
                    columns={[
                      { title: "Drug", dataIndex: "name" },
                      { title: "Dosage", dataIndex: "dosage" },
                      { title: "Freq", dataIndex: "frequency" },
                      {
                        title: "Duration",
                        dataIndex: "duration",
                        render: (d) => `${d} Days`,
                      },
                      {
                        title: "Action",
                        render: (_, __, i) => (
                          <Button
                            type="link"
                            danger
                            onClick={() =>
                              setMedicines(
                                medicines.filter((_, idx) => idx !== i),
                              )
                            }
                          >
                            Remove
                          </Button>
                        ),
                      },
                    ]}
                  />
                )}
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  justifyContent: "center",
                  marginTop: "2rem",
                }}
              >
                <button
                  type="submit"
                  className="formsubmitbutton"
                  style={{ width: "220px", margin: "0" }}
                  disabled={loading}
                >
                  {loading ? "Saving..." : "Finalize & Generate Report"}
                </button>

                <button
                  type="button"
                  className="formsubmitbutton"
                  style={{
                    width: "220px",
                    margin: "0",
                    backgroundColor: "#52c41a",
                  }}
                  onClick={() => setIsLabModalOpen(true)}
                >
                  Request Lab Test
                </button>

                <button
                  type="button"
                  className="formsubmitbutton"
                  style={{
                    width: "220px",
                    margin: "0",
                    backgroundColor: "#1890ff",
                  }}
                  onClick={() => setIsCertModalOpen(true)}
                >
                  Issue Certificate
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      <Modal
        title="Send Laboratory Request"
        open={isLabModalOpen}
        onCancel={() => setIsLabModalOpen(false)}
        footer={null}
      >
        <Form
          form={labForm}
          layout="vertical"
          onFinish={handleLabRequestSubmit}
        >
          <Form.Item
            label="Test Type"
            name="test_type"
            rules={[{ required: true, message: "Please select test type" }]}
          >
            <Select placeholder="Select Test">
              <Select.Option value="Blood Test">Blood Test</Select.Option>
              <Select.Option value="Urine Test">Urine Test</Select.Option>
              <Select.Option value="X-Ray">X-Ray</Select.Option>
              <Select.Option value="ECG">ECG</Select.Option>
              <Select.Option value="Other">Other</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Priority" name="priority" initialValue="Normal">
            <Select>
              <Select.Option value="Normal">Normal</Select.Option>
              <Select.Option value="Urgent">Urgent</Select.Option>
              <Select.Option value="Emergency">Emergency</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item label="Reason for Test" name="notes">
            <Input.TextArea
              rows={3}
              placeholder="Explain why this test is needed..."
            />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              Send Request to Lab
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      <Certificate_Modal
        visible={isCertModalOpen}
        onClose={() => setIsCertModalOpen(false)}
        patientId={creds?.patientid}
        patientName={patient?.name}
        patientDisplayId={patient?.studentid}
        doctorId={data?.user?.id}
        doctorName={data?.user?.name}
        token={data?.token}
      />
    </>
  );
};

export default Create_Report;
