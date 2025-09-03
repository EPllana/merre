// src/pages/Dashboard.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="container">
      <div className="header">
        <h1>Miresevini, {user?.name || user?.email}</h1>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px' }}>
        <button onClick={() => navigate('/bookings')} className="btn btn-primary" style={{ marginRight: '10px' }}>
          Shiko Rezervimet
        </button>
        <button onClick={() => navigate('/workers')} className="btn btn-primary">
          Gjej Punonjës
        </button>

        <div style={{ marginTop: '30px' }}>
          <button onClick={logout} className="btn btn-danger">
            Çkyçu
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;