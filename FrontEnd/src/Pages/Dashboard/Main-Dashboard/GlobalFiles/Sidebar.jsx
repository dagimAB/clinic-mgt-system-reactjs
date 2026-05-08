import React, { useState } from "react";
import { AiOutlineUserAdd } from "react-icons/ai";
import { FaUsers } from "react-icons/fa";
import { FaRobot } from "react-icons/fa";
import { BsBookmarkPlus, BsFillBookmarkCheckFill } from "react-icons/bs";
import { CgProfile } from "react-icons/cg";
import { TbReportMedical } from "react-icons/tb";
import { NavLink, Link } from "react-router-dom";
import { ImMenu } from "react-icons/im";
import { FiLogOut } from "react-icons/fi";
import { MdDashboard, MdSettings, MdAnalytics } from "react-icons/md";
import { MdOutlineAssignment } from "react-icons/md";
import { GiMicroscope } from "react-icons/gi";
import { useDispatch, useSelector } from "react-redux";
import { authLogout } from "../../../../Redux/auth/action";
import { HistoryOutlined } from "@ant-design/icons";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const dispatch = useDispatch();

  const {
    data: { user },
  } = useSelector((state) => state.auth);

  function toggle() {
    setIsOpen(!isOpen);
  }

  return (
    <>
      <div>
        <div style={{ width: isOpen ? "200px" : "70px" }} className={`sidebar`}>
          <div className="top_section">
            <h1 style={{ display: isOpen ? "block" : "none" }} className="logo">
              AASTU SHMS
            </h1>
            <div
              style={{ marginLeft: isOpen ? "12px" : "0px" }}
              className="bars"
            >
              <ImMenu
                onClick={toggle}
                style={{ cursor: "pointer" }}
                role="button"
                tabIndex={0}
                aria-label={isOpen ? "Collapse navigation" : "Expand navigation"}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    toggle();
                  }
                }}
              />
            </div>
          </div>
          <div className="bottomSection">
            <NavLink className="link" to={"/dashboard"}>
              <div className="icon">
                <MdDashboard className="mainIcon" />
              </div>
              <div
                style={{ display: isOpen ? "block" : "none" }}
                className="link_text"
              >
                DashBoard
              </div>
            </NavLink>
            <NavLink className="link" to={"/ai-assistant"}>
              <div className="icon">
                <FaRobot className="mainIcon" />
              </div>
              <div
                style={{ display: isOpen ? "block" : "none" }}
                className="link_text"
              >
                AI Assistant
              </div>
            </NavLink>
            {user?.userType === "patient" ? (
              <>
                <NavLink className="link" to={"/patientprofile"}>
                  <div className="icon">
                    <CgProfile className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Profile
                  </div>
                </NavLink>
                <NavLink className="link" to={"/bookappointment"}>
                  <div className="icon">
                    <BsBookmarkPlus className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Book Appointment
                  </div>
                </NavLink>
              </>
            ) : null}
            {user?.userType === "admin" ? (
              <>
                <NavLink className="link" to={"/addstaff"}>
                  <div className="icon">
                    <AiOutlineUserAdd className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Add Staff
                  </div>
                </NavLink>
                <NavLink className="link" to={"/managestaff"}>
                  <div className="icon">
                    <FaUsers className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Manage Staff
                  </div>
                </NavLink>
                <NavLink className="link" to={"/adminprofile"}>
                  <div className="icon">
                    <CgProfile className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Profile
                  </div>
                </NavLink>
                <NavLink className="link" to={"/systemsetup"}>
                  <div className="icon">
                    <MdSettings className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    System Settings
                  </div>
                </NavLink>
                <NavLink className="link" to={"/auditlogs"}>
                  <div className="icon">
                    <HistoryOutlined className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Audit Logs
                  </div>
                </NavLink>
                <NavLink className="link" to={"/analytics"}>
                  <div className="icon">
                    <MdAnalytics className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Analytics & Reports
                  </div>
                </NavLink>
              </>
            ) : null}
            {user?.userType === "doctor" ? (
              <>
                <NavLink className="link" to={"/doctorprofile"}>
                  <div className="icon">
                    <CgProfile className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Profile
                  </div>
                </NavLink>
                <NavLink className="link" to={"/patientdetails"}>
                  <div className="icon">
                    <FaUsers className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Patients
                  </div>
                </NavLink>
                <NavLink className="link" to={"/doctor/queue"}>
                  <div className="icon">
                    <MdOutlineAssignment className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Patient Queue
                  </div>
                </NavLink>
                <NavLink className="link" to={"/doctor/lab"}>
                  <div className="icon">
                    <GiMicroscope className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Lab Dashboard
                  </div>
                </NavLink>
                <NavLink className="link" to={"/doctor/appointments"}>
                  <div className="icon">
                    <BsFillBookmarkCheckFill className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    My Appointments
                  </div>
                </NavLink>
                <NavLink className="link" to={"/certificates"}>
                  <div className="icon">
                    <TbReportMedical className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Certificates
                  </div>
                </NavLink>
              </>
            ) : null}

            {user?.userType === "lab_technologist" ? (
              <>
                <NavLink className="link" to={"/lab/pending"}>
                  <div className="icon">
                    <MdOutlineAssignment className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Pending Tests
                  </div>
                </NavLink>
                <NavLink className="link" to={"/lab/history"}>
                  <div className="icon">
                    <GiMicroscope className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Lab History
                  </div>
                </NavLink>
                <NavLink className="link" to={"/labtechprofile"}>
                  <div className="icon">
                    <CgProfile className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                   Profile
                  </div>
                </NavLink>
              </>
            ) : null}
            {user?.userType === "nurse" ? (
              <>
                <NavLink className="link" to={"/nurseprofile"}>
                  <div className="icon">
                    <CgProfile className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Profile
                  </div>
                </NavLink>
                <NavLink className="link" to={"/registration"}>
                  <div className="icon">
                    <AiOutlineUserAdd className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Registration
                  </div>
                </NavLink>
                <NavLink
                  className="link"
                  to={"/queuemanagement"}
                >
                  <div className="icon">
                    <FaUsers className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Queue Management
                  </div>
                </NavLink>
                <NavLink
                  className="link"
                  to={"/appointments"}
                >
                  <div className="icon">
                    <BsBookmarkPlus className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Appointments
                  </div>
                </NavLink>
                <NavLink
                  className="link"
                  to={"/certificates"}
                >
                  <div className="icon">
                    <TbReportMedical className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Certificates
                  </div>
                </NavLink>
              </>
            ) : null}

            {user?.userType !== "admin" && 
            user?.userType !== "lab_technologist" && 
            user?.userType !== "nurse" &&
            user?.userType !== "doctor" ? (
              <>
                <NavLink className="link" to={"/checkappointment"}>
                  <div className="icon">
                    <BsFillBookmarkCheckFill className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    My Appointments
                  </div>
                </NavLink>
                <NavLink className="link" to={"/certificates"}>
                  <div className="icon">
                    <TbReportMedical className="mainIcon" />
                  </div>
                  <div
                    style={{ display: isOpen ? "block" : "none" }}
                    className="link_text"
                  >
                    Certificates
                  </div>
                </NavLink>
              </>
            ) : null}

            <Link
              className="LogOutPath link"
              onClick={() => {
                dispatch(authLogout());
              }}
              to={"/"}
            >
              <div className="icon">
                <FiLogOut />
              </div>
              <div
                style={{ display: isOpen ? "block" : "none" }}
                className="link_text"
              >
                Logout
              </div>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
