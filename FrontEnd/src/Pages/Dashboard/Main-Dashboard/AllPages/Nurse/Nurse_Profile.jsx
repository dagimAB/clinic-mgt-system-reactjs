import React, { useEffect, useState } from "react";
import "../Doctor/CSS/Doctor_Profile.css";
import { BiTime } from "react-icons/bi";
import { MdEmail } from "react-icons/md";
import { BsFillTelephoneFill } from "react-icons/bs";
import { FaRegHospital, FaMapMarkedAlt } from "react-icons/fa";
import Sidebar from "../../GlobalFiles/Sidebar"; // All dashboard pages seem to use Sidebar
import { useDispatch, useSelector } from "react-redux";
import { message, Modal, Descriptions, Input, Tag, Button, Card, Row, Col } from "antd";

import { UpdateNurse } from "../../../../../Redux/auth/action";
import { Navigate } from "react-router-dom";
import { RiEmpathizeLine } from "react-icons/ri"; // Nurse icon
import { KeyOutlined } from "@ant-design/icons";
import profile from "../../../../../img/profile.png"; 

const NurseProfile = () => {
  const { data } = useSelector((store) => store.auth);
  // We rely on auth data here since UpdateNurse updates it directly
  const nurse = data?.user || {};

  const dispatch = useDispatch();

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Form Data for Edit Profile
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phonenum: "",
    address: "",
    qualification: ""
  });

  const showModal = () => {
    setFormData({
      newPassword: "",
      confirmNewPassword: "",
    });
    setOpen(true);
  };

  const showEditModal = () => {
    setEditFormData({
        name: nurse.name || "",
        email: nurse.email || "",
        phonenum: nurse.phonenum || "",
        address: nurse.address || "",
        qualification: nurse.qualification || ""
    });
    setEditOpen(true);
  };

  const handleOk = () => {
    setConfirmLoading(true);
    setTimeout(() => {
      setOpen(false);
      setConfirmLoading(false);
    }, 2000);
  };

  const [messageApi, contextHolder] = message.useMessage();

  const success = (text) => {
    messageApi.success(text);
  };

  const error = (text) => {
    messageApi.error(text);
  };

  const handleCancel = () => {
    setOpen(false);
    setEditOpen(false);
  };

  const [formData, setFormData] = useState({
    newPassword: "",
    confirmNewPassword: ""
  });

  const handleFormChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  
  const handleEditFormChange = (e) => {
    setEditFormData({ ...editFormData, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = () => {
    if (formData.newPassword !== formData.confirmNewPassword) {
      return error("Passwords do not match");
    }

    dispatch(
        UpdateNurse(
        nurse.id,
        { 
          password: formData.newPassword 
        },
        data.token
      )
    ).then((res) => {
        if (res?.message === "password updated") {
        success("Password updated successfully");
        handleOk();
      } else {
        error(res?.message || "Something went wrong.");
      }
    });
  };

  const handleEditSubmit = () => {
      setConfirmLoading(true);
      dispatch(UpdateNurse(nurse.id, editFormData, data.token))
      .then((res) => {
        setConfirmLoading(false);
        if(res && res.message === "profile updated") {
            success("Profile details updated!");
            setEditOpen(false);
        } else {
            error("Failed to update profile.");
        }
      });
  };

  if (data?.isAuthenticated === false) {
    return <Navigate to={"/"} />;
  }

  if (data?.user.userType !== "nurse") {
    return <Navigate to={"/dashboard"} />;
  }

  return (
    <>
      {contextHolder}
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar" style={{ padding: "40px" }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: '#1a237e', marginBottom: '30px', fontSize: '32px' }}>Nurse Profile</h1>
                <Button type="default" onClick={showEditModal} icon={<RiEmpathizeLine />}>Edit Details</Button>
            </div>
            
            <Row gutter={[24, 24]}>
              {/* Left Column: Main Profile Card */}
              <Col xs={24} lg={10}>
                <Card 
                  className="profile-card"
                  style={{ borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  bodyStyle={{ padding: '40px 24px' }}
                >
                  <img src={profile} alt="nurse" style={{ width: '160px', height: '160px', borderRadius: '50%', border: '4px solid #f0f2f5', marginBottom: '15px' }} />
                  <h2 style={{ fontSize: '24px', margin: '0' }}>{nurse.name || "Nurse"}</h2>
                  <Tag color="cyan" style={{ fontSize: '14px', padding: '2px 10px', marginTop: '10px' }}> Registered Nurse </Tag>
                  
                  <div style={{ marginTop: '30px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', color: '#555' }}>
                      <RiEmpathizeLine style={{ fontSize: '20px', marginRight: '12px', color: '#1a237e' }} />
                      <span><strong>ID:</strong> {nurse.id}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', color: '#555' }}>
                      <MdEmail style={{ fontSize: '20px', marginRight: '12px', color: '#1a237e' }} />
                      <span>{nurse.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#555' }}>
                      <BsFillTelephoneFill style={{ fontSize: '20px', marginRight: '12px', color: '#1a237e' }} />
                      <span>{nurse.phonenum || "N/A"}</span>
                    </div>
                  </div>

                  <Button 
                    type="primary" 
                    icon={<KeyOutlined />} 
                    onClick={showModal}
                    size="large"
                    style={{ marginTop: '40px', width: '100%', borderRadius: '10px', height: '45px' }}
                  >
                    Change Password
                  </Button>
                </Card>
              </Col>

              {/* Right Column: Information Cards */}
              <Col xs={24} lg={14}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Detailed Info Card */}
                  <Card title="Professional Information" style={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Descriptions column={1} labelStyle={{ fontWeight: 'bold', color: '#666' }}>
                      <Descriptions.Item label="Qualification">
                        {nurse.qualification || "Nursing Degree"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Campus Address">
                        {nurse.address || "Addis Ababa Science and Technology University"}
                      </Descriptions.Item>
                       <Descriptions.Item label="Age">
                        {nurse.age || "N/A"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Gender">
                        {nurse.gender || "N/A"}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  {/* Institution Details Card */}
                  <Card title="Hospital & Institutional Details" style={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <BiTime style={{ fontSize: '20px', marginRight: '15px', color: '#ff6f6f' }} />
                        <span><strong>Service Timing:</strong> 24/7 Shift Basis</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FaRegHospital style={{ fontSize: '20px', marginRight: '15px', color: '#7bda82' }} />
                        <span><strong>Facility:</strong> AASTU Student Health Center</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <FaMapMarkedAlt style={{ fontSize: '20px', marginRight: '15px', color: '#4f33ea' }} />
                        <span><strong>Location:</strong> Addis Ababa, Ethiopia</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </Col>
            </Row>

            <Modal
              title="CHANGE PASSWORD"
              open={open}
              onOk={handleFormSubmit}
              confirmLoading={confirmLoading}
              onCancel={handleCancel}
              okText="Update Password"
              cancelText="Cancel"
            >
              <div style={{ padding: '10px 0' }}>
                <p style={{ marginBottom: '20px', color: '#666' }}>Please enter your new password to secure your account.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <Input.Password
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleFormChange}
                    placeholder="New Password"
                    size="large"
                  />
                  <Input.Password
                    name="confirmNewPassword"
                    value={formData.confirmNewPassword}
                    onChange={handleFormChange}
                    placeholder="Confirm New Password"
                    size="large"
                  />
                </div>
              </div>
            </Modal>
            
            <Modal
              title="EDIT PROFILE DETAILS"
              open={editOpen}
              onOk={handleEditSubmit}
              confirmLoading={confirmLoading}
              onCancel={handleCancel}
              okText="Save Changes"
              cancelText="Cancel"
            >
               <div style={{ padding: '10px 0', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <div>
                      <label>Full Name</label>
                      <Input name="name" value={editFormData.name} onChange={handleEditFormChange} placeholder="Full Name" />
                  </div>
                  <div>
                      <label>Email</label>
                      <Input name="email" value={editFormData.email} onChange={handleEditFormChange} placeholder="Email" />
                  </div>
                  <div>
                      <label>Phone Number</label>
                      <Input name="phonenum" value={editFormData.phonenum} onChange={handleEditFormChange} placeholder="Phone Number" />
                  </div>
                  <div>
                      <label>Address</label>
                      <Input name="address" value={editFormData.address} onChange={handleEditFormChange} placeholder="Campus Address" />
                  </div>
                   <div>
                      <label>Qualification</label>
                      <Input name="qualification" value={editFormData.qualification} onChange={handleEditFormChange} placeholder="Qualification" />
                  </div>
               </div>
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
};

export default NurseProfile;
