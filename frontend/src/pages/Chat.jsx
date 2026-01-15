import React from 'react';

const Chat = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Parchate IA</h1>
      <p className="text-gray-600 mb-8">Conversa con nuestro asistente emocional inteligente</p>
      
      <div className="card">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">🤖</div>
          <h3 className="text-xl font-semibold mb-2">Comienza una conversación</h3>
          <p className="text-gray-600 mb-6">Parchate está aquí para escucharte y ayudarte</p>
          <button className="btn-primary px-8">Nueva conversación</button>
        </div>
      </div>
    </div>
  );
};

export default Chat;
