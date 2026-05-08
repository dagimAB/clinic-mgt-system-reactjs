import React, { useState } from "react";
import "./CSS/Add_Doctor.css"; // Reusing existing premium styles
import staff_icon from "../../../../../img/doctoravatar.png";
import { useDispatch, useSelector } from "react-redux";
import { RegisterStaff } from "../../../../../Redux/auth/action";
import Sidebar from "../../GlobalFiles/Sidebar";
import { ToastContainer, toast } from "react-toastify";
import { Navigate } from "react-router-dom";

const notify = (text) => toast(text);
const AddStaff = () => {
  const { data } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);

  const initData = {
    name: "",
    email: "",
    password: "",
    role: "DOCTOR",
    qualification: "",
  };
  const [staffValue, setStaffValue] = useState(initData);

  const handleChange = (e) => {
    setStaffValue({ ...staffValue, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    dispatch(RegisterStaff(staffValue)).then((res) => {
      if (res.message === "Staff member created successfully") {
        notify(`Staff Added Successfully! ID: ${res.staff.id}`);
        setStaffValue(initData);
      } else {
        notify(res.message || "Something went wrong");
      }
      setLoading(false);
    });
  };

  if (data?.isAuthenticated === false) return <Navigate to={"/"} />;
  if (data?.user?.userType !== "admin") return <Navigate to={"/dashboard"} />;

  return (
    <>
      <ToastContainer />
      <div className="container">
        <Sidebar />
        <div className="AfterSideBar">
          <div className="Main_Add_Doctor_div">
            <h1>Add New Staff Member</h1>
            <img src={staff_icon} alt="staff" className="avatarimg" />
            <form onSubmit={handleSubmit}>
              <div>
                <label>Full Name</label>
                <div className="inputdiv">
                  <input
                    type="text"
                    placeholder="e.g. Abebe Kebede"
                    name="name"
                    value={staffValue.name}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label>Email Address</label>
                <div className="inputdiv">
                  <input
                    type="email"
                    placeholder="abc@aastu.edu.et"
                    name="email"
                    value={staffValue.email}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label>Role</label>
                <div className="inputdiv">
                  <select
                    name="role"
                    value={staffValue.role}
                    onChange={handleChange}
                    required
                  >
                    <option value="DOCTOR">Doctor</option>
                    <option value="NURSE">Nurse</option>
                    <option value="LAB_TECH">Lab Technologist</option>
                  </select>
                </div>
              </div>

              <div>
                <label>Qualification</label>
                <div className="inputdiv">
                  <input
                    type="text"
                    placeholder="e.g. MD, Senior Nurse"
                    name="qualification"
                    value={staffValue.qualification}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div>
                <label>Temporary Password</label>
                <div className="inputdiv">
                  <input
                    type="password"
                    placeholder="Min 8 characters"
                    name="password"
                    value={staffValue.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <button type="submit" className="formsubmitbutton">
                {loading ? "Registering..." : "Register Staff"}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AddStaff;
