import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { DynamicStampCard } from '../components/DynamicStampCard';
import { GoogleWalletButton } from '../components/GoogleWalletButton';
import { useTheme } from '../../../core/theme/useTheme';
import { apiClient } from '../../../core/api/client';
import { CreditCard, Award, History, QrCode, RefreshCw } from 'lucide-react';

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
    tenant_name: 'Cafetería Gourmet',
    logo_url: '',
    primary_color: '#788C5A',
    secondary_color: '#CFD989',
    bg_color: '#FAF7F2'
  });
  const [history, setHistory] = useState([]);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  useEffect(() => {
    fetchCardAndHistory();

    // Sondeo en tiempo real (Polling cada 3 segundos) para actualización automática
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
        setLastUpdated(new Date());

        // Inyección dinámica de colores del tenant en ThemeProvider
        updateThemeLocally({
          primaryColor: d.primary_color || '#788C5A',
          secondaryColor: d.secondary_color || '#CFD989',
          bgColor: d.bg_color || '#FAF7F2',
          textColor: d.text_color || '#734F2F'
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
    <div style={{ maxWidth: '640px', margin: '0 auto', padding: '0 1rem 3rem 1rem' }} className="animate-fade-in">
      {/* Tarjeta Digital con Degradado Dinámico */}
      <div style={{
        background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem',
        color: 'white',
        boxShadow: 'var(--shadow-glow)',
        marginBottom: '1.5rem',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {cardData.logo_url && (
              <img src={cardData.logo_url} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
            )}
            <div>
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.85 }}>
                {cardData.tenant_name}
              </span>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginTop: '0.1rem' }}>{cardData.full_name}</h2>
            </div>
          </div>
          <Badge variant="primary">VIP MEMBER</Badge>
        </div>

        <div style={{ margin: '1.75rem 0' }}>
          <p style={{ fontSize: '0.8rem', opacity: 0.85, fontWeight: '500' }}>MONEDERO DE PUNTOS</p>
          <h1 style={{ fontSize: '2.5rem', fontWeight: '800', letterSpacing: '-0.03em' }}>
            {cardData.points_balance.toFixed(0)} <span style={{ fontSize: '1rem', fontWeight: '600' }}>PTS</span>
          </h1>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem', opacity: 0.95 }}>
          <span>CÓDIGO: {cardData.card_number}</span>
          <span>{cardData.stamps_balance} de {cardData.stamps_target} Sellos</span>
        </div>
      </div>

      {/* Tarjeta de Sellos Dinámica */}
      <Card title="Tu Tarjeta de Sellos Digital" subtitle="Completa 10 sellos y reclama una recompensa especial">
        <DynamicStampCard
          stampsCount={cardData.stamps_balance}
          stampsTarget={cardData.stamps_target}
          walletHeroImageUrl={cardData.wallet_hero_image_url}
        />
      </Card>

      {/* Código QR Personal para Presentar en Caja */}
      <div style={{ marginTop: '1.5rem' }}>
        <Card title="Código QR Personal para Caja">
          <div style={{ textAlign: 'center', padding: '1rem 0' }}>
            <div style={{
              background: '#ffffff',
              padding: '1.25rem',
              borderRadius: '20px',
              display: 'inline-block',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)'
            }}>
              <QRCodeSVG value={cardData.qr_code_value} size={180} />
            </div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.85rem' }}>
              Muestra este código QR al cajero para acumular sellos o puntos en tu compra.
            </p>
          </div>
        </Card>
      </div>

      {/* Botón de Google Wallet */}
      <GoogleWalletButton customerId={cardData.customer_id} cardNumber={cardData.card_number} />

      {/* Historial Reciente */}
      <div style={{ marginTop: '1.75rem' }}>
        <Card title="Historial de Transacciones" subtitle="Tus compras y canjes recientes">
          {history.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', textAlign: 'center', padding: '1rem 0' }}>
              No tienes transacciones registradas aún.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {history.map((tx) => (
                <div key={tx.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.75rem 0',
                  borderBottom: '1px solid var(--card-border)'
                }}>
                  <div>
                    <h5 style={{ fontSize: '0.9rem', fontWeight: '600' }}>{tx.description}</h5>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {new Date(tx.created_at).toLocaleDateString()} - {tx.transaction_type}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{
                      color: tx.points_transacted >= 0 ? '#10b981' : '#ef4444',
                      fontWeight: '700',
                      fontSize: '0.9rem'
                    }}>
                      {tx.points_transacted >= 0 ? `+${tx.points_transacted}` : tx.points_transacted} pts
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};
