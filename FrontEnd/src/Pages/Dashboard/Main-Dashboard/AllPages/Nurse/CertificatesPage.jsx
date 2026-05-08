import { Table, Button, Tag, Space, Modal } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Sidebar from "../../GlobalFiles/Sidebar";
import {
  GetAllCertificates,
  GetPatients,
} from "../../../../../Redux/Datas/action";
import { AiOutlineEye, AiOutlinePrinter } from "react-icons/ai";
import CertificateModal from "../Doctor/Certificate_Modal";

const baseURL = process.env.REACT_APP_BASE_URL;
if (!baseURL) throw new Error("REACT_APP_BASE_URL is not defined in .env");

const CertificatesPage = () => {
  const dispatch = useDispatch();
  const { data } = useSelector((state) => state.auth);
  const user = data?.user;
  const certificatesData = useSelector((store) => store.data?.certificates);
  const certificates = certificatesData?.certificates || [];
  const patientsData = useSelector((store) => store.data?.patients);
  const patients = patientsData?.patients || [];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCert, setSelectedCert] = useState(null);
  const [isGenerateOpen, setIsGenerateOpen] = useState(false);

  useEffect(() => {
    if (user?.userType) {
      dispatch(GetAllCertificates(user.userType, user.id));
    }
    if (user?.userType === "doctor") {
      dispatch(GetPatients());
    }
  }, [user, dispatch]);

  const [config, setConfig] = useState(null);

  useEffect(() => {
    // Fetch certificate template config
    const fetchConfig = async () => {
      try {
        const response = await fetch(
          `${baseURL}/nurses/config/certificate_settings`,
        );
        const data = await response.json();
        setConfig(data);
      } catch (error) {
        console.error("Error fetching certificate config:", error);
      }
    };
    fetchConfig();
  }, []);

  console.log("CertificatesPage state:", { user, certificates });

  if (!user) {
    return (
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <h1>Please log in to view certificates.</h1>
        </div>
      </div>
    );
  }

  const handlePrint = (record) => {
    console.log("Printing record:", record);

    // Default fallback if no config
    const templateName = config?.template || "Standard Medical Certificate";
    const logoUrl = config?.logo_url || "";
    const fields = config?.fields || ["student_id", "diagnosis", "rest_period"];

    const printWindow = window.open("", "_blank");
    printWindow.document.write(`
      <html>
        <head>
          <title>${templateName} - ${record.patient_name}</title>
          <style>
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #333; line-height: 1.6; }
            .header { text-align: center; border-bottom: 2px solid #1a1a1a; padding-bottom: 20px; margin-bottom: 30px; }
            .header img { max-height: 80px; margin-bottom: 10px; }
            .content { margin: 20px 0; }
            .footer { margin-top: 50px; text-align: right; }
            .stamp { border: 2px solid #d32f2f; color: #d32f2f; display: inline-block; padding: 5px 15px; transform: rotate(-10deg); font-weight: bold; margin-top: 20px; }
            h1 { font-size: 24px; margin: 0; }
            h2 { font-size: 20px; color: #1677ff; }
            .meta { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <div class="header">
            ${logoUrl ? `<img src="${logoUrl}" alt="Logo" />` : ""}
            <h1>AASTU PATIENT HEALTH CENTER</h1>
            <p>${templateName}</p>
          </div>
          <div class="content">
            <h2>${record.type}</h2>
            <div class="meta">
              <p><strong>Date:</strong> ${new Date(record.issue_date).toLocaleDateString()}</p>
              <p><strong>Certificate ID:</strong> #CERT-${record.id}</p>
              <p><strong>Patient Name:</strong> ${record.patient_name || record.student_name}</p>
              <p><strong>Patient ID:</strong> ${record.patient_display_id || record.student_id}</p>
              <p><strong>Doctor:</strong> ${record.doctor_name}</p>
              ${fields.includes("department") ? `<p><strong>Department:</strong> ${record.department || "N/A"}</p>` : ""}
            </div>
            <div style="border: 1px dashed #ccc; padding: 20px; background: #fafafa;">
              <p><strong>Medical Justification:</strong></p>
              <p>${record.medical_justification || record.content}</p>
            </div>
          </div>
          <div class="footer">
            <p>_________________________</p>
            <p>Authorized Signature</p>
            <div class="stamp">OFFICIAL SEAL</div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const columns = [
    {
      title: "Patient Name",
      dataIndex: "patient_name",
      key: "patient_name",
      render: (_, record) => record.patient_name || record.student_name,
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type) => {
        let color = "blue";
        if (type === "Sick Leave") color = "volcano";
        if (type === "Fitness Certificate") color = "green";
        if (type === "Referral Letter") color = "gold";
        return <Tag color={color}>{type?.toUpperCase()}</Tag>;
      },
    },
    {
      title: "Doctor",
      dataIndex: "doctor_name",
      key: "doctor_name",
      render: (name) => name || "You",
    },
    {
      title: "Date",
      dataIndex: "issue_date",
      key: "issue_date",
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Button
            icon={<AiOutlineEye />}
            onClick={() => {
              setSelectedCert(record);
              setIsModalOpen(true);
            }}
          >
            View
          </Button>
          <Button
            type="primary"
            icon={<AiOutlinePrinter />}
            onClick={() => handlePrint(record)}
          >
            Print
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "20px",
            }}
          >
            <h1 style={{ color: "rgb(184 191 234)", marginBottom: 0 }}>
              Doctor-Generated Certificates
            </h1>
            {user?.userType === "doctor" && (
              <Button type="primary" onClick={() => setIsGenerateOpen(true)}>
                Generate Certificate
              </Button>
            )}
          </div>
          <div className="patientDetails">
            <div className="patientBox">
              <Table
                columns={columns}
                dataSource={certificates || []}
                rowKey="id"
              />
            </div>
          </div>
        </div>
      </div>

      <Modal
        title="Certificate Details"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="close" onClick={() => setIsModalOpen(false)}>
            Close
          </Button>,
          <Button
            key="print"
            type="primary"
            onClick={() => handlePrint(selectedCert)}
          >
            Print
          </Button>,
        ]}
      >
        {selectedCert && (
          <div style={{ padding: "10px" }}>
            <p>
              <strong>Patient:</strong>{" "}
              {selectedCert.patient_name || selectedCert.student_name}
            </p>
            <p>
              <strong>Doctor:</strong> {selectedCert.doctor_name}
            </p>
            <p>
              <strong>Type:</strong> {selectedCert.type}
            </p>
            <p>
              <strong>Date:</strong>{" "}
              {new Date(selectedCert.issue_date).toLocaleDateString()}
            </p>
            <hr />
            <p>
              <strong>Justification:</strong>
            </p>
            <p
              style={{
                background: "#f5f5f5",
                padding: "10px",
                borderRadius: "4px",
              }}
            >
              {selectedCert.medical_justification || selectedCert.content}
            </p>
          </div>
        )}
      </Modal>

      <CertificateModal
        visible={isGenerateOpen}
        onClose={() => setIsGenerateOpen(false)}
        doctorId={user?.id}
        doctorName={user?.name}
        token={data?.token}
        allowPatientSelect={user?.userType === "doctor"}
        patients={patients}
      />
    </>
  );
};

export default CertificatesPage;
