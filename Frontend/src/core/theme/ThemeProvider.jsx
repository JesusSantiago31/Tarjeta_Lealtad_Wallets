import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState({
    primaryColor: '#6b8e64',
    secondaryColor: '#6b462b',
    bgColor: '#faf8f2',
    textColor: '#2b261f',
    logoUrl: ''
  });

  useEffect(() => {
    if (user?.theme) {
      const tenantTheme = {
        primaryColor: user.theme.primary_color || '#6b8e64',
        secondaryColor: user.theme.secondary_color || '#6b462b',
        bgColor: user.theme.bg_color || '#faf8f2',
        textColor: user.theme.text_color || '#2b261f',
        logoUrl: user.theme.logo_url || ''
      };
      setTheme(tenantTheme);
      applyCssVariables(tenantTheme);
    } else {
      applyCssVariables(theme);
    }
  }, [user]);

  const applyCssVariables = (customTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', customTheme.primaryColor);
    root.style.setProperty('--secondary-color', customTheme.secondaryColor);
    root.style.setProperty('--bg-color', customTheme.bgColor);
    root.style.setProperty('--text-color', customTheme.textColor);

    // Ajustes tácticos de contraste visual para hover
    root.style.setProperty('--primary-hover', customTheme.primaryColor);
    root.style.setProperty('--secondary-hover', customTheme.secondaryColor);
  };

  const updateThemeLocally = (newColors) => {
    const updated = { ...theme, ...newColors };
    setTheme(updated);
    applyCssVariables(updated);
  };

  return (
    <ThemeContext.Provider value={{ theme, updateThemeLocally }}>
      {children}
    </ThemeContext.Provider>
  );
};
