// src/pages/Register.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'user', // ose "worker" nëse dëshiron
    phone: '',
    address: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await API.post('/register', formData);
      setSuccess('Regjistrimi u krye me sukses! Tani mund të kyqesh.');
      setError('');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Regjistrimi dështoi. Provo përsëri.');
      setSuccess('');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Regjistrohu</h1>
      </div>

      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
      {success && <p style={{ color: 'green', textAlign: 'center' }}>{success}</p>}

      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="form-group">
          <label>Emri i plotë</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Fjalëkalimi</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            minLength="6"
          />
        </div>

        <div className="form-group">
          <label>Telefoni</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Adresa</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
          />
        </div>

        <div className="form-group">
          <label>Roli</label>
          <select name="role" value={formData.role} onChange={handleChange}>
            <option value="user">Përdorues</option>
            <option value="worker">Punonjës</option>
          </select>
        </div>

        <button type="submit" className="btn btn-primary">Regjistrohu</button>
      </form>

      <p style={{ textAlign: 'center', marginTop: '20px' }}>
        Ke llogari? <a href="/login">Kyqu këtu</a>
      </p>
    </div>
  );
};

export default Register;