import React from 'react';

const PasswordStrength = ({ password }) => {
  // Función para calcular la fortaleza
  const calculateStrength = (pwd) => {
    if (!pwd || pwd.length === 0) return 0;
    
    let score = 0;
    
    // Longitud
    if (pwd.length >= 8) score += 25;
    
    // Letras mayúsculas
    if (/[A-Z]/.test(pwd)) score += 25;
    
    // Números
    if (/[0-9]/.test(pwd)) score += 25;
    
    // Símbolos especiales
    if (/[^A-Za-z0-9]/.test(pwd)) score += 25;
    
    return Math.min(score, 100);
  };

  const strength = calculateStrength(password);
  
  // Obtener color basado en fortaleza
  const getColorClass = () => {
    if (strength < 25) return 'bg-red-500';
    if (strength < 50) return 'bg-yellow-500';
    if (strength < 75) return 'bg-blue-500';
    return 'bg-green-500';
  };

  // Obtener texto basado en fortaleza
  const getStrengthText = () => {
    if (strength < 25) return 'Débil';
    if (strength < 50) return 'Regular';
    if (strength < 75) return 'Buena';
    return 'Excelente';
  };

  return (
    <div className="mt-3">
      <div className="flex justify-between text-sm mb-1">
        <span className="text-gray-600">Seguridad de contraseña:</span>
        <span className="font-medium">{getStrengthText()}</span>
      </div>
      
      {/* Barra de progreso */}
      <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
        <div 
          className={h-full  transition-all duration-500}
          style={{ width: ${strength}% }}
        />
      </div>
      
      {/* Consejos */}
      <div className="mt-2 text-xs text-gray-500">
        {password && password.length > 0 && (
          <ul className="list-disc pl-5 space-y-1">
            {password.length < 8 && <li>Usa al menos 8 caracteres</li>}
            {!/[A-Z]/.test(password) && <li>Incluye una letra mayúscula</li>}
            {!/[0-9]/.test(password) && <li>Incluye un número</li>}
            {!/[^A-Za-z0-9]/.test(password) && <li>Incluye un símbolo especial</li>}
          </ul>
        )}
      </div>
    </div>
  );
};

export default PasswordStrength;
