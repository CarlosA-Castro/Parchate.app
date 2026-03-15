import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiUser,
  FiMail,
  FiCalendar,
  FiBook,
  FiMessageSquare,
  FiLogOut,
  FiChevronLeft,
  FiShield,
  FiHeart
} from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [conversationCount, setConversationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      const [statsRes, convsRes] = await Promise.all([
        api.get('/journal/stats'),
        api.get('/ai/conversations')
      ]);
      setStats(statsRes.data);
      setConversationCount(convsRes.data.conversations?.length || 0);
    } catch (err) {
      // Silencioso — mostramos lo que podamos
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const memberSince = user?.created_at
    ? new Date(user.created_at).toLocaleDateString('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      })
    : 'Miembro reciente';

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <FiChevronLeft size={20} />
            </button>
            <h1 className="text-lg font-bold">Perfil</h1>
            <div className="w-9" />
          </div>
        </div>
      </div>

      <div className="px-4 py-8 max-w-lg mx-auto">

        {/* Avatar y nombre */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-24 h-24 bg-black rounded-3xl flex items-center justify-center mb-4">
            <span className="text-white text-4xl font-bold">
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
          <h2 className="text-2xl font-bold mb-1">{user?.username}</h2>
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <FiMail size={14} />
            <span>{user?.email}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-400 text-xs mt-1">
            <FiCalendar size={12} />
            <span>{memberSince}</span>
          </div>
        </div>

        {/* Stats */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[1, 2].map(i => (
              <div key={i} className="p-4 bg-gray-50 rounded-2xl animate-pulse h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-8">
            <div className="p-5 bg-gray-50 rounded-2xl text-center">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiBook className="text-white" size={18} />
              </div>
              <p className="text-2xl font-bold mb-1">{stats?.total_entries ?? '—'}</p>
              <p className="text-xs text-gray-600">Reflexiones escritas</p>
            </div>
            <div className="p-5 bg-gray-50 rounded-2xl text-center">
              <div className="w-10 h-10 bg-gray-200 rounded-xl flex items-center justify-center mx-auto mb-3">
                <FiMessageSquare className="text-gray-700" size={18} />
              </div>
              <p className="text-2xl font-bold mb-1">{conversationCount}</p>
              <p className="text-xs text-gray-600">Conversaciones con IA</p>
            </div>
          </div>
        )}

        {/* Info de la cuenta */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Tu cuenta
          </h3>
          <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100">
            <div className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <FiUser size={16} className="text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Usuario</p>
                <p className="text-sm font-medium">{user?.username}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <FiMail size={16} className="text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Email</p>
                <p className="text-sm font-medium">{user?.email}</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4">
              <div className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                <FiShield size={16} className="text-gray-600" />
              </div>
              <div>
                <p className="text-xs text-gray-500">Privacidad</p>
                <p className="text-sm font-medium">Datos encriptados y privados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Navegación rápida */}
        <div className="mb-8">
          <h3 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wide">
            Ir a
          </h3>
          <div className="bg-gray-50 rounded-2xl divide-y divide-gray-100">
            <Link to="/journal" className="flex items-center justify-between p-4 hover:bg-gray-100 rounded-t-2xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                  <FiBook size={16} className="text-gray-600" />
                </div>
                <span className="text-sm font-medium">Mi diario</span>
              </div>
              <FiChevronLeft size={16} className="text-gray-400 rotate-180" />
            </Link>
            <Link to="/chat" className="flex items-center justify-between p-4 hover:bg-gray-100 rounded-b-2xl transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-white rounded-xl border border-gray-200 flex items-center justify-center">
                  <FiMessageSquare size={16} className="text-gray-600" />
                </div>
                <span className="text-sm font-medium">Sabiduría IA</span>
              </div>
              <FiChevronLeft size={16} className="text-gray-400 rotate-180" />
            </Link>
          </div>
        </div>

        {/* Filosofía de la app */}
        <div className="mb-8 p-5 bg-gray-50 rounded-2xl">
          <div className="flex items-center gap-2 mb-2">
            <FiHeart size={14} className="text-gray-500" />
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">Sobre Parchate</span>
          </div>
          <p className="text-sm text-gray-600 leading-relaxed">
            Un espacio privado para pensar con claridad, usando la sabiduría acumulada de los mejores filósofos, científicos y líderes de la historia.
          </p>
        </div>

        {/* Cerrar sesión */}
        <button
          onClick={handleLogout}
          className="w-full py-4 rounded-2xl border-2 border-red-200 text-red-500 font-medium hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
        >
          <FiLogOut size={18} />
          <span>Cerrar sesión</span>
        </button>

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="px-4 py-3">
          <div className="flex justify-around">
            <Link to="/dashboard" className="flex flex-col items-center gap-1 p-2">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <span className="text-gray-700 font-bold">π</span>
              </div>
              <span className="text-xs text-gray-600">Inicio</span>
            </Link>
            <Link to="/journal" className="flex flex-col items-center gap-1 p-2">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <FiBook className="text-gray-700" />
              </div>
              <span className="text-xs text-gray-600">Diario</span>
            </Link>
            <Link to="/chat" className="flex flex-col items-center gap-1 p-2">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <FiMessageSquare className="text-gray-700" />
              </div>
              <span className="text-xs text-gray-600">Sabiduría</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center gap-1 p-2">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                <FiUser className="text-white" />
              </div>
              <span className="text-xs font-medium">Perfil</span>
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Profile;
