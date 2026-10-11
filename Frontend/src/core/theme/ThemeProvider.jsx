import React, { createContext, useState, useEffect } from 'react';
import { useAuth } from '../auth/useAuth';

export const ThemeContext = createContext(null);

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState({
    primaryColor: '#6366f1',
    secondaryColor: '#14b8a6',
    bgColor: '#0f172a',
    textColor: '#f8fafc',
    logoUrl: ''
  });

  useEffect(() => {
    if (user?.theme) {
      const tenantTheme = {
        primaryColor: user.theme.primary_color || '#6366f1',
        secondaryColor: user.theme.secondary_color || '#14b8a6',
        bgColor: user.theme.bg_color || '#0f172a',
        textColor: user.theme.text_color || '#f8fafc',
        logoUrl: user.theme.logo_url || ''
      };
      setTheme(tenantTheme);
      applyCssVariables(tenantTheme);
    }
  }, [user]);

  const applyCssVariables = (customTheme) => {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', customTheme.primaryColor);
    root.style.setProperty('--secondary-color', customTheme.secondaryColor);
    root.style.setProperty('--bg-color', customTheme.bgColor);
    root.style.setProperty('--text-color', customTheme.textColor);
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
