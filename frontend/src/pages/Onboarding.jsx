import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';

const questions = [
  {
    id: 1,
    question: '¿Cómo describes tu energía en este momento de tu vida?',
    options: [
      { label: 'Enfocado y en modo conquista', value: 'discipline', emoji: '💪' },
      { label: 'Buscando calma y equilibrio', value: 'nature', emoji: '🌿' },
      { label: 'Conectando con mi esencia femenina', value: 'femininity', emoji: '🌸' },
      { label: 'En búsqueda espiritual y de sentido', value: 'spiritual', emoji: '✨' },
      { label: 'Prefiero la claridad sin adornos', value: 'minimal', emoji: '◼' },
    ],
  },
  {
    id: 2,
    question: '¿Qué frase resuena más contigo ahora mismo?',
    options: [
      { label: '"La disciplina supera al talento"', value: 'discipline', emoji: '🏆' },
      { label: '"Fluye como el agua"', value: 'nature', emoji: '💧' },
      { label: '"Mi vulnerabilidad es mi fuerza"', value: 'femininity', emoji: '🌺' },
      { label: '"El camino empieza adentro"', value: 'spiritual', emoji: '🔮' },
      { label: '"Menos es más"', value: 'minimal', emoji: '✦' },
    ],
  },
  {
    id: 3,
    question: '¿Qué ambiente te genera más claridad mental?',
    options: [
      { label: 'Un gym a las 5am, sin nadie', value: 'discipline', emoji: '🌑' },
      { label: 'Un bosque o parque al amanecer', value: 'nature', emoji: '🌲' },
      { label: 'Un café con velas y música suave', value: 'femininity', emoji: '🕯️' },
      { label: 'Meditando en silencio absoluto', value: 'spiritual', emoji: '🧘' },
      { label: 'Una habitación blanca y ordenada', value: 'minimal', emoji: '🏠' },
    ],
  },
  {
    id: 4,
    question: '¿Qué quieres que Parchate te ayude a desarrollar principalmente?',
    options: [
      { label: 'Disciplina y alto rendimiento', value: 'discipline', emoji: '⚡' },
      { label: 'Paz interior y conexión con la naturaleza', value: 'nature', emoji: '🍃' },
      { label: 'Autoconocimiento y amor propio', value: 'femininity', emoji: '💖' },
      { label: 'Propósito y crecimiento espiritual', value: 'spiritual', emoji: '🌙' },
      { label: 'Claridad mental y organización', value: 'minimal', emoji: '📐' },
    ],
  },
  {
    id: 5,
    question: '¿Con qué paleta de colores te identificas más?',
    options: [
      { label: 'Negro profundo con verde energético', value: 'discipline', emoji: '🖤' },
      { label: 'Blanco y verde suave, como un jardín', value: 'nature', emoji: '🤍' },
      { label: 'Vino, rosa suave y crema dorada', value: 'femininity', emoji: '🩷' },
      { label: 'Morado profundo y dorado místico', value: 'spiritual', emoji: '💜' },
      { label: 'Blanco, negro y beige puro', value: 'minimal', emoji: '🩶' },
    ],
  },
];

const themeDescriptions = {
  discipline: 'Construido para quienes no se rinden. Oscuro, enérgico, enfocado.',
  nature: 'Para quienes encuentran paz en lo simple. Blanco, verde, calma.',
  femininity: 'Para quienes abrazan su poder interior. Profundo y suave a la vez.',
  spiritual: 'Para quienes buscan más allá de lo visible. Místico y sereno.',
  minimal: 'Para quienes piensan mejor sin ruido. Limpio y directo.',
};

const Onboarding = () => {
  const { changeTheme, themes, currentTheme } = useTheme();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [assignedTheme, setAssignedTheme] = useState(null);
  const [transitioning, setTransitioning] = useState(false);

  const canvasRef = useRef(null);
  const animRef = useRef(null);

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

    const particles = Array.from({ length: 30 }, () => ({
      x: Math.random() * (canvas.width || 400),
      y: Math.random() * (canvas.height || 800),
      r: 0.5 + Math.random() * 2,
      vx: (Math.random() - 0.5) * 0.3,
      vy: -(0.1 + Math.random() * 0.3),
      opacity: 0.06 + Math.random() * 0.2,
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
  }, [currentTheme]);

  const progress = step === 0 ? 0 : step <= 5 ? (step / 5) * 100 : 100;

  const calculateTheme = (answers) => {
    const counts = {};
    answers.forEach(a => { counts[a] = (counts[a] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  };

  const handleSelect = (value) => setSelectedOption(value);

  const handleNext = () => {
    if (!selectedOption) return;
    const newAnswers = [...answers, selectedOption];
    setAnswers(newAnswers);
    setTransitioning(true);
    setTimeout(() => {
      setSelectedOption(null);
      if (step === 5) {
        const theme = calculateTheme(newAnswers);
        setAssignedTheme(theme);
        changeTheme(theme);
        setStep(6);
      } else {
        setStep(step + 1);
      }
      setTransitioning(false);
    }, 280);
  };

  const handleBack = () => {
    if (step <= 1) return;
    setAnswers(answers.slice(0, -1));
    setSelectedOption(null);
    setStep(step - 1);
  };

  const handleFinish = () => {
    localStorage.setItem('parchate_onboarding_done', 'true');
    navigate('/dashboard', { replace: true });
  };

  const currentQuestion = questions[step - 1];

  const s = {
    page: {
      minHeight: '100vh',
      background: 'var(--bg-primary)',
      color: 'var(--text-primary)',
      fontFamily: 'var(--font-body)',
      transition: 'background 0.8s ease, color 0.5s ease',
      display: 'flex', flexDirection: 'column',
      position: 'relative',
    },
    canvas: { position: 'fixed', inset: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 0 },
    progressBar: { position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10, height: '2px', background: 'var(--border-card)' },
    progressFill: { height: '100%', background: 'var(--accent)', transition: 'width 0.5s ease' },
    body: {
      flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center',
      padding: '60px 24px 40px', maxWidth: '480px', margin: '0 auto', width: '100%',
      position: 'relative', zIndex: 1,
    },
    optionBtn: (active) => ({
      width: '100%', padding: '16px 20px', borderRadius: '16px',
      background: active ? 'var(--accent-muted)' : 'var(--bg-card)',
      border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border-card)'}`,
      color: active ? 'var(--text-accent)' : 'var(--text-secondary)',
      fontSize: '14px', fontWeight: active ? 500 : 400,
      cursor: 'pointer', textAlign: 'left',
      display: 'flex', alignItems: 'center', gap: '14px',
      fontFamily: 'var(--font-body)',
      transition: 'all 0.2s ease',
      transform: active ? 'translateX(6px)' : 'translateX(0)',
      backdropFilter: 'blur(8px)',
    }),
    nextBtn: (enabled) => ({
      flex: 1, padding: '15px', borderRadius: '14px',
      background: enabled ? 'var(--btn-bg)' : 'var(--bg-card)',
      border: `1px solid ${enabled ? 'var(--accent)' : 'var(--border-card)'}`,
      color: enabled ? 'var(--btn-text)' : 'var(--text-muted)',
      fontSize: '15px', fontWeight: 500,
      cursor: enabled ? 'pointer' : 'not-allowed',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      fontFamily: 'var(--font-body)', transition: 'all 0.2s ease',
      opacity: enabled ? 1 : 0.5,
    }),
    backBtn: {
      padding: '15px 18px', borderRadius: '14px',
      background: 'transparent', border: '1px solid var(--border-card)',
      color: 'var(--text-secondary)', cursor: 'pointer',
      display: 'flex', alignItems: 'center',
      fontFamily: 'var(--font-body)', transition: 'all 0.2s',
    },
    themeBtn: (active) => ({
      padding: '9px 16px', borderRadius: '24px', fontSize: '12px', fontWeight: 500,
      cursor: 'pointer', border: 'none', fontFamily: 'var(--font-body)',
      transition: 'all 0.25s ease',
      background: active ? 'var(--accent)' : 'var(--bg-card)',
      color: active ? 'var(--btn-text)' : 'var(--text-secondary)',
      border: `1px solid ${active ? 'var(--accent)' : 'var(--border-card)'}`,
      transform: active ? 'scale(1.05)' : 'scale(1)',
    }),
  };

  return (
    <div style={s.page}>
      <canvas ref={canvasRef} style={s.canvas} />

      {step > 0 && step <= 5 && (
        <div style={s.progressBar}>
          <div style={{ ...s.progressFill, width: `${progress}%` }} />
        </div>
      )}

      <div style={s.body}>

        {/* INTRO */}
        {step === 0 && (
          <div style={{ animation: 'fadeUp 0.6s ease forwards', textAlign: 'center' }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '24px',
              background: 'var(--accent-muted)', border: '1px solid var(--accent-border)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              margin: '0 auto 24px',
              fontFamily: 'var(--font-heading)', fontSize: '32px', fontWeight: 700,
              color: 'var(--text-accent)', animation: 'float 3s ease-in-out infinite',
            }}>π</div>

            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: '38px', fontWeight: 700, lineHeight: 1.1, color: 'var(--text-primary)', marginBottom: '16px' }}>
              Bienvenido a<br />
              <span style={{ color: 'var(--accent)' }}>Parchate</span>
            </h1>

            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.7, marginBottom: '40px', maxWidth: '320px', margin: '0 auto 40px' }}>
              5 preguntas para crear tu espacio personal. Tu experiencia se adapta a quién eres.
            </p>

            <button onClick={() => setStep(1)} style={{
              ...s.nextBtn(true), width: '100%', padding: '16px',
            }}>
              Comenzar <FiArrowRight size={16} />
            </button>

            <p style={{ marginTop: '16px', fontSize: '11px', color: 'var(--text-muted)' }}>
              Puedes cambiar tu tema en cualquier momento desde tu perfil
            </p>
          </div>
        )}

        {/* PREGUNTAS */}
        {step >= 1 && step <= 5 && currentQuestion && (
          <div style={{
            opacity: transitioning ? 0 : 1,
            transform: transitioning ? 'translateY(8px)' : 'translateY(0)',
            transition: 'all 0.28s ease',
          }}>
            <div style={{ fontSize: '11px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '12px' }}>
              {step} de 5
            </div>

            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '24px', fontWeight: 700, lineHeight: 1.25, color: 'var(--text-primary)', marginBottom: '28px' }}>
              {currentQuestion.question}
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
              {currentQuestion.options.map(opt => (
                <button key={opt.value} onClick={() => handleSelect(opt.value)} style={s.optionBtn(selectedOption === opt.value)}
                  onMouseEnter={e => { if (selectedOption !== opt.value) e.currentTarget.style.background = 'var(--bg-card-hover)'; }}
                  onMouseLeave={e => { if (selectedOption !== opt.value) e.currentTarget.style.background = 'var(--bg-card)'; }}
                >
                  <span style={{ fontSize: '22px', flexShrink: 0 }}>{opt.emoji}</span>
                  <span style={{ flex: 1 }}>{opt.label}</span>
                  {selectedOption === opt.value && <FiCheck size={16} style={{ color: 'var(--accent)', flexShrink: 0 }} />}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              {step > 1 && (
                <button onClick={handleBack} style={s.backBtn}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-card)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <FiArrowLeft size={18} />
                </button>
              )}
              <button onClick={handleNext} disabled={!selectedOption} style={s.nextBtn(!!selectedOption)}
                onMouseEnter={e => { if (selectedOption) e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => e.currentTarget.style.opacity = selectedOption ? '1' : '0.5'}
              >
                {step === 5 ? 'Ver mi espacio' : 'Siguiente'} <FiArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* RESULTADO */}
        {step === 6 && assignedTheme && (
          <div style={{ animation: 'fadeUp 0.6s ease forwards', textAlign: 'center' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px', animation: 'float 3s ease-in-out infinite' }}>
              {themes[assignedTheme]?.emoji}
            </div>

            <div style={{ fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent-soft)', marginBottom: '10px' }}>
              Tu espacio es
            </div>

            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: '40px', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '12px' }}>
              {themes[assignedTheme]?.name}
            </h2>

            <p style={{ fontSize: '15px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '36px', maxWidth: '300px', margin: '0 auto 36px' }}>
              {themeDescriptions[assignedTheme]}
            </p>

            <div style={{ marginBottom: '32px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '12px' }}>
                ¿Quieres otro? Elige:
              </p>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', flexWrap: 'wrap' }}>
                {Object.values(themes).map(t => (
                  <button key={t.id} onClick={() => { setAssignedTheme(t.id); changeTheme(t.id); }} style={s.themeBtn(assignedTheme === t.id)}>
                    {t.emoji} {t.name}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={handleFinish} style={{ ...s.nextBtn(true), width: '100%', padding: '16px' }}
              onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              Entrar a mi espacio <FiArrowRight size={16} />
            </button>
          </div>
        )}

      </div>
    </div>
  );
};

export default Onboarding;
