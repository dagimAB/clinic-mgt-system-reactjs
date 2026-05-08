import React, { useEffect, useState } from "react";
import "../Doctor/CSS/Doctor_Profile.css";
import { BiTime } from "react-icons/bi";
import { GiAges, GiMeditation } from "react-icons/gi";
import { MdEmail } from "react-icons/md";
import { BsFillTelephoneFill } from "react-icons/bs";
import { BsHouseFill, BsGenderAmbiguous } from "react-icons/bs";
import { FaRegHospital, FaMapMarkedAlt, FaBirthdayCake } from "react-icons/fa";
import Sidebar from "../../GlobalFiles/Sidebar";
import { useDispatch, useSelector } from "react-redux";
import { message, Modal, Descriptions, Input, Tag, Button, Card, Row, Col } from "antd";

// Import UpdateStaffStatus and other actions
import { UpdateAdmin, UpdateStaffStatus } from "../../../../../Redux/auth/action";
import { GetAdminDetails } from "../../../../../Redux/Datas/action";
import { Navigate } from "react-router-dom";
import { RiAdminLine, RiShieldUserLine } from "react-icons/ri";
import { KeyOutlined } from "@ant-design/icons";
import profile from "../../../../../img/profile.png";
import "./CSS/Admin_Profile.css";

const AdminProfile = () => {
  const { data } = useSelector((store) => store.auth);
  // console.log("heree", data); // Commenting out logs
  // console.log(data?.user?.id);

  const dispatch = useDispatch();
  const { admins } = useSelector((store) => store.data.admins);
  const admin = admins?.find((admin) => data?.user?.id === admin?.id) || {};

  useEffect(() => {
    dispatch(GetAdminDetails());
  }, [dispatch]);

  const dobString = admin?.dob;
  const formattedDob = dobString ? new Date(dobString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }) : "N/A";

  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false); // State for Edit Profile Modal
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
        name: admin.name || "",
        email: admin.email || "",
        phonenum: admin.phonenum || "",
        address: admin.address || ""
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

  console.log("admin new pass ", formData.newPassword);
    const handleFormSubmit = () => {
    if (formData.newPassword !== formData.confirmNewPassword) {
      return error("Passwords do not match");
    }

    dispatch(
      UpdateAdmin(
        data.user.id,
        { 
          oldPassword: formData.oldPassword, 
          newPassword: formData.newPassword 
        },
        data.token
      )
    ).then((res) => {
      console.log("Update response:", res);
      if (res?.message === "password updated") {
        success("Password updated successfully");
        handleOk();
      } else if (res?.message === "Incorrect Old Password") {
        error("Incorrect Old Password");
      } else {
        error(res?.message || "Something went wrong.");
      }
    });
  };

  const handleEditSubmit = () => {
      setConfirmLoading(true);
      dispatch(UpdateStaffStatus(admin.id || data.user.id, editFormData))
      .then((res) => {
        setConfirmLoading(false);
        if(res && res.message === "Staff member updated successfully") {
            success("Profile details updated!");
            dispatch(GetAdminDetails()); // Refresh data
            setEditOpen(false);
        } else {
            error("Failed to update profile.");
        }
      });
  };

  if (data?.isAuthenticated === false) {
    return <Navigate to={"/"} />;
  }

  if (data?.user.userType !== "admin") {
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
                <h1 style={{ color: '#1a237e', marginBottom: '30px', fontSize: '32px' }}>Admin Profile</h1>
                <Button type="default" onClick={showEditModal} icon={<RiAdminLine />}>Edit Details</Button>
            </div>
            
            <Row gutter={[24, 24]}>
              {/* Left Column: Main Profile Card */}
              <Col xs={24} lg={10}>
                <Card 
                  className="profile-card"
                  style={{ borderRadius: '20px', textAlign: 'center', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }}
                  bodyStyle={{ padding: '40px 24px' }}
                >
                  <img src={profile} alt="admin" style={{ width: '160px', height: '160px', borderRadius: '50%', border: '4px solid #f0f2f5', marginBottom: '15px' }} />
                  <h2 style={{ fontSize: '24px', margin: '0' }}>{admin.name || "Administrator"}</h2>
                  <Tag color="gold" style={{ fontSize: '14px', padding: '2px 10px', marginTop: '10px' }}>SYSTEM ADMIN</Tag>
                  
                  <div style={{ marginTop: '30px', textAlign: 'left' }}>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', color: '#555' }}>
                      <RiAdminLine style={{ fontSize: '20px', marginRight: '12px', color: '#1a237e' }} />
                      <span><strong>ID:</strong> {admin.id || data?.user?.id}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', marginBottom: '15px', color: '#555' }}>
                      <MdEmail style={{ fontSize: '20px', marginRight: '12px', color: '#1a237e' }} />
                      <span>{admin.email}</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', color: '#555' }}>
                      <BsFillTelephoneFill style={{ fontSize: '20px', marginRight: '12px', color: '#1a237e' }} />
                      <span>{admin.phonenum || "N/A"}</span>
                    </div>
                  </div>

                  <Button 
                    type="primary" 
                    icon={<KeyOutlined />} 
                    onClick={showModal}
                    size="large"
                    style={{ marginTop: '40px', width: '100%', borderRadius: '10px', height: '45px' }}
                  >
                    Security Settings
                  </Button>
                </Card>
              </Col>

              {/* Right Column: Information Cards */}
              <Col xs={24} lg={14}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                  {/* Detailed Info Card */}
                  <Card title="Professional Information" style={{ borderRadius: '15px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
                    <Descriptions column={1} labelStyle={{ fontWeight: 'bold', color: '#666' }}>
                      <Descriptions.Item label="Campus Address">
                        {admin.address || "Addis Ababa Science and Technology University"}
                      </Descriptions.Item>
                      <Descriptions.Item label="Date of Birth">
                        {formattedDob}
                      </Descriptions.Item>
                      <Descriptions.Item label="Employment Status">
                        <Tag color="green">Active</Tag>
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
                <p style={{ marginBottom: '20px', color: '#666' }}>Please enter your current and new password to secure your account.</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  <Input.Password
                    name="oldPassword"
                    value={formData.oldPassword}
                    onChange={handleFormChange}
                    placeholder="Current Password"
                    size="large"
                  />
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


export default AdminProfile;