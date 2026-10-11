import React, { useState } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { Scan, QrCode, Camera, Upload } from 'lucide-react';

export const QrScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [query, setQuery] = useState('');

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      onScanSuccess(query.trim());
      onClose();
    }
  };

  const handleSimulatedScan = () => {
    // Ejemplo de escaneo QR rápido para simulación o cámara
    const demoQr = "QR-5512345678";
    onScanSuccess(demoQr);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Escáner QR / Búsqueda POS">
      <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
        {/* Visor simulado de cámara en vivo */}
        <div style={{
          width: '200px',
          height: '200px',
          margin: '0 auto 1.25rem auto',
          borderRadius: '20px',
          border: '2px dashed var(--primary-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'rgba(99, 102, 241, 0.06)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <QrCode size={64} color="var(--primary-color)" />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem', fontWeight: '500' }}>
            Apunta la cámara al código QR
          </span>
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '2px',
            background: 'var(--secondary-color)',
            boxShadow: '0 0 10px var(--secondary-color)',
            animation: 'pulseGlow 2s infinite ease-in-out'
          }} />
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={handleSimulatedScan}
            className="btn-tenant-secondary"
            style={{ width: '100%', fontSize: '0.85rem', gap: '0.5rem' }}
          >
            <Camera size={16} /> Escanear QR Demo (QR-5512345678)
          </button>
        </div>

        <form onSubmit={handleManualSearch}>
          <Input
            label="O ingresa Teléfono / Código QR / Email"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: 5512345678 o QR-5512345678"
          />
          <Button type="submit" style={{ width: '100%', marginTop: '0.5rem' }}>
            <Scan size={18} /> Validar Tarjeta de Cliente
          </Button>
        </form>
      </div>
    </Modal>
  );
};
