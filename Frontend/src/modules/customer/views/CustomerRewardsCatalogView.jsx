import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { Modal } from '../../../shared/components/Modal';
import { apiClient } from '../../../core/api/client';
import { Gift, Star, QrCode, CheckCircle2 } from 'lucide-react';

export const CustomerRewardsCatalogView = () => {
  const [rewards, setRewards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedReward, setSelectedReward] = useState(null);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [customerPhone, setCustomerPhone] = useState('');

  useEffect(() => {
    fetchRewards();
    fetchCustomerInfo();
  }, []);

  const fetchCustomerInfo = async () => {
    try {
      const res = await apiClient.get('/customer/portal/my-card');
      if (res.success && res.data) {
        setCustomerPhone(res.data.phone || res.data.card_number);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRewards = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/catalog');
      if (res.success && res.data) {
        setRewards(res.data);
      }
    } catch (err) {
      console.error("Error fetching rewards catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateTicket = (reward) => {
    setSelectedReward(reward);
    setIsQrModalOpen(true);
  };

  const qrTicketValue = selectedReward
    ? `REDEMP:${customerPhone || '5512345678'}:${selectedReward.id}`
    : '';

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }} className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Gift color="var(--primary-color)" /> Catálogo de Recompensas
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Selecciona una recompensa disponible y genera tu Ticket QR para presentar al cajero.
        </p>
      </div>

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Cargando catálogo...</p>
      ) : rewards.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Gift size={48} color="var(--primary-color)" style={{ margin: '0 auto 1rem auto', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Sin Recompensas Disponibles</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.4rem' }}>
            Pronto añadiremos nuevos premios y productos canjeables.
          </p>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(270px, 1fr))', gap: '1.5rem' }}>
          {rewards.map((item) => (
            <Card key={item.id}>
              {item.image_url && (
                <img
                  src={item.image_url}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem'
                  }}
                />
              )}
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{item.title}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.4rem 0 1rem 0' }}>
                {item.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
                <Badge variant="warning"><Star size={12} /> {item.points_required} PTS</Badge>
                <Button onClick={() => handleGenerateTicket(item)} style={{ padding: '0.45rem 0.9rem', fontSize: '0.8rem' }}>
                  Generar Ticket QR
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Ticket QR de Canje */}
      <Modal isOpen={isQrModalOpen} onClose={() => setIsQrModalOpen(false)} title="Ticket QR de Canje">
        {selectedReward && (
          <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
            <h4 style={{ fontSize: '1.1rem', fontWeight: '700', marginBottom: '0.2rem' }}>{selectedReward.title}</h4>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Costo de Canje: {selectedReward.points_required} Puntos
            </p>

            <div style={{
              background: '#ffffff',
              padding: '1.25rem',
              borderRadius: '20px',
              display: 'inline-block',
              boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
              marginBottom: '1.25rem'
            }}>
              <QRCodeSVG value={qrTicketValue} size={180} />
            </div>

            <div style={{
              background: 'rgba(99, 102, 241, 0.08)',
              padding: '0.75rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              color: 'var(--text-color)',
              marginBottom: '1.25rem'
            }}>
              Muestra este Ticket QR al cajero. El descuento de puntos se aplicará al validar el código.
            </div>

            <Button onClick={() => setIsQrModalOpen(false)} style={{ width: '100%' }}>
              Cerrar Ticket
            </Button>
          </div>
        )}
      </Modal>
    </div>
  );
};
