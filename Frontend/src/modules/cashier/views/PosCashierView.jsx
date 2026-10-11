import React, { useState, useEffect, useRef } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { QrScannerModal } from '../components/QrScannerModal';
import { IndependentAccumulationForm } from '../components/IndependentAccumulationForm';
import { apiClient } from '../../../core/api/client';
import { useAuth } from '../../../core/auth/useAuth';
import { useTheme } from '../../../core/theme/useTheme';
import { Search, Camera, Video, QrCode, UserCheck, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import jsQR from 'jsqr';

export const PosCashierView = () => {
  const { user } = useAuth();
  const { updateThemeLocally } = useTheme();
  const [searchQuery, setSearchQuery] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [decodingPhoto, setDecodingPhoto] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [tenantInfo, setTenantInfo] = useState(null);

  const fileInputRef = useRef(null);

  // Sincronizar en tiempo real los colores oficiales de la empresa asociada al cajero
  useEffect(() => {
    const syncTenantTheme = async () => {
      try {
        const res = await apiClient.get('/admin/branding');
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
        console.warn('Error al sincronizar branding del cajero:', err);
      }
    };
    syncTenantTheme();
  }, []);

  const executeSearch = async (queryToSearch) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.post('/cashier/scanner/search', { query: q });
      if (res.success && res.data) {
        setSelectedCustomer(res.data);
      }
    } catch (err) {
      setSelectedCustomer(null);
      setErrorMsg(err.detail || err.message || `No se encontró ningún cliente registrado con '${q}'`);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSearch = (e) => {
    if (e) e.preventDefault();
    executeSearch(searchQuery);
  };

  const handleScanSuccess = (scannedQuery) => {
    setSearchQuery(scannedQuery);
    executeSearch(scannedQuery);
  };

  // Manejador para decodificar QR a partir de una foto seleccionada
  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDecodingPhoto(true);
    setErrorMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert'
          });

          if (code && code.data) {
            setSearchQuery(code.data);
            executeSearch(code.data);
          } else {
            setErrorMsg('No se detectó un código QR legible en la foto. Intenta con una imagen más nítida o escribe el número de celular.');
          }
        } catch (err) {
          console.error(err);
          setErrorMsg('Error al procesar la imagen seleccionada.');
        } finally {
          setDecodingPhoto(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      img.onerror = () => {
        setDecodingPhoto(false);
        setErrorMsg('No se pudo cargar la imagen seleccionada.');
      };
      img.src = event.target.result;
    };
    reader.readAsDataURL(file);
  };

  const handleTransactionComplete = (updatedData) => {
    if (selectedCustomer) {
      setSelectedCustomer(prev => ({
        ...prev,
        points_balance: updatedData.new_points_balance,
        stamps_balance: updatedData.new_stamps_balance
      }));
    }
  };

  const handleResetSearch = () => {
    setSelectedCustomer(null);
    setSearchQuery('');
    setErrorMsg('');
  };

  return (
    <div className="app-container animate-fade-in" style={{ maxWidth: selectedCustomer ? '1000px' : '520px', margin: '0 auto', paddingBottom: '3rem' }}>
      
      {/* VISTA 1: BÚSQUEDA DE CLIENTES (PANTALLA EXACTA A LA IMAGEN) */}
      {!selectedCustomer ? (
        <div style={{ marginTop: '0.5rem' }}>
          
          {/* Encabezado con Icono y Título */}
          <div style={{ textAlign: 'center', marginBottom: '1.25rem' }}>
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              marginBottom: '0.25rem'
            }}>
              <QrCode size={30} color="var(--secondary-color, #6b462b)" strokeWidth={2.2} />
              <h1 style={{
                fontSize: '1.65rem',
                fontWeight: '800',
                color: 'var(--secondary-color, #6b462b)',
                letterSpacing: '-0.02em',
                margin: 0
              }}>
                Búsqueda de Clientes
              </h1>
            </div>
            <p style={{
              color: '#735843',
              fontSize: '0.88rem',
              fontWeight: '500',
              marginTop: '0.35rem',
              lineHeight: 1.3
            }}>
              Escanee el QR o ingrese el número de celular para buscar al cliente.
            </p>
          </div>

          {/* Formulario de Búsqueda */}
          <form onSubmit={handleFormSearch} style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
            
            {/* Input con Etiqueta */}
            <div>
              <label style={{
                display: 'block',
                fontSize: '0.92rem',
                fontWeight: '700',
                color: 'var(--secondary-color, #6b462b)',
                marginBottom: '0.45rem'
              }}>
                Ingresar número de celular
              </label>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ejemplo: 5512345678"
                style={{
                  width: '100%',
                  padding: '0.9rem 1.1rem',
                  fontSize: '1rem',
                  borderRadius: '14px',
                  border: '1.8px solid var(--primary-color, #6b8e64)',
                  backgroundColor: 'var(--bg-color, #faf8f2)',
                  color: 'var(--text-color, #2b261f)',
                  outline: 'none',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease, box-shadow 0.2s ease'
                }}
              />
            </div>

            {/* Botón Principal: Buscar Cliente */}
            <button
              type="submit"
              disabled={loading || decodingPhoto}
              style={{
                width: '100%',
                backgroundColor: 'var(--primary-color, #6b8e64)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '12px',
                padding: '0.9rem 1.25rem',
                fontSize: '1.05rem',
                fontWeight: '700',
                cursor: (loading || decodingPhoto) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                marginTop: '0.2rem',
                transition: 'opacity 0.2s ease, transform 0.1s ease'
              }}
            >
              {loading ? (
                <>
                  <RefreshCw size={19} className="animate-spin" /> Buscando...
                </>
              ) : (
                <>
                  <Search size={19} strokeWidth={2.5} /> Buscar Cliente
                </>
              )}
            </button>

            {/* Dos Botones Secundarios Lado a Lado */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '0.75rem',
              marginTop: '0.2rem'
            }}>
              {/* Botón Verde: Seleccionar Foto QR */}
              <button
                type="button"
                disabled={loading || decodingPhoto}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  backgroundColor: 'var(--primary-color, #6b8e64)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.85rem 0.5rem',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  cursor: (loading || decodingPhoto) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.08)'
                }}
              >
                <Camera size={18} strokeWidth={2.2} />
                {decodingPhoto ? 'Leyendo...' : 'Seleccionar Foto QR'}
              </button>

              {/* Botón Café: Cámara en Vivo */}
              <button
                type="button"
                disabled={loading || decodingPhoto}
                onClick={() => setIsScannerOpen(true)}
                style={{
                  backgroundColor: 'var(--secondary-color, #6b462b)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '12px',
                  padding: '0.85rem 0.5rem',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  cursor: (loading || decodingPhoto) ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.45rem',
                  boxShadow: '0 3px 8px rgba(0,0,0,0.08)'
                }}
              >
                <Video size={18} strokeWidth={2.2} />
                Cámara en Vivo
              </button>
            </div>

            {/* Input oculto para subir imagen con QR */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              style={{ display: 'none' }}
              onChange={handlePhotoSelect}
            />
          </form>

          {/* Mensaje de Error si no se encuentra cliente */}
          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              border: '1.5px solid rgba(220, 38, 38, 0.3)',
              color: '#b91c1c',
              padding: '0.85rem 1rem',
              borderRadius: '12px',
              marginTop: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              fontSize: '0.88rem',
              fontWeight: '600'
            }}>
              <AlertCircle size={20} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Indicador de Empresa & Cajero Activo */}
          <div style={{
            marginTop: '2.5rem',
            textAlign: 'center',
            fontSize: '0.8rem',
            color: 'var(--text-muted, #735843)',
            opacity: 0.85
          }}>
            <p>Empresa: <strong>{tenantInfo?.name || user?.tenant_name || 'Café Lealtad'}</strong></p>
            <p>Operador: <strong>{user?.first_name || 'Cajero'} {user?.last_name || ''}</strong> ({user?.email})</p>
          </div>
        </div>
      ) : (
        /* VISTA 2: CLIENTE ENCONTRADO - DOBLE CONTROL Y ACUMULACIÓN */
        <div>
          {/* Barra superior de retorno */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem',
            gap: '0.5rem'
          }}>
            <button
              onClick={handleResetSearch}
              style={{
                backgroundColor: 'var(--card-bg, #ffffff)',
                border: '1.5px solid var(--primary-color, #6b8e64)',
                color: 'var(--primary-color, #6b8e64)',
                borderRadius: '12px',
                padding: '0.6rem 1.1rem',
                fontSize: '0.88rem',
                fontWeight: '700',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <ArrowLeft size={16} /> Volver a Búsqueda
            </button>
            <Badge variant="primary">Cliente Activo</Badge>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(290px, 1fr))', gap: '1.25rem' }}>
            
            {/* Perfil del Cliente */}
            <Card title="Datos de la Tarjeta del Cliente">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', marginBottom: '1.25rem' }}>
                <div style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--primary-color, #6b8e64)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                  fontWeight: '800'
                }}>
                  <UserCheck size={24} />
                </div>
                <div>
                  <h4 style={{ fontSize: '1.15rem', fontWeight: '800', color: 'var(--secondary-color, #6b462b)' }}>
                    {selectedCustomer.full_name}
                  </h4>
                  <p style={{ color: 'var(--text-muted, #735843)', fontSize: '0.82rem' }}>
                    {selectedCustomer.email || 'Sin correo electrónico'}
                  </p>
                  <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.25rem' }}>
                    <Badge variant="primary">{selectedCustomer.card_number}</Badge>
                    {selectedCustomer.phone && <Badge variant="success">📞 {selectedCustomer.phone}</Badge>}
                  </div>
                </div>
              </div>

              {/* Balances Actuales */}
              <div style={{
                backgroundColor: 'var(--input-bg, #faf8f2)',
                border: '1.5px solid var(--card-border, #e5e0d3)',
                padding: '1.1rem',
                borderRadius: '14px',
                display: 'flex',
                justifyContent: 'space-around',
                textAlign: 'center'
              }}>
                <div>
                  <p style={{ color: '#735843', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.04em' }}>PUNTOS</p>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--primary-color, #6b8e64)' }}>
                    {selectedCustomer.points_balance} <span style={{ fontSize: '0.9rem' }}>pts</span>
                  </h3>
                </div>
                <div style={{ borderRight: '1.5px solid var(--card-border, #e5e0d3)' }} />
                <div>
                  <p style={{ color: '#735843', fontSize: '0.72rem', fontWeight: '800', letterSpacing: '0.04em' }}>SELLOS</p>
                  <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: 'var(--secondary-color, #6b462b)' }}>
                    {selectedCustomer.stamps_balance} / {selectedCustomer.stamps_target || 10}
                  </h3>
                </div>
              </div>
            </Card>

            {/* Formulario Doble Control */}
            <IndependentAccumulationForm
              customer={selectedCustomer}
              onTransactionComplete={handleTransactionComplete}
            />
          </div>
        </div>
      )}

      {/* Modal de Cámara en Vivo con Decodificador QR */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};
