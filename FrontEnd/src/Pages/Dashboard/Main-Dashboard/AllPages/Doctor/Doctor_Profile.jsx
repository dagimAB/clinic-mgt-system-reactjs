import React, { useEffect, useState } from "react";
import "./CSS/Doctor_Profile.css";
import { BiTime } from "react-icons/bi";
import { GiAges, GiMeditation } from "react-icons/gi";
import { MdEmail } from "react-icons/md";
import { BsFillTelephoneFill } from "react-icons/bs";
import { BsHouseFill, BsGenderAmbiguous } from "react-icons/bs";
import { FaRegHospital, FaMapMarkedAlt, FaBirthdayCake } from "react-icons/fa";
import Sidebar from "../../GlobalFiles/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { message, Modal, Descriptions, Input, Tag, Button, Card, Row, Col } from "antd";

// Import Actions
import { UpdateDoctor } from "../../../../../Redux/auth/action";
import { GetDoctorDetails } from "../../../../../Redux/Datas/action";
import { Navigate } from "react-router-dom";
import { RiUserHeartLine } from "react-icons/ri"; // Changed icon for Doctor
import { KeyOutlined } from "@ant-design/icons";
import profile from "../../../../../img/profile.png"; 

const DoctorProfile = () => {
  const { data } = useSelector((store) => store.auth);

  const dispatch = useDispatch();
  const { doctors } = useSelector((store) => store.data.doctors);
  
  // Find the specific doctor from the list of doctors using ID
  const doctor = doctors?.find((doc) => data?.user?.id === doc?.id) || data?.user || {};

  useEffect(() => {
    dispatch(GetDoctorDetails());
  }, [dispatch]);

  const dobString = doctor?.dob;
  const formattedDob = dobString ? new Date(dobString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }) : "N/A";

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [confirmLoading, setConfirmLoading] = useState(false);

  // Form Data for Edit Profile
  const [editFormData, setEditFormData] = useState({
    name: "",
    email: "",
    phonenum: "",
    address: ""
  });

  const showModal = () => {
    setFormData({
      oldPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    });
    setOpen(true);
  };

  const showEditModal = () => {
    setEditFormData({
        name: doctor.name || "",
        email: doctor.email || "",
        phonenum: doctor.phonenum || "",
        address: doctor.address || ""
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

    // Reuse UpdateDoctor for password change as well if supported or reuse UpdateAdmin action logic if it's generic enough
    // But backend for doctors has specific password update logic in UpdateDoctor action? 
    // Wait, UpdateDoctor action calls PATCH /doctors/:id which handles password too.
    
    dispatch(
        UpdateDoctor(
        data.user.id,
        { 
          // oldPassword might not be checked by Doctor backend route? 
          // Backend route: const { password, ...profileUpdates } = req.body;
          // Logic: await updatePass(password, id);
          // It doesn't seem to check old password. 
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
      dispatch(UpdateDoctor(doctor.id || data.user.id, editFormData, data.token))
      .then((res) => {
        setConfirmLoading(false);
        if(res && res.message === "profile updated") {
            success("Profile details updated!");
            dispatch(GetDoctorDetails()); // Refresh data
            setEditOpen(false);
        } else {
            error("Failed to update profile.");
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
      {contextHolder}
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar" style={{ padding: "40px" }}>
          <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h1 style={{ color: '#1a237e', marginBottom: '30px', fontSize: '32px' }}>Doctor Profile</h1>
                <Button type="default" onClick={showEditModal} icon={<RiUserHeartLine />}>Edit Details</Button>
            </div>
            
            <Row gutter={[24, 24]}>
              {/* Left Column: Main Profile Card */}
              <Col xs={24} lg={10}>
                <Card 
                  className="profile-card"
                  style={{ borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  bodyStyle={{ padding: '40px 24px' }}
                >
                  <img src={profile} alt="doctor" style={{ width: '160px', height: '160px', borderRadius: '50%', border: '4px solid #f0f2f5', marginBottom: '15px' }} />
                  <h2 style={{ fontSize: '24px', margin: '0' }}>{doctor.name || "Doctor"}</h2>
                  <Tag color="blue" style={{ fontSize: '14px', padding: '2px 10px', marginTop: '10px' }}> Medical Specialist </Tag>
                  
                  <div style={{ marginTop: '30px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', color: '#555' }}>
                      <RiUserHeartLine style={{ fontSize: '20px', marginRight: '12px', color: '#1a237e' }} />
                      <span><strong>ID:</strong> {doctor.id || data?.user?.id}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', color: '#555' }}>
                      <MdEmail style={{ fontSize: '20px', marginRight: '12px', color: '#1a237e' }} />
                      <span>{doctor.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#555' }}>
                      <BsFillTelephoneFill style={{ fontSize: '20px', marginRight: '12px', color: '#1a237e' }} />
                      <span>{doctor.phonenum || "N/A"}</span>
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
                      <Descriptions.Item label="Specialization">
                        {doctor.education || "General Practitioner"}
                      </Descriptions.Item>
                       <Descriptions.Item label="Department">
                        {doctor.department || "General"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Campus Address">
                        {doctor.address || "Addis Ababa Science and Technology University"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Date of Birth">
                        {formattedDob}
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>

                  {/* Institution Details Card */}
                  <Card title="Hospital & Institutional Details" style={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <BiTime style={{ fontSize: '20px', marginRight: '15px', color: '#ff6f6f' }} />
                        <span><strong>Service Timing:</strong> 09:00 AM - 08:00 PM (LST)</span>
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
               </div>
            </Modal>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorProfile;
