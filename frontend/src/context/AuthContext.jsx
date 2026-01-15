// src/context/AuthContext.jsx - VERSIÓN CON DEBUG
import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

console.log('🔧 API URL configurada:', API_URL);

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token en interceptor:', token ? 'Presente' : 'No presente');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error('❌ Error en interceptor:', error);
    return Promise.reject(error);
  }
);

const AuthContext = createContext({});

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('🔄 AuthProvider montándose...');
    const token = localStorage.getItem('token');
    console.log('📦 Token en localStorage:', token);
    
    if (token) {
      try {
        // Decodificar token JWT de manera segura
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        
        console.log('📄 Payload decodificado:', payload);
        
        const userData = {
          id: payload.user_id || payload.sub,
          email: payload.email || 'demo@parchate.com',
          username: payload.username || 'UsuarioDemo',
        };
        
        console.log('👤 Datos de usuario extraídos:', userData);
        setUser(userData);
      } catch (error) {
        console.error('❌ Error decodificando token:', error);
        console.log('🗑️ Eliminando token inválido...');
        localStorage.removeItem('token');
      }
    } else {
      console.log('⚠️ No hay token en localStorage');
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    console.log('🚀 Iniciando login con:', { email, password });
    
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password
      });
      
      console.log('✅ Respuesta del login:', response.data);
      
      if (response.data.access_token) {
        const token = response.data.access_token;
        console.log('🔐 Token recibido:', token.substring(0, 50) + '...');
        
        localStorage.setItem('token', token);
        
        // Decodificar token para obtener datos del usuario
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        
        console.log('📄 Payload del nuevo token:', payload);
        
        const userData = {
          id: payload.user_id || payload.sub,
          email: payload.email || email,
          username: payload.username || response.data.user?.username || email.split('@')[0],
        };
        
        console.log('👤 Usuario establecido:', userData);
        setUser(userData);
        return { success: true, user: userData };
      } else {
        console.error('❌ No se recibió token en la respuesta');
        return { success: false, error: 'Token no recibido' };
      }
    } catch (error) {
      console.error('❌ Error completo en login:', error);
      console.error('📊 Datos de error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        headers: error.response?.headers
      });
      
      return { 
        success: false, 
        error: error.response?.data?.error || 
               error.response?.data?.message || 
               error.message || 
               'Error al iniciar sesión' 
      };
    }
  };

  const register = async (username, email, password) => {
    console.log('🚀 Iniciando registro con:', { username, email });
    
    try {
      const response = await axiosInstance.post('/auth/register', {
        username,
        email,
        password
      });
      
      console.log('✅ Respuesta del registro:', response.data);
      
      if (response.data.access_token) {
        const token = response.data.access_token;
        localStorage.setItem('token', token);
        
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(atob(base64));
        
        const userData = {
          id: payload.user_id || payload.sub,
          email: payload.email || email,
          username: payload.username || username,
        };
        
        setUser(userData);
        return { success: true, user: userData };
      } else {
        console.log('⚠️ No se recibió token, intentando login...');
        return await login(email, password);
      }
    } catch (error) {
      console.error('❌ Error en registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.error || 
               error.response?.data?.message || 
               'Error al registrar usuario' 
      };
    }
  };

  const logout = () => {
    console.log('👋 Cerrando sesión...');
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    user,
    login,
    register,
    logout,
    loading,
    isAuthenticated: !!user,
  };

  console.log('🎯 AuthProvider valor actual:', { 
    user, 
    isAuthenticated: !!user, 
    loading 
  });

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;