import React from 'react';
import { FiBarChart2, FiCalendar, FiTrendingUp, FiPlus, FiMessageCircle } from 'react-icons/fi';
import Button from '../components/Button';
import Card, { CardBody, CardHeader } from '../components/Card';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bienvenido a Parchate</h1>
          <p className="text-gray-600">Tu espacio seguro para gestionar emociones y pensamientos</p>
        </div>
        <div className="flex gap-3">
          <Button variant="primary">
            <FiPlus className="mr-2" />
            Nueva entrada
          </Button>
          <Button variant="secondary">
            <FiMessageCircle className="mr-2" />
            Chat con IA
          </Button>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Entradas del diario</p>
                <p className="text-3xl font-bold mt-2">0</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-xl">
                <FiCalendar className="text-blue-600 text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Estado emocional</p>
                <p className="text-3xl font-bold mt-2">Neutro</p>
              </div>
              <div className="p-3 bg-green-50 rounded-xl">
                <FiTrendingUp className="text-green-600 text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>
        
        <Card hover>
          <CardBody>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Conversaciones IA</p>
                <p className="text-3xl font-bold mt-2">0</p>
              </div>
              <div className="p-3 bg-purple-50 rounded-xl">
                <FiBarChart2 className="text-purple-600 text-xl" />
              </div>
            </div>
          </CardBody>
        </Card>
      </div>
      
      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <h2 className="text-xl font-bold text-gray-900">Acciones Rápidas</h2>
        </CardHeader>
        <CardBody>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link to="/journal" className="block">
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-black hover:bg-gray-50 transition-all text-center cursor-pointer">
                <div className="text-5xl mb-4">📝</div>
                <h3 className="font-semibold text-lg mb-2">Nueva entrada en el diario</h3>
                <p className="text-gray-600">Escribe cómo te sientes hoy</p>
              </div>
            </Link>
            
            <Link to="/chat" className="block">
              <div className="p-6 border-2 border-dashed border-gray-300 rounded-2xl hover:border-black hover:bg-gray-50 transition-all text-center cursor-pointer">
                <div className="text-5xl mb-4">💬</div>
                <h3 className="font-semibold text-lg mb-2">Hablar con Parchate</h3>
                <p className="text-gray-600">Conversa con nuestra IA emocional</p>
              </div>
            </Link>
          </div>
        </CardBody>
      </Card>
      
      {/* Welcome Message */}
      <Card className="bg-gradient-to-r from-gray-900 to-black text-white">
        <CardBody>
          <div className="max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">Tu viaje emocional comienza aquí</h2>
            <p className="text-gray-300 mb-6">
              Parchate está diseñado para ayudarte a procesar tus emociones de manera saludable.
              Usa el diario para reflexionar y el chat para obtener perspectivas.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button variant="primary" className="bg-white text-black hover:bg-gray-100">
                Comenzar diario
              </Button>
              <Button variant="ghost" className="border-white/30 text-white hover:bg-white/10">
                Explorar funciones
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
