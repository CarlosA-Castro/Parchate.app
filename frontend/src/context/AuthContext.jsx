import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

const decodeToken = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(atob(base64));
  } catch {
    return null;
  }
};

const buildUserFromPayload = (payload, fallbacks = {}) => ({
  id: payload.user_id || payload.sub,
  email: payload.email || fallbacks.email || '',
  username: payload.username || fallbacks.username || '',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      const payload = decodeToken(token);

      if (payload && payload.exp && payload.exp > Date.now() / 1000) {
        setUser(buildUserFromPayload(payload));
      } else {
        // Token expirado o inválido
        localStorage.removeItem('token');
      }
    }

    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const response = await axiosInstance.post('/auth/login', { email, password });

      const token = response.data.access_token;
      if (!token) return { success: false, error: 'Token no recibido' };

      localStorage.setItem('token', token);

      const payload = decodeToken(token);
      const userData = buildUserFromPayload(payload, {
        email,
        username: response.data.user?.username || email.split('@')[0]
      });

      setUser(userData);
      return { success: true, user: userData };

    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error al iniciar sesión'
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

      const token = response.data.access_token;

      if (token) {
        localStorage.setItem('token', token);

        const payload = decodeToken(token);
        const userData = buildUserFromPayload(payload, { email, username });

        setUser(userData);
        return { success: true, user: userData };
      }

      // Si no devuelve token, intentar login directamente
      return await login(email, password);

    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || error.message || 'Error al registrar usuario'
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      loading,
      isAuthenticated: !!user,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
