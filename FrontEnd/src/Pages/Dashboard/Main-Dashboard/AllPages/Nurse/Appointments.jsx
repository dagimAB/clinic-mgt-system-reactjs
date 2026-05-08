import React, { useState, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import Sidebar from "../../GlobalFiles/Sidebar";
import axios from "axios";
import "./CSS/Appointments.css";

const baseURL = process.env.REACT_APP_BASE_URL;
if (!baseURL) throw new Error("REACT_APP_BASE_URL is not defined in .env");

const Appointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    studentID: "",
    patientName: "",
    doctorID: "",
    date: "",
    time: "",
    notes: "",
  });

  const notify = (text) => toast(text);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
  }, []);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get(
        `${baseURL}/nurses/appointments`,
      );
      setAppointments(res.data);
    } catch (error) {
      console.error("Error fetching appointments:", error);
    }
  };

  const fetchDoctors = async () => {
    try {
      const res = await axios.get(
        `${baseURL}/nurses/doctors`,
      );
      setDoctors(res.data);
    } catch (error) {
      notify("Error fetching doctors");
    }
  };

  const handleSearchPatient = async () => {
    if (!formData.studentID.trim()) {
      notify("Please enter a Student ID");
      return;
    }
    try {
      const res = await axios.get(
        `${baseURL}/nurses/patient?studentID=${encodeURIComponent(formData.studentID.trim())}`,
      );
      setFormData({
        ...formData,
        patientName: res.data.name,
        patientID: res.data.id,
      });
      notify("Patient found: " + res.data.name);
    } catch (error) {
      notify("Patient not found");
      setFormData({ ...formData, patientName: "" });
    }
  };

  const handleSchedule = async (e) => {
    e.preventDefault();
    if (
      !formData.patientID ||
      !formData.doctorID ||
      !formData.date ||
      !formData.time
    ) {
      notify("Please fill all required fields");
      return;
    }

    try {
      const appointmentData = {
        patientID: formData.patientID,
        doctorID: formData.doctorID,
        date: formData.date,
        time: formData.time,
        notes: formData.notes || "",
      };

      if (formData.id) {
        // Update existing
        await axios.patch(
          `${baseURL}/nurses/appointments/${formData.id}`,
          appointmentData,
        );
        notify("Appointment updated successfully");
      } else {
        // Create new
        await axios.post(
          `${baseURL}/nurses/appointments`,
          appointmentData,
        );
        notify("Appointment scheduled successfully");
      }

      setShowForm(false);
      setFormData({
        id: null,
        studentID: "",
        patientName: "",
        doctorID: "",
        date: "",
        time: "",
        notes: "",
      });
      fetchAppointments();
    } catch (error) {
      notify("Error saving appointment");
      console.error(error);
    }
  };

  return (
    <div className="container">
      <Sidebar />
      <div className="AfterSideBar">
        <ToastContainer />
        <div className="appointments-header">
          <h1>Appointment Scheduling</h1>
          <button className="schedule-btn" onClick={() => setShowForm(true)}>
            + Schedule Appointment
          </button>
        </div>

        <div className="appointments-list">
          <h3>Scheduled Appointments</h3>
          {appointments.length === 0 ? (
            <p className="empty-msg">No appointments scheduled</p>
          ) : (
            <table className="appointments-table">
              <thead>
                <tr>
                  <th>Patient Name</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Notes</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id}>
                    <td>{apt.patient_name || "N/A"}</td>
                    <td>{apt.doctor_name || "N/A"}</td>
                    <td>{new Date(apt.date).toLocaleDateString()}</td>
                    <td>{apt.time}</td>
                    <td>{apt.notes || apt.problem || "-"}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          className="action-btn checkin-btn"
                          title="Check In to Queue"
                          onClick={async () => {
                            if (
                              window.confirm(
                                `Check in ${apt.patient_name} to the active queue?`,
                              )
                            ) {
                              try {
                                await axios.post(
                                  `${baseURL}/nurses/check-in`,
                                  {
                                    student_id: apt.patientid,
                                    chief_complaint:
                                      "APPOINTMENT: " +
                                      (apt.notes ||
                                        apt.problem ||
                                        "Scheduled Visit"),
                                    priority: "Normal",
                                    doctor_id: apt.doctorid,
                                  },
                                );
                                notify("Patient checked in and sent to Queue!");
                              } catch (err) {
                                notify("Error checking in patient");
                                console.error(err);
                              }
                            }
                          }}
                        >
                          Check In
                        </button>
                        <button
                          className="action-btn edit-btn"
                          onClick={() => {
                            setFormData({
                              id: apt.id,
                              studentID: apt.student_id || "",
                              patientName: apt.patient_name,
                              patientID: apt.patientid,
                              doctorID: apt.doctorid,
                              date: new Date(apt.date)
                                .toISOString()
                                .split("T")[0],
                              time: apt.time,
                              notes: apt.notes || apt.problem || "",
                            });
                            setShowForm(true);
                          }}
                        >
                          Edit
                        </button>
                        <button
                          className="action-btn delete-btn"
                          onClick={async () => {
                            if (
                              window.confirm(
                                "Are you sure you want to delete this appointment?",
                              )
                            ) {
                              try {
                                await axios.delete(
                                  `${baseURL}/nurses/appointments/${apt.id}`,
                                );
                                notify("Appointment deleted");
                                fetchAppointments();
                              } catch (err) {
                                notify("Error deleting appointment");
                              }
                            }
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {showForm && (
          <div className="modal-overlay">
            <div className="modal-content-apt">
              <h2>Schedule New Appointment</h2>
              <form onSubmit={handleSchedule}>
                <div className="form-row">
                  <div className="input-group">
                    <label>Student ID *</label>
                    <div className="search-input">
                      <input
                        placeholder="e.g. ETS0217/15"
                        value={formData.studentID}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            studentID: e.target.value,
                          })
                        }
                      />
                      <button type="button" onClick={handleSearchPatient}>
                        Search
                      </button>
                    </div>
                  </div>
                  {formData.patientName && (
                    <div className="patient-found">
                      <span>✓ Patient: {formData.patientName}</span>
                    </div>
                  )}
                </div>

                <div className="input-group">
                  <label>Select Doctor *</label>
                  <select
                    value={formData.doctorID}
                    onChange={(e) =>
                      setFormData({ ...formData, doctorID: e.target.value })
                    }
                    required
                  >
                    <option value="">-- Choose Doctor --</option>
                    {doctors.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.name} - {doc.department}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-row">
                  <div className="input-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) =>
                        setFormData({ ...formData, date: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="input-group">
                    <label>Time *</label>
                    <input
                      type="time"
                      value={formData.time}
                      onChange={(e) =>
                        setFormData({ ...formData, time: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="input-group">
                  <label>Notes (Optional)</label>
                  <textarea
                    placeholder="Additional notes..."
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                  />
                </div>

                <div className="modal-actions">
                  <button type="submit" className="submit-btn">
                    Schedule Appointment
                  </button>
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setShowForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Appointments;
