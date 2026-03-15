import React, { createContext, useContext, useState, useEffect } from 'react';
import { themes, defaultTheme, applyTheme } from '../config/themes';

const ThemeContext = createContext({});

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [currentTheme, setCurrentTheme] = useState(defaultTheme);
  const [themeLoaded, setThemeLoaded] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('parchate_theme');
    if (saved && themes[saved]) {
      const theme = themes[saved];
      setCurrentTheme(theme);
      applyTheme(theme);
    } else {
      applyTheme(defaultTheme);
    }
    setThemeLoaded(true);
  }, []);

  const changeTheme = (themeId) => {
    const theme = themes[themeId];
    if (!theme) return;
    setCurrentTheme(theme);
    applyTheme(theme);
    localStorage.setItem('parchate_theme', themeId);
  };

  if (!themeLoaded) return null;

  return (
    <ThemeContext.Provider value={{ currentTheme, changeTheme, themes }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeContext;
