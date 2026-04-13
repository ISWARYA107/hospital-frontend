import React, { useState } from 'react';
import Login from './components/Login';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import AdminDashboard from './components/AdminDashboard';
import './App.css';

function App() {
  const [user, setUser] = useState(null);

  return (
    <div>
      {!user ? (
        <Login onLogin={setUser} />
      ) : user.role === 'patient' ? (
        <PatientDashboard user={user} onLogout={() => setUser(null)} />
      ) : user.role === 'doctor' ? (
        <DoctorDashboard user={user} onLogout={() => setUser(null)} />
      ) : (
        <AdminDashboard user={user} onLogout={() => setUser(null)} />
      )}
    </div>
  );
}

export default App;