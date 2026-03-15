import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiBook, FiMessageSquare, FiLogOut,
  FiTarget, FiTrendingUp, FiHeart,
  FiArrowRight, FiUser, FiRefreshCw, FiZap
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
  const { currentTheme } = useTheme();

  const [journalStats, setJournalStats] = useState(null);
  const [recentEntries, setRecentEntries] = useState([]);
  const [recentConversations, setRecentConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [insights, setInsights] = useState(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightsMessage, setInsightsMessage] = useState('');
  const [dailyQuote] = useState(() => quotes[Math.floor(Math.random() * quotes.length)]);

  const canvasRef = useRef(null);
  const animFrameRef = useRef(null);

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  // Partículas de fondo
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const color = currentTheme?.colors?.particle || '80,80,80';

    const resize = () => {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: 0.5 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3 - 0.05,
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
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      });
      animFrameRef.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      window.removeEventListener('resize', resize);
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    };
  }, [currentTheme]);

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
    } finally {
      setLoading(false);
    }
  };

  const fetchInsights = async () => {
    try {
      setInsightsLoading(true);
      setInsights(null);
      setInsightsMessage('');
      const res = await api.get('/analysis/insights');
      if (res.data.insights) setInsights(res.data.insights);
      else setInsightsMessage(res.data.message || 'No hay suficiente data aún.');
    } catch {
      setInsightsMessage('No se pudo generar el análisis. Intenta de nuevo.');
    } finally {
      setInsightsLoading(false);
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

  const getMoodEmoji = (moodId) => moods.find(m => m.id === moodId)?.emoji || '';

  const stats = [
    { label: 'Entradas totales', value: journalStats?.total_entries ?? '—', icon: FiBook },
    { label: 'Últimos 7 días', value: journalStats?.entries_last_7_days ?? '—', icon: FiTarget, highlight: true },
    { label: 'Mood frecuente', value: journalStats?.most_common_mood ? getMoodEmoji(journalStats.most_common_mood) : '—', icon: FiHeart },
    { label: 'Conversaciones', value: recentConversations.length || '—', icon: FiMessageSquare },
  ];

  const s = {
    page: {
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
      transition: 'background 0.8s ease, color 0.5s ease',
      position: 'relative',
      paddingBottom: '80px',
    },
    canvas: {
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0,
    },
    content: { position: 'relative', zIndex: 1 },
    header: {
      position: 'sticky', top: 0, zIndex: 10,
      background: 'var(--nav-bg)',
      borderBottom: '1px solid var(--nav-border)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      padding: '16px',
    },
    headerInner: { display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
    logo: {
      width: '36px', height: '36px', borderRadius: '10px',
      background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: 'var(--font-heading)', fontWeight: 700,
      color: 'var(--text-accent)', fontSize: '16px',
    },
    appName: { fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '18px', color: 'var(--text-primary)' },
    appSub: { fontSize: '11px', color: 'var(--text-muted)' },
    iconBtn: {
      padding: '8px', borderRadius: '10px', background: 'transparent',
      border: 'none', cursor: 'pointer', color: 'var(--text-secondary)',
      transition: 'background 0.2s',
    },
    body: { padding: '24px 16px' },
    greeting: { marginBottom: '28px', animation: 'fadeUp 0.6s ease forwards' },
    greetingName: { fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '4px' },
    greetingDate: { fontSize: '13px', color: 'var(--text-secondary)' },
    quoteCard: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
      borderRadius: '20px', padding: '20px',
      marginBottom: '24px',
      animation: 'fadeUp 0.7s ease 0.1s both',
      transition: 'background 0.3s ease',
    },
    quoteInner: { display: 'flex', gap: '16px' },
    quoteIcon: {
      width: '36px', height: '36px', borderRadius: '10px',
      background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--text-accent)', fontSize: '18px', flexShrink: 0,
    },
    quoteText: { fontStyle: 'italic', color: 'var(--text-primary)', fontSize: '14px', lineHeight: 1.6, marginBottom: '6px' },
    quoteAuthor: { fontSize: '12px', color: 'var(--text-secondary)' },
    statsGrid: {
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: '10px', marginBottom: '24px',
      animation: 'fadeUp 0.7s ease 0.2s both',
    },
    statCard: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
      borderRadius: '18px', padding: '16px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    statIcon: {
      width: '36px', height: '36px', borderRadius: '10px',
      background: 'var(--accent-muted)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '10px',
    },
    statIconHighlight: {
      width: '36px', height: '36px', borderRadius: '10px',
      background: 'var(--accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '10px',
    },
    statVal: { fontSize: '26px', fontFamily: 'var(--font-heading)', color: 'var(--text-accent)', fontWeight: 700, marginBottom: '2px' },
    statLabel: { fontSize: '11px', color: 'var(--text-secondary)' },
    sectionTitle: { fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '14px' },
    actionsGrid: {
      display: 'grid', gridTemplateColumns: '1fr 1fr',
      gap: '10px', marginBottom: '24px',
      animation: 'fadeUp 0.7s ease 0.3s both',
    },
    actionCard: {
      padding: '20px', borderRadius: '20px',
      border: '1px solid var(--border-card)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', textDecoration: 'none',
      transition: 'all 0.2s ease',
      background: 'var(--bg-card)',
    },
    actionCardPrimary: {
      padding: '20px', borderRadius: '20px',
      border: '1px solid var(--accent-border)',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      cursor: 'pointer', textDecoration: 'none',
      transition: 'all 0.2s ease',
      background: 'var(--accent-muted)',
    },
    actionIcon: {
      width: '44px', height: '44px', borderRadius: '12px',
      background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '10px', transition: 'all 0.2s',
    },
    actionIconPrimary: {
      width: '44px', height: '44px', borderRadius: '12px',
      background: 'var(--accent)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      marginBottom: '10px', transition: 'all 0.2s',
    },
    actionLabel: { fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '2px' },
    actionSub: { fontSize: '11px', color: 'var(--text-secondary)' },
    insightSection: { marginBottom: '24px', animation: 'fadeUp 0.7s ease 0.4s both' },
    insightTrigger: {
      width: '100%', padding: '20px', borderRadius: '20px',
      border: '1px dashed var(--border-card-hover)',
      background: 'transparent', cursor: 'pointer',
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px',
      transition: 'all 0.2s ease', fontFamily: 'var(--font-body)',
    },
    insightCard: {
      background: 'var(--accent)',
      borderRadius: '20px', padding: '20px',
      marginBottom: '10px',
    },
    insightCardSub: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-card)',
      borderRadius: '20px', padding: '16px',
      marginBottom: '10px',
      transition: 'background 0.3s ease',
    },
    entriesSection: { marginBottom: '24px', animation: 'fadeUp 0.7s ease 0.5s both' },
    entryCard: {
      display: 'block', padding: '16px', borderRadius: '18px',
      border: '1px solid var(--border-card)',
      background: 'var(--bg-card)',
      textDecoration: 'none', marginBottom: '10px',
      transition: 'all 0.2s ease', cursor: 'pointer',
    },
    nav: {
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--nav-bg)',
      borderTop: '1px solid var(--nav-border)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      padding: '10px 16px 14px',
      zIndex: 10,
    },
    navInner: { display: 'flex', justifyContent: 'space-around' },
    navItem: {
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      gap: '3px', padding: '6px 12px', borderRadius: '12px',
      textDecoration: 'none', cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
    navIcon: {
      width: '32px', height: '32px', borderRadius: '9px',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.2s ease',
    },
    navLabel: { fontSize: '10px', color: 'var(--text-muted)', transition: 'color 0.2s' },
  };

  const hoverCard = (e, enter) => {
    e.currentTarget.style.transform = enter ? 'translateY(-2px)' : '';
    e.currentTarget.style.background = enter ? 'var(--bg-card-hover)' : 'var(--bg-card)';
    e.currentTarget.style.borderColor = enter ? 'var(--border-card-hover)' : 'var(--border-card)';
  };

  return (
    <div style={s.page}>
      <canvas ref={canvasRef} style={s.canvas} />

      <div style={s.content}>
        {/* Header */}
        <div style={s.header}>
          <div style={s.headerInner}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={s.logo}>π</div>
              <div>
                <div style={s.appName}>Parchate</div>
                <div style={s.appSub}>Claridad mental</div>
              </div>
            </div>
            <button style={s.iconBtn} onClick={logout}>
              <FiLogOut size={18} />
            </button>
          </div>
        </div>

        <div style={s.body}>

          {/* Saludo */}
          <div style={s.greeting}>
            <div style={s.greetingName}>Hola, {user?.username || 'bienvenido'}</div>
            <div style={s.greetingDate}>
              {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
            </div>
          </div>

          {/* Frase */}
          <div style={s.quoteCard}>
            <div style={s.quoteInner}>
              <div style={s.quoteIcon}>"</div>
              <div>
                <div style={s.quoteText}>"{dailyQuote.text}"</div>
                <div style={s.quoteAuthor}>— {dailyQuote.author}</div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div style={s.statsGrid}>
            {stats.map((stat, i) => (
              <div key={i} style={s.statCard}
                onMouseEnter={e => hoverCard(e, true)}
                onMouseLeave={e => hoverCard(e, false)}
                onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.97)'; }}
                onMouseUp={e => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
              >
                <div style={stat.highlight ? s.statIconHighlight : s.statIcon}>
                  <stat.icon size={16} style={{ color: stat.highlight ? 'var(--btn-text)' : 'var(--text-accent)' }} />
                </div>
                <div style={s.statVal}>{stat.value}</div>
                <div style={s.statLabel}>{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Acciones */}
          <div style={{ marginBottom: '8px' }}>
            <div style={s.sectionTitle}>Acciones rápidas</div>
          </div>
          <div style={s.actionsGrid}>
            <Link to="/journal" style={s.actionCardPrimary}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.opacity = '0.9'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.opacity = '1'; }}
            >
              <div style={s.actionIconPrimary}>
                <FiBook size={20} style={{ color: 'var(--btn-text)' }} />
              </div>
              <div style={s.actionLabel}>Diario</div>
              <div style={s.actionSub}>Escribe tu reflexión</div>
            </Link>
            <Link to="/chat" style={s.actionCard}
              onMouseEnter={e => hoverCard(e, true)}
              onMouseLeave={e => hoverCard(e, false)}
            >
              <div style={s.actionIcon}>
                <FiMessageSquare size={20} style={{ color: 'var(--text-accent)' }} />
              </div>
              <div style={s.actionLabel}>Sabiduría IA</div>
              <div style={s.actionSub}>Conversa con sabios</div>
            </Link>
          </div>

          {/* Análisis */}
          <div style={s.insightSection}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={s.sectionTitle}>Tu análisis personal</div>
              {insights && (
                <button onClick={fetchInsights} disabled={insightsLoading}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontFamily: 'var(--font-body)' }}
                >
                  <FiRefreshCw size={12} style={insightsLoading ? { animation: 'spin 1s linear infinite' } : {}} />
                  Actualizar
                </button>
              )}
            </div>

            {!insights && !insightsLoading && !insightsMessage && (
              <button style={s.insightTrigger} onClick={fetchInsights}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent-border)'; e.currentTarget.style.background = 'var(--bg-card)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-card-hover)'; e.currentTarget.style.background = 'transparent'; }}
              >
                <div style={{ width: '44px', height: '44px', borderRadius: '12px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <FiZap size={20} style={{ color: 'var(--text-secondary)' }} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px', marginBottom: '4px' }}>Analizar mis emociones</div>
                  <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>La IA analizará tu diario y chats</div>
                </div>
              </button>
            )}

            {insightsLoading && (
              <div style={{ ...s.insightCardSub, display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ display: 'flex', gap: '4px' }}>
                  {[0, 0.2, 0.4].map((d, i) => (
                    <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent)', animation: `pulse-soft 1s ${d}s ease-in-out infinite` }} />
                  ))}
                </div>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Analizando tu diario y conversaciones...</span>
              </div>
            )}

            {insightsMessage && !insightsLoading && (
              <div style={{ ...s.insightCardSub, textAlign: 'center' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{insightsMessage}</span>
              </div>
            )}

            {insights && !insightsLoading && (
              <div>
                <div style={s.insightCard}>
                  <div style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--btn-text)', opacity: 0.6, marginBottom: '4px' }}>Estado general</div>
                  <div style={{ fontSize: '17px', fontFamily: 'var(--font-heading)', color: 'var(--btn-text)', fontWeight: 600 }}>{insights.estado_general}</div>
                </div>
                <div style={s.insightCardSub}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <FiTrendingUp size={12} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Patrón detectado</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>{insights.patron_detectado}</div>
                </div>
                <div style={s.insightCardSub}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
                    <FiZap size={12} style={{ color: 'var(--text-secondary)' }} />
                    <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>Recomendación</span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.6 }}>{insights.recomendacion}</div>
                </div>
                {insights.frase_inspiradora && (
                  <div style={s.insightCardSub}>
                    <div style={{ fontSize: '13px', color: 'var(--text-primary)', fontStyle: 'italic', marginBottom: '6px' }}>"{insights.frase_inspiradora}"</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>— {insights.autor_frase}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Entradas recientes */}
          <div style={s.entriesSection}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
              <div style={s.sectionTitle}>Reflexiones recientes</div>
              <Link to="/journal" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
                Ver todas <FiArrowRight size={12} />
              </Link>
            </div>

            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} style={{ ...s.entryCard, height: '72px', opacity: 0.4 }} />
              ))
            ) : recentEntries.length === 0 ? (
              <div style={{ ...s.entryCard, textAlign: 'center', padding: '28px' }}>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px' }}>Aún no tienes reflexiones escritas</div>
                <Link to="/journal" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-accent)', textDecoration: 'none' }}>Escribe tu primera entrada →</Link>
              </div>
            ) : recentEntries.map(entry => (
              <Link key={entry.id} to="/journal" style={s.entryCard}
                onMouseEnter={e => hoverCard(e, true)}
                onMouseLeave={e => hoverCard(e, false)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', letterSpacing: '1px', color: 'var(--text-secondary)', background: 'var(--accent-muted)', padding: '3px 8px', borderRadius: '6px' }}>
                    {formatDate(entry.created_at)}
                  </span>
                  {entry.mood && <span style={{ fontSize: '14px' }}>{getMoodEmoji(entry.mood)}</span>}
                </div>
                <div style={{ fontWeight: 500, color: 'var(--text-primary)', fontSize: '14px', marginBottom: '4px' }}>{entry.title || 'Reflexión del día'}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitBoxOrient: 'vertical', WebkitLineClamp: 2 }}>{entry.content}</div>
              </Link>
            ))}
          </div>

        </div>

        {/* Nav */}
        <div style={s.nav}>
          <div style={s.navInner}>
            {[
              { to: '/dashboard', icon: 'π', label: 'Inicio', active: true },
              { to: '/journal', icon: <FiBook size={16} />, label: 'Diario' },
              { to: '/chat', icon: <FiMessageSquare size={16} />, label: 'Sabiduría' },
              { to: '/profile', icon: <FiUser size={16} />, label: 'Perfil' },
            ].map((item, i) => (
              <Link key={i} to={item.to} style={s.navItem}>
                <div style={{ ...s.navIcon, background: item.active ? 'var(--nav-active)' : 'transparent' }}>
                  <span style={{ color: item.active ? 'var(--nav-active-text)' : 'var(--text-muted)', fontSize: item.to === '/dashboard' ? '16px' : undefined, fontFamily: item.to === '/dashboard' ? 'var(--font-heading)' : undefined, fontWeight: item.to === '/dashboard' ? 700 : undefined }}>
                    {item.icon}
                  </span>
                </div>
                <span style={{ ...s.navLabel, color: item.active ? 'var(--nav-active-text)' : 'var(--text-muted)' }}>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
