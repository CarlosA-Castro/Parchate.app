import React, { useEffect, useRef } from 'react';

const ForestBackground = () => {
  const pcRef = useRef(null);

  useEffect(() => {
    const container = pcRef.current;
    if (!container) return;

    container.innerHTML = '';
    for (let i = 0; i < 20; i++) {
      const p = document.createElement('div');
      const size = 1.5 + Math.random() * 3;
      p.style.cssText = `
        position: absolute;
        border-radius: 50%;
        background: rgba(180,230,160,0.6);
        width: ${size}px;
        height: ${size}px;
        left: ${Math.random() * 100}%;
        bottom: ${60 + Math.random() * 200}px;
        animation: forestParticle ${6 + Math.random() * 10}s linear infinite;
        animation-delay: ${-Math.random() * 10}s;
        pointer-events: none;
      `;
      container.appendChild(p);
    }
  }, []);

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 0,
      pointerEvents: 'none',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #b8d4c8 0%, #c8ddd0 15%, #d4e8d8 30%, #ddeedd 50%, #e4f0e0 70%, #eef5ea 100%)',
    }}>
      {/* Luz solar difusa */}
      <div style={{
        position: 'absolute',
        top: '-60px', left: '50%',
        transform: 'translateX(-50%)',
        width: '100%', height: '300px',
        background: 'radial-gradient(ellipse 70% 60% at 50% 0%, rgba(255,255,220,0.35) 0%, transparent 70%)',
        animation: 'skyPulse 8s ease-in-out infinite',
      }} />

      {/* Rayos de luz entre árboles */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: `
          linear-gradient(170deg, rgba(255,255,220,0.05) 0%, transparent 40%),
          linear-gradient(175deg, rgba(255,255,220,0.04) 0%, transparent 50%),
          linear-gradient(168deg, rgba(255,255,220,0.04) 0%, transparent 45%)
        `,
        backgroundPosition: '20% 0, 50% 0, 78% 0',
        backgroundRepeat: 'no-repeat',
        animation: 'lightShift 12s ease-in-out infinite',
      }} />

      {/* Árboles lejanos */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '300px',
        background: `
          radial-gradient(ellipse 18px 80px at 8% 100%, #2d5a3d 0%, transparent 100%),
          radial-gradient(ellipse 22px 110px at 15% 100%, #1e4a2e 0%, transparent 100%),
          radial-gradient(ellipse 16px 70px at 22% 100%, #2a5438 0%, transparent 100%),
          radial-gradient(ellipse 20px 95px at 30% 100%, #1a4028 0%, transparent 100%),
          radial-gradient(ellipse 25px 120px at 38% 100%, #234e32 0%, transparent 100%),
          radial-gradient(ellipse 18px 85px at 46% 100%, #2d5a3d 0%, transparent 100%),
          radial-gradient(ellipse 22px 100px at 54% 100%, #1e4a2e 0%, transparent 100%),
          radial-gradient(ellipse 16px 75px at 62% 100%, #28523a 0%, transparent 100%),
          radial-gradient(ellipse 20px 90px at 70% 100%, #1a4028 0%, transparent 100%),
          radial-gradient(ellipse 24px 115px at 78% 100%, #234e32 0%, transparent 100%),
          radial-gradient(ellipse 18px 80px at 86% 100%, #2d5a3d 0%, transparent 100%),
          radial-gradient(ellipse 20px 95px at 94% 100%, #1e4a2e 0%, transparent 100%)
        `,
        opacity: 0.4,
      }} />

      {/* Árboles medios — se mecen */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '260px',
        background: `
          radial-gradient(ellipse 30px 140px at 5% 100%, #1a4a28 0%, transparent 100%),
          radial-gradient(ellipse 26px 120px at 13% 100%, #234e32 0%, transparent 100%),
          radial-gradient(ellipse 34px 160px at 22% 100%, #1a3e24 0%, transparent 100%),
          radial-gradient(ellipse 28px 130px at 33% 100%, #20482e 0%, transparent 100%),
          radial-gradient(ellipse 32px 150px at 44% 100%, #1a4228 0%, transparent 100%),
          radial-gradient(ellipse 26px 120px at 55% 100%, #234e32 0%, transparent 100%),
          radial-gradient(ellipse 30px 140px at 66% 100%, #1a4a28 0%, transparent 100%),
          radial-gradient(ellipse 28px 130px at 77% 100%, #20482e 0%, transparent 100%),
          radial-gradient(ellipse 34px 155px at 88% 100%, #1a3e24 0%, transparent 100%),
          radial-gradient(ellipse 26px 120px at 97% 100%, #234e32 0%, transparent 100%)
        `,
        opacity: 0.55,
        animation: 'treeSway 6s ease-in-out infinite',
      }} />

      {/* Árboles cercanos */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0,
        height: '200px',
        background: `
          radial-gradient(ellipse 50px 200px at 0% 100%, #0f3018 0%, transparent 100%),
          radial-gradient(ellipse 44px 180px at 10% 100%, #143820 0%, transparent 100%),
          radial-gradient(ellipse 56px 220px at 25% 100%, #0d2a16 0%, transparent 100%),
          radial-gradient(ellipse 48px 195px at 42% 100%, #123420 0%, transparent 100%),
          radial-gradient(ellipse 52px 210px at 58% 100%, #0f3018 0%, transparent 100%),
          radial-gradient(ellipse 44px 185px at 74% 100%, #143820 0%, transparent 100%),
          radial-gradient(ellipse 56px 215px at 88% 100%, #0d2a16 0%, transparent 100%),
          radial-gradient(ellipse 48px 195px at 100% 100%, #123420 0%, transparent 100%)
        `,
        opacity: 0.75,
      }} />

      {/* Niebla — 3 capas */}
      <div style={{ position: 'absolute', bottom: '80px', left: 0, right: 0, height: '200px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', bottom: 0, left: '-20%', width: '140%', height: '110px',
          background: 'radial-gradient(ellipse 70% 50% at 50% 100%, rgba(255,255,255,0.25) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'mistMove1 15s ease-in-out infinite',
        }} />
        <div style={{
          position: 'absolute', bottom: '20px', left: '-20%', width: '140%', height: '80px',
          background: 'radial-gradient(ellipse 60% 40% at 50% 100%, rgba(240,250,244,0.2) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'mistMove2 22s ease-in-out infinite',
          animationDelay: '-5s',
          opacity: 0.8,
        }} />
        <div style={{
          position: 'absolute', bottom: '40px', left: '-20%', width: '140%', height: '60px',
          background: 'radial-gradient(ellipse 80% 35% at 40% 100%, rgba(255,255,255,0.18) 0%, transparent 70%)',
          borderRadius: '50%',
          animation: 'mistMove3 18s ease-in-out infinite',
          animationDelay: '-10s',
          opacity: 0.6,
        }} />
      </div>

      {/* Suelo */}
      <div style={{
        position: 'absolute',
        bottom: 0, left: 0, right: 0, height: '60px',
        background: 'linear-gradient(180deg, transparent 0%, rgba(15,40,20,0.5) 60%, rgba(10,28,14,0.7) 100%)',
      }} />

      {/* Agua */}
      <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '28px', overflow: 'hidden' }}>
        <div style={{
          position: 'absolute', bottom: 0, left: '-10%', width: '120%', height: '100%',
          background: 'linear-gradient(180deg, rgba(120,200,180,0.0) 0%, rgba(100,180,160,0.3) 40%, rgba(80,160,140,0.5) 100%)',
          animation: 'waterFlow 4s ease-in-out infinite',
        }} />
        {[0, -1, -2].map((delay, i) => (
          <div key={i} style={{
            position: 'absolute',
            bottom: `${8 + i * 6}px`, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.35) 30%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0.35) 70%, transparent 100%)',
            animation: `rippleMove 3s ease-in-out infinite`,
            animationDelay: `${delay}s`,
            opacity: 1 - i * 0.25,
          }} />
        ))}
      </div>

      {/* Partículas de luz */}
      <div ref={pcRef} style={{ position: 'absolute', inset: 0 }} />
    </div>
  );
};

export default ForestBackground;
