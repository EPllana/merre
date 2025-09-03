// src/pages/UploadDocs.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../services/api';

const UploadDocs = () => {
  const [idDocument, setIdDocument] = useState(null);
  const [selfie, setSelfie] = useState(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    if (idDocument) formData.append('idDocument', idDocument);
    if (selfie) formData.append('selfie', selfie);

    try {
      await API.post(`/user/${JSON.parse(localStorage.getItem('user'))?._id}/upload-docs`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setMessage('Dokumentet u ngarkuan me sukses!');
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Ngarkimi dështoi.');
      setMessage('');
    }
  };

  return (
    <div className="container">
      <div className="header">
        <h1>Ngarko Dokumentet</h1>
      </div>

      {message && <p style={{ color: 'green', textAlign: 'center' }}>{message}</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ maxWidth: '500px', margin: '0 auto' }}>
        <div className="form-group">
          <label>Ngarko Dokumentin (ID, Pasaporta)</label>
          <input
            type="file"
            accept="image/*,application/pdf"
            onChange={(e) => setIdDocument(e.target.files[0])}
          />
        </div>

        <div className="form-group">
          <label>Ngarko Selfie me Dokumentin</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setSelfie(e.target.files[0])}
          />
        </div>

        <button type="submit" className="btn btn-primary">Ngarko Dokumentet</button>
      </form>

      <div style={{ textAlign: 'center', marginTop: '20px' }}>
        <button onClick={() => navigate('/dashboard')} className="btn btn-primary">
          Kthehu në Dashboard
        </button>
      </div>
    </div>
  );
};

export default UploadDocs;