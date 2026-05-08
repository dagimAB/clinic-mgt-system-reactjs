import React, { useState } from "react";
import {
  Modal,
  Form,
  Select,
  Input,
  Button,
  InputNumber,
  Space,
  Divider,
} from "antd";
import { useDispatch } from "react-redux";
import {
  CreateCertificate,
  EmailCertificate,
} from "../../../../../Redux/Datas/action";
import { toast } from "react-toastify";
import jsPDF from "jspdf";

const Certificate_Modal = ({
  visible,
  onClose,
  patientId,
  patientName,
  patientDisplayId,
  doctorId,
  doctorName,
  token,
  allowPatientSelect = false,
  patients = [],
}) => {
  const [form] = Form.useForm();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const [emailLoading, setEmailLoading] = useState(false);
  const [certType, setCertType] = useState("");
  const [generatedCert, setGeneratedCert] = useState(null);

  const onFinish = (values) => {
    setLoading(true);
    const resolvedPatientId = patientId || values.student_id;
    if (!resolvedPatientId) {
      setLoading(false);
      toast.error("Please select a patient");
      return;
    }
    const resolvedPatient = patients.find(
      (patient) => String(patient.id) === String(resolvedPatientId),
    );
    const resolvedPatientName = resolvedPatient?.name || patientName;
    const resolvedStudentDisplayId =
      resolvedPatient?.studentid || patientDisplayId;
    const payload = {
      student_id: resolvedPatientId,
      doctor_id: doctorId,
      type: values.type,
      medical_justification: values.justification,
      duration_days: values.duration,
      content: values.content,
      issue_date: new Date().toISOString().split("T")[0],
    };

    dispatch(CreateCertificate(payload, token)).then((res) => {
      setLoading(false);
      if (res && (res.message === "Successful" || res.data)) {
        toast.success("Certificate generated successfully!");
        setGeneratedCert({
          ...payload,
          id: res.data?.id,
          student_name: resolvedPatientName,
          student_display_id: resolvedStudentDisplayId,
          doctor_name: doctorName,
        }); // Store for Print/Email
      } else {
        toast.error("Failed to generate certificate.");
      }
    });
  };

  const handlePrint = () => {
    if (!generatedCert) return;
    const doc = new jsPDF();

    doc.setFontSize(22);
    doc.text("Medical Certificate", 105, 20, null, null, "center");

    doc.setFontSize(14);
    doc.text(`Certificate Type: ${generatedCert.type}`, 20, 40);
    doc.text(`Issue Date: ${generatedCert.issue_date}`, 150, 40);

    doc.setFontSize(12);
    let infoY = 55;
    doc.text(`Patient ID: ${generatedCert.student_id}`, 20, infoY);
    infoY += 10;
    doc.text(`Doctor ID: ${generatedCert.doctor_id}`, 20, infoY);
    infoY += 10;

    if (generatedCert.type === "Sick Leave") {
      const studentId =
        generatedCert.student_display_id || generatedCert.student_id;
      doc.text(`Student ID: ${studentId}`, 20, infoY);
      infoY += 10;
      if (generatedCert.student_name) {
        doc.text(`Student Name: ${generatedCert.student_name}`, 20, infoY);
        infoY += 10;
      }
      if (generatedCert.doctor_name) {
        doc.text(`Doctor Name: ${generatedCert.doctor_name}`, 20, infoY);
        infoY += 10;
      }
    }

    const lineY = infoY + 5;
    doc.line(20, lineY, 190, lineY);

    const sectionTitleY = lineY + 15;
    doc.setFontSize(16);
    doc.text("Medical Justification:", 20, sectionTitleY);
    doc.setFontSize(12);
    const splitJustification = doc.splitTextToSize(
      generatedCert.medical_justification || "N/A",
      170,
    );
    const justificationY = sectionTitleY + 10;
    doc.text(splitJustification, 20, justificationY);

    let nextY = justificationY + splitJustification.length * 6 + 10;

    if (generatedCert.duration_days) {
      doc.text(
        `Recommended Rest Duration: ${generatedCert.duration_days} Days`,
        20,
        nextY,
      );
      nextY += 10;
    }

    if (generatedCert.content) {
      doc.text("Notes:", 20, nextY);
      const splitNotes = doc.splitTextToSize(generatedCert.content, 170);
      doc.text(splitNotes, 20, nextY + 10);
      nextY += splitNotes.length * 6 + 20;
    }

    doc.text("Official Signature:", 140, 250);
    doc.line(140, 270, 190, 270);

    doc.save(`${generatedCert.type}_${generatedCert.student_id}.pdf`);
  };

  const handleEmail = () => {
    if (!generatedCert) return;

    // Prompt for email (could be improved with a proper input, but simplifying for now or assuming student email)
    // For this task, we'll try to email the student ID if it looks like an email OR ask user.
    // Given context constraints, we'll send it to the logged-in user email or a prompt?
    // User requirements said "Auto-saved to student record... Print or email option".
    // Let's assume we email the current patient (we just have ID).
    // We'll prompt via simple window.prompt for flexibility for now.
    const email = window.prompt("Enter recipient email address:");
    if (!email) return;

    setEmailLoading(true);
    const emailBody = `
            <h2>Medical Certificate - ${generatedCert.type}</h2>
            <p><strong>Patient ID:</strong> ${generatedCert.student_id}</p>
            <p><strong>Date:</strong> ${generatedCert.issue_date}</p>
            <hr/>
            <h3>Medical Justification</h3>
            <p>${generatedCert.medical_justification}</p>
            ${generatedCert.duration_days ? `<p><strong>Duration:</strong> ${generatedCert.duration_days} Days</p>` : ""}
            <p><strong>Doctor ID:</strong> ${generatedCert.doctor_id}</p>
        `;

    dispatch(
      EmailCertificate(
        {
          to: email,
          subject: `Medical Certificate: ${generatedCert.type}`,
          html: emailBody,
        },
        token,
      ),
    ).then((res) => {
      setEmailLoading(false);
      if (res && res.message === "Email Sent Successfully") {
        toast.success("Email sent successfully!");
      } else {
        toast.error("Failed to send email");
      }
    });
  };

  const handleReset = () => {
    setGeneratedCert(null);
    form.resetFields();
  };

  return (
    <Modal
      title="Generate Medical Certificate"
      open={visible}
      onCancel={() => {
        handleReset();
        onClose();
      }}
      footer={null}
      destroyOnClose
    >
      {!generatedCert ? (
        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
          initialValues={{ duration: 1 }}
        >
          {allowPatientSelect && (
            <Form.Item
              label="Select Patient"
              name="student_id"
              rules={[{ required: true, message: "Please select a patient" }]}
            >
              <Select
                placeholder="Search by name or student ID"
                showSearch
                optionFilterProp="label"
              >
                {patients.map((patient) => (
                  <Select.Option
                    key={patient.id}
                    value={patient.id}
                    label={`${patient.name} (${patient.studentid})`}
                  >
                    {patient.name} ({patient.studentid})
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>
          )}
          <Form.Item
            label="Certificate Type"
            name="type"
            rules={[
              { required: true, message: "Please select certificate type" },
            ]}
          >
            <Select
              placeholder="Select Type"
              onChange={(val) => setCertType(val)}
            >
              <Select.Option value="Sick Leave">Sick Leave</Select.Option>
              <Select.Option value="Fitness Certificate">
                Fitness Certificate
              </Select.Option>
              <Select.Option value="Referral Letter">
                Referral Letter
              </Select.Option>
            </Select>
          </Form.Item>

          {certType === "Sick Leave" && (
            <Form.Item
              label="Duration (Days)"
              name="duration"
              rules={[{ required: true, message: "Please specify duration" }]}
            >
              <InputNumber min={1} max={7} style={{ width: "100%" }} />
            </Form.Item>
          )}

          <Form.Item
            label="Medical Justification"
            name="justification"
            rules={[
              { required: true, message: "Please provide justification" },
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Provide medical reasoning..."
            />
          </Form.Item>

          <Form.Item label="Additional Content / Notes" name="content">
            <Input.TextArea rows={2} placeholder="Any extra details..." />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block loading={loading}>
              Generate and Save
            </Button>
          </Form.Item>
        </Form>
      ) : (
        <div style={{ textAlign: "center" }}>
          <div
            style={{ marginBottom: "20px", color: "green", fontSize: "16px" }}
          >
            ✅ Certificate Generated Successfully
          </div>
          <Space direction="vertical" style={{ width: "100%" }}>
            <Button type="primary" onClick={handlePrint} block>
              Print / Download PDF
            </Button>
            <Button onClick={handleEmail} block loading={emailLoading}>
              Email Certificate
            </Button>
            <Divider />
            <Button onClick={handleReset} block>
              Create Another
            </Button>
          </Space>
        </div>
      )}
    </Modal>
  );
};

export default Certificate_Modal;
