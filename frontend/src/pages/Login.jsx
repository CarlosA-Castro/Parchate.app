import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiMail, 
  FiLock, 
  FiLogIn,
  FiAlertCircle,
  FiEye,
  FiEyeOff,
  FiArrowRight
} from 'react-icons/fi';

const Login = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
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

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-black rounded-3xl mb-6">
            <span className="text-white font-bold text-2xl">π</span>
          </div>
          <h1 className="text-4xl font-bold mb-2 tracking-tight">
            Parchate
          </h1>
          <p className="text-gray-600">
            Journal para la claridad mental
          </p>
        </div>
        
        {/* Login Card */}
        <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-2">Iniciar sesión</h2>
            <p className="text-gray-600 mb-8">Continúa tu camino hacia el bienestar</p>
            
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center text-red-700">
                  <FiAlertCircle className="mr-2" />
                  <span className="text-sm">{error}</span>
                </div>
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
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
                    className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-lg"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400">
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
                    className="w-full pl-12 pr-12 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 p-2"
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-gray-600 hover:text-black font-medium"
                >
                  ¿Olvidaste tu contraseña?
                </Link>
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-black text-white font-semibold py-4 rounded-2xl hover:bg-gray-800 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2 text-lg disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Iniciando sesión...</span>
                  </>
                ) : (
                  <>
                    <span>Continuar</span>
                    <FiArrowRight />
                  </>
                )}
              </button>
            </form>
            
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-center text-gray-600">
                ¿Primera vez aquí?{' '}
                <Link 
                  to="/register" 
                  className="font-semibold text-black hover:text-gray-800 transition-colors"
                >
                  Crear cuenta
                </Link>
              </p>
            </div>
          </div>
        </div>
        
        {/* Trust indicators */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-6 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Encriptado</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Privado</span>
            </div>
            <div className="h-4 w-px bg-gray-300"></div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
              <span>Sin seguimiento</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;