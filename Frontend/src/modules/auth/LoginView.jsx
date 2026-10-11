import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/useAuth';
import { Card } from '../../shared/components/Card';
import { Button } from '../../shared/components/Button';
import { Navigation, Mail, Lock, Building, Shield, Store, CreditCard, User, AlertCircle } from 'lucide-react';

export const LoginView = () => {
  const { login, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [tenantSlug, setTenantSlug] = useState('demo-cafe');
  const [errorMsg, setErrorMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    const result = await login(email, password, tenantSlug);
    if (result && result.success) {
      redirectUser(result.role);
    } else {
      setErrorMsg(result?.message || 'Error de autenticación. Verifica tus credenciales.');
    }
  };

  const quickLogin = async (demoEmail, demoRole) => {
    setErrorMsg('');
    const result = await login(demoEmail, 'password123', 'demo-cafe');
    if (result && result.success) {
      redirectUser(demoRole);
    }
  };

  const redirectUser = (role) => {
    if (role === 'super_admin' || role === 'tenant_admin') {
      navigate('/admin/dashboard');
    } else if (role === 'cashier') {
      navigate('/cashier/pos');
    } else {
      navigate('/customer/card');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      backgroundColor: 'var(--bg-color)'
    }}>
      <div style={{ width: '100%', maxWidth: '420px' }} className="animate-fade-in">
        
        {/* Card Elevada Limpia RouteSense */}
        <div className="glass-panel" style={{ textAlign: 'center' }}>
          
          {/* Logo Badge Icon */}
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: 'var(--primary-color)',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1.25rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Navigation size={28} color="#ffffff" style={{ transform: 'rotate(45deg)' }} />
          </div>

          <h1 style={{ fontSize: '1.6rem', fontWeight: '800', marginBottom: '0.35rem', color: 'var(--text-color)' }}>
            RouteSense Admin
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1.75rem' }}>
            Ingrese sus credenciales de despacho
          </p>

          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.12)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: 'var(--danger-color)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.25rem',
              textAlign: 'left',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={18} /> {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} style={{ textAlign: 'left' }}>
            {/* Campo Empresa Slug */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label className="form-label">EMPRESA (SLUG)</label>
              <div style={{ position: 'relative' }}>
                <Building size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  value={tenantSlug}
                  onChange={(e) => setTenantSlug(e.target.value)}
                  placeholder="demo-cafe"
                  required
                />
              </div>
            </div>

            {/* Campo Correo Electrónico */}
            <div style={{ marginBottom: '1.1rem' }}>
              <label className="form-label">CORREO ELECTRÓNICO</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="email"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@routesense.app"
                  required
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label">CONTRASEÑA</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
                <input
                  type="password"
                  className="form-input"
                  style={{ paddingLeft: '2.75rem' }}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} style={{ width: '100%', borderRadius: 'var(--radius-md)', height: '50px' }}>
              {loading ? 'Autenticando...' : 'Entrar al Panel'}
            </Button>
          </form>

          {/* Accesos Rápidos Demo */}
          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--card-border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.75rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              ACCESO RÁPIDO DEMO:
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => quickLogin('admin@democafe.com', 'tenant_admin')}
                className="btn-tenant-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem', minHeight: '40px' }}
              >
                <Shield size={14} /> Tenant Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin('cajero@democafe.com', 'cashier')}
                className="btn-tenant-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem', minHeight: '40px' }}
              >
                <Store size={14} /> Cajero POS
              </button>
              <button
                type="button"
                onClick={() => quickLogin('cliente@gmail.com', 'customer')}
                className="btn-tenant-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem', minHeight: '40px' }}
              >
                <CreditCard size={14} /> Cliente Final
              </button>
              <button
                type="button"
                onClick={() => quickLogin('super@platform.com', 'super_admin')}
                className="btn-tenant-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem', minHeight: '40px' }}
              >
                <User size={14} /> Super Admin
              </button>
            </div>
          </div>

          {/* Footer Subtext */}
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '1.75rem', opacity: 0.85 }}>
            © Desarrollado por Jesus Santiago | 3801 | Sistemas Distribuidos
          </p>
        </div>
      </div>
    </div>
  );
};
