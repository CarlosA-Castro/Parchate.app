import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiBook, FiEdit2, FiCalendar, FiClock,
  FiSave, FiTrash2, FiPlus, FiChevronLeft,
  FiX, FiAlertCircle
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Journal = () => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
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
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, entryId: null });

  const canvasRef = useRef(null);
  const animRef = useRef(null);

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
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const color = currentTheme?.colors?.particle || '80,80,80';

    const resize = () => {
      canvas.width = canvas.offsetWidth || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * (canvas.width || 400),
      y: Math.random() * (canvas.height || 800),
      r: 0.5 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.1 + Math.random() * 0.3),
      opacity: 0.1 + Math.random() * 0.3
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},${p.opacity})`;
        ctx.fill();
        p.x += p.vx;
        p.y += p.vy;
        if (p.y < 0) p.y = canvas.height;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
      });
      animRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animRef.current) cancelAnimationFrame(animRef.current);
    };
  }, [currentTheme]);

  useEffect(() => {
    fetchEntries();
    fetchStats();
  }, []);

  const fetchEntries = async () => {
    try {
      setLoadingEntries(true);
      const res = await api.get('/journal/entries');
      setEntries(res.data.entries || []);
    } catch {
      setError('No se pudieron cargar las entradas');
    } finally {
      setLoadingEntries(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await api.get('/journal/stats');
      setStats(res.data);
    } catch {}
  };

  const handleSaveEntry = async () => {
    if (!currentEntry.trim()) return;
    setLoading(true);
    setError('');
    try {
      if (editingEntry) {
        const res = await api.put(`/journal/entries/${editingEntry.id}`, {
          content: currentEntry, mood: selectedMood, title: title || 'Reflexión del día'
        });
        setEntries(prev => prev.map(e => e.id === editingEntry.id ? res.data.entry : e));
      } else {
        const res = await api.post('/journal/entries', {
          content: currentEntry, mood: selectedMood, tags: [], title: title || 'Reflexión del día'
        });
        setEntries(prev => [res.data.entry, ...prev]);
      }
      setCurrentEntry(''); setTitle(''); setSelectedMood('neutral');
      setEditingEntry(null); setViewMode('list');
      fetchStats();
    } catch {
      setError('No se pudo guardar la entrada. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const askDeleteEntry = (id) => setConfirmModal({ isOpen: true, entryId: id });

  const handleDeleteEntry = async () => {
    const id = confirmModal.entryId;
    setConfirmModal({ isOpen: false, entryId: null });
    try {
      await api.delete(`/journal/entries/${id}`);
      setEntries(prev => prev.filter(e => e.id !== id));
      fetchStats();
    } catch {
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
    setCurrentEntry(''); setTitle(''); setSelectedMood('neutral');
    setEditingEntry(null); setViewMode('list'); setError('');
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

  const formatTime = (dateStr) => new Date(dateStr).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const s = {
    page: {
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
      transition: 'background 0.8s ease, color 0.5s ease',
      position: 'relative',
      paddingBottom: '32px',
    },
    canvas: {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      pointerEvents: 'none', zIndex: 0,
    },
    content: { position: 'relative', zIndex: 1 },
    header: {
      position: 'sticky', top: 0, zIndex: 10,
      background: 'var(--nav-bg)',
      borderBottom: '1px solid var(--nav-border)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      padding: '16px',
    },
    headerInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    iconBtn: {
      padding: '8px', borderRadius: '10px', background: 'transparent',
      border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
      transition: 'background 0.2s', display: 'flex', alignItems: 'center',
    },
    headerTitle: { fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)' },
    headerSub: { fontSize: '11px', color: 'var(--text-muted)', textAlign: 'center' },
    body: { padding: '24px 16px' },
    error: {
      margin: '0 16px 16px',
      padding: '12px 16px',
      background: 'rgba(220,50,50,0.1)',
      border: '1px solid rgba(220,50,50,0.2)',
      borderRadius: '14px',
      display: 'flex', alignItems: 'center', gap: '8px',
      color: '#c03030', fontSize: '13px',
    },
    moodRow: { display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', marginBottom: '24px' },
    moodBtn: (active) => ({
      padding: '10px 16px', borderRadius: '24px',
      display: 'flex', alignItems: 'center', gap: '6px',
      whiteSpace: 'nowrap', cursor: 'pointer', border: 'none',
      fontFamily: 'var(--font-body)', fontSize: '13px', fontWeight: 500,
      transition: 'all 0.2s ease',
      background: active ? 'var(--accent)' : 'var(--bg-card)',
      color: active ? 'var(--btn-text)' : 'var(--text-secondary)',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border-card)'}`,
      transform: active ? 'scale(1.03)' : 'scale(1)',
    }),
    titleInput: {
      width: '100%', fontSize: '24px', fontFamily: 'var(--font-heading)',
      fontWeight: 700, background: 'transparent', border: 'none', outline: 'none',
      color: 'var(--text-primary)', marginBottom: '12px',
    },
    metaRow: { display: 'flex', alignItems: 'center', gap: '16px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '24px' },
    textarea: {
      width: '100%', minHeight: '280px', fontSize: '16px', lineHeight: 1.7,
      background: 'transparent', border: 'none', outline: 'none', resize: 'none',
      color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
    },
    saveBtn: (disabled) => ({
      width: '100%', padding: '16px', borderRadius: '14px',
      background: disabled ? 'var(--bg-card)' : 'var(--btn-bg)',
      border: `1px solid ${disabled ? 'var(--border-card)' : 'var(--accent)'}`,
      color: disabled ? 'var(--text-muted)' : 'var(--btn-text)',
      fontSize: '15px', fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      fontFamily: 'var(--font-body)', transition: 'all 0.2s ease',
      opacity: disabled ? 0.5 : 1,
    }),
    emptyState: { textAlign: 'center', padding: '60px 24px' },
    emptyIcon: {
      width: '80px', height: '80px', borderRadius: '24px',
      background: 'var(--bg-card)', border: '1px solid var(--border-card)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 20px',
    },
    entryCard: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
      borderRadius: '20px', padding: '20px',
      marginBottom: '12px',
      transition: 'all 0.2s ease',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      animation: 'fadeUp 0.5s ease forwards',
    },
    entryTitle: { fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '16px', color: 'var(--text-primary)', marginBottom: '6px' },
    entryMeta: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '10px', flexWrap: 'wrap' },
    entryContent: { fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6, overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 3 },
    entryActions: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '14px' },
    statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginTop: '32px', paddingTop: '24px', borderTop: '1px solid var(--border-card)' },
    statCard: {
      background: 'var(--bg-card)', border: '1px solid var(--border-card)',
      borderRadius: '14px', padding: '14px', textAlign: 'center',
      transition: 'all 0.2s ease',
    },
  };

  const hoverCard = (e, enter) => {
    e.currentTarget.style.transform = enter ? 'translateY(-2px)' : '';
    e.currentTarget.style.background = enter ? 'var(--bg-card-hover)' : 'var(--bg-card)';
    e.currentTarget.style.borderColor = enter ? 'var(--border-card-hover)' : 'var(--border-card)';
  };

  return (
    <div style={s.page}>
      <canvas ref={canvasRef} style={s.canvas} />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="¿Eliminar entrada?"
        message="Esta reflexión se eliminará permanentemente y no podrás recuperarla."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteEntry}
        onCancel={() => setConfirmModal({ isOpen: false, entryId: null })}
      />

      <div style={s.content}>
        <div style={s.header}>
          <div style={s.headerInner}>
            <button style={s.iconBtn} onClick={() => viewMode === 'write' ? handleCancelWrite() : navigate(-1)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {viewMode === 'write' ? <FiX size={20} /> : <FiChevronLeft size={20} />}
            </button>

            <div style={{ textAlign: 'center' }}>
              <div style={s.headerTitle}>Diario</div>
              <div style={s.headerSub}>
                {viewMode === 'write' ? (editingEntry ? 'Editando entrada' : 'Nueva entrada') : 'Reflexiones privadas'}
              </div>
            </div>

            <button style={s.iconBtn}
              onClick={() => viewMode === 'list' ? setViewMode('write') : handleSaveEntry()}
              disabled={viewMode === 'write' && (!currentEntry.trim() || loading)}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {viewMode === 'list' ? <FiPlus size={20} /> : <FiSave size={20} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={s.error}>
            <FiAlertCircle size={14} />
            <span>{error}</span>
          </div>
        )}

        <div style={s.body}>
          {viewMode === 'write' ? (
            <div style={{ maxWidth: '600px', margin: '0 auto', animation: 'fadeUp 0.4s ease forwards' }}>
              {/* Mood */}
              <div style={{ marginBottom: '8px', fontSize: '11px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Estado de ánimo</div>
              <div style={s.moodRow}>
                {moods.map(mood => (
                  <button key={mood.id} onClick={() => setSelectedMood(mood.id)} style={s.moodBtn(selectedMood === mood.id)}>
                    <span>{mood.emoji}</span>
                    <span>{mood.label}</span>
                  </button>
                ))}
              </div>

              {/* Título */}
              <input
                type="text" value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Título (opcional)"
                style={s.titleInput}
              />

              {/* Meta */}
              <div style={s.metaRow}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiCalendar size={12} />
                  {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FiClock size={12} />
                  {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: 'var(--border-card)', marginBottom: '20px' }} />

              {/* Textarea */}
              <textarea
                value={currentEntry}
                onChange={e => setCurrentEntry(e.target.value)}
                placeholder="¿Qué estás pensando? Escribe tus reflexiones aquí..."
                style={s.textarea}
                autoFocus
              />

              <div style={{ height: '1px', background: 'var(--border-card)', margin: '20px 0' }} />

              <button
                onClick={handleSaveEntry}
                disabled={loading || !currentEntry.trim()}
                style={s.saveBtn(loading || !currentEntry.trim())}
                onMouseEnter={e => { if (!loading && currentEntry.trim()) e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => e.currentTarget.style.opacity = '1'}
              >
                {loading ? (
                  <>
                    <div style={{ width: '16px', height: '16px', border: '2px solid var(--btn-text)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                    {editingEntry ? 'Actualizando...' : 'Guardando...'}
                  </>
                ) : (
                  <>
                    <FiSave size={16} />
                    {editingEntry ? 'Actualizar reflexión' : 'Guardar reflexión'}
                  </>
                )}
              </button>
            </div>

          ) : (
            <>
              {loadingEntries ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
                  <div style={{ width: '32px', height: '32px', border: '2px solid var(--accent)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                </div>

              ) : entries.length === 0 ? (
                <div style={s.emptyState}>
                  <div style={s.emptyIcon}>
                    <FiBook size={28} style={{ color: 'var(--text-muted)' }} />
                  </div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '20px', color: 'var(--text-primary)', marginBottom: '8px' }}>Diario vacío</div>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '28px' }}>Comienza a escribir tus reflexiones</div>
                  <button onClick={() => setViewMode('write')} style={{ padding: '14px 28px', borderRadius: '14px', background: 'var(--btn-bg)', border: `1px solid var(--accent)`, color: 'var(--btn-text)', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                    Crear primera entrada
                  </button>
                </div>

              ) : (
                <>
                  {entries.map((entry, i) => {
                    const mood = moods.find(m => m.id === entry.mood);
                    return (
                      <div key={entry.id} style={{ ...s.entryCard, animationDelay: `${i * 0.06}s` }}
                        onMouseEnter={e => hoverCard(e, true)}
                        onMouseLeave={e => hoverCard(e, false)}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={s.entryTitle}>{entry.title || 'Reflexión del día'}</div>
                            <div style={s.entryMeta}>
                              <span>{formatDate(entry.created_at)}</span>
                              <span>·</span>
                              <span>{formatTime(entry.created_at)}</span>
                              {mood && <><span>·</span><span>{mood.emoji} {mood.label}</span></>}
                            </div>
                          </div>
                          <button onClick={() => askDeleteEntry(entry.id)} style={{ ...s.iconBtn, color: 'var(--text-muted)' }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#c03030'; e.currentTarget.style.background = 'rgba(200,50,50,0.08)'; }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.background = 'transparent'; }}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>

                        <div style={s.entryContent}>{entry.content}</div>

                        <div style={s.entryActions}>
                          <button onClick={() => handleEditEntry(entry)} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'var(--text-secondary)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-body)', padding: '4px 0', transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-accent)'}
                            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                          >
                            <FiEdit2 size={13} /> Editar
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {stats && (
                    <div style={s.statsGrid}>
                      {[
                        { label: 'Entradas totales', value: stats.total_entries },
                        { label: 'Últimos 7 días', value: stats.entries_last_7_days },
                        { label: 'Mood frecuente', value: stats.most_common_mood ? moods.find(m => m.id === stats.most_common_mood)?.emoji || '—' : '—' },
                      ].map((s2, i) => (
                        <div key={i} style={s.statCard}>
                          <div style={{ fontSize: '22px', fontFamily: 'var(--font-heading)', color: 'var(--text-accent)', fontWeight: 700, marginBottom: '4px' }}>{s2.value}</div>
                          <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px', textTransform: 'uppercase' }}>{s2.label}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Journal;
