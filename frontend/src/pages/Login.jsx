import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiEye, FiEyeOff, FiArrowRight, FiAlertCircle } from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef(null);
  const animRef = useRef(null);

  const from = location.state?.from?.pathname || '/dashboard';

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = canvas.offsetWidth || window.innerWidth;
      canvas.height = canvas.offsetHeight || window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 25 }, () => ({
      x: Math.random() * (canvas.width || 400),
      y: Math.random() * (canvas.height || 800),
      r: 0.5 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.1 + Math.random() * 0.3),
      opacity: 0.06 + Math.random() * 0.18,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const color = getComputedStyle(document.documentElement).getPropertyValue('--particle-color').trim() || '80,80,80';
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
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error || 'Error al iniciar sesión');
    }
    setLoading(false);
  };

  const inputStyle = {
    width: '100%', padding: '14px 16px 14px 44px',
    background: 'var(--bg-card)', border: '1px solid var(--border-card)',
    borderRadius: '14px', color: 'var(--text-primary)',
    fontSize: '15px', outline: 'none', fontFamily: 'var(--font-body)',
    transition: 'all 0.2s ease',
    backdropFilter: 'blur(8px)',
  };

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      color: 'var(--text-primary)', fontFamily: 'var(--font-body)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '24px', position: 'relative',
      transition: 'background 0.8s ease',
    }}>
      <canvas ref={canvasRef} style={{ position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 }} />

      <div style={{ width: '100%', maxWidth: '420px', position: 'relative', zIndex: 1 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeUp 0.5s ease forwards' }}>
          <div style={{
            width: '72px', height: '72px', borderRadius: '22px',
            background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 18px',
            fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 700,
            color: 'var(--text-accent)',
          }}>π</div>
          <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Parchate
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>Journal para la claridad mental</p>
        </div>

        {/* Card */}
        <div style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-card)',
          borderRadius: '24px', padding: '32px',
          backdropFilter: 'blur(20px)', WebkitBackdropFilter: 'blur(20px)',
          animation: 'fadeUp 0.6s ease 0.1s both',
        }}>
          <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '22px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '6px' }}>
            Iniciar sesión
          </h2>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Continúa tu camino hacia el bienestar
          </p>

          {error && (
            <div style={{
              marginBottom: '20px', padding: '12px 16px', borderRadius: '12px',
              background: 'rgba(200,50,50,0.1)', border: '1px solid rgba(200,50,50,0.2)',
              display: 'flex', alignItems: 'center', gap: '8px',
              color: '#d05050', fontSize: '13px',
            }}>
              <FiAlertCircle size={15} />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px', letterSpacing: '0.3px' }}>
                Correo electrónico
              </label>
              <div style={{ position: 'relative' }}>
                <FiMail size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="nombre@email.com"
                  required disabled={loading} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-card)'}
                />
              </div>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Contraseña
              </label>
              <div style={{ position: 'relative' }}>
                <FiLock size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type={showPassword ? 'text' : 'password'} name="password"
                  value={formData.password} onChange={handleChange}
                  placeholder="••••••••" required disabled={loading}
                  style={{ ...inputStyle, paddingRight: '44px' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-border)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border-card)'}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: '4px' }}
                >
                  {showPassword ? <FiEyeOff size={16} /> : <FiEye size={16} />}
                </button>
              </div>
            </div>

            <div style={{ textAlign: 'right', marginBottom: '24px' }}>
              <Link to="/forgot-password" style={{ fontSize: '12px', color: 'var(--text-secondary)', textDecoration: 'none', transition: 'color 0.2s' }}
                onMouseEnter={e => e.target.style.color = 'var(--text-accent)'}
                onMouseLeave={e => e.target.style.color = 'var(--text-secondary)'}
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>

            <button type="submit" disabled={loading}
              style={{
                width: '100%', padding: '15px', borderRadius: '14px',
                background: loading ? 'var(--bg-card)' : 'var(--btn-bg)',
                border: `1px solid ${loading ? 'var(--border-card)' : 'var(--accent)'}`,
                color: loading ? 'var(--text-muted)' : 'var(--btn-text)',
                fontSize: '15px', fontWeight: 500, cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontFamily: 'var(--font-body)', transition: 'all 0.2s ease',
                opacity: loading ? 0.6 : 1,
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={e => e.currentTarget.style.opacity = loading ? '0.6' : '1'}
            >
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid var(--btn-text)', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                  Iniciando sesión...
                </>
              ) : (
                <>Continuar <FiArrowRight size={16} /></>
              )}
            </button>
          </form>

          <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '1px solid var(--border-card)', textAlign: 'center' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
              ¿Primera vez aquí?{' '}
              <Link to="/register" style={{ color: 'var(--text-accent)', fontWeight: 500, textDecoration: 'none' }}>
                Crear cuenta
              </Link>
            </span>
          </div>
        </div>

        {/* Trust indicators */}
        <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'center', gap: '20px', animation: 'fadeUp 0.6s ease 0.2s both' }}>
          {['Encriptado', 'Privado', 'Sin seguimiento'].map((label, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-muted)' }}>
              <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: 'var(--accent-soft)' }} />
              {label}
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default Login;
