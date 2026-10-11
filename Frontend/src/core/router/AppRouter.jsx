import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { Navbar } from '../../shared/components/Navbar';

// Views
import { LoginView } from '../../modules/auth/LoginView';
import { AdminDashboardView } from '../../modules/admin/views/AdminDashboardView';
import { AdminBrandingView } from '../../modules/admin/views/AdminBrandingView';
import { AdminRulesView } from '../../modules/admin/views/AdminRulesView';
import { AdminCatalogView } from '../../modules/admin/views/AdminCatalogView';
import { PosCashierView } from '../../modules/cashier/views/PosCashierView';
import { CustomerCardView } from '../../modules/customer/views/CustomerCardView';
import { CustomerRewardsCatalogView } from '../../modules/customer/views/CustomerRewardsCatalogView';

export const AppRouter = () => {
  return (
    <>
      <Navbar />
      <Routes>
        {/* Ruta Pública */}
        <Route path="/login" element={<LoginView />} />

        {/* Rutas de Cliente Final */}
        <Route element={<ProtectedRoute allowedRoles={['customer']} />}>
          <Route path="/customer/card" element={<CustomerCardView />} />
          <Route path="/customer/rewards" element={<CustomerRewardsCatalogView />} />
        </Route>

        {/* Rutas de Cajero POS */}
        <Route element={<ProtectedRoute allowedRoles={['cashier', 'tenant_admin', 'super_admin']} />}>
          <Route path="/cashier/pos" element={<PosCashierView />} />
        </Route>

        {/* Rutas de Administrador de Tenant & Super Admin */}
        <Route element={<ProtectedRoute allowedRoles={['tenant_admin', 'super_admin']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboardView />} />
          <Route path="/admin/branding" element={<AdminBrandingView />} />
          <Route path="/admin/rules" element={<AdminRulesView />} />
          <Route path="/admin/catalog" element={<AdminCatalogView />} />
        </Route>

        {/* Redirección por Defecto */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
};
