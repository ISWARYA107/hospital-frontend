import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'https://hospital-backend-ue0o.onrender.com/api';

function DoctorDashboard({ user, onLogout }) {
  const [doctorId, setDoctorId] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [admittedPatients, setAdmittedPatients] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [decision, setDecision] = useState('OP');
  const [diagnosis, setDiagnosis] = useState('');
  const [prescription, setPrescription] = useState('');
  const [rooms, setRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const getDoctorId = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/doctor-id/${user.id}`);
      if (res.data.doctorId) {
        setDoctorId(res.data.doctorId);
        loadAppointments(res.data.doctorId);
        loadAdmittedPatients(res.data.doctorId);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  }, [user.id]);

  const loadAppointments = async (id) => {
    try {
      const res = await axios.get(`${API}/doctor-appointments/${id}`);
      setAppointments(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadAdmittedPatients = async (id) => {
    try {
      const res = await axios.get(`${API}/admitted-patients/${id}`);
      setAdmittedPatients(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const loadRooms = async () => {
    try {
      const res = await axios.get(`${API}/rooms`);
      setRooms(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  useEffect(() => {
    getDoctorId();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openModal = (appointment) => {
    setSelectedAppointment(appointment);
    setShowModal(true);
    loadRooms();
    setMessage('');
  };

  const submitDecision = async () => {
    if (decision === 'IP' && !selectedRoom) {
      setMessage('Please select a room');
      setMessageType('error');
      return;
    }

    const data = { 
      appointmentId: selectedAppointment.id, 
      decision, 
      diagnosis,
      doctorId: doctorId
    };
    
    if (decision === 'OP') {
      data.prescription = prescription;
    } else {
      data.roomId = selectedRoom;
      data.treatment = diagnosis;
    }
    
    try {
      const res = await axios.post(`${API}/doctor-decision`, data);
      if (res.data.success) {
        alert(res.data.message);
        setShowModal(false);
        if (doctorId) {
          loadAppointments(doctorId);
          loadAdmittedPatients(doctorId);
        }
        setDiagnosis('');
        setPrescription('');
        setSelectedRoom('');
      } else {
        setMessage(res.data.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Failed to submit');
      setMessageType('error');
    }
  };

  const dischargePatient = async (inpatientId) => {
    if (window.confirm('Are you sure you want to discharge this patient?')) {
      try {
        const res = await axios.put(`${API}/discharge/${inpatientId}`, { doctorId });
        if (res.data.success) {
          alert('Patient discharged successfully');
          loadAdmittedPatients(doctorId);
        } else {
          alert(res.data.message);
        }
      } catch (error) {
        if (error.response && error.response.status === 403) {
          alert('You can only discharge patients you admitted');
        } else {
          alert('Failed to discharge patient');
        }
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">Doctor Dashboard</div>
          <div className="navbar-right">
            <div className="user-info">Dr. {user.name}</div>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-number">{appointments.length}</div>
            <div className="stat-label">Pending Appointments</div>
          </div>
          <div className="stat-card">
            <div className="stat-number">{admittedPatients.length}</div>
            <div className="stat-label">My Admitted Patients</div>
          </div>
        </div>

        <div className="grid-2">
          <div className="card">
            <div className="card-title">Pending Appointments</div>
            {appointments.length === 0 ? (
              <div className="empty-state">No pending appointments</div>
            ) : (
              <div className="appointment-list">
                {appointments.map(app => (
                  <div key={app.id} className="appointment-item pending">
                    <div className="appointment-header">
                      <span className="appointment-doctor">{app.patient_name}</span>
                      <span className="appointment-status status-pending">Pending</span>
                    </div>
                    <div className="appointment-details">
                      <div className="detail">Date: {app.appointment_date}</div>
                      <div className="detail">Time: {app.appointment_time}</div>
                      <div className="detail">Phone: {app.phone}</div>
                    </div>
                    <button className="btn" onClick={() => openModal(app)}>Start Consultation</button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card">
            <div className="card-title">My Admitted Patients</div>
            {admittedPatients.length === 0 ? (
              <div className="empty-state">No admitted patients under your care</div>
            ) : (
              <div className="appointment-list">
                {admittedPatients.map(patient => (
                  <div key={patient.id} className="appointment-item">
                    <div className="appointment-header">
                      <span className="appointment-doctor">{patient.patient_name}</span>
                      <span className="appointment-status status-completed">Admitted</span>
                    </div>
                    <div className="appointment-details">
                      <div className="detail">Room: {patient.room_number}</div>
                      <div className="detail">Admitted: {patient.admission_date}</div>
                      <div className="detail">Diagnosis: {patient.diagnosis}</div>
                    </div>
                    <button className="btn btn-secondary" onClick={() => dischargePatient(patient.id)}>
                      Discharge Patient
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="modal" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">Patient Consultation</div>
            <p><strong>Patient:</strong> {selectedAppointment?.patient_name}</p>
            
            <label className="form-label">Diagnosis</label>
            <textarea className="form-textarea" rows="2" value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)}></textarea>
            
            <label className="form-label">Decision</label>
            <select className="form-select" value={decision} onChange={(e) => setDecision(e.target.value)}>
              <option value="OP">Out-Patient (Give medicine and go home)</option>
              <option value="IP">In-Patient (Admit to hospital)</option>
            </select>
            
            {decision === 'OP' ? (
              <>
                <label className="form-label">Prescription</label>
                <textarea className="form-textarea" rows="3" value={prescription} onChange={(e) => setPrescription(e.target.value)} placeholder="Enter medicine details"></textarea>
              </>
            ) : (
              <>
                <label className="form-label">Select Room</label>
                <select className="form-select" value={selectedRoom} onChange={(e) => setSelectedRoom(e.target.value)}>
                  <option value="">Choose a room</option>
                  {rooms.map(room => <option key={room.id} value={room.id}>Room {room.room_number} - {room.room_type}</option>)}
                </select>
              </>
            )}
            
            {message && <div className={`message message-${messageType}`}>{message}</div>}
            
            <div className="modal-buttons">
              <button className="btn" onClick={submitDecision}>Submit</button>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DoctorDashboard;