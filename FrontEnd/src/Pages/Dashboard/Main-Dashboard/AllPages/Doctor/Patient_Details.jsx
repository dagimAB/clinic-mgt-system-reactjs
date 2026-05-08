import { Table, Input, Button, Space, Typography, Card, Tag, Tooltip } from "antd";
import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { Navigate, useNavigate } from "react-router-dom";
import { GetPatients } from "../../../../../Redux/Datas/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import Topbar from "../../GlobalFiles/Topbar";
import { SearchOutlined, EyeOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const Patient_Details = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { data } = useSelector((store) => store.auth);
  const { patients, Loading } = useSelector((store) => store.data);
  const [searchText, setSearchText] = useState("");

  useEffect(() => {
    dispatch(GetPatients());
  }, [dispatch]);

  if (data?.isAuthenticated === false) {
    return <Navigate to={"/"} />;
  }

  if (data?.user.userType !== "doctor") {
    return <Navigate to={"/dashboard"} />;
  }

  // Handle nested structure if any, otherwise default to patients or []
  const patientData = patients?.patients || patients || [];

  const filteredData = patientData.filter((item) => {
    const searchLower = searchText.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      (item.studentid || item.studentID || "").toLowerCase().includes(searchLower) ||
      item.department?.toLowerCase().includes(searchLower)
    );
  });

  const columns = [
    {
      title: "Student ID",
      dataIndex: "studentid",
      key: "studentid",
      render: (text, record) => <Text strong color="blue">{text || record.studentID}</Text>,
      sorter: (a, b) => (a.studentid || a.studentID || "").localeCompare(b.studentid || b.studentID || ""),
    },
    {
      title: "Patient Name",
      dataIndex: "name",
      key: "name",
      render: (text) => (
        <Space>
          <UserOutlined style={{ color: "#1890ff" }} />
          <Text>{text}</Text>
        </Space>
      ),
      sorter: (a, b) => a.name.localeCompare(b.name),
    },
    {
      title: "Department",
      dataIndex: "department",
      key: "department",
    },
    {
      title: "Year",
      dataIndex: "year",
      key: "year",
      render: (year) => <Tag color="cyan">Year {year}</Tag>,
    },
    {
      title: "Blood Group",
      dataIndex: "bloodGroup",
      key: "bloodGroup",
      render: (bg) => <Tag color="volcano">{bg}</Tag>,
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="View Medical History">
            <Button
              type="primary"
              icon={<EyeOutlined />}
              onClick={() => navigate(`/doctor/patient-history/${encodeURIComponent(record.studentid || record.studentID)}`)}
            >
              View History
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="container">
      <Sidebar />
      <div className="AfterSideBar">
        <Topbar />
        <div style={{ padding: "32px", backgroundColor: "#f0f2f5", minHeight: "100vh" }}>
          <Card
            style={{ borderRadius: "12px", boxShadow: "0 4px 12px rgba(0,0,0,0.05)" }}
            title={
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0" }}>
                <Title level={3} style={{ margin: 0 }}>Registered Patients</Title>
                <Input
                  placeholder="Search by Name, ID or Dept..."
                  prefix={<SearchOutlined style={{ color: "rgba(0,0,0,0.45)" }} />}
                  onChange={(e) => setSearchText(e.target.value)}
                  style={{ width: 350, height: 40, borderRadius: "8px" }}
                  allowClear
                />
              </div>
            }
          >
            <Table
              columns={columns}
              dataSource={filteredData}
              loading={Loading}
              rowKey="id"
              pagination={{ pageSize: 10, showSizeChanger: true }}
              style={{ borderRadius: "8px" }}
            />
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Patient_Details;
