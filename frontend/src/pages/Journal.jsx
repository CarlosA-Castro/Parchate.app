import React, { useState, useEffect } from 'react';
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
  FiAlertCircle
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Journal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState('');
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingEntries, setLoadingEntries] = useState(true);
  const [viewMode, setViewMode] = useState('list');
  const [selectedMood, setSelectedMood] = useState('neutral');
  const [editingEntry, setEditingEntry] = useState(null);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);

  // Estado del modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    entryId: null
  });

  const moods = [
    { id: 'calm', emoji: '😌', label: 'Tranquilo' },
    { id: 'focused', emoji: '🎯', label: 'Concentrado' },
    { id: 'neutral', emoji: '😐', label: 'Neutral' },
    { id: 'reflective', emoji: '💭', label: 'Reflexivo' },
    { id: 'grateful', emoji: '🙏', label: 'Agradecido' }
  ];

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoadingEntries(true);
      const res = await api.get('/journal/entries');
      setEntries(res.data.entries || []);
    } catch (err) {
      setError('No se pudieron cargar las entradas');
    } finally {
      setLoadingEntries(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/journal/stats');
      setStats(res.data);
    } catch (err) {
      // Stats no críticas, no mostrar error
    }
  };

  const handleSaveEntry = async () => {
    if (!currentEntry.trim()) return;
    setLoading(true);
    setError('');

    try {
      if (editingEntry) {
        const res = await api.put(`/journal/entries/${editingEntry.id}`, {
          content: currentEntry,
          mood: selectedMood,
          title: title || 'Reflexión del día'
        });
        setEntries(prev =>
          prev.map(e => e.id === editingEntry.id ? res.data.entry : e)
        );
      } else {
        const res = await api.post('/journal/entries', {
          content: currentEntry,
          mood: selectedMood,
          tags: [],
          title: title || 'Reflexión del día'
        });
        setEntries(prev => [res.data.entry, ...prev]);
      }

      setCurrentEntry('');
      setTitle('');
      setSelectedMood('neutral');
      setEditingEntry(null);
      setViewMode('list');
      fetchStats();

    } catch (err) {
      setError('No se pudo guardar la entrada. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Abre el modal en lugar de borrar directamente
  const askDeleteEntry = (id) => {
    setConfirmModal({ isOpen: true, entryId: id });
  };

  // Se ejecuta solo si el usuario confirma en el modal
  const handleDeleteEntry = async () => {
    const id = confirmModal.entryId;
    setConfirmModal({ isOpen: false, entryId: null });

    try {
      await api.delete(`/journal/entries/${id}`);
      setEntries(prev => prev.filter(e => e.id !== id));
      fetchStats();
    } catch (err) {
      setError('No se pudo eliminar la entrada');
    }
  };

  const handleEditEntry = (entry) => {
    setEditingEntry(entry);
    setTitle(entry.title || '');
    setCurrentEntry(entry.content);
    setSelectedMood(entry.mood || 'neutral');
    setViewMode('write');
  };

  const handleCancelWrite = () => {
    setCurrentEntry('');
    setTitle('');
    setSelectedMood('neutral');
    setEditingEntry(null);
    setViewMode('list');
    setError('');
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

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900">

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="¿Eliminar entrada?"
        message="Esta reflexión se eliminará permanentemente y no podrás recuperarla."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteEntry}
        onCancel={() => setConfirmModal({ isOpen: false, entryId: null })}
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => viewMode === 'write' ? handleCancelWrite() : navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              {viewMode === 'write' ? <FiX size={20} /> : <FiChevronLeft size={20} />}
            </button>

            <div className="text-center">
              <h1 className="text-lg font-bold">Diario</h1>
              <p className="text-xs text-gray-500">
                {viewMode === 'write'
                  ? editingEntry ? 'Editando entrada' : 'Nueva entrada'
                  : 'Reflexiones privadas'}
              </p>
            </div>

            <button
              onClick={() => viewMode === 'list' ? setViewMode('write') : handleSaveEntry()}
              disabled={viewMode === 'write' && (!currentEntry.trim() || loading)}
              className="p-2 hover:bg-gray-100 rounded-xl disabled:opacity-50"
            >
              {viewMode === 'list' ? <FiPlus size={20} /> : <FiSave size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mx-4 mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm">
          <FiAlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="px-4 py-6">

        {viewMode === 'write' ? (
          <div className="max-w-2xl mx-auto">

            <div className="mb-8">
              <p className="text-sm text-gray-600 mb-3">Estado de ánimo</p>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {moods.map((mood) => (
                  <button
                    key={mood.id}
                    onClick={() => setSelectedMood(mood.id)}
                    className={`px-4 py-3 rounded-xl flex items-center gap-2 whitespace-nowrap transition-colors ${
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
                  <span>
                    {new Date().toLocaleDateString('es-ES', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <FiClock size={14} />
                  <span>
                    {new Date().toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
              </div>
            </div>

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

            <button
              onClick={handleSaveEntry}
              disabled={loading || !currentEntry.trim()}
              className="w-full py-4 bg-black text-white font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{editingEntry ? 'Actualizando...' : 'Guardando...'}</span>
                </>
              ) : (
                <>
                  <FiSave />
                  <span>{editingEntry ? 'Actualizar reflexión' : 'Guardar reflexión'}</span>
                </>
              )}
            </button>
          </div>

        ) : (
          <>
            {loadingEntries ? (
              <div className="flex justify-center py-20">
                <div className="w-8 h-8 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
              </div>

            ) : entries.length === 0 ? (
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
                            <h3 className="font-bold text-lg mb-2">
                              {entry.title || 'Reflexión del día'}
                            </h3>
                            <div className="flex items-center gap-3 text-sm text-gray-500 flex-wrap">
                              <span>{formatDate(entry.created_at)}</span>
                              <span>•</span>
                              <span>{formatTime(entry.created_at)}</span>
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
                            onClick={() => askDeleteEntry(entry.id)}
                            className="p-2 hover:bg-gray-100 rounded-xl text-gray-400 hover:text-red-500 ml-2"
                          >
                            <FiTrash2 size={18} />
                          </button>
                        </div>

                        <p className="text-gray-700 line-clamp-3">{entry.content}</p>

                        <button
                          onClick={() => handleEditEntry(entry)}
                          className="mt-4 text-sm text-gray-600 hover:text-black flex items-center gap-1"
                        >
                          <FiEdit2 size={14} />
                          <span>Editar</span>
                        </button>
                      </div>
                    );
                  })}
                </div>

                {stats && (
                  <div className="mt-12 pt-8 border-t border-gray-200">
                    <h3 className="text-lg font-medium mb-6">Tu progreso</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-1">{stats.total_entries}</div>
                        <p className="text-xs text-gray-600">Entradas totales</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-1">{stats.entries_last_7_days}</div>
                        <p className="text-xs text-gray-600">Últimos 7 días</p>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold mb-1">
                          {stats.most_common_mood
                            ? moods.find(m => m.id === stats.most_common_mood)?.emoji || '—'
                            : '—'}
                        </div>
                        <p className="text-xs text-gray-600">Mood frecuente</p>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default Journal;
