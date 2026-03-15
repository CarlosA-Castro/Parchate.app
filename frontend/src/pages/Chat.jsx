import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiMessageSquare, FiSend, FiUser, FiChevronLeft,
  FiBook, FiTarget, FiZap, FiTrendingUp,
  FiClock, FiPlus, FiTrash2
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Chat = () => {
  const { user } = useAuth();
  const { currentTheme } = useTheme();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedPersonality, setSelectedPersonality] = useState('estoic');
  const [error, setError] = useState('');
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, conversationId: null });

  const messagesEndRef = useRef(null);
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const personalities = [
    { id: 'estoic', name: 'Guía Estoico', icon: <FiBook size={16} />, greeting: 'La virtud está en actuar de acuerdo con la razón. ¿Qué tienes en mente hoy?' },
    { id: 'coach', name: 'Coach', icon: <FiTarget size={16} />, greeting: '¿Listo para ir más allá de tus límites? Cuéntame qué está pasando.' },
    { id: 'philosopher', name: 'Filósofo', icon: <FiTrendingUp size={16} />, greeting: 'La búsqueda del conocimiento empieza con reconocer nuestra propia ignorancia. ¿Qué te preocupa?' },
    { id: 'scientist', name: 'Científico', icon: <FiZap size={16} />, greeting: 'Desde la neurociencia, podemos entender y cambiar casi cualquier patrón. ¿Qué quieres explorar?' },
  ];

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  // Partículas
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

    const particles = Array.from({ length: 20 }, () => ({
      x: Math.random() * (canvas.width || 400),
      y: Math.random() * (canvas.height || 800),
      r: 0.5 + Math.random() * 1.5,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -(0.1 + Math.random() * 0.25),
      opacity: 0.08 + Math.random() * 0.2
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

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { if (activeConversationId) fetchMessages(activeConversationId); }, [activeConversationId]);

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const res = await api.get('/ai/conversations');
      setConversations(res.data.conversations || []);
    } catch { setError('No se pudieron cargar las conversaciones'); }
    finally { setLoadingConversations(false); }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await api.get(`/ai/conversations/${conversationId}/messages`);
      const msgs = res.data.messages || [];
      if (msgs.length === 0) {
        const selected = personalities.find(p => p.id === selectedPersonality);
        setMessages([{ id: 'greeting', role: 'assistant', content: selected?.greeting || '¿En qué puedo ayudarte?', created_at: new Date().toISOString() }]);
      } else {
        setMessages(msgs);
      }
    } catch { setError('No se pudieron cargar los mensajes'); }
  };

  const createConversation = async () => {
    try {
      const res = await api.post('/ai/conversations');
      const newConv = res.data.conversation;
      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);
      const selected = personalities.find(p => p.id === selectedPersonality);
      setMessages([{ id: 'greeting', role: 'assistant', content: selected?.greeting || '¿En qué puedo ayudarte?', created_at: new Date().toISOString() }]);
      return newConv.id;
    } catch { setError('No se pudo crear la conversación'); return null; }
  };

  const askDeleteConversation = (id) => setConfirmModal({ isOpen: true, conversationId: id });

  const handleDeleteConversation = async () => {
    const id = confirmModal.conversationId;
    setConfirmModal({ isOpen: false, conversationId: null });
    try {
      await api.delete(`/ai/conversations/${id}`);
      setConversations(prev => prev.filter(c => c.id !== id));
      if (activeConversationId === id) { setActiveConversationId(null); setMessages([]); }
    } catch { setError('No se pudo eliminar la conversación'); }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;
    setError('');
    const messageText = inputMessage.trim();
    setInputMessage('');

    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = await createConversation();
      if (!conversationId) return;
    }

    const tempMsg = { id: `temp-${Date.now()}`, role: 'user', content: messageText, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, tempMsg]);
    setLoading(true);

    try {
      const res = await api.post(`/ai/conversations/${conversationId}/chat`, {
        message: messageText, personality: selectedPersonality
      });
      setMessages(prev => [...prev, { id: res.data.message_id, role: 'assistant', content: res.data.message, created_at: new Date().toISOString() }]);
      fetchConversations();
    } catch {
      setError('Error al enviar el mensaje. Intenta de nuevo.');
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
    } finally { setLoading(false); }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(); }
  };

  const handlePersonalityChange = (id) => {
    setSelectedPersonality(id);
    if (activeConversationId) {
      const selected = personalities.find(p => p.id === id);
      setMessages(prev => [...prev, { id: `sys-${Date.now()}`, role: 'system-notice', content: `Cambiaste a ${selected?.name}`, created_at: new Date().toISOString() }]);
    }
  };

  const formatTime = (iso) => new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const s = {
    page: {
      minHeight: '100vh', height: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
      transition: 'background 0.8s ease',
      display: 'flex', flexDirection: 'column',
      position: 'relative', overflow: 'hidden',
    },
    canvas: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 },
    z1: { position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', height: '100%' },
    header: {
      background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)', padding: '14px 16px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
    },
    iconBtn: { padding: '8px', borderRadius: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s', display: 'flex', alignItems: 'center' },
    personalityBar: { background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)', backdropFilter: 'blur(20px)', padding: '10px 16px', flexShrink: 0 },
    personalityRow: { display: 'flex', gap: '8px', overflowX: 'auto' },
    pBtn: (active) => ({
      display: 'flex', alignItems: 'center', gap: '6px',
      padding: '8px 16px', borderRadius: '20px', whiteSpace: 'nowrap',
      cursor: 'pointer', border: 'none', fontFamily: 'var(--font-body)',
      fontSize: '12px', fontWeight: 500, transition: 'all 0.2s ease',
      background: active ? 'var(--accent)' : 'var(--bg-card)',
      color: active ? 'var(--btn-text)' : 'var(--text-secondary)',
      transform: active ? 'scale(1.03)' : 'scale(1)',
    }),
    body: { display: 'flex', flex: 1, overflow: 'hidden' },
    sidebar: {
      width: '220px', borderRight: '1px solid var(--nav-border)',
      background: 'var(--nav-bg)', backdropFilter: 'blur(20px)',
      overflowY: 'auto', padding: '16px', flexShrink: 0,
      display: 'none',
    },
    sidebarLabel: { fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' },
    convItem: (active) => ({
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '10px 12px', borderRadius: '12px', cursor: 'pointer',
      marginBottom: '6px', transition: 'all 0.2s ease',
      background: active ? 'var(--accent-muted)' : 'transparent',
      border: `1px solid ${active ? 'var(--accent-border)' : 'transparent'}`,
    }),
    messagesArea: { flex: 1, overflowY: 'auto', padding: '20px 16px' },
    msgRow: (isUser) => ({ display: 'flex', gap: '10px', marginBottom: '16px', flexDirection: isUser ? 'row-reverse' : 'row', animation: 'fadeUp 0.3s ease forwards' }),
    avatar: (isUser) => ({
      width: '32px', height: '32px', borderRadius: '10px', flexShrink: 0,
      background: isUser ? 'var(--accent)' : 'var(--bg-card)',
      border: `1px solid ${isUser ? 'var(--accent)' : 'var(--border-card)'}`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }),
    bubble: (isUser) => ({
      maxWidth: '72%', padding: '12px 16px', borderRadius: isUser ? '18px 4px 18px 18px' : '4px 18px 18px 18px',
      background: isUser ? 'var(--accent)' : 'var(--bg-card)',
      border: isUser ? 'none' : `1px solid var(--border-card)`,
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      transition: 'background 0.3s ease',
    }),
    bubbleText: (isUser) => ({ fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap', color: isUser ? 'var(--btn-text)' : 'var(--text-primary)' }),
    bubbleTime: { fontSize: '10px', color: 'var(--text-muted)', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '3px' },
    inputArea: {
      background: 'var(--nav-bg)', borderTop: '1px solid var(--nav-border)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      padding: '14px 16px', flexShrink: 0,
    },
    inputRow: { display: 'flex', gap: '10px', maxWidth: '700px', margin: '0 auto' },
    textarea: {
      flex: 1, padding: '12px 16px', borderRadius: '14px',
      background: 'var(--bg-card)', border: '1px solid var(--border-card)',
      color: 'var(--text-primary)', fontSize: '14px', resize: 'none',
      fontFamily: 'var(--font-body)', outline: 'none', transition: 'all 0.2s',
      backdropFilter: 'blur(8px)',
    },
    sendBtn: (disabled) => ({
      alignSelf: 'flex-end', padding: '12px 16px', borderRadius: '14px',
      background: disabled ? 'var(--bg-card)' : 'var(--btn-bg)',
      border: `1px solid ${disabled ? 'var(--border-card)' : 'var(--accent)'}`,
      color: disabled ? 'var(--text-muted)' : 'var(--btn-text)',
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      transition: 'all 0.2s ease', opacity: disabled ? 0.5 : 1,
    }),
  };

  return (
    <div style={s.page}>
      <canvas ref={canvasRef} style={s.canvas} />

      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="¿Eliminar conversación?"
        message="Esta conversación y todos sus mensajes se eliminarán permanentemente."
        confirmText="Sí, eliminar" cancelText="Cancelar"
        onConfirm={handleDeleteConversation}
        onCancel={() => setConfirmModal({ isOpen: false, conversationId: null })}
      />

      <div style={s.z1}>
        {/* Header */}
        <div style={s.header}>
          <button style={s.iconBtn} onClick={() => navigate(-1)}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <FiChevronLeft size={20} />
          </button>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)' }}>Sabiduría IA</div>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{activeConversationId ? 'Conversación activa' : 'Nueva conversación'}</div>
          </div>
          <button style={s.iconBtn} onClick={createConversation}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <FiPlus size={20} />
          </button>
        </div>

        {/* Personalidades */}
        <div style={s.personalityBar}>
          <div style={s.personalityRow}>
            {personalities.map(p => (
              <button key={p.id} onClick={() => handlePersonalityChange(p.id)} style={s.pBtn(selectedPersonality === p.id)}>
                {p.icon}
                <span>{p.name}</span>
              </button>
            ))}
          </div>
        </div>

        <div style={s.body}>
          {/* Sidebar — visible en md+ */}
          <div style={{ ...s.sidebar, display: window.innerWidth >= 768 ? 'block' : 'none' }}>
            <div style={s.sidebarLabel}>Conversaciones</div>
            {loadingConversations ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Cargando...</div>
            ) : conversations.length === 0 ? (
              <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Sin conversaciones aún</div>
            ) : conversations.map(conv => (
              <div key={conv.id} style={s.convItem(activeConversationId === conv.id)}
                onClick={() => setActiveConversationId(conv.id)}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: 500, color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {conv.title || 'Nueva conversación'}
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{conv.message_count} mensajes</div>
                </div>
                <button onClick={e => { e.stopPropagation(); askDeleteConversation(conv.id); }}
                  style={{ ...s.iconBtn, padding: '4px', opacity: 0, transition: 'opacity 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#c03030'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '0'; e.currentTarget.style.color = 'var(--text-muted)'; }}
                >
                  <FiTrash2 size={13} />
                </button>
              </div>
            ))}
          </div>

          {/* Mensajes */}
          <div style={s.messagesArea}>
            {!activeConversationId && messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '60px 24px', animation: 'fadeUp 0.5s ease forwards' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-card)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                  <FiMessageSquare size={24} style={{ color: 'var(--text-muted)' }} />
                </div>
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '18px', color: 'var(--text-primary)', marginBottom: '8px' }}>Inicia una conversación</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Selecciona una personalidad y escribe lo que tienes en mente</div>
              </div>
            )}

            {messages.map(msg => {
              if (msg.role === 'system-notice') return (
                <div key={msg.id} style={{ textAlign: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', background: 'var(--bg-card)', padding: '4px 12px', borderRadius: '20px', border: '1px solid var(--border-card)' }}>
                    {msg.content}
                  </span>
                </div>
              );

              const isUser = msg.role === 'user';
              return (
                <div key={msg.id} style={s.msgRow(isUser)}>
                  <div style={s.avatar(isUser)}>
                    {isUser
                      ? <FiUser size={14} style={{ color: 'var(--btn-text)' }} />
                      : <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '13px', color: 'var(--text-accent)' }}>π</span>
                    }
                  </div>
                  <div>
                    <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: isUser ? 'flex-end' : 'flex-start' }}>
                      <span>{isUser ? 'Tú' : personalities.find(p => p.id === selectedPersonality)?.name}</span>
                      <FiClock size={9} />
                      <span>{formatTime(msg.created_at)}</span>
                    </div>
                    <div style={s.bubble(isUser)}>
                      <div style={s.bubbleText(isUser)}>{msg.content}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div style={s.msgRow(false)}>
                <div style={s.avatar(false)}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '13px', color: 'var(--text-accent)' }}>π</span>
                </div>
                <div style={s.bubble(false)}>
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    {[0, 0.2, 0.4].map((d, i) => (
                      <div key={i} style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--text-muted)', animation: `pulse-soft 1s ${d}s ease-in-out infinite` }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <span style={{ fontSize: '12px', color: '#c03030', background: 'rgba(200,50,50,0.08)', padding: '6px 14px', borderRadius: '20px', border: '1px solid rgba(200,50,50,0.2)' }}>
                  {error}
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input */}
        <div style={s.inputArea}>
          <div style={s.inputRow}>
            <textarea
              value={inputMessage}
              onChange={e => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={`Escribe a ${personalities.find(p => p.id === selectedPersonality)?.name}...`}
              rows={2}
              disabled={loading}
              style={s.textarea}
              onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
              onBlur={e => e.target.style.borderColor = 'var(--border-card)'}
            />
            <button
              onClick={handleSendMessage}
              disabled={loading || !inputMessage.trim()}
              style={s.sendBtn(loading || !inputMessage.trim())}
              onMouseEnter={e => { if (!loading && inputMessage.trim()) e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={e => e.currentTarget.style.opacity = loading || !inputMessage.trim() ? '0.5' : '1'}
            >
              <FiSend size={18} />
            </button>
          </div>
          <div style={{ textAlign: 'center', fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px' }}>
            Las conversaciones son privadas y encriptadas
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
