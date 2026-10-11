import React, { createContext, useState, useEffect } from 'react';
import { apiClient } from '../api/client';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('access_token'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password, tenantSlug = null) => {
    setLoading(true);
    try {
      const res = await apiClient.post('/auth/login', {
        email,
        password,
        tenant_slug: tenantSlug,
      });

      if (res.success && res.data) {
        const { access_token, user_id, full_name, role, tenant_id, tenant_slug, tenant_name, theme } = res.data;
        const userData = {
          id: user_id,
          email,
          full_name,
          role,
          tenant_id,
          tenant_slug,
          tenant_name,
          theme
        };

        setToken(access_token);
        setUser(userData);

        localStorage.setItem('access_token', access_token);
        localStorage.setItem('user_data', JSON.stringify(userData));
        if (tenant_id) {
          localStorage.setItem('tenant_id', tenant_id);
        }

        return { success: true, role };
      }
    } catch (err) {
      console.error("Login failed:", err);
      return { success: false, message: err.detail || err.message || "Error al iniciar sesión" };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('tenant_id');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
