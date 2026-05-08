import React from "react";
import { Table, Tag, Button } from "antd";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft, FaUserMd } from "react-icons/fa";
import "./QueueScreen.css";

const QueueScreen = () => {
  const navigate = useNavigate();
  const [queueData, setQueueData] = React.useState([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchQueue = async () => {
      try {
          const baseURL = process.env.REACT_APP_BASE_URL;
          if (!baseURL) throw new Error("REACT_APP_BASE_URL is not defined in .env");
        const response = await fetch(
          `${baseURL}/public/queue`,
        );
        const data = await response.json();
        setQueueData(data);
        setLoading(false);
      } catch (err) {
        console.error("Failed to fetch queue:", err);
        setLoading(false);
      }
    };

    fetchQueue();
    // Refresh every 5 seconds for live feel
    const interval = setInterval(fetchQueue, 5000);
    return () => clearInterval(interval);
  }, []);

  const columns = [
    {
      title: "Queue #",
      dataIndex: "id",
      key: "id",
      render: (text) => <span className="queue-number">#{text}</span>,
    },
    {
      title: "Patient Name",
      dataIndex: "patient_name",
      key: "patient_name",
      render: (text) => <strong>{text}</strong>,
    },
    {
      title: "Department",
      dataIndex: "patient_dept",
      key: "patient_dept",
    },
    {
      title: "Priority",
      dataIndex: "priority",
      key: "priority",
      render: (priority) => {
        let color = "green";
        if (priority === "Urgent") color = "gold";
        if (priority === "Emergency") color = "red";
        return (
          <Tag color={color} className="priority-tag">
            {priority.toUpperCase()}
          </Tag>
        );
      },
    },
    {
      title: "Assigned Doctor",
      dataIndex: "doctor_name",
      key: "doctor_name",
      render: (text) => (
        <span className="doctor-info">
          {text ? (
            <>
              <FaUserMd style={{ marginRight: "5px", color: "#1677ff" }} />{" "}
              {text}
            </>
          ) : (
            <span style={{ color: "#999", fontStyle: "italic" }}>
              Waiting for assignment...
            </span>
          )}
        </span>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = "blue";
        let label = status;
        if (status === "Assigned") {
          color = "green";
          label = "IN CONSULTATION";
        }
        return (
          <Tag color={color} className="status-tag">
            {label.toUpperCase()}
          </Tag>
        );
      },
    },
  ];

  return (
    <div className="queue-container">
      <div className="queue-nav">
        <Button
          icon={<FaArrowLeft />}
          onClick={() => navigate("/")}
          className="back-btn"
        >
          Back to Portal
        </Button>
      </div>

      <div className="queue-content">
        <div className="queue-header">
          <h1>AASTU SHMS - Live Patient Queue</h1>
          <p>
            Real-time status of current consultations. Priority cases are
            handled first.
          </p>
        </div>

        <div className="queue-table-card">
          <Table
            dataSource={queueData}
            columns={columns}
            pagination={false}
            loading={loading}
            rowKey="id"
            className="custom-table"
          />
        </div>

        <div className="queue-footer">
          <div className="info-item">
            <span className="dot online"></span> Live Updates Active
          </div>
          <div className="info-item">
            Please wait in the lounge until your name is called.
          </div>
        </div>
      </div>
    </div>
  );
};

export default QueueScreen;
