import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { FiMail, FiLock, FiUser, FiAlertCircle, FiCheckCircle, FiArrowRight } from 'react-icons/fi';
import Button from '../components/Button';
import Input from '../components/Input';
import Card, { CardBody, CardFooter } from '../components/Card';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Limpiar errores al escribir
    if (error) setError('');
  };

  const validateForm = () => {
    if (!formData.username.trim()) {
      setError('El nombre de usuario es requerido');
      return false;
    }
    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      return false;
    }
    if (!formData.email.includes('@')) {
      setError('Correo electrónico inválido');
      return false;
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    const result = await register(
      formData.username,
      formData.email,
      formData.password
    );
    
    if (result.success) {
      setSuccess('¡Cuenta creada exitosamente!');
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        navigate('/dashboard', { replace: true });
      }, 2000);
    } else {
      setError(result.error || 'Error al crear la cuenta');
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
          <p className="text-gray-600">Comienza tu camino hacia el bienestar emocional</p>
        </div>
        
        {/* Card de Registro */}
        <Card variant="elevated" hover className="overflow-hidden">
          <CardBody>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
            <p className="text-gray-600 mb-8">Regístrate para comenzar a usar Parchate</p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center text-red-700">
                  <FiAlertCircle className="mr-2" />
                  <span>{error}</span>
                </div>
              </div>
            )}
            
            {success && (
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center text-green-700">
                  <FiCheckCircle className="mr-2" />
                  <span>{success}</span>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <Input
                label="Nombre de usuario"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                placeholder="Ej: maria_garcia"
                leftIcon={<FiUser />}
                required
                disabled={loading}
              />
              
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
              
              <Input
                label="Confirmar contraseña"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                leftIcon={<FiLock />}
                required
                disabled={loading}
              />
              
              <div className="text-sm text-gray-600 mt-4">
                <p>La contraseña debe contener:</p>
                <ul className="list-disc list-inside ml-2">
                  <li>Mínimo 6 caracteres</li>
                  <li>Puede incluir letras y números</li>
                </ul>
              </div>
              
              <Button
                type="submit"
                variant="primary"
                size="large"
                fullWidth
                loading={loading}
                className="mt-2"
              >
                <FiArrowRight className="mr-2" />
                Crear Cuenta
              </Button>
            </form>
          </CardBody>
          
          <CardFooter>
            <p className="text-center text-gray-600">
              ¿Ya tienes cuenta?{' '}
              <Link 
                to="/login" 
                className="text-black font-semibold hover:underline"
              >
                Inicia sesión aquí
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
