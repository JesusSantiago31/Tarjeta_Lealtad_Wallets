import React from 'react';
import { Navigate, Outlet } from 'react_router-dom';
import { useAuth } from '../auth/useAuth';

export const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user, token } = useAuth();

  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // Redirección defensiva basada en el rol actual del usuario
    if (user.role === 'customer') return <Navigate to="/customer/card" replace />;
    if (user.role === 'cashier') return <Navigate to="/cashier/pos" replace />;
    if (user.role === 'tenant_admin') return <Navigate to="/admin/dashboard" replace />;
    if (user.role === 'super_admin') return <Navigate to="/admin/dashboard" replace />;
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
};
