// src/pages/Login.jsx
import API from '../services/api';
import { useState } from 'react';

console.log('API instance:', API); // 🟡 Shiko në konsolë në DevTools

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Test thirrjeje (pa dërguar ende)
      console.log('Duke provuar të bëj login...');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={{ padding: 20 }}>
      <h2>Test Login</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ display: 'block', marginBottom: 10 }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ display: 'block', marginBottom: 10 }}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;