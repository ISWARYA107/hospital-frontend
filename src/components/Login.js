import React, { useState } from 'react';
import axios from 'axios';

const API = 'http://localhost:5000/api';

function Login({ onLogin }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('patient');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/login`, { email, password, role });
      if (res.data.success) {
        onLogin(res.data.user);
      } else {
        setMessage(res.data.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Login failed');
      setMessageType('error');
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(`${API}/register`, {
        name, email, password, phone
      });
      if (res.data.success) {
        setMessage('Registration successful! Please login.');
        setMessageType('success');
        setIsLogin(true);
        setName('');
        setEmail('');
        setPassword('');
        setPhone('');
      } else {
        setMessage(res.data.message);
        setMessageType('error');
      }
    } catch (error) {
      setMessage('Registration failed');
      setMessageType('error');
    }
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="login-header">
            <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
            <p>{isLogin ? 'Login to your account' : 'Register as a new patient'}</p>
          </div>

          {isLogin ? (
            <form onSubmit={handleLogin}>
              <div className="form-group">
                <label>Account Type</label>
                <select value={role} onChange={(e) => setRole(e.target.value)} className="form-control">
                  <option value="patient">Patient</option>
                  <option value="doctor">Doctor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  className="form-control"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  className="form-control"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="Enter your password"
                />
              </div>
              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Please wait...' : 'Login'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegister}>
              <div className="form-group">
                <label>Full Name</label>
                <input 
                  type="text" 
                  className="form-control"
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="Enter your full name"
                />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input 
                  type="email" 
                  className="form-control"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  required 
                  placeholder="Enter your email"
                />
              </div>
              <div className="form-group">
                <label>Password</label>
                <input 
                  type="password" 
                  className="form-control"
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  required 
                  placeholder="Create a password"
                />
              </div>
              <div className="form-group">
                <label>Phone Number</label>
                <input 
                  type="tel" 
                  className="form-control"
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)} 
                  required 
                  placeholder="Enter phone number"
                />
              </div>
              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Please wait...' : 'Register'}
              </button>
            </form>
          )}

          {message && (
            <div className={`message ${messageType === 'success' ? 'message-success' : 'message-error'}`}>
              {message}
            </div>
          )}

          <div className="login-footer">
            <p>
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(!isLogin);
                  setMessage('');
                }}
                className="link-btn"
              >
                {isLogin ? 'Register here' : 'Login here'}
              </button>
            </p>
          </div>

          {isLogin && (
            <div className="demo-box">
              <p className="demo-title">Demo Accounts</p>
              <p>Patient: patient@hospital.com / patient123</p>
              <p>Doctor: doctor@hospital.com / doctor123</p>
              <p>Admin: admin@hospital.com / admin123</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;