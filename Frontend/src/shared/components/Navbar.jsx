import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/useAuth';
import { LogOut, Store, CreditCard, Scan, Settings, Shield } from 'lucide-react';
import { Badge } from './Badge';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  return (
    <nav className="glass-panel" style={{
      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
      borderTop: 'none',
      padding: '0.9rem 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '2rem'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          background: 'var(--primary-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: '800',
          fontSize: '1.2rem'
        }}>
          {user.tenant_name ? user.tenant_name.charAt(0) : 'L'}
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: '700' }}>{user.tenant_name || 'Plataforma Lealtad'}</h2>
          <Badge variant="primary">{user.role.toUpperCase()}</Badge>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
        {/* Navigation according to RBAC Role */}
        {user.role === 'customer' && (
          <>
            <Link to="/customer/card" style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
              <CreditCard size={18} /> Mi Tarjeta
            </Link>
            <Link to="/customer/rewards" style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
              <Store size={18} /> Recompensas
            </Link>
          </>
        )}

        {user.role === 'cashier' && (
          <Link to="/cashier/pos" style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
            <Scan size={18} /> POS Escáner
          </Link>
        )}

        {(user.role === 'tenant_admin' || user.role === 'super_admin') && (
          <>
            <Link to="/admin/dashboard" style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
              <Shield size={18} /> Dashboard
            </Link>
            <Link to="/admin/branding" style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
              <Settings size={18} /> Branding
            </Link>
            <Link to="/admin/rules" style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.9rem' }}>
              <Store size={18} /> Reglas
            </Link>
          </>
        )}

        <button
          onClick={logout}
          style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '0.5rem 1rem',
            borderRadius: 'var(--radius-md)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            fontWeight: '600',
            fontSize: '0.85rem'
          }}
        >
          <LogOut size={16} /> Salir
        </button>
      </div>
    </nav>
  );
};
