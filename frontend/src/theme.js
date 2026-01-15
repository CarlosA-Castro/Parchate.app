// theme.js - Tema profesional para app psicológica
export const colors = {
  // Colores principales - inspirados en tranquilidad y confianza
  primary: {
    50: '#f0f9ff',
    100: '#e0f2fe',
    200: '#bae6fd',
    300: '#7dd3fc',
    400: '#38bdf8',
    500: '#0ea5e9', // Azul principal - confianza
    600: '#0284c7',
    700: '#0369a1',
    800: '#075985',
    900: '#0c4a6e',
  },
  
  // Colores secundarios - inspirados en calma
  secondary: {
    50: '#fdf4ff',
    100: '#fae8ff',
    200: '#f5d0fe',
    300: '#f0abfc',
    400: '#e879f9',
    500: '#d946ef', // Púrpura - sabiduría
    600: '#c026d3',
    700: '#a21caf',
    800: '#86198f',
    900: '#701a75',
  },
  
  // Neutrales - minimalismo y elegancia
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
  },
  
  // Feedback
  success: {
    500: '#10b981',
    600: '#059669',
  },
  warning: {
    500: '#f59e0b',
    600: '#d97706',
  },
  error: {
    500: '#ef4444',
    600: '#dc2626',
  },
  
  // Fondos especiales
  background: {
    light: '#f8fafc',
    dark: '#0f172a',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    card: 'rgba(255, 255, 255, 0.95)',
  }
};

export const typography = {
  fonts: {
    sans: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    serif: "'Merriweather', 'Georgia', serif",
    mono: "'JetBrains Mono', 'Courier New', monospace",
  },
  sizes: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
  },
};

export const effects = {
  shadows: {
    soft: '0 4px 20px rgba(0, 0, 0, 0.08)',
    medium: '0 8px 30px rgba(0, 0, 0, 0.12)',
    hard: '0 20px 60px rgba(0, 0, 0, 0.16)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
  },
  gradients: {
    primary: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    secondary: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    calm: 'linear-gradient(135deg, #a3bded 0%, #6991c7 100%)',
  },
  blurs: {
    backdrop: 'blur(20px)',
    soft: 'blur(8px)',
  },
};

export const animations = {
  transitions: {
    fast: '150ms ease',
    normal: '300ms ease',
    slow: '500ms ease',
  },
  keyframes: {
    fadeIn: {
      from: { opacity: 0 },
      to: { opacity: 1 },
    },
    slideUp: {
      from: { transform: 'translateY(20px)', opacity: 0 },
      to: { transform: 'translateY(0)', opacity: 1 },
    },
    pulseSoft: {
      '0%, 100%': { opacity: 1 },
      '50%': { opacity: 0.7 },
    },
  },
};

export default {
  colors,
  typography,
  effects,
  animations,
};
