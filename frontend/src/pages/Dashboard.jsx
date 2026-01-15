import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  FiBook, 
  FiMessageSquare, 
  FiCalendar,
  FiLogOut,
  FiUser,
  FiTarget,
  FiTrendingUp,
  FiHeart,
  FiArrowRight
} from 'react-icons/fi';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const dailyQuote = {
    text: "La felicidad de tu vida depende de la calidad de tus pensamientos.",
    author: "Marco Aurelio"
  };

  const stats = [
    { label: 'Días seguidos', value: '7', change: '+2', icon: FiTarget },
    { label: 'Reflexiones', value: '12', change: '+3', icon: FiBook },
    { label: 'Consistencia', value: '85%', change: '+5%', icon: FiTrendingUp },
    { label: 'Bienestar', value: '4.8', change: '+0.3', icon: FiHeart }
  ];

  const recentEntries = [
    { date: 'Hoy', title: 'Sobre el control', preview: 'Solo puedo controlar mis propias acciones...' },
    { date: 'Ayer', title: 'Virtud en acción', preview: 'La verdadera virtud está en actuar...' },
    { date: '15 Ene', title: 'Claridad mental', preview: 'El orden externo refleja el interno...' }
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
                <p className="text-xs text-gray-500">Journal estoico</p>
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

      {/* Main Content */}
      <div className="px-4 py-8">
        {/* Welcome */}
        <div className="mb-8">
          <h2 className="text-2xl font-medium mb-1">
            {user?.username || 'Bienvenido'}
          </h2>
          <p className="text-gray-600 text-sm">
            {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>

        {/* Quote Card */}
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

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="p-4 bg-white rounded-2xl border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  index === 0 ? 'bg-black' : 'bg-gray-100'
                }`}>
                  <stat.icon className={index === 0 ? "text-white" : "text-gray-700"} size={18} />
                </div>
                <span className="text-sm font-medium text-green-600">{stat.change}</span>
              </div>
              <p className="text-2xl font-bold mb-1">{stat.value}</p>
              <p className="text-xs text-gray-600">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-4">Acciones rápidas</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link 
              to="/journal"
              className="p-6 rounded-2xl border-2 border-black flex flex-col items-center justify-center hover:bg-black hover:text-white transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-black flex items-center justify-center mb-3">
                <FiBook className="text-white" size={24} />
              </div>
              <span className="font-medium">Diario</span>
              <span className="text-xs mt-1">Escribe tu reflexión</span>
            </Link>
            
            <Link 
              to="/chat"
              className="p-6 rounded-2xl border-2 border-gray-300 flex flex-col items-center justify-center hover:border-black transition-colors"
            >
              <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-3">
                <FiMessageSquare className="text-gray-700" size={24} />
              </div>
              <span className="font-medium">Sabiduría IA</span>
              <span className="text-xs mt-1">Conversa con sabios</span>
            </Link>
          </div>
        </div>

        {/* Recent Entries */}
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
          
          <div className="space-y-3">
            {recentEntries.map((entry, index) => (
              <div 
                key={index}
                className="p-4 rounded-2xl border border-gray-200 hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-medium text-gray-600 bg-gray-100 px-2 py-1 rounded">
                    {entry.date}
                  </span>
                </div>
                <h4 className="font-medium mb-1">{entry.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">
                  {entry.preview}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Insight */}
        <div className="p-6 bg-black text-white rounded-2xl">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm">
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
            
            <button className="flex flex-col items-center gap-1 p-2">
              <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center">
                <FiUser className="text-gray-700" />
              </div>
              <span className="text-xs text-gray-600">Perfil</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;