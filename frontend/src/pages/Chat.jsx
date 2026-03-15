import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiMessageSquare,
  FiSend,
  FiUser,
  FiChevronLeft,
  FiBook,
  FiTarget,
  FiZap,
  FiTrendingUp,
  FiClock,
  FiPlus,
  FiTrash2
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ConfirmModal from '../components/ConfirmModal';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [conversations, setConversations] = useState([]);
  const [activeConversationId, setActiveConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [selectedPersonality, setSelectedPersonality] = useState('estoic');
  const [error, setError] = useState('');

  // Estado del modal de confirmación
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    conversationId: null
  });

  const messagesEndRef = useRef(null);

  const personalities = [
    {
      id: 'estoic',
      name: 'Guía Estoico',
      icon: <FiBook size={18} />,
      description: 'Sabiduría de Marco Aurelio y Séneca',
      greeting: 'La virtud está en actuar de acuerdo con la razón. ¿Qué tienes en mente hoy?'
    },
    {
      id: 'coach',
      name: 'Coach',
      icon: <FiTarget size={18} />,
      description: 'Mentalidad de alto rendimiento',
      greeting: '¿Listo para ir más allá de tus límites? Cuéntame qué está pasando.'
    },
    {
      id: 'philosopher',
      name: 'Filósofo',
      icon: <FiTrendingUp size={18} />,
      description: 'Pensamiento profundo y existencial',
      greeting: 'La búsqueda del conocimiento empieza con reconocer nuestra propia ignorancia. ¿Qué te preocupa?'
    },
    {
      id: 'scientist',
      name: 'Científico',
      icon: <FiZap size={18} />,
      description: 'Neurociencia y psicología aplicada',
      greeting: 'Desde la neurociencia, podemos entender y cambiar casi cualquier patrón. ¿Qué quieres explorar?'
    }
  ];

  const api = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${localStorage.getItem('token')}`
    }
  });

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (activeConversationId) {
      fetchMessages(activeConversationId);
    }
  }, [activeConversationId]);

  const fetchConversations = async () => {
    try {
      setLoadingConversations(true);
      const res = await api.get('/ai/conversations');
      setConversations(res.data.conversations || []);
    } catch (err) {
      setError('No se pudieron cargar las conversaciones');
    } finally {
      setLoadingConversations(false);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const res = await api.get(`/ai/conversations/${conversationId}/messages`);
      const msgs = res.data.messages || [];

      if (msgs.length === 0) {
        const selected = personalities.find(p => p.id === selectedPersonality);
        setMessages([{
          id: 'greeting',
          role: 'assistant',
          content: selected?.greeting || '¿En qué puedo ayudarte hoy?',
          created_at: new Date().toISOString()
        }]);
      } else {
        setMessages(msgs);
      }
    } catch (err) {
      setError('No se pudieron cargar los mensajes');
    }
  };

  const createConversation = async () => {
    try {
      const res = await api.post('/ai/conversations');
      const newConv = res.data.conversation;

      setConversations(prev => [newConv, ...prev]);
      setActiveConversationId(newConv.id);

      const selected = personalities.find(p => p.id === selectedPersonality);
      setMessages([{
        id: 'greeting',
        role: 'assistant',
        content: selected?.greeting || '¿En qué puedo ayudarte hoy?',
        created_at: new Date().toISOString()
      }]);

      return newConv.id;
    } catch (err) {
      setError('No se pudo crear la conversación');
      return null;
    }
  };

  // Abre el modal en lugar de borrar directamente
  const askDeleteConversation = (conversationId) => {
    setConfirmModal({ isOpen: true, conversationId });
  };

  // Se ejecuta solo si el usuario confirma en el modal
  const handleDeleteConversation = async () => {
    const conversationId = confirmModal.conversationId;
    setConfirmModal({ isOpen: false, conversationId: null });

    try {
      await api.delete(`/ai/conversations/${conversationId}`);
      setConversations(prev => prev.filter(c => c.id !== conversationId));

      if (activeConversationId === conversationId) {
        setActiveConversationId(null);
        setMessages([]);
      }
    } catch (err) {
      setError('No se pudo eliminar la conversación');
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    setError('');
    const messageText = inputMessage.trim();
    setInputMessage('');

    let conversationId = activeConversationId;
    if (!conversationId) {
      conversationId = await createConversation();
      if (!conversationId) return;
    }

    const tempUserMsg = {
      id: `temp-${Date.now()}`,
      role: 'user',
      content: messageText,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const res = await api.post(`/ai/conversations/${conversationId}/chat`, {
        message: messageText,
        personality: selectedPersonality
      });

      const aiMsg = {
        id: res.data.message_id,
        role: 'assistant',
        content: res.data.message,
        created_at: new Date().toISOString()
      };
      setMessages(prev => [...prev, aiMsg]);
      fetchConversations();

    } catch (err) {
      setError('Error al enviar el mensaje. Intenta de nuevo.');
      setMessages(prev => prev.filter(m => m.id !== tempUserMsg.id));
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePersonalityChange = (personalityId) => {
    setSelectedPersonality(personalityId);
    if (activeConversationId) {
      const selected = personalities.find(p => p.id === personalityId);
      setMessages(prev => [...prev, {
        id: `system-${Date.now()}`,
        role: 'system-notice',
        content: `Cambiaste a ${selected?.name}. ${selected?.greeting}`,
        created_at: new Date().toISOString()
      }]);
    }
  };

  const formatTime = (isoString) => {
    return new Date(isoString).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">

      {/* Modal de confirmación */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title="¿Eliminar conversación?"
        message="Esta conversación y todos sus mensajes se eliminarán permanentemente."
        confirmText="Sí, eliminar"
        cancelText="Cancelar"
        onConfirm={handleDeleteConversation}
        onCancel={() => setConfirmModal({ isOpen: false, conversationId: null })}
      />

      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="p-2 hover:bg-gray-100 rounded-xl"
            >
              <FiChevronLeft size={20} />
            </button>

            <div className="text-center">
              <h1 className="text-lg font-bold">Sabiduría IA</h1>
              <p className="text-xs text-gray-500">
                {activeConversationId ? 'Conversación activa' : 'Nueva conversación'}
              </p>
            </div>

            <button
              onClick={createConversation}
              className="p-2 hover:bg-gray-100 rounded-xl"
              title="Nueva conversación"
            >
              <FiPlus size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Selector de personalidad */}
      <div className="border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {personalities.map((personality) => (
              <button
                key={personality.id}
                onClick={() => handlePersonalityChange(personality.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl whitespace-nowrap transition-colors ${
                  selectedPersonality === personality.id
                    ? 'bg-black text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {personality.icon}
                <span className="text-sm font-medium">{personality.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">

        {/* Panel lateral — historial */}
        <div className="hidden md:flex flex-col w-64 border-r border-gray-200 overflow-y-auto">
          <div className="p-4">
            <h2 className="text-sm font-medium text-gray-600 mb-3">Conversaciones</h2>

            {loadingConversations ? (
              <p className="text-xs text-gray-400">Cargando...</p>
            ) : conversations.length === 0 ? (
              <p className="text-xs text-gray-400">Aún no tienes conversaciones</p>
            ) : (
              <div className="space-y-2">
                {conversations.map(conv => (
                  <div
                    key={conv.id}
                    className={`group flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors ${
                      activeConversationId === conv.id
                        ? 'bg-black text-white'
                        : 'hover:bg-gray-100'
                    }`}
                    onClick={() => setActiveConversationId(conv.id)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium truncate">
                        {conv.title || 'Nueva conversación'}
                      </p>
                      <p className={`text-xs mt-0.5 ${
                        activeConversationId === conv.id ? 'text-gray-300' : 'text-gray-400'
                      }`}>
                        {conv.message_count} mensajes
                      </p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        askDeleteConversation(conv.id);
                      }}
                      className={`p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                        activeConversationId === conv.id
                          ? 'hover:bg-white/20 text-white'
                          : 'hover:bg-gray-200 text-gray-400'
                      }`}
                    >
                      <FiTrash2 size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Panel principal — mensajes */}
        <div className="flex-1 flex flex-col overflow-hidden">

          <div className="flex-1 overflow-y-auto px-4 py-6">
            <div className="space-y-6 max-w-2xl mx-auto">

              {!activeConversationId && messages.length === 0 && (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FiMessageSquare className="text-gray-400" size={28} />
                  </div>
                  <h3 className="font-medium text-gray-700 mb-2">Inicia una conversación</h3>
                  <p className="text-sm text-gray-500">
                    Selecciona una personalidad y escribe lo que tienes en mente
                  </p>
                </div>
              )}

              {messages.map((message) => {
                if (message.role === 'system-notice') {
                  return (
                    <div key={message.id} className="flex justify-center">
                      <span className="text-xs text-gray-400 bg-gray-100 px-3 py-1 rounded-full">
                        {message.content}
                      </span>
                    </div>
                  );
                }

                const isUser = message.role === 'user';
                return (
                  <div key={message.id} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      isUser ? 'bg-black' : 'bg-gray-100'
                    }`}>
                      {isUser ? (
                        <FiUser className="text-white text-sm" />
                      ) : (
                        <span className="font-bold text-gray-800 text-sm">π</span>
                      )}
                    </div>

                    <div className={`max-w-[75%] ${isUser ? 'text-right' : ''}`}>
                      <div className={`flex items-center gap-2 mb-1 ${isUser ? 'justify-end' : ''}`}>
                        <span className="text-xs font-medium text-gray-600">
                          {isUser ? 'Tú' : personalities.find(p => p.id === selectedPersonality)?.name}
                        </span>
                        <span className="text-xs text-gray-400 flex items-center gap-1">
                          <FiClock size={10} />
                          {formatTime(message.created_at)}
                        </span>
                      </div>

                      <div className={`p-4 rounded-2xl ${
                        isUser ? 'bg-black text-white' : 'bg-gray-100 text-gray-800'
                      }`}>
                        <p className="whitespace-pre-wrap leading-relaxed">{message.content}</p>
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
                    <span className="font-bold text-gray-800 text-sm">π</span>
                  </div>
                  <div className="max-w-[75%]">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-medium text-gray-600">
                        {personalities.find(p => p.id === selectedPersonality)?.name}
                      </span>
                    </div>
                    <div className="p-4 rounded-2xl bg-gray-100">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {error && (
                <div className="flex justify-center">
                  <span className="text-xs text-red-500 bg-red-50 px-3 py-1 rounded-full">{error}</span>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Input */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4">
            <div className="max-w-2xl mx-auto">
              <div className="flex gap-3">
                <div className="flex-1">
                  <textarea
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder={`Escribe a ${personalities.find(p => p.id === selectedPersonality)?.name}...`}
                    className="w-full p-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent resize-none bg-white"
                    rows={2}
                    disabled={loading}
                  />
                </div>
                <button
                  onClick={handleSendMessage}
                  disabled={loading || !inputMessage.trim()}
                  className="self-end p-4 bg-black text-white rounded-2xl hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
                >
                  <FiSend size={20} />
                </button>
              </div>
              <p className="mt-2 text-xs text-gray-400 text-center">
                Las conversaciones son privadas y encriptadas
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
