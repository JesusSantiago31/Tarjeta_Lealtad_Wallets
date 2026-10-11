import React, { useState } from 'react';
import { apiClient } from '../../../core/api/client';
import { Modal } from '../../../shared/components/Modal';
import { Button } from '../../../shared/components/Button';
import { AlertCircle, RefreshCw } from 'lucide-react';

export const GoogleWalletButton = ({ customerId, cardNumber }) => {
  const [loading, setLoading] = useState(false);
  const [errorModalOpen, setErrorModalOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleAddToGoogleWallet = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post('/customer/wallet/generate-pass', {
        customer_id: customerId,
        card_number: cardNumber
      });

      if (res.success && res.data?.save_url) {
        window.open(res.data.save_url, '_blank');
      } else {
        throw new Error(res.message || 'No se pudo generar el enlace de Google Wallet');
      }
    } catch (err) {
      console.error("Error al generar pase de Google Wallet:", err);
      setErrorMsg(err.detail || err.message || 'Error de conexión al generar el pase digital');
      setErrorModalOpen(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={handleAddToGoogleWallet}
        disabled={loading}
        style={{
          width: '100%',
          background: '#000000',
          color: '#ffffff',
          border: '1px solid rgba(255, 255, 255, 0.25)',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          fontWeight: '600',
          fontSize: '0.95rem',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.75rem',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4)',
          transition: 'all 0.2s ease',
          marginTop: '1rem'
        }}
      >
        {/* SVG de Google Wallet / Pay */}
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19.5 4H4.5C3.12 4 2 5.12 2 6.5V17.5C2 18.88 3.12 20 4.5 20H19.5C20.88 20 22 18.88 22 17.5V6.5C22 5.12 20.88 4 19.5 4Z" fill="#4285F4"/>
          <path d="M19.5 4H4.5C3.12 4 2 5.12 2 6.5V11H22V6.5C22 5.12 20.88 4 19.5 4Z" fill="#34A853"/>
          <path d="M12 16C13.6569 16 15 14.6569 15 13C15 11.3431 13.6569 10 12 10C10.3431 10 9 11.3431 9 13C9 14.6569 10.3431 16 12 16Z" fill="#FBBC05"/>
        </svg>
        {loading ? 'Generando Pase Digital...' : 'Añadir a Google Wallet'}
      </button>

      {/* Modal de Reintento */}
      <Modal isOpen={errorModalOpen} onClose={() => setErrorModalOpen(false)} title="Error de Integración Google Wallet">
        <div style={{ textAlign: 'center', padding: '1rem 0' }}>
          <AlertCircle size={48} color="var(--danger-color)" style={{ margin: '0 auto 1rem auto' }} />
          <p style={{ fontSize: '0.9rem', color: 'var(--text-color)', marginBottom: '1.5rem' }}>
            {errorMsg}
          </p>
          <Button onClick={handleAddToGoogleWallet} style={{ width: '100%', gap: '0.5rem' }}>
            <RefreshCw size={16} /> Reintentar Generación de Pase
          </Button>
        </div>
      </Modal>
    </>
  );
};
