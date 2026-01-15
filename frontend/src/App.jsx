import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';

// Componente temporal para Dashboard
const DashboardTemp = () => (
  <div className="min-h-screen bg-gray-50 p-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-4 text-gray-900">Dashboard</h1>
      <div className="bg-white rounded-2xl shadow-lg p-6">
        <p className="text-gray-700">¡Has iniciado sesión exitosamente en Parchate! 🎉</p>
        <p className="text-gray-600 mt-2">Esta es tu área personal para gestionar tu bienestar emocional.</p>
      </div>
    </div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Rutas públicas */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          {/* Redirección raíz */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          
          {/* Ruta protegida */}
          <Route 
            path="/dashboard" 
            element={
              <PrivateRoute>
                <DashboardTemp />
              </PrivateRoute>
            } 
          />
          
          {/* Ruta 404 */}
          <Route path="*" element={
            <div className="min-h-screen flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                <p className="text-gray-600">Página no encontrada</p>
              </div>
            </div>
          } />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
