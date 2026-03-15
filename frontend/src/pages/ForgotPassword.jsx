import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/forgot-password`, { email });
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al enviar el email. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">

        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black rounded-2xl mb-5">
            <span className="text-white font-bold text-2xl">π</span>
          </div>
          <h1 className="text-3xl font-bold mb-2">Parchate</h1>
        </div>

        <div className="bg-white border border-gray-200 rounded-3xl p-8">

          {sent ? (
            /* Estado de éxito */
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiCheckCircle className="text-green-600" size={28} />
              </div>
              <h2 className="text-xl font-bold mb-2">Revisa tu email</h2>
              <p className="text-gray-600 text-sm mb-6 leading-relaxed">
                Si <strong>{email}</strong> está registrado en Parchate,
                recibirás un enlace para restablecer tu contraseña en los próximos minutos.
              </p>
              <p className="text-xs text-gray-400 mb-6">
                Revisa también tu carpeta de spam si no lo ves.
              </p>
              <Link
                to="/login"
                className="text-sm font-medium text-black hover:underline"
              >
                Volver al inicio de sesión
              </Link>
            </div>

          ) : (
            /* Formulario */
            <>
              <h2 className="text-2xl font-bold mb-2">¿Olvidaste tu contraseña?</h2>
              <p className="text-gray-600 text-sm mb-8 leading-relaxed">
                Escribe tu email y te enviaremos un enlace para crear una nueva contraseña.
              </p>

              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo electrónico
                  </label>
                  <div className="relative">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                      <FiMail size={18} />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="nombre@email.com"
                      required
                      disabled={loading}
                      className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent text-lg"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || !email.trim()}
                  className="w-full bg-black text-white font-semibold py-4 rounded-2xl hover:bg-gray-800 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Enviando...</span>
                    </>
                  ) : (
                    <span>Enviar enlace</span>
                  )}
                </button>
              </form>

              <div className="mt-6 pt-6 border-t border-gray-100">
                <Link
                  to="/login"
                  className="flex items-center justify-center gap-2 text-sm text-gray-600 hover:text-black transition-colors"
                >
                  <FiArrowLeft size={14} />
                  <span>Volver al inicio de sesión</span>
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
