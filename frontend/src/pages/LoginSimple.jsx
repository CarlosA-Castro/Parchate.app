import React from 'react';
import { Link } from 'react-router-dom';

const LoginSimple = () => {
  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1 style={{ fontSize: '32px', marginBottom: '30px' }}>Parchate - Login</h1>
      
      <div style={{ marginBottom: '20px', padding: '20px', border: '2px solid #ccc' }}>
        <h3>🔗 PRUEBA ESTOS LINKS:</h3>
        <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', marginTop: '15px' }}>
          <Link 
            to="/register" 
            style={{
              padding: '10px 20px',
              backgroundColor: '#000',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '5px'
            }}
          >
            Link React Router (Regístrate)
          </Link>
          
          <a 
            href="/register"
            style={{
              padding: '10px 20px',
              backgroundColor: '#666',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: '5px'
            }}
          >
            Link HTML normal
          </a>
          
          <button 
            onClick={() => window.location.href = '/register'}
            style={{
              padding: '10px 20px',
              backgroundColor: '#333',
              color: '#fff',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            JavaScript redirect
          </button>
        </div>
      </div>
      
      <div style={{ marginTop: '30px', color: '#666' }}>
        <p>Si el Link de React Router funciona, deberías navegar sin recargar la página.</p>
        <p>Si el Link HTML funciona, la página se recargará.</p>
      </div>
    </div>
  );
};

export default LoginSimple;
