// src/components/PrivateRoute.jsx
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  console.log('🔒 PrivateRoute estado:', { 
    isAuthenticated, 
    loading, 
    user,
    currentPath: location.pathname 
  });

  if (loading) {
    console.log('⏳ PrivateRoute cargando...');
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-black border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando tu espacio seguro...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🚫 PrivateRoute: No autenticado, redirigiendo a login');
    console.log('📍 Guardando ubicación para redirección:', location.pathname);
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  console.log('✅ PrivateRoute: Acceso permitido para:', user?.username);
  return children;
};

export default PrivateRoute;