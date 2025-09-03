// src/pages/Register.jsx
import React, { useState } from 'react';
import axios from 'axios';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    role: 'user',
  });
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/api/register', formData);
      setMessage('Regjistrimi u krye me sukses!');
      setError('');
      console.log('User i krijuar:', res.data.user);
    } catch (err) {
      setError(err.response?.data?.message || 'Regjistrimi dështoi');
      setMessage('');
    }
  };

  return (
    <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'center' }}>
      <h2>Regjistrohu</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {message && <p style={{ color: 'green' }}>{message}</p>}
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '10px', textAlign: 'left' }}>
          <label>Emri:</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px', textAlign: 'left' }}>
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            required
          />
        </div>
        <div style={{ marginBottom: '10px', textAlign: 'left' }}>
          <label>Fjalëkalimi:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
            required
            minLength="6"
          />
        </div>
        <div style={{ marginBottom: '10px', textAlign: 'left' }}>
          <label>Telefoni:</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px', textAlign: 'left' }}>
          <label>Adresa:</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            style={{ width: '100%', padding: '8px' }}
          />
        </div>
        <div style={{ marginBottom: '10px', textAlign: 'left' }}>
          <label>Roli:</label>
          <select name="role" value={formData.role} onChange={handleChange} style={{ width: '100%', padding: '8px' }}>
            <option value="user">Përdorues</option>
            <option value="worker">Punonjës</option>
          </select>
        </div>
        <button
          type="submit"
          style={{
            backgroundColor: '#28a745',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
          }}
        >
          Regjistrohu
        </button>
      </form>
      <p style={{ marginTop: '20px' }}>
        Ke llogari?{' '}
        <a href="/login" style={{ color: '#007bff' }}>
          Kyqu këtu
        </a>
      </p>
    </div>
  );
};

export default Register;