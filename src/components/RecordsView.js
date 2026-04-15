import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

function RecordsView() {
  const [activeTab, setActiveTab] = useState('op');
  const [outpatients, setOutpatients] = useState([]);
  const [inpatients, setInpatients] = useState([]);
  const [searchKeyword, setSearchKeyword] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (activeTab === 'op') {
      loadOutpatients();
    } else {
      loadInpatients();
    }
  }, [activeTab]);

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

  return (
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
        <button className="search-btn" onClick={handleSearch}>🔍 Search</button>
        {showSearch && (
          <button className="clear-btn" onClick={clearSearch}>✕ Clear</button>
        )}
      </div>

      {/* Tabs for OP and IP */}
      <div className="records-tabs">
        <button 
          className={`records-tab ${activeTab === 'op' ? 'active' : ''}`}
          onClick={() => { setActiveTab('op'); setShowSearch(false); }}
        >
          Outpatients (OP) - {outpatients.length}
        </button>
        <button 
          className={`records-tab ${activeTab === 'ip' ? 'active' : ''}`}
          onClick={() => { setActiveTab('ip'); setShowSearch(false); }}
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

      {/* Outpatients List (OP) */}
      {!showSearch && activeTab === 'op' && (
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

      {/* Inpatients List (IP) */}
      {!showSearch && activeTab === 'ip' && (
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
  );
}

export default RecordsView;