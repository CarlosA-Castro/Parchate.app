import React from 'react';

const Journal = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Diario Emocional</h1>
      <p className="text-gray-600 mb-8">Escribe libremente sobre tus pensamientos y emociones</p>
      
      <div className="card">
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📖</div>
          <h3 className="text-xl font-semibold mb-2">Tu diario está vacío</h3>
          <p className="text-gray-600 mb-6">Comienza escribiendo tu primera entrada</p>
          <button className="btn-primary px-8">Nueva entrada</button>
        </div>
      </div>
    </div>
  );
};

export default Journal;
