import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../core/auth/useAuth';
import { Card } from '../../shared/components/Card';
import { Input } from '../../shared/components/Input';
import { Button } from '../../shared/components/Button';
import { Shield, Sparkles, User, CreditCard, Store } from 'lucide-react';

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
      setErrorMsg(result?.message || 'Error de autenticación');
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
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at top, rgba(99, 102, 241, 0.15), transparent)'
    }}>
      <div style={{ width: '100%', maxWidth: '440px' }} className="animate-fade-in">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '16px',
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '1rem',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Sparkles size={32} color="#fff" />
          </div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: '800' }}>Tarjeta de Lealtad SaaS</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
            Plataforma Multi-Empresa & Google Wallet
          </p>
        </div>

        <Card title="Iniciar Sesión">
          {errorMsg && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              color: '#ef4444',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1rem'
            }}>
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <Input
              label="Empresa (Slug)"
              value={tenantSlug}
              onChange={(e) => setTenantSlug(e.target.value)}
              placeholder="demo-cafe"
              required
            />
            <Input
              label="Correo Electrónico"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
            />
            <Input
              label="Contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />

            <Button type="submit" disabled={loading} className="glow-effect" style={{ width: '100%', marginTop: '0.5rem' }}>
              {loading ? 'Autenticando...' : 'Entrar a la Plataforma'}
            </Button>
          </form>

          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--card-border)' }}>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginBottom: '0.75rem', fontWeight: '600' }}>
              ACCESO RÁPIDO DE PRUEBA (DEMO ROLES):
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => quickLogin('admin@democafe.com', 'tenant_admin')}
                className="btn-tenant-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              >
                <Shield size={14} /> Tenant Admin
              </button>
              <button
                type="button"
                onClick={() => quickLogin('cajero@democafe.com', 'cashier')}
                className="btn-tenant-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              >
                <Store size={14} /> Cajero POS
              </button>
              <button
                type="button"
                onClick={() => quickLogin('cliente@gmail.com', 'customer')}
                className="btn-tenant-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              >
                <CreditCard size={14} /> Cliente Final
              </button>
              <button
                type="button"
                onClick={() => quickLogin('super@platform.com', 'super_admin')}
                className="btn-tenant-secondary"
                style={{ fontSize: '0.75rem', padding: '0.5rem' }}
              >
                <User size={14} /> Super Admin
              </button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
