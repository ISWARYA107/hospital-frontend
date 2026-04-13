import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

function PatientDashboard({ user, onLogout }) {
  const [patientId, setPatientId] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [availableSlots, setAvailableSlots] = useState([]);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('book');

  const loadAppointments = useCallback(async (id) => {
    try {
      const res = await axios.get(`${API}/my-appointments/${id}`);
      setAppointments(res.data);
    } catch (error) {
      console.error('Error loading appointments:', error);
    }
  }, []);

  const getPatientId = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/patient-id/${user.id}`);
      if (res.data.patientId) {
        setPatientId(res.data.patientId);
        loadAppointments(res.data.patientId);
      } else {
        console.error('No patient ID found for user:', user.id);
      }
    } catch (error) {
      console.error('Error getting patient ID:', error);
    }
  }, [user.id, loadAppointments]);

  const loadDoctors = useCallback(async () => {
    try {
      const res = await axios.get(`${API}/doctors`);
      setDoctors(res.data);
    } catch (error) {
      console.error('Error loading doctors:', error);
    }
  }, []);

  const loadAvailableSlots = useCallback(async () => {
    if (!selectedDoctor || !selectedDate) {
      console.log('No doctor or date selected');
      return;
    }
    
    setLoading(true);
    console.log(`Fetching slots for doctor ${selectedDoctor} on date ${selectedDate}`);
    
    try {
      const res = await axios.get(`${API}/available-slots/${selectedDoctor}/${selectedDate}`);
      console.log('Available slots response:', res.data);
      setAvailableSlots(res.data);
      
      if (res.data.length === 0) {
        setMessage('No slots available on this date');
        setMessageType('error');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error loading slots:', error);
      setAvailableSlots([]);
      setMessage('Error loading available slots');
      setMessageType('error');
    }
    setLoading(false);
  }, [selectedDoctor, selectedDate]);

  useEffect(() => {
    getPatientId();
    loadDoctors();
  }, [getPatientId, loadDoctors]);

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      loadAvailableSlots();
    } else {
      setAvailableSlots([]);
    }
  }, [selectedDoctor, selectedDate, loadAvailableSlots]);

  const bookAppointment = async () => {
    if (!selectedDoctor) {
      setMessage('Please select a doctor');
      setMessageType('error');
      return;
    }
    if (!selectedDate) {
      setMessage('Please select a date');
      setMessageType('error');
      return;
    }
    if (!selectedTime) {
      setMessage('Please select a time slot');
      setMessageType('error');
      return;
    }
    
    setLoading(true);
    try {
      await axios.post(`${API}/appointments`, {
        patientId,
        doctorId: selectedDoctor,
        date: selectedDate,
        time: selectedTime,
        notes
      });
      setMessage('Appointment booked successfully!');
      setMessageType('success');
      if (patientId) {
        loadAppointments(patientId);
      }
      setSelectedDate('');
      setSelectedTime('');
      setAvailableSlots([]);
      setNotes('');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Booking error:', error);
      setMessage('Booking failed. Slot might be taken');
      setMessageType('error');
    }
    setLoading(false);
  };

  const cancelAppointment = async (id) => {
    if (window.confirm('Are you sure you want to cancel this appointment?')) {
      try {
        await axios.put(`${API}/cancel-appointment/${id}`);
        if (patientId) {
          loadAppointments(patientId);
        }
        setMessage('Appointment cancelled successfully');
        setMessageType('success');
        setTimeout(() => setMessage(''), 3000);
      } catch (error) {
        console.error('Cancel error:', error);
        setMessage('Failed to cancel appointment');
        setMessageType('error');
      }
    }
  };

  return (
    <div className="dashboard">
      <div className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">Patient Portal</div>
          <div className="navbar-right">
            <div className="user-info">Welcome, {user.name}</div>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="welcome-banner">
          <h1>Hello, {user.name}</h1>
          <p>Manage your appointments and health records from one place</p>
        </div>

        <div className="tabs">
          <button 
            className={`tab ${activeTab === 'book' ? 'active' : ''}`} 
            onClick={() => setActiveTab('book')}
          >
            Book Appointment
          </button>
          <button 
            className={`tab ${activeTab === 'history' ? 'active' : ''}`} 
            onClick={() => setActiveTab('history')}
          >
            My Appointments ({appointments.length})
          </button>
        </div>

        {message && (
          <div className={`message message-${messageType}`} style={{ marginBottom: '20px' }}>
            {message}
          </div>
        )}

        {activeTab === 'book' && (
          <div className="grid-2">
            <div className="card">
              <div className="card-title">Book New Appointment</div>
              
              <div>
                <label className="form-label">Select Doctor</label>
                <select 
                  className="form-select" 
                  value={selectedDoctor} 
                  onChange={(e) => {
                    setSelectedDoctor(e.target.value);
                    setSelectedTime('');
                  }}
                >
                  <option value="">-- Choose a doctor --</option>
                  {doctors.map(doc => (
                    <option key={doc.id} value={doc.id}>
                      Dr. {doc.name} - {doc.specialization}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="form-label">Select Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={selectedDate} 
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSelectedTime('');
                  }} 
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="form-label">Available Time Slots</label>
                {loading ? (
                  <div className="loading">Loading available slots...</div>
                ) : (
                  <div className="slots-grid">
                    {!selectedDoctor ? (
                      <div style={{ padding: '20px', textAlign: 'center', background: '#f1f5f9', borderRadius: '8px' }}>
                        Please select a doctor first
                      </div>
                    ) : !selectedDate ? (
                      <div style={{ padding: '20px', textAlign: 'center', background: '#f1f5f9', borderRadius: '8px' }}>
                        Please select a date first
                      </div>
                    ) : availableSlots.length === 0 ? (
                      <div style={{ padding: '20px', textAlign: 'center', background: '#f1f5f9', borderRadius: '8px' }}>
                        No time slots available on this date
                      </div>
                    ) : (
                      availableSlots.map(slot => (
                        <button
                          key={slot}
                          className={`time-slot ${selectedTime === slot ? 'selected' : ''}`}
                          onClick={() => setSelectedTime(slot)}
                        >
                          {slot}
                        </button>
                      ))
                    )}
                  </div>
                )}
                {selectedDoctor && selectedDate && !loading && availableSlots.length > 0 && (
                  <div style={{ fontSize: '12px', color: '#64748b', marginTop: '8px' }}>
                    Click on a time slot to select it
                  </div>
                )}
              </div>

              <div>
                <label className="form-label">Additional Notes</label>
                <textarea 
                  className="form-textarea" 
                  rows="3" 
                  value={notes} 
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe your symptoms or any special requests"
                />
              </div>

              <button className="btn" onClick={bookAppointment} disabled={loading || !selectedTime}>
                {loading ? 'Processing...' : 'Confirm Appointment'}
              </button>
            </div>

            <div className="info-box">
              <h3>Before Your Visit</h3>
              <ul>
                <li>Arrive 15 minutes before appointment time</li>
                <li>Bring previous medical records if any</li>
                <li>Carry your ID proof</li>
                <li>Cancel at least 24 hours in advance</li>
                <li>Contact hospital for emergency rescheduling</li>
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="card">
            <div className="card-title">My Appointment History</div>
            {appointments.length === 0 ? (
              <div className="empty-state">
                <h3>No Appointments Found</h3>
                <p>You haven't booked any appointments yet</p>
                <button className="btn" onClick={() => setActiveTab('book')}>Book Your First Appointment</button>
              </div>
            ) : (
              <div className="appointment-list">
                {appointments.map(app => (
                  <div key={app.id} className={`appointment-item ${app.status}`}>
                    <div className="appointment-header">
                      <span className="appointment-doctor">Dr. {app.doctor_name}</span>
                      <span className={`appointment-status status-${app.status}`}>
                        {app.status === 'pending' ? 'Pending' : app.status === 'completed' ? 'Completed' : 'Cancelled'}
                      </span>
                    </div>
                    <div className="appointment-details">
                      <div className="detail">Date: {app.appointment_date}</div>
                      <div className="detail">Time: {app.appointment_time}</div>
                      <div className="detail">Specialization: {app.specialization}</div>
                    </div>
                    {app.status === 'pending' && (
                      <button className="btn btn-danger" onClick={() => cancelAppointment(app.id)}>
                        Cancel Appointment
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PatientDashboard;