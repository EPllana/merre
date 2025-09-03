// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import UploadDocs from './pages/UploadDocs';
import Dashboard from './pages/Dashboard';
import Bookings from './pages/Bookings';
import Workers from './pages/Workers';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Rruga publike */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Rrugët e mbrojtura */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bookings"
            element={
              <ProtectedRoute>
                <Bookings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workers"
            element={
              <ProtectedRoute>
                <Workers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/upload-docs"
            element={
              <ProtectedRoute>
                <UploadDocs />
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;