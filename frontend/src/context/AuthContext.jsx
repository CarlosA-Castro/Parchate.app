import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Configurar la URL de la API - usar variable de entorno o valor por defecto
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar token a las peticiones
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = Bearer ;
    }
    return config;
  },
  (error) => {
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
    // Verificar si hay token al cargar la app
    const token = localStorage.getItem('token');
    if (token) {
      try {
        // Decodificar token JWT (parte del payload)
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({
          id: payload.sub || payload.user_id,
          email: payload.email,
          username: payload.username || payload.email.split('@')[0],
        });
      } catch (error) {
        console.error('Error decodificando token:', error);
        localStorage.removeItem('token');
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', {
        email,
        password
      });
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        // Decodificar token
        const payload = JSON.parse(atob(response.data.access_token.split('.')[1]));
        const userData = {
          id: payload.sub || payload.user_id,
          email: payload.email,
          username: payload.username || payload.email.split('@')[0],
        };
        
        setUser(userData);
        return { success: true, user: userData };
      } else {
        return { success: false, error: 'Token no recibido' };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al iniciar sesión' 
      };
    }
  };

  const register = async (username, email, password) => {
    try {
      const response = await axiosInstance.post('/auth/register', {
        username,
        email,
        password
      });
      
      if (response.data.access_token) {
        localStorage.setItem('token', response.data.access_token);
        
        const payload = JSON.parse(atob(response.data.access_token.split('.')[1]));
        const userData = {
          id: payload.sub || payload.user_id,
          email: payload.email,
          username: payload.username || username,
        };
        
        setUser(userData);
        return { success: true, user: userData };
      } else {
        // Si no devuelve token, hacer login automático
        return await login(email, password);
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        error: error.response?.data?.message || 'Error al registrar usuario' 
      };
    }
  };

  const logout = () => {
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

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
