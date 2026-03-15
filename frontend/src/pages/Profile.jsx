import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  FiUser, FiMail, FiLogOut, FiChevronLeft,
  FiShield, FiBook, FiMessageSquare, FiHeart
} from 'react-icons/fi';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Profile = () => {
  const { user, logout } = useAuth();
  const { currentTheme, changeTheme, themes } = useTheme();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [conversationCount, setConversationCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const canvasRef = useRef(null);
  const animRef = useRef(null);

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
    } catch {}
    finally { setLoading(false); }
  };

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const s = {
    page: {
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
      transition: 'background 0.8s ease, color 0.5s ease',
      position: 'relative',
      paddingBottom: '100px',
    },
    canvas: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 },
    content: { position: 'relative', zIndex: 1 },
    header: {
      position: 'sticky', top: 0, zIndex: 10,
      background: 'var(--nav-bg)', borderBottom: '1px solid var(--nav-border)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      padding: '14px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    },
    iconBtn: { padding: '8px', borderRadius: '10px', background: 'transparent', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', transition: 'all 0.2s', display: 'flex', alignItems: 'center' },
    body: { padding: '32px 16px', maxWidth: '480px', margin: '0 auto' },
    avatar: {
      width: '80px', height: '80px', borderRadius: '24px',
      background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      margin: '0 auto 16px',
      fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 700,
      color: 'var(--text-accent)',
    },
    name: { fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, color: 'var(--text-primary)', textAlign: 'center', marginBottom: '6px' },
    email: { fontSize: '13px', color: 'var(--text-secondary)', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', marginBottom: '32px' },
    statsGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '28px' },
    statCard: {
      background: 'var(--bg-card)', border: '1px solid var(--border-card)',
      borderRadius: '18px', padding: '18px', textAlign: 'center',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
      transition: 'all 0.2s ease', animation: 'fadeUp 0.5s ease forwards',
    },
    sectionLabel: { fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' },
    listCard: {
      background: 'var(--bg-card)', border: '1px solid var(--border-card)',
      borderRadius: '18px', overflow: 'hidden', marginBottom: '20px',
      backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
    },
    listItem: {
      display: 'flex', alignItems: 'center', gap: '14px',
      padding: '14px 16px', borderBottom: '1px solid var(--border-card)',
      transition: 'background 0.2s ease', cursor: 'default',
    },
    listItemIcon: {
      width: '34px', height: '34px', borderRadius: '10px',
      background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    },
    listItemLabel: { fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px' },
    listItemValue: { fontSize: '14px', fontWeight: 500, color: 'var(--text-primary)' },
    themeGrid: { display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '28px' },
    themeBtn: (active) => ({
      padding: '8px 16px', borderRadius: '24px', fontSize: '12px', fontWeight: 500,
      cursor: 'pointer', border: 'none', fontFamily: 'var(--font-body)',
      transition: 'all 0.25s ease',
      background: active ? 'var(--accent)' : 'var(--bg-card)',
      color: active ? 'var(--btn-text)' : 'var(--text-secondary)',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border-card)'}`,
      transform: active ? 'scale(1.05)' : 'scale(1)',
      boxShadow: active ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
    }),
    linkItem: {
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '14px 16px', textDecoration: 'none',
      transition: 'background 0.2s ease',
      borderBottom: '1px solid var(--border-card)',
    },
    logoutBtn: {
      width: '100%', padding: '16px', borderRadius: '14px',
      background: 'transparent', border: '1px solid rgba(200,50,50,0.3)',
      color: '#c03030', fontSize: '14px', fontWeight: 500,
      cursor: 'pointer', fontFamily: 'var(--font-body)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      transition: 'all 0.2s ease',
    },
    nav: {
      position: 'fixed', bottom: 0, left: 0, right: 0,
      background: 'var(--nav-bg)', borderTop: '1px solid var(--nav-border)',
      backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
      padding: '10px 16px 14px', zIndex: 10,
    },
    navInner: { display: 'flex', justifyContent: 'space-around' },
    navItem: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '3px', padding: '6px 12px', textDecoration: 'none', transition: 'all 0.2s' },
    navIcon: (active) => ({ width: '32px', height: '32px', borderRadius: '9px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: active ? 'var(--nav-active)' : 'transparent', transition: 'all 0.2s' }),
    navLabel: (active) => ({ fontSize: '10px', color: active ? 'var(--nav-active-text)' : 'var(--text-muted)', transition: 'color 0.2s' }),
  };

  const hoverCard = (e, enter) => {
    e.currentTarget.style.background = enter ? 'var(--bg-card-hover)' : 'var(--bg-card)';
    e.currentTarget.style.transform = enter ? 'translateY(-2px)' : '';
  };

  return (
    <div style={s.page}>
      <canvas ref={canvasRef} style={s.canvas} />

      <div style={s.content}>
        <div style={s.header}>
          <button style={s.iconBtn} onClick={() => navigate(-1)}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <FiChevronLeft size={20} />
          </button>
          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: '17px', color: 'var(--text-primary)' }}>Perfil</div>
          <div style={{ width: '36px' }} />
        </div>

        <div style={s.body}>

          {/* Avatar */}
          <div style={{ animation: 'fadeUp 0.5s ease forwards' }}>
            <div style={s.avatar}>
              {user?.username?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div style={s.name}>{user?.username}</div>
            <div style={s.email}>
              <FiMail size={13} />
              {user?.email}
            </div>
          </div>

          {/* Stats */}
          <div style={s.statsGrid}>
            <div style={{ ...s.statCard, animationDelay: '0.1s' }}
              onMouseEnter={e => hoverCard(e, true)}
              onMouseLeave={e => hoverCard(e, false)}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-muted)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <FiBook size={16} style={{ color: 'var(--text-accent)' }} />
              </div>
              <div style={{ fontSize: '26px', fontFamily: 'var(--font-heading)', color: 'var(--text-accent)', fontWeight: 700, marginBottom: '4px' }}>
                {loading ? '—' : stats?.total_entries ?? '0'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Reflexiones</div>
            </div>
            <div style={{ ...s.statCard, animationDelay: '0.15s' }}
              onMouseEnter={e => hoverCard(e, true)}
              onMouseLeave={e => hoverCard(e, false)}
            >
              <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'var(--accent-muted)', border: '1px solid var(--accent-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 10px' }}>
                <FiMessageSquare size={16} style={{ color: 'var(--text-accent)' }} />
              </div>
              <div style={{ fontSize: '26px', fontFamily: 'var(--font-heading)', color: 'var(--text-accent)', fontWeight: 700, marginBottom: '4px' }}>
                {loading ? '—' : conversationCount}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Conversaciones</div>
            </div>
          </div>

          {/* Info de cuenta */}
          <div style={s.sectionLabel}>Tu cuenta</div>
          <div style={s.listCard}>
            {[
              { icon: <FiUser size={15} style={{ color: 'var(--text-accent)' }} />, label: 'Usuario', value: user?.username },
              { icon: <FiMail size={15} style={{ color: 'var(--text-accent)' }} />, label: 'Email', value: user?.email },
              { icon: <FiShield size={15} style={{ color: 'var(--text-accent)' }} />, label: 'Privacidad', value: 'Datos encriptados' },
            ].map((item, i) => (
              <div key={i} style={{ ...s.listItem, borderBottom: i < 2 ? '1px solid var(--border-card)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={s.listItemIcon}>{item.icon}</div>
                <div>
                  <div style={s.listItemLabel}>{item.label}</div>
                  <div style={s.listItemValue}>{item.value}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Cambiar tema */}
          <div style={s.sectionLabel}>Tu espacio visual</div>
          <div style={s.themeGrid}>
            {Object.values(themes).map(theme => (
              <button
                key={theme.id}
                onClick={() => changeTheme(theme.id)}
                style={s.themeBtn(currentTheme.id === theme.id)}
              >
                {theme.emoji} {theme.name}
              </button>
            ))}
          </div>

          {/* Navegación rápida */}
          <div style={s.sectionLabel}>Ir a</div>
          <div style={s.listCard}>
            {[
              { to: '/journal', icon: <FiBook size={15} style={{ color: 'var(--text-accent)' }} />, label: 'Mi diario' },
              { to: '/chat', icon: <FiMessageSquare size={15} style={{ color: 'var(--text-accent)' }} />, label: 'Sabiduría IA' },
            ].map((item, i) => (
              <Link key={i} to={item.to} style={{ ...s.linkItem, color: 'var(--text-primary)', borderBottom: i === 0 ? '1px solid var(--border-card)' : 'none' }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={s.listItemIcon}>{item.icon}</div>
                  <span style={{ fontSize: '14px', fontWeight: 500 }}>{item.label}</span>
                </div>
                <FiChevronLeft size={16} style={{ color: 'var(--text-muted)', transform: 'rotate(180deg)' }} />
              </Link>
            ))}
          </div>

          {/* Sobre Parchate */}
          <div style={{ ...s.listCard, padding: '16px', marginBottom: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FiHeart size={13} style={{ color: 'var(--text-muted)' }} />
              <span style={{ fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Sobre Parchate</span>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Un espacio privado para pensar con claridad, usando la sabiduría acumulada de los mejores filósofos, científicos y líderes de la historia.
            </p>
          </div>

          {/* Cerrar sesión */}
          <button style={s.logoutBtn} onClick={handleLogout}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(200,50,50,0.08)'; e.currentTarget.style.borderColor = 'rgba(200,50,50,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'rgba(200,50,50,0.3)'; }}
          >
            <FiLogOut size={16} />
            Cerrar sesión
          </button>

        </div>
      </div>

      {/* Nav */}
      <div style={s.nav}>
        <div style={s.navInner}>
          {[
            { to: '/dashboard', icon: 'π', label: 'Inicio' },
            { to: '/journal', icon: <FiBook size={16} />, label: 'Diario' },
            { to: '/chat', icon: <FiMessageSquare size={16} />, label: 'Sabiduría' },
            { to: '/profile', icon: <FiUser size={16} />, label: 'Perfil', active: true },
          ].map((item, i) => (
            <Link key={i} to={item.to} style={s.navItem}>
              <div style={s.navIcon(item.active)}>
                <span style={{ color: item.active ? 'var(--nav-active-text)' : 'var(--text-muted)', fontFamily: item.to === '/dashboard' ? 'var(--font-heading)' : undefined, fontWeight: item.to === '/dashboard' ? 700 : undefined, fontSize: item.to === '/dashboard' ? '16px' : undefined }}>
                  {item.icon}
                </span>
              </div>
              <span style={s.navLabel(item.active)}>{item.label}</span>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Profile;
