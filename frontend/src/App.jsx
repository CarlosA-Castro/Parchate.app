import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import PrivateRoute from './components/PrivateRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import Journal from './pages/Journal';
import Chat from './pages/Chat';
import Profile from './pages/Profile';

const OnboardingGuard = ({ children }) => {
  const done = localStorage.getItem('parchate_onboarding_done');
  if (!done) return <Navigate to="/onboarding" replace />;
  return children;
};

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/onboarding" element={<Onboarding />} />

            <Route path="/" element={<Navigate to="/dashboard" replace />} />

            <Route path="/dashboard" element={
              <PrivateRoute>
                <OnboardingGuard>
                  <Dashboard />
                </OnboardingGuard>
              </PrivateRoute>
            } />
            <Route path="/journal" element={
              <PrivateRoute><Journal /></PrivateRoute>
            } />
            <Route path="/chat" element={
              <PrivateRoute><Chat /></PrivateRoute>
            } />
            <Route path="/profile" element={
              <PrivateRoute><Profile /></PrivateRoute>
            } />

            <Route path="*" element={
              <div style={{ minHeight:'100vh', background:'var(--bg-primary)', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
                <div style={{ textAlign:'center' }}>
                  <div style={{ width:'80px', height:'80px', background:'var(--accent-muted)', borderRadius:'24px', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 24px', fontSize:'28px', color:'var(--accent)' }}>404</div>
                  <h1 style={{ fontFamily:'var(--font-heading)', fontSize:'32px', color:'var(--text-primary)', marginBottom:'12px' }}>Página no encontrada</h1>
                  <p style={{ color:'var(--text-secondary)', marginBottom:'32px' }}>Esta página no existe o fue movida.</p>
                  <a href="/dashboard" style={{ padding:'14px 28px', background:'var(--btn-bg)', color:'var(--btn-text)', borderRadius:'14px', textDecoration:'none', fontSize:'14px', fontWeight:500 }}>Volver al inicio</a>
                </div>
              </div>
            } />
          </Routes>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
