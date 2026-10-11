import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../../core/auth/useAuth';
import { useTheme } from '../../../core/theme/useTheme';
import { apiClient } from '../../../core/api/client';
import { UserPlus, AlertCircle, RefreshCw } from 'lucide-react';

export const CustomerRegisterView = () => {
  const { tenantSlug: paramSlug } = useParams();
  const [searchParams] = useSearchParams();
  const querySlug = searchParams.get('origin') || searchParams.get('tenant');
  const targetSlug = paramSlug || querySlug || 'demo-cafe';

  const { setSessionFromTokenResponse } = useAuth();
  const { updateThemeLocally } = useTheme();
  const navigate = useNavigate();

  const [phone, setPhone] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');

  const [tenantInfo, setTenantInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetchingTenant, setFetchingTenant] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Sincronizar paleta de colores y datos de la empresa de origen
  useEffect(() => {
    const fetchTenantData = async () => {
      setFetchingTenant(true);
      try {
        const res = await apiClient.get(`/auth/tenant/${targetSlug}`);
        if (res.success && res.data) {
          setTenantInfo(res.data);
          updateThemeLocally({
            primaryColor: res.data.primary_color || '#6b8e64',
            secondaryColor: res.data.secondary_color || '#6b462b',
            bgColor: res.data.bg_color || '#faf8f2',
            textColor: res.data.text_color || '#2b261f'
          });
        }
      } catch (err) {
        console.warn('Error fetching tenant branding for registration:', err);
      } finally {
        setFetchingTenant(false);
      }
    };

    fetchTenantData();
  }, [targetSlug]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!phone.trim()) {
      setErrorMsg('Por favor ingresa tu número de teléfono.');
      return;
    }
    if (!fullName.trim()) {
      setErrorMsg('Por favor ingresa tu nombre completo.');
      return;
    }
    if (!password.trim() || password.length < 4) {
      setErrorMsg('La contraseña debe tener al menos 4 caracteres.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = await apiClient.post('/auth/register-customer', {
        phone: phone.trim(),
        full_name: fullName.trim(),
        password: password.trim(),
        tenant_slug: targetSlug
      });

      if (res.success && res.data) {
        // Iniciar sesión automáticamente
        setSessionFromTokenResponse(res.data);
        if (res.data.theme) {
          updateThemeLocally({
            primaryColor: res.data.theme.primary_color,
            secondaryColor: res.data.theme.secondary_color,
            bgColor: res.data.theme.bg_color,
            textColor: res.data.theme.text_color
          });
        }
        // Redirigir a la tarjeta digital del cliente
        navigate('/customer/card');
      }
    } catch (err) {
      setErrorMsg(err.detail || err.message || 'Error al completar el registro.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: 'var(--bg-color, #faf8f2)',
      padding: '1rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      {/* 1. ENCABEZADO SUPERIOR: LOGO Y SISTEMA DE MONEDERO (EXACTO A LA IMAGEN) */}
      <div style={{
        width: '100%',
        maxWidth: '560px',
        display: 'flex',
        alignItems: 'center',
        gap: '0.85rem',
        backgroundColor: '#ffffff',
        padding: '0.9rem 1.25rem',
        borderRadius: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
        marginBottom: '1.75rem'
      }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '14px',
          backgroundColor: 'var(--primary-color, #6b8e64)',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.4rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.12)'
        }}>
          ☕
        </div>
        <div>
          <h2 style={{
            margin: 0,
            fontSize: '1.25rem',
            fontWeight: '800',
            color: 'var(--secondary-color, #4a3525)',
            lineHeight: 1.15
          }}>
            {tenantInfo?.name || 'Café Lealtad'}
          </h2>
          <span style={{
            fontSize: '0.72rem',
            fontWeight: '800',
            color: 'var(--secondary-color, #6b462b)',
            letterSpacing: '0.04em'
          }}>
            SISTEMA DE MONEDERO
          </span>
        </div>
      </div>

      {/* 2. TARJETA CENTRAL DE REGISTRO (DISEÑO EXACTO A LA IMAGEN) */}
      <div style={{
        width: '100%',
        maxWidth: '460px',
        backgroundColor: '#ffffff',
        borderRadius: '24px',
        padding: '2.2rem 1.8rem',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        boxSizing: 'border-box'
      }}>
        <h1 style={{
          fontSize: '1.35rem',
          fontWeight: '800',
          color: 'var(--secondary-color, #6b462b)',
          textAlign: 'center',
          margin: '0 0 1.5rem 0',
          letterSpacing: '-0.01em'
        }}>
          Regístrate para obtener beneficios
        </h1>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          
          {/* Campo 1: Número de Teléfono */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.92rem',
              fontWeight: '700',
              color: 'var(--secondary-color, #6b462b)',
              marginBottom: '0.45rem'
            }}>
              Número de Teléfono
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 5512345678"
              style={{
                width: '100%',
                padding: '0.85rem 1.1rem',
                fontSize: '1rem',
                borderRadius: '14px',
                border: '1.8px solid var(--primary-color, #8e9e7c)',
                backgroundColor: 'var(--bg-color, #faf8f2)',
                color: 'var(--text-color, #2b261f)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Campo 2: Nombre Completo */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.92rem',
              fontWeight: '700',
              color: 'var(--secondary-color, #6b462b)',
              marginBottom: '0.45rem'
            }}>
              Nombre Completo
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Tu Nombre"
              style={{
                width: '100%',
                padding: '0.85rem 1.1rem',
                fontSize: '1rem',
                borderRadius: '14px',
                border: '1.8px solid var(--primary-color, #8e9e7c)',
                backgroundColor: 'var(--bg-color, #faf8f2)',
                color: 'var(--text-color, #2b261f)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Campo 3: Contraseña */}
          <div>
            <label style={{
              display: 'block',
              fontSize: '0.92rem',
              fontWeight: '700',
              color: 'var(--secondary-color, #6b462b)',
              marginBottom: '0.45rem'
            }}>
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="........"
              style={{
                width: '100%',
                padding: '0.85rem 1.1rem',
                fontSize: '1rem',
                borderRadius: '14px',
                border: '1.8px solid var(--primary-color, #8e9e7c)',
                backgroundColor: 'var(--bg-color, #faf8f2)',
                color: 'var(--text-color, #2b261f)',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {/* Botón Principal: Registrarme */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              backgroundColor: 'var(--primary-color, #6b8e64)',
              color: '#ffffff',
              border: 'none',
              borderRadius: '14px',
              padding: '0.9rem 1.25rem',
              fontSize: '1.05rem',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              marginTop: '0.4rem',
              transition: 'opacity 0.2s ease, transform 0.1s ease'
            }}
          >
            {loading ? (
              <>
                <RefreshCw size={19} className="animate-spin" /> Registrando...
              </>
            ) : (
              <>
                <UserPlus size={19} strokeWidth={2.4} /> Registrarme
              </>
            )}
          </button>

          {/* Error Message */}
          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              border: '1.5px solid rgba(220, 38, 38, 0.3)',
              color: '#b91c1c',
              padding: '0.75rem 1rem',
              borderRadius: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.85rem',
              fontWeight: '600'
            }}>
              <AlertCircle size={18} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Enlace Inferior: Iniciar Sesión */}
          <div style={{ textAlign: 'center', marginTop: '0.6rem' }}>
            <Link
              to={`/login?tenant=${targetSlug}`}
              style={{
                color: 'var(--secondary-color, #6b462b)',
                fontSize: '0.88rem',
                fontWeight: '600',
                textDecoration: 'none'
              }}
            >
              ¿Ya tienes una cuenta? Inicia sesión aquí
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};
