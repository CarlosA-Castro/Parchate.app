import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Redirección raíz */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Rutas privadas */}
          <Route path="/dashboard" element={
            <PrivateRoute><Dashboard /></PrivateRoute>
          } />
          <Route path="/journal" element={
            <PrivateRoute><Journal /></PrivateRoute>
          } />
          <Route path="/chat" element={
            <PrivateRoute><Chat /></PrivateRoute>
          } />
          <Route path="/profile" element={
            <PrivateRoute><Profile /></PrivateRoute>
          } />

          {/* 404 */}
          <Route path="*" element={
            <div className="min-h-screen bg-white flex items-center justify-center p-4">
              <div className="text-center max-w-md">
                <div className="w-24 h-24 bg-black rounded-3xl mx-auto mb-6 flex items-center justify-center">
                  <span className="text-white text-4xl font-bold">404</span>
                </div>
                <h1 className="text-4xl font-bold text-gray-900 mb-4">Página no encontrada</h1>
                <p className="text-gray-600 mb-8">Esta página no existe o ha sido movida.</p>
                <a
                  href="/dashboard"
                  className="inline-block px-6 py-3 bg-black text-white font-semibold rounded-xl hover:bg-gray-800 transition-all"
                >
                  Volver al inicio
                </a>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
