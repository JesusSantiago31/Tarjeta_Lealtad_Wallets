import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { DynamicStampCard } from '../components/DynamicStampCard';
import { GoogleWalletButton } from '../components/GoogleWalletButton';
import { useTheme } from '../../../core/theme/useTheme';
import { apiClient } from '../../../core/api/client';
import { CreditCard, History, QrCode } from 'lucide-react';

export const CustomerCardView = () => {
  const { updateThemeLocally } = useTheme();
  const [cardData, setCardData] = useState({
    customer_id: '',
    card_number: 'CARD-883921',
    full_name: 'Cliente Lealtad',
    email: '',
    points_balance: 0.0,
    stamps_balance: 0,
    stamps_target: 10,
    qr_code_value: 'CARD-883921',
    wallet_hero_image_url: '',
    tenant_name: 'Café Lealtad',
    logo_url: '',
    primary_color: '#6b8e64',
    secondary_color: '#6b462b',
    bg_color: '#faf8f2',
    text_color: '#2b261f'
  });
  const [history, setHistory] = useState([]);

  useEffect(() => {
    fetchCardAndHistory();

    const interval = setInterval(() => {
      fetchCardAndHistory(true);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const fetchCardAndHistory = async (isSilent = false) => {
    try {
      const resCard = await apiClient.get('/customer/portal/my-card');
      if (resCard.success && resCard.data) {
        const d = resCard.data;
        setCardData(d);

        // Inyección dinámica de colores del tenant en ThemeProvider
        updateThemeLocally({
          primaryColor: d.primary_color || '#6b8e64',
          secondaryColor: d.secondary_color || '#6b462b',
          bgColor: d.bg_color || '#faf8f2',
          textColor: d.text_color || '#2b261f'
        });
      }

      if (!isSilent) {
        const resHist = await apiClient.get('/customer/history');
        if (resHist.success && resHist.data) {
          setHistory(resHist.data);
        }
      }
    } catch (err) {
      console.error("Error fetching customer portal data:", err);
    }
  };

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '0 0.5rem 2.5rem 0.5rem' }} className="animate-fade-in">
      {/* Tarjeta Digital con Paleta Dinámica del Tenant */}
      <div style={{
        backgroundColor: 'var(--primary-color)',
        borderRadius: 'var(--radius-xl)',
        padding: '1.5rem',
        color: '#ffffff',
        boxShadow: 'var(--shadow-glow)',
        marginBottom: '1.25rem',
        position: 'relative'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            {cardData.logo_url ? (
              <img src={cardData.logo_url} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'var(--secondary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800' }}>
                ☕
              </div>
            )}
            <div>
              <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.9 }}>
                {cardData.tenant_name}
              </span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: '800', lineHeight: 1.1, color: '#ffffff' }}>{cardData.full_name}</h2>
            </div>
          </div>
          <Badge variant="success">VIP</Badge>
        </div>

        <div style={{ margin: '1.25rem 0' }}>
          <p style={{ fontSize: '0.75rem', opacity: 0.9, fontWeight: '600' }}>SALDO DE PUNTOS</p>
          <h1 style={{ fontSize: '2.4rem', fontWeight: '800', color: '#ffffff', letterSpacing: '-0.02em' }}>
            {cardData.points_balance.toFixed(0)} <span style={{ fontSize: '1rem', fontWeight: '700' }}>PTS</span>
          </h1>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', opacity: 0.95 }}>
          <span>CÓDIGO: {cardData.card_number}</span>
          <span>{cardData.stamps_balance} / {cardData.stamps_target} Sellos</span>
        </div>
      </div>

      {/* Tarjeta de Sellos Dinámica */}
      <Card title="Tu Tarjeta de Sellos Digital" subtitle="Completa 10 sellos para reclamar tu premio">
        <DynamicStampCard
          stampsCount={cardData.stamps_balance}
          stampsTarget={cardData.stamps_target}
          walletHeroImageUrl={cardData.wallet_hero_image_url}
        />
      </Card>

      {/* Código QR Personal para Presentar en Caja */}
      <div style={{ marginTop: '1.25rem' }}>
        <Card title="Código QR para Caja">
          <div style={{ textAlign: 'center', padding: '0.75rem 0' }}>
            <div style={{
              backgroundColor: '#ffffff',
              padding: '1rem',
              borderRadius: '16px',
              display: 'inline-block',
              boxShadow: 'var(--shadow-soft)',
              border: '1px solid var(--card-border)'
            }}>
              <QRCodeSVG value={cardData.qr_code_value} size={160} />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.75rem' }}>
              Muestra este código QR al cajero para acumular puntos o sellos.
            </p>
          </div>
        </Card>
      </div>

      {/* Botón de Google Wallet */}
      <GoogleWalletButton customerId={cardData.customer_id} cardNumber={cardData.card_number} />

      {/* Historial Reciente */}
      <div style={{ marginTop: '1.25rem' }}>
        <Card title="Historial Reciente" subtitle="Tus últimas compras y recompensas">
          {history.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '0.75rem 0' }}>
              No tienes transacciones registradas aún.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {history.map((tx) => (
                <div key={tx.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.65rem 0',
                  borderBottom: '1px solid var(--card-border)'
                }}>
                  <div>
                    <h5 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-color)' }}>{tx.description}</h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(tx.created_at).toLocaleDateString()} - {tx.transaction_type}
                    </span>
                  </div>
                  <span style={{
                    color: tx.points_transacted >= 0 ? 'var(--success-color)' : 'var(--danger-color)',
                    fontWeight: '800',
                    fontSize: '0.85rem'
                  }}>
                    {tx.points_transacted >= 0 ? `+${tx.points_transacted}` : tx.points_transacted} pts
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
