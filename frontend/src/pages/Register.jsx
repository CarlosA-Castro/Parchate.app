import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiMail,
  FiLock,
  FiUser,
  FiAlertCircle,
  FiHeart,
  FiEye,
  FiEyeOff,
  FiCheckCircle,
  FiArrowRight
} from 'react-icons/fi';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    if (error) setError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return false;
    }
    if (formData.password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
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
      navigate('/dashboard', { replace: true });
    } else {
      setError(result.error || 'Error al crear la cuenta');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Header con logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-500 rounded-3xl mb-5 shadow-xl animate-pulse">
            <FiHeart className="text-white text-3xl" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2 tracking-tight">
            Parchate
          </h1>
          <p className="text-gray-600 text-lg">
            Comienza tu viaje de crecimiento emocional
          </p>
        </div>
        
        {/* Card de Registro */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Crear Cuenta</h2>
            <p className="text-gray-600 mb-8">Un espacio seguro solo para ti</p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl animate-fade-in">
                <div className="flex items-center text-red-700">
                  <FiAlertCircle className="mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de usuario
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiUser />
                  </div>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="tu_nombre"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiMail />
                  </div>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="nombre@email.com"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiLock />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-12 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 p-2"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <div className="mt-2 space-y-1">
                  <div className="flex items-center text-xs text-gray-500">
                    <FiCheckCircle className="mr-1 text-green-500" />
                    <span>Mínimo 8 caracteres</span>
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    <FiLock />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    className="w-full pl-10 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
                  />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white font-semibold py-4 rounded-2xl hover:from-blue-600 hover:to-purple-600 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-lg disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creando cuenta...</span>
                  </>
                ) : (
                  <>
                    <span>Comenzar ahora</span>
                    <FiArrowRight className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>
            
            {/* Beneficios de registro */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <h4 className="font-semibold text-gray-900 mb-3 text-center">Lo que obtienes:</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                    <FiHeart className="text-blue-600 text-xs" />
                  </div>
                  <span>IA de bienestar</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-6 h-6 bg-purple-100 rounded-lg flex items-center justify-center">
                    <FiCheckCircle className="text-purple-600 text-xs" />
                  </div>
                  <span>Diario privado</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                    <FiCheckCircle className="text-green-600 text-xs" />
                  </div>
                  <span>Encriptado total</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-6 h-6 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <FiCheckCircle className="text-yellow-600 text-xs" />
                  </div>
                  <span>Sin publicidad</span>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-600">
                ¿Ya tienes cuenta?{' '}
                <Link 
                  to="/login" 
                  className="font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  Inicia sesión aquí
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Mensaje de filosofía */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 italic max-w-sm mx-auto">
            "El mejor proyecto en el que trabajarás eres tú mismo. - Parchate"
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
