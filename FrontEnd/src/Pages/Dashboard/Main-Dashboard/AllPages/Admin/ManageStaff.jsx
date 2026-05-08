import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetAllStaff, UpdateStaffStatus, ResetStaffPassword, GetStaffWorkload } from "../../../../../Redux/auth/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import { Table, Tag, Space, Button, Modal, Input, message, Statistic, Row, Col } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined, KeyOutlined, BarChartOutlined } from "@ant-design/icons";
import { Navigate } from "react-router-dom";

const ManageStaff = () => {
  const { data } = useSelector((store) => store.auth);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isWorkloadVisible, setIsWorkloadVisible] = useState(false);
  const [currentStaff, setCurrentStaff] = useState(null);
  const [workloadData, setWorkloadData] = useState(null);
  const [newPassword, setNewPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const fetchStaff = () => {
    setLoading(true);
    GetAllStaff()(null).then(res => {
        console.log("Fetched Staff Data:", res);
        setStaffList(res);
        setLoading(false);
    });
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleStatusToggle = (staff) => {
    UpdateStaffStatus(staff.id, { ...staff, is_active: !staff.is_active })(null).then(res => {
        message.success(`Status updated for ${staff.name}`);
        fetchStaff();
    });
  };

  const showResetModal = (staff) => {
    setCurrentStaff(staff);
    setIsModalVisible(true);
  };

  const showWorkloadModal = (staff) => {
    setCurrentStaff(staff);
    GetStaffWorkload(staff.id)(null).then(res => {
        setWorkloadData(res);
        setIsWorkloadVisible(true);
    });
  };

  const handleResetPassword = () => {
    if (newPassword.length < 8) return message.error("Password must be at least 8 characters");
    ResetStaffPassword(currentStaff.id, newPassword)(null).then(res => {
        message.success("Password reset successfully");
        setIsModalVisible(false);
        setNewPassword("");
    });
  };

  const filteredStaff = staffList?.filter(staff => 
    staff.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.id?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    staff.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (data?.isAuthenticated === false) return <Navigate to={"/"} />;
  if (data?.user?.userType !== "admin") return <Navigate to={"/dashboard"} />;

  const columns = [
    { title: "ID", dataIndex: "id", key: "id" },
    { title: "Name", dataIndex: "name", key: "name", fontWeight: 'bold' },
    { 
        title: "Role", 
        dataIndex: "role", 
        key: "role",
        render: (role) => (
            <Tag color={role === 'DOCTOR' ? 'blue' : role === 'ADMIN' ? 'gold' : 'cyan'}>
                {role}
            </Tag>
        )
    },
    {
        title: "Last Login",
        dataIndex: "last_login",
        key: "last_login",
        render: (date) => date ? new Date(date).toLocaleString() : "Never",
    },
    {
      title: "Status",
      dataIndex: "is_active",
      key: "status",
      render: (isActive) => (
        <Tag color={isActive ? "green" : "red"}>
          {isActive ? "ACTIVE" : "INACTIVE"}
        </Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space size="middle">
          <Button 
            type={record.is_active ? "ghost" : "primary"} 
            onClick={() => handleStatusToggle(record)}
            icon={record.is_active ? <CloseCircleOutlined style={{color: 'red'}} /> : <CheckCircleOutlined />}
            title={record.is_active ? "Deactivate" : "Activate"}
          />
          <Button 
            onClick={() => showResetModal(record)} 
            icon={<KeyOutlined />}
            title="Reset Password"
          />
          <Button 
            type="primary"
            onClick={() => showWorkloadModal(record)} 
            icon={<BarChartOutlined />}
            title="View Workload"
          >
              Stats
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="container" style={{display: 'flex', minHeight: '100vh', backgroundColor: '#f0f2f5'}}>
      <Sidebar />
      <div className="AfterSideBar" style={{ flex: 1, padding: "24px" }}>
        <h1 style={{ marginBottom: "24px", fontSize: '28px', color: '#1a237e', borderBottom: '2px solid #1a237e', paddingBottom: '10px' }}>
            🏥 Staff Management & Performance
        </h1>
        
        <div style={{ marginBottom: '20px', display: 'flex', justifyContent: 'flex-end' }}>
          <Input.Search
            placeholder="Search by Name, ID, or Email..."
            style={{ width: 400 }}
            onChange={(e) => setSearchQuery(e.target.value)}
            allowClear
          />
        </div>
        
        <Table 
            columns={columns} 
            dataSource={filteredStaff} 
            rowKey="id" 
            loading={loading}
            pagination={{ pageSize: 8 }}
            scroll={{ x: 'max-content' }}
            style={{ backgroundColor: 'white', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}
        />

        {/* RESET PASSWORD MODAL */}
        <Modal 
            title={`Reset Password for ${currentStaff?.name}`}
            visible={isModalVisible}
            onOk={handleResetPassword}
            onCancel={() => setIsModalVisible(false)}
        >
          <p>Enter new temporary password for {currentStaff?.id}:</p>
          <Input.Password 
            placeholder="New Password" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
          />
        </Modal>

        {/* WORKLOAD MODAL */}
        <Modal
            title={`Performance Stats: ${currentStaff?.name} (${currentStaff?.role})`}
            visible={isWorkloadVisible}
            onCancel={() => setIsWorkloadVisible(false)}
            footer={[
                <Button key="close" onClick={() => setIsWorkloadVisible(false)}>
                    Close
                </Button>
            ]}
            width={600}
        >
            <div style={{ padding: '20px', textAlign: 'center' }}>
                <Statistic 
                    title={
                        currentStaff?.role === 'DOCTOR' ? "Consultations Completed" :
                        currentStaff?.role === 'NURSE' ? "Patient Registrations" :
                        currentStaff?.role === 'LAB_TECH' ? "Laboratory Tests" : "Verified Actions"
                    } 
                    value={workloadData?.total_reports || 0} 
                    prefix={<BarChartOutlined />} 
                    valueStyle={{ color: '#1a237e', fontSize: '36px' }}
                />
                <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e3f2fd', borderRadius: '8px', textAlign: 'left' }}>
                    <p><strong>Note:</strong> Performance metrics are calculated based on departmental records since the system initialization.</p>
                </div>
            </div>
        </Modal>
      </div>
    </div>
  );
};

export default ManageStaff;
