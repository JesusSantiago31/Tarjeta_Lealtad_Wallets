import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/useAuth';
import { LogOut, Store, CreditCard, Scan, Shield, Menu, X, Settings } from 'lucide-react';
import { Badge } from './Badge';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (!user) return null;

  return (
    <nav className="glass-panel" style={{
      borderRadius: '0 0 var(--radius-lg) var(--radius-lg)',
      borderTop: 'none',
      padding: '0.85rem 1.25rem',
      marginBottom: '1.5rem',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'var(--card-bg)'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Brand & Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '42px',
            height: '42px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--primary-color)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: '800',
            fontSize: '1.25rem',
            boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
          }}>
            {user.tenant_name ? user.tenant_name.charAt(0) : '☕'}
          </div>
          <div>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '800', lineHeight: 1.1 }}>
              {user.tenant_name || 'Café Lealtad'}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.2rem' }}>
              <Badge variant="primary">{user.role.toUpperCase()}</Badge>
            </div>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="desktop-nav" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          {user.role === 'customer' && (
            <>
              <Link to="/customer/card" style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                <CreditCard size={18} color="var(--primary-color)" /> Mi Tarjeta
              </Link>
              <Link to="/customer/rewards" style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                <Store size={18} color="var(--secondary-color)" /> Recompensas
              </Link>
            </>
          )}

          {user.role === 'cashier' && (
            <Link to="/cashier/pos" style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
              <Scan size={18} color="var(--primary-color)" /> POS Escáner
            </Link>
          )}

          {(user.role === 'tenant_admin' || user.role === 'super_admin') && (
            <>
              <Link to="/admin/dashboard" style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                <Shield size={18} color="var(--primary-color)" /> Directorio
              </Link>
              <Link to="/admin/branding" style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: '600', fontSize: '0.9rem' }}>
                <Settings size={18} color="var(--secondary-color)" /> Marca
              </Link>
            </>
          )}

          <button
            onClick={logout}
            style={{
              backgroundColor: 'var(--danger-color)',
              color: '#ffffff',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontWeight: '700',
              fontSize: '0.85rem'
            }}
          >
            <LogOut size={16} /> Salir
          </button>
        </div>

        {/* Mobile Hamburger Toggle Button */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-color)',
            cursor: 'pointer',
            padding: '0.5rem',
            display: 'none'
          }}
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div style={{
          marginTop: '1rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--card-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.85rem'
        }}>
          {user.role === 'customer' && (
            <>
              <Link to="/customer/card" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '600', padding: '0.5rem 0' }}>
                <CreditCard size={20} color="var(--primary-color)" /> Mi Tarjeta Digital
              </Link>
              <Link to="/customer/rewards" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '600', padding: '0.5rem 0' }}>
                <Store size={20} color="var(--secondary-color)" /> Recompensas Disponibles
              </Link>
            </>
          )}

          {user.role === 'cashier' && (
            <Link to="/cashier/pos" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '600', padding: '0.5rem 0' }}>
              <Scan size={20} color="var(--primary-color)" /> Módulo POS Escáner
            </Link>
          )}

          {(user.role === 'tenant_admin' || user.role === 'super_admin') && (
            <>
              <Link to="/admin/dashboard" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '600', padding: '0.5rem 0' }}>
                <Shield size={20} color="var(--primary-color)" /> Directorio de Clientes
              </Link>
              <Link to="/admin/branding" onClick={() => setMobileMenuOpen(false)} style={{ color: 'var(--text-color)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: '600', padding: '0.5rem 0' }}>
                <Settings size={20} color="var(--secondary-color)" /> Personalización de Marca
              </Link>
            </>
          )}

          <button
            onClick={() => { setMobileMenuOpen(false); logout(); }}
            style={{
              backgroundColor: 'var(--danger-color)',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              fontWeight: '700',
              marginTop: '0.5rem'
            }}
          >
            <LogOut size={18} /> Cerrar Sesión
          </button>
        </div>
      )}

      {/* Media query inline style override for Mobile */}
      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-toggle { display: block !important; }
        }
      `}</style>
    </nav>
  );
};
