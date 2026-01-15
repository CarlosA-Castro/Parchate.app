import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  FiMessageSquare,
  FiSend,
  FiUser,
  FiChevronLeft,
  FiBook,
  FiTarget,
  FiTrendingUp,
  FiZap,
  FiClock
} from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const Chat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedPersonality, setSelectedPersonality] = useState('estoic');
  const messagesEndRef = useRef(null);

  const personalities = [
    {
      id: 'estoic',
      name: 'Guía Estoico',
      icon: <FiBook size={18} />,
      description: 'Sabiduría de Séneca y Marco Aurelio',
      greeting: 'Hola. La virtud está en actuar de acuerdo con la naturaleza y la razón. ¿En qué puedo ayudarte hoy?'
    },
    {
      id: 'coach',
      name: 'Coach',
      icon: <FiTarget size={18} />,
      description: 'Mentalidad de alto rendimiento',
      greeting: '¡Hola! ¿Listo para superar tus límites? La disciplina supera al talento cuando el talento no se disciplina.'
    },
    {
      id: 'philosopher',
      name: 'Filósofo',
      icon: <FiTrendingUp size={18} />,
      description: 'Pensamiento crítico y profundo',
      greeting: 'Saludos. La búsqueda del conocimiento comienza con reconocer nuestra propia ignorancia. ¿Qué cuestiones te preocupan?'
    },
    {
      id: 'scientist',
      name: 'Científico',
      icon: <FiZap size={18} />,
      description: 'Basado en psicología y neurociencia',
      greeting: 'Hola. Desde una perspectiva neurocientífica, tu cerebro puede reconfigurarse a través de la neuroplasticidad. ¿Qué quieres explorar?'
    }
  ];

  useEffect(() => {
    const selected = personalities.find(p => p.id === selectedPersonality);
    if (selected) {
      setMessages([{
        id: 1,
        text: selected.greeting,
        sender: 'ai',
        personality: selected.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }]);
    }
  }, [selectedPersonality]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    // Simular respuesta de IA
    setTimeout(() => {
      const responses = {
        estoic: [
          "Recuerda: No es lo que te pasa, sino cómo reaccionas a lo que te pasa lo que importa.",
          "Concéntrate en lo que puedes controlar y acepta lo que no está en tu poder.",
          "La virtud es su propia recompensa. Actúa bien por el bien mismo."
        ],
        coach: [
          "¡No te rindas! El verdadero crecimiento ocurre fuera de tu zona de confort.",
          "¿Qué es lo que realmente quieres? Ve por ello sin excusas.",
          "Haz lo que tienes que hacer, cuando tienes que hacerlo, te guste o no."
        ],
        philosopher: [
          "Interesante punto. Analicemos los supuestos detrás de esa afirmación.",
          "La vida examinada es la única que merece vivirse.",
          "¿Qué significa realmente eso para ti a nivel existencial?"
        ],
        scientist: [
          "Desde una perspectiva neurocientífica, esa situación activa tu amígdala.",
          "Los estudios muestran que practicar gratitud reduce el cortisol en un 23%.",
          "La meditación regular aumenta la densidad de materia gris en el hipocampo."
        ]
      };

      const aiResponse = {
        id: messages.length + 2,
        text: responses[selectedPersonality][Math.floor(Math.random() * responses[selectedPersonality].length)],
        sender: 'ai',
        personality: personalities.find(p => p.id === selectedPersonality)?.name,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiResponse]);
      setLoading(false);
    }, 1200);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
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
              <p className="text-xs text-gray-500">Conversa con sabios</p>
            </div>
            
            <div className="w-9"></div> {/* Spacer para centrar */}
          </div>
        </div>
      </div>

      {/* Personality selector */}
      <div className="border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex gap-2 overflow-x-auto">
            {personalities.map((personality) => (
              <button
                key={personality.id}
                onClick={() => setSelectedPersonality(personality.id)}
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

      {/* Messages container */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6 max-w-2xl mx-auto">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${message.sender === 'user' ? 'flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                message.sender === 'user' ? 'bg-black' : 'bg-gray-100'
              }`}>
                {message.sender === 'user' ? (
                  <FiUser className="text-white text-sm" />
                ) : (
                  <span className="font-bold text-gray-800 text-sm">π</span>
                )}
              </div>
              
              {/* Message bubble */}
              <div className={`max-w-[75%] ${message.sender === 'user' ? 'text-right' : ''}`}>
                {/* Meta info */}
                <div className={`flex items-center gap-2 mb-1 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                  <span className="text-xs font-medium text-gray-600">
                    {message.sender === 'user' ? 'Tú' : message.personality}
                  </span>
                  <span className="text-xs text-gray-400 flex items-center gap-1">
                    <FiClock size={10} />
                    {message.timestamp}
                  </span>
                </div>
                
                {/* Message content */}
                <div className={`p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <p className="whitespace-pre-wrap leading-relaxed">{message.text}</p>
                </div>
              </div>
            </div>
          ))}
          
          {/* Loading indicator */}
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
          
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input area */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
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
          
          <div className="mt-3 text-xs text-gray-500 text-center">
            <p>Las conversaciones son privadas y encriptadas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
