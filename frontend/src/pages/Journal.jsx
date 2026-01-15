import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiBook,
  FiEdit2,
  FiCalendar,
  FiClock,
  FiSave,
  FiTrash2,
  FiPlus,
  FiChevronLeft,
  FiX,
  FiCheck
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Journal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [entries, setEntries] = useState([
    {
      id: 1,
      title: 'Sobre el control',
      content: 'Hoy recordé que solo puedo controlar mis propias acciones y reacciones. Lo demás está fuera de mi control.',
      date: '2024-01-15',
      time: '10:30 AM',
      mood: 'calm'
    },
    {
      id: 2,
      title: 'Virtud en la acción',
      content: 'La verdadera virtud está en la acción, no solo en la intención. Actuar de acuerdo con principios, incluso cuando nadie mira.',
      date: '2024-01-14',
      time: '9:15 PM',
      mood: 'focused'
    }
  ]);
  
  const [currentEntry, setCurrentEntry] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState('list');
  const [selectedMood, setSelectedMood] = useState('neutral');

  const moods = [
    { id: 'calm', emoji: '😌', label: 'Tranquilo' },
    { id: 'focused', emoji: '🎯', label: 'Concentrado' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'reflective', emoji: '💭', label: 'Reflexivo' },
    { id: 'grateful', emoji: '🙏', label: 'Agradecido' }
  ];

  const handleSaveEntry = () => {
    if (!currentEntry.trim()) return;
    
    setLoading(true);
    
    setTimeout(() => {
      const newEntry = {
        id: entries.length + 1,
        title: title || 'Reflexión del día',
        content: currentEntry,
        date: new Date().toISOString().split('T')[0],
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        mood: selectedMood
      };
      
      setEntries([newEntry, ...entries]);
      setCurrentEntry('');
      setTitle('');
      setViewMode('list');
      setLoading(false);
    }, 800);
  };

  const handleDeleteEntry = (id) => {
    setEntries(entries.filter(entry => entry.id !== id));
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
            
            <div className="text-center">
              <h1 className="text-lg font-bold">Diario</h1>
              <p className="text-xs text-gray-500">Reflexiones privadas</p>
            </div>
            
            <button 
              onClick={() => setViewMode(viewMode === 'list' ? 'write' : 'list')}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              {viewMode === 'list' ? <FiPlus size={20} /> : <FiX size={20} />}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6">
        {viewMode === 'write' ? (
          <div className="max-w-2xl mx-auto">
            {/* Mood selector */}
            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-3">Estado de ánimo</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`px-4 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap ${
                      selectedMood === mood.id
                        ? 'bg-black text-white'
                        : 'bg-gray-100 hover:bg-gray-200'
                    }`}
                  >
                    <span className="text-lg">{mood.emoji}</span>
                    <span className="text-sm font-medium">{mood.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div className="mb-6">
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Título (opcional)"
                className="w-full text-2xl font-bold mb-4 placeholder-gray-400 focus:outline-none"
              />
              
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <FiCalendar size={14} />
                  <span>{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FiClock size={14} />
                  <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
              </div>
            </div>

            {/* Editor */}
            <div className="mb-8">
              <textarea
                value={currentEntry}
                onChange={(e) => setCurrentEntry(e.target.value)}
                placeholder="¿Qué estás pensando? Escribe tus reflexiones aquí..."
                className="w-full min-h-[300px] text-lg placeholder-gray-400 focus:outline-none resize-none"
                rows={12}
                autoFocus
              />
            </div>

            {/* Save button */}
            <button
              onClick={handleSaveEntry}
              disabled={loading || !currentEntry.trim()}
              className="w-full py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Guardando...</span>
                </>
              ) : (
                <>
                  <FiSave />
                  <span>Guardar reflexión</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <>
            {/* Empty state */}
            {entries.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <FiBook className="text-gray-400 text-3xl" />
                </div>
                <h3 className="text-xl font-medium mb-2">Diario vacío</h3>
                <p className="text-gray-600 mb-8">Comienza a escribir tus reflexiones</p>
                <button
                  onClick={() => setViewMode('write')}
                  className="px-6 py-3 bg-black text-white rounded-xl font-medium hover:bg-gray-800"
                >
                  Crear primera entrada
                </button>
              </div>
            ) : (
              <>
                {/* Entries list */}
                <div className="space-y-4">
                  {entries.map((entry) => {
                    const mood = moods.find(m => m.id === entry.mood);
                    
                    return (
                      <div 
                        key={entry.id}
                        className="p-6 border border-gray-200 rounded-2xl hover:border-gray-300 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex-1">
                            <h3 className="font-bold text-lg mb-2">{entry.title}</h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500">
                              <span>{formatDate(entry.date)}</span>
                              <span>•</span>
                              <span>{entry.time}</span>
                              {mood && (
                                <>
                                  <span>•</span>
                                  <span className="flex items-center gap-1">
                                    <span>{mood.emoji}</span>
                                    <span>{mood.label}</span>
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-red-500 ml-2"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                        
                        <p className="text-gray-700 line-clamp-3">
                          {entry.content}
                        </p>
                        
                        <button
                          onClick={() => {
                            setTitle(entry.title);
                            setCurrentEntry(entry.content);
                            setSelectedMood(entry.mood);
                            setViewMode('write');
                          }}
                          className="mt-4 text-sm text-gray-600 hover:text-black flex items-center gap-1"
                        >
                          <FiEdit2 size={14} />
                          <span>Editar</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Stats */}
                <div className="mt-12 pt-8 border-t border-gray-200">
                  <h3 className="text-lg font-medium mb-6">Tu progreso</h3>
                  <div className="grid grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">{entries.length}</div>
                      <p className="text-xs text-gray-600">Entradas</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">7</div>
                      <p className="text-xs text-gray-600">Días seguidos</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">85%</div>
                      <p className="text-xs text-gray-600">Consistencia</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold mb-1">4.8</div>
                      <p className="text-xs text-gray-600">Bienestar</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Journal;