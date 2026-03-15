import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiBook,
  FiMessageSquare,
  FiCalendar,
  FiLogOut,
  FiTarget,
  FiTrendingUp,
  FiHeart,
  FiArrowRight,
  FiUser
} from 'react-icons/fi';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const quotes = [
  { text: 'La felicidad de tu vida depende de la calidad de tus pensamientos.', author: 'Marco Aurelio' },
  { text: 'Entre el estímulo y la respuesta hay un espacio. En ese espacio está nuestro poder.', author: 'Viktor Frankl' },
  { text: 'El dolor más la reflexión es igual al progreso.', author: 'Ray Dalio' },
  { text: 'No son las cosas las que nos perturban, sino las opiniones que tenemos de ellas.', author: 'Epicteto' },
  { text: 'Hay que imaginarse a Sísifo feliz.', author: 'Albert Camus' },
  { text: 'Concentra todo tu pensamiento en el trabajo que tienes entre manos.', author: 'Kobe Bryant' },
  { text: 'Cuando ya no somos capaces de cambiar una situación, nos enfrentamos al reto de cambiarnos a nosotros mismos.', author: 'Viktor Frankl' },
];

const moods = [
  { id: 'calm', emoji: '😌', label: 'Tranquilo' },
  { id: 'focused', emoji: '🎯', label: 'Concentrado' },
  { id: 'neutral', emoji: '😐', label: 'Neutral' },
  { id: 'reflective', emoji: '💭', label: 'Reflexivo' },
  { id: 'grateful', emoji: '🙏', label: 'Agradecido' }
];

const Dashboard = () => {
  const { user, logout } = useAuth();

  const [journalStats, setJournalStats] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Frase del día — aleatoria pero fija durante la sesión
  const [dailyQuote] = useState(
    () => quotes[Math.floor(Math.random() * quotes.length)]
  );

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      const [statsRes, entriesRes, convsRes] = await Promise.all([
        api.get('/journal/stats'),
        api.get('/journal/entries?page=1&per_page=3'),
        api.get('/ai/conversations')
      ]);

      setJournalStats(statsRes.data);
      setRecentEntries(entriesRes.data.entries || []);
      setRecentConversations((convsRes.data.conversations || []).slice(0, 3));

    } catch (err) {
      // Si falla silenciosamente mostramos los defaults
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';
    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
  };

  const getMoodEmoji = (moodId) => {
    return moods.find(m => m.id === moodId)?.emoji || '';
  };

  const stats = [
    {
      label: 'Entradas totales',
      value: journalStats?.total_entries ?? '—',
      icon: FiBook,
      highlight: false
    },
    {
      label: 'Últimos 7 días',
      value: journalStats?.entries_last_7_days ?? '—',
      icon: FiTarget,
      highlight: true
    },
    {
      label: 'Mood frecuente',
      value: journalStats?.most_common_mood
        ? getMoodEmoji(journalStats.most_common_mood)
        : '—',
      icon: FiHeart,
      highlight: false
    },
    {
      label: 'Conversaciones',
      value: recentConversations.length > 0
        ? recentConversations.length + (recentConversations.length === 3 ? '+' : '')
        : '—',
      icon: FiMessageSquare,
      highlight: false
    }
  ];

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-sm">π</span>
              </div>
              <div>
                <h1 className="text-lg font-bold">Parchate</h1>
                <p className="text-xs text-gray-500">Claridad mental</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="text-gray-600">
                <FiCalendar size={20} />
              </button>
              <button
                onClick={logout}
                className="p-2 hover:bg-gray-100 rounded-xl"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-8">

        {/* Bienvenida */}
        <div className="mb-8">
          <h2 className="text-2xl font-medium mb-1">
            Hola, {user?.username || 'bienvenido'}
          </h2>
          <p className="text-gray-600 text-sm">
            {new Date().toLocaleDateString('es-ES', {
              weekday: 'long',
              day: 'numeric',
              month: 'long'
            })}
          </p>
        </div>

        {/* Frase del día */}
        <div className="mb-8 p-6 bg-gray-50 rounded-2xl border border-gray-200">
          <div className="flex gap-4">
            <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center flex-shrink-0">
              <span className="text-white text-lg">"</span>
            </div>
            <div>
              <p className="text-gray-700 italic mb-2 text-lg">"{dailyQuote.text}"</p>
              <p className="text-sm text-gray-600">— {dailyQuote.author}</p>
            </div>
          </div>
        </div>

        {/* Stats reales */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 animate-pulse h-24" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 mb-8">
            {stats.map((stat, index) => (
              <div key={index} className="p-4 bg-white rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    stat.highlight ? 'bg-black' : 'bg-gray-100'
                  }`}>
                    <stat.icon
                      className={stat.highlight ? 'text-white' : 'text-gray-700'}
                      size={18}
                    />
                  </div>
                </div>
                <p className="text-2xl font-bold mb-1">{stat.value}</p>
                <p className="text-xs text-gray-600">{stat.label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Acciones rápidas */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Acciones rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link
              to="/journal"
              className="p-6 rounded-2xl border-2 border-black flex flex-col items-center justify-center hover:bg-black hover:text-white transition-colors group"
            >
              <div className="w-12 h-12 rounded-xl bg-black group-hover:bg-white flex items-center justify-center mb-3 transition-colors">
                <FiBook className="text-white group-hover:text-black" size={24} />
              </div>
              <span className="font-medium">Diario</span>
              <span className="text-xs mt-1 text-gray-500 group-hover:text-gray-300">Escribe tu reflexión</span>
            </Link>

            <Link
              to="/chat"
              className="p-6 rounded-2xl border-2 border-gray-300 flex flex-col items-center justify-center hover:border-black transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <FiMessageSquare className="text-gray-700" size={24} />
              </div>
              <span className="font-medium">Sabiduría IA</span>
              <span className="text-xs mt-1 text-gray-500">Conversa con sabios</span>
            </Link>
          </div>
        </div>

        {/* Entradas recientes reales */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Reflexiones recientes</h3>
            <Link
              to="/journal"
              className="text-sm text-gray-600 hover:text-black flex items-center gap-1"
            >
              Ver todas
              <FiArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map(i => (
                <div key={i} className="p-4 rounded-2xl border border-gray-100 animate-pulse h-20" />
              ))}
            </div>
          ) : recentEntries.length === 0 ? (
            <div className="p-6 rounded-2xl border border-gray-200 text-center">
              <p className="text-gray-500 text-sm mb-3">Aún no tienes reflexiones escritas</p>
              <Link
                to="/journal"
                className="text-sm font-medium text-black hover:underline"
              >
                Escribe tu primera entrada →
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {recentEntries.map((entry) => (
                <Link
                  to="/journal"
                  key={entry.id}
                  className="block p-4 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                      {formatDate(entry.created_at)}
                    </span>
                    {entry.mood && (
                      <span className="text-sm">{getMoodEmoji(entry.mood)}</span>
                    )}
                  </div>
                  <h4 className="font-medium mb-1">{entry.title || 'Reflexión del día'}</h4>
                  <p className="text-sm text-gray-600 line-clamp-2">{entry.content}</p>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Insight del día */}
        <div className="p-6 bg-black text-white rounded-2xl mb-24">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl">⚡</span>
            </div>
            <div>
              <h4 className="font-medium mb-1">Insight del día</h4>
              <p className="text-sm text-white/80">
                La consistencia en pequeñas acciones genera grandes resultados a largo plazo.
              </p>
            </div>
          </div>
        </div>

      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
        <div className="px-4 py-3">
          <div className="flex justify-around">
            <Link to="/dashboard" className="flex flex-col items-center gap-1 p-2">
              <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
                <span className="text-white font-bold">π</span>
              </div>
              <span className="text-xs font-medium">Inicio</span>
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
  <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
    <FiUser className="text-gray-700" />
  </div>
  <span className="text-xs text-gray-600">Perfil</span>
</Link>
          </div>
        </div>
      </div>

    </div>
  );
};

export default Dashboard;
