import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiLogIn, FiAlertCircle } from 'react-icons/fi';
import Button from '../components/Button';
import Input from '../components/Input';
import Card, { CardBody, CardFooter } from '../components/Card';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/dashboard';

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      navigate(from, { replace: true });
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full animate-fade-in">
        {/* Logo y Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-black to-gray-800 rounded-2xl mb-4 shadow-hard">
            <span className="text-white text-2xl">🧠</span>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">Parchate</h1>
          <p className="text-gray-600">Tu espacio seguro para el bienestar emocional</p>
        </div>
        
        {/* Card de Login */}
        <Card variant="elevated" hover className="overflow-hidden">
          <CardBody>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Bienvenido de nuevo</h2>
            <p className="text-gray-600 mb-8">Ingresa a tu cuenta para continuar</p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center text-red-700">
                  <FiAlertCircle className="mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Correo electrónico"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="tu@email.com"
                leftIcon={<FiMail />}
                required
                disabled={loading}
              />
              
              <Input
                label="Contraseña"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                leftIcon={<FiLock />}
                required
                disabled={loading}
              />
              
              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
                className="mt-2"
              >
                <FiLogIn className="mr-2" />
                Iniciar Sesión
              </Button>
            </form>
          </CardBody>
          
          <CardFooter>
            <p className="text-center text-gray-600">
              ¿No tienes cuenta?{' '}
              <Link 
                to="/register" 
                className="text-black font-semibold hover:underline"
              >
                Regístrate aquí
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
