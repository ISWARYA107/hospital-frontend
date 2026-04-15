import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://hospital-backend-ue0o.onrender.com/api';

function AdminDashboard({ user, onLogout }) {
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('stats');
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', specialization: '', phone: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  // Records state
  const [outpatients, setOutpatients] = useState([]);
  const [inpatients, setInpatients] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [recordsTab, setRecordsTab] = useState('op');

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (activeTab === 'records') {
      if (recordsTab === 'op') {
        loadOutpatients();
      } else {
        loadInpatients();
      }
    }
  }, [activeTab, recordsTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [statsRes, doctorsRes, patientsRes, appointmentsRes, roomsRes] = await Promise.all([
        axios.get(`${API}/admin-stats`),
        axios.get(`${API}/all-doctors`),
        axios.get(`${API}/all-patients`),
        axios.get(`${API}/all-appointments`),
        axios.get(`${API}/all-rooms`)
      ]);
      setStats(statsRes.data);
      setDoctors(doctorsRes.data);
      setPatients(patientsRes.data);
      setAppointments(appointmentsRes.data);
      setRooms(roomsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    }
    setLoading(false);
  };

  const loadOutpatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/outpatients`);
      setOutpatients(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const loadInpatients = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API}/inpatients`);
      setInpatients(res.data);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const handleSearch = async () => {
    if (!searchKeyword.trim()) {
      alert('Please enter a name, email, or phone number');
      return;
    }
    setLoading(true);
    try {
      const res = await axios.get(`${API}/search-patients/${searchKeyword}`);
      setSearchResults(res.data);
      setShowSearch(true);
    } catch (error) {
      console.error('Error:', error);
    }
    setLoading(false);
  };

  const clearSearch = () => {
    setSearchKeyword('');
    setShowSearch(false);
    setSearchResults([]);
  };

  const createDoctor = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/register-doctor`, formData);
      if (res.data.success) {
        setMessage('Doctor created successfully');
        setFormData({ name: '', email: '', password: '', specialization: '', phone: '' });
        loadData();
        setTimeout(() => setMessage(''), 3000);
      } else {
        setMessage(res.data.message);
      }
    } catch (error) {
      setMessage('Failed to create doctor');
    }
    setLoading(false);
  };

  if (loading && Object.keys(stats).length === 0 && activeTab !== 'records') {
    return <div className="loading">Loading...</div>;
  }

  return (
    <div className="dashboard">
      <div className="navbar">
        <div className="navbar-inner">
          <div className="navbar-brand">Admin Panel</div>
          <div className="navbar-right">
            <div className="user-info">Welcome, {user.name}</div>
            <button onClick={onLogout} className="logout-btn">Logout</button>
          </div>
        </div>
      </div>

      <div className="content">
        <div className="tabs">
          <button className={`tab ${activeTab === 'stats' ? 'active' : ''}`} onClick={() => setActiveTab('stats')}>Statistics</button>
          <button className={`tab ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>Doctors</button>
          <button className={`tab ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>Patients</button>
          <button className={`tab ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>Appointments</button>
          <button className={`tab ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>Rooms</button>
          <button className={`tab ${activeTab === 'records' ? 'active' : ''}`} onClick={() => setActiveTab('records')}>OP/IP Records</button>
          <button className={`tab ${activeTab === 'create' ? 'active' : ''}`} onClick={() => setActiveTab('create')}>Add Doctor</button>
        </div>

        {activeTab === 'stats' && (
          <div className="stats-grid">
            <div className="stat-card"><div className="stat-number">{stats.totalDoctors || 0}</div><div className="stat-label">Doctors</div></div>
            <div className="stat-card"><div className="stat-number">{stats.totalPatients || 0}</div><div className="stat-label">Patients</div></div>
            <div className="stat-card"><div className="stat-number">{stats.totalAppointments || 0}</div><div className="stat-label">Appointments</div></div>
            <div className="stat-card"><div className="stat-number">{stats.pendingAppointments || 0}</div><div className="stat-label">Pending</div></div>
            <div className="stat-card"><div className="stat-number">{stats.admittedPatients || 0}</div><div className="stat-label">Admitted</div></div>
            <div className="stat-card"><div className="stat-number">{stats.availableRooms || 0}</div><div className="stat-label">Available Rooms</div></div>
          </div>
        )}

        {activeTab === 'doctors' && (
          <div className="card">
            <div className="card-title">All Doctors</div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Specialization</th><th>Phone</th></tr>
                </thead>
                <tbody>
                  {doctors.map(doc => (
                    <tr key={doc.id}>
                      <td>Dr. {doc.name}</td>
                      <td>{doc.email}</td>
                      <td>{doc.specialization}</td>
                      <td>{doc.phone || '-'}</td>
                    </tr>
                  ))}
                  {doctors.length === 0 && <tr><td colSpan="4" style={{ textAlign: 'center' }}>No doctors found</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'patients' && (
          <div className="card">
            <div className="card-title">All Patients</div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr><th>Name</th><th>Email</th><th>Phone</th></tr>
                </thead>
                <tbody>
                  {patients.map(pat => (
                    <tr key={pat.id}>
                      <td>{pat.name}</td>
                      <td>{pat.email}</td>
                      <td>{pat.phone || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'appointments' && (
          <div className="card">
            <div className="card-title">Recent Appointments</div>
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr><th>Patient</th><th>Doctor</th><th>Date</th><th>Time</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {appointments.map(app => (
                    <tr key={app.id}>
                      <td>{app.patient_name}</td>
                      <td>Dr. {app.doctor_name}</td>
                      <td>{app.appointment_date}</td>
                      <td>{app.appointment_time}</td>
                      <td>{app.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'rooms' && (
          <div className="stats-grid">
            {rooms.map(room => (
              <div key={room.id} className="stat-card">
                <div className="stat-number">Room {room.room_number}</div>
                <div className="stat-label">{room.room_type}</div>
                <div style={{ fontSize: '12px', marginTop: '8px', color: room.status === 'available' ? '#22c55e' : '#ef4444' }}>{room.status}</div>
              </div>
            ))}
          </div>
        )}

        {/* OP/IP RECORDS TAB */}
        {activeTab === 'records' && (
          <div className="records-container">
            {/* Search Bar */}
            <div className="search-bar">
              <input
                type="text"
                className="search-input"
                placeholder="Search patient by name, email, or phone..."
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className="search-btn" onClick={handleSearch}>Search</button>
              {showSearch && (
                <button className="clear-btn" onClick={clearSearch}>Clear</button>
              )}
            </div>

            {/* OP/IP Tabs */}
            <div className="records-tabs">
              <button 
                className={`records-tab ${recordsTab === 'op' ? 'active' : ''}`}
                onClick={() => { setRecordsTab('op'); setShowSearch(false); }}
              >
                Outpatients (OP) - {outpatients.length}
              </button>
              <button 
                className={`records-tab ${recordsTab === 'ip' ? 'active' : ''}`}
                onClick={() => { setRecordsTab('ip'); setShowSearch(false); }}
              >
                Inpatients (IP) - {inpatients.length}
              </button>
            </div>

            {/* Search Results */}
            {showSearch && (
              <div className="search-results">
                <h3>Search Results for "{searchKeyword}"</h3>
                {searchResults.length === 0 ? (
                  <div className="empty-state">No patients found</div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Blood Group</th><th>Total Visits</th></tr>
                      </thead>
                      <tbody>
                        {searchResults.map(patient => (
                          <tr key={patient.id}>
                            <td>{patient.name}</td>
                            <td>{patient.email}</td>
                            <td>{patient.phone || '-'}</td>
                            <td>{patient.blood_group || '-'}</td>
                            <td>{patient.total_visits || 0}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Outpatients List */}
            {!showSearch && recordsTab === 'op' && (
              <div className="records-list">
                <h3>Outpatient Records</h3>
                {loading ? (
                  <div className="loading">Loading...</div>
                ) : outpatients.length === 0 ? (
                  <div className="empty-state">No outpatient records found</div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr><th>Patient Name</th><th>Date</th><th>Time</th><th>Diagnosis</th><th>Medicine</th><th>Follow-up</th></tr>
                      </thead>
                      <tbody>
                        {outpatients.map(patient => (
                          <tr key={patient.id}>
                            <td>{patient.patient_name}</td>
                            <td>{patient.appointment_date}</td>
                            <td>{patient.appointment_time}</td>
                            <td>{patient.diagnosis || '-'}</td>
                            <td>{patient.prescription || '-'}</td>
                            <td>{patient.follow_up_date || '-'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Inpatients List */}
            {!showSearch && recordsTab === 'ip' && (
              <div className="records-list">
                <h3>Inpatient Records</h3>
                {loading ? (
                  <div className="loading">Loading...</div>
                ) : inpatients.length === 0 ? (
                  <div className="empty-state">No inpatient records found</div>
                ) : (
                  <div className="table-wrapper">
                    <table className="table">
                      <thead>
                        <tr><th>Patient Name</th><th>Doctor</th><th>Admission Date</th><th>Discharge Date</th><th>Room</th><th>Status</th></tr>
                      </thead>
                      <tbody>
                        {inpatients.map(patient => (
                          <tr key={patient.id}>
                            <td>{patient.patient_name}</td>
                            <td>Dr. {patient.doctor_name}</td>
                            <td>{patient.admission_date}</td>
                            <td>{patient.discharge_date || 'Still Admitted'}</td>
                            <td>{patient.room_number} ({patient.room_type})</td>
                            <td className={patient.discharge_date ? 'status-completed' : 'status-pending'}>
                              {patient.discharge_date ? 'Discharged' : 'Admitted'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'create' && (
          <div className="card">
            <div className="card-title">Create New Doctor</div>
            <form onSubmit={createDoctor}>
              <input type="text" className="form-input" placeholder="Doctor Name" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              <input type="email" className="form-input" placeholder="Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
              <input type="password" className="form-input" placeholder="Password" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
              <input type="text" className="form-input" placeholder="Specialization" value={formData.specialization} onChange={(e) => setFormData({...formData, specialization: e.target.value})} required />
              <input type="text" className="form-input" placeholder="Phone" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
              <button type="submit" className="btn" disabled={loading}>{loading ? 'Creating...' : 'Create Doctor'}</button>
              {message && <div className={`message message-${message.includes('success') ? 'success' : 'error'}`} style={{ marginTop: '15px' }}>{message}</div>}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;