import React from 'react';

const AppSimple = () => {
  return (
    <div style={{ 
      padding: '40px 20px',
      textAlign: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white'
    }}>
      <h1 style={{ fontSize: '32px', marginBottom: '20px' }}>🧠 Parchate</h1>
      <p style={{ marginBottom: '30px', opacity: 0.9 }}>
        Bienestar emocional con IA
      </p>
      <div style={{ 
        background: 'rgba(255,255,255,0.95)', 
        borderRadius: '20px',
        padding: '30px',
        color: '#333',
        maxWidth: '400px',
        margin: '0 auto'
      }}>
        <h2 style={{ fontSize: '24px', marginBottom: '10px' }}>✅ Funcionando</h2>
        <p>React está cargado correctamente</p>
        <div style={{ marginTop: '20px' }}>
          <a 
            href="/login"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: '12px',
              textDecoration: 'none',
              margin: '5px'
            }}
          >
            Ir a Login
          </a>
          <a 
            href="/register"
            style={{
              display: 'inline-block',
              padding: '12px 24px',
              background: '#f0f9ff',
              color: '#0ea5e9',
              border: '2px solid #0ea5e9',
              borderRadius: '12px',
              textDecoration: 'none',
              margin: '5px'
            }}
          >
            Ir a Register
          </a>
        </div>
      </div>
    </div>
  );
};

export default AppSimple;
