import React, { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Badge } from '../../../shared/components/Badge';
import { QrScannerModal } from '../components/QrScannerModal';
import { IndependentAccumulationForm } from '../components/IndependentAccumulationForm';
import { apiClient } from '../../../core/api/client';
import { Scan, UserCheck, Search, AlertCircle } from 'lucide-react';

export const PosCashierView = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.post('/cashier/scanner/search', { query: searchQuery.trim() });
      if (res.success && res.data) {
        setSelectedCustomer(res.data);
      }
    } catch (err) {
      setSelectedCustomer(null);
      setErrorMsg(err.detail || err.message || `No se encontró ningún cliente con '${searchQuery}'`);
    } finally {
      setLoading(false);
    }
  };

  const handleScanSuccess = async (query) => {
    setSearchQuery(query);
    setLoading(true);
    setErrorMsg('');
    try {
      const res = await apiClient.post('/cashier/scanner/search', { query });
      if (res.success && res.data) {
        setSelectedCustomer(res.data);
      }
    } catch (err) {
      setSelectedCustomer(null);
      setErrorMsg(err.detail || err.message || `No se encontró cliente con QR '${query}'`);
    } finally {
      setLoading(false);
    }
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

  return (
    <div className="app-container animate-fade-in">
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        marginBottom: '1.25rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Terminal POS Cajero</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Escáner QR y acumulación independiente de Puntos y Sellos.
          </p>
        </div>
        <Button onClick={() => setIsScannerOpen(true)}>
          <Scan size={18} /> Escanear QR
        </Button>
      </div>

      {/* Barra de Búsqueda Rápida */}
      <Card style={{ marginBottom: '1.25rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Teléfono, correo o QR (ej: 5512345678)"
          />
          <Button type="submit" disabled={loading} style={{ width: '100%' }}>
            <Search size={18} /> {loading ? 'Buscando...' : 'Buscar Cliente'}
          </Button>
        </form>
      </Card>

      {errorMsg && (
        <div style={{
          backgroundColor: 'rgba(220, 38, 38, 0.12)',
          border: '1px solid rgba(220, 38, 38, 0.3)',
          color: 'var(--danger-color)',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.85rem'
        }}>
          <AlertCircle size={18} /> {errorMsg}
        </div>
      )}

      {!selectedCustomer ? (
        <Card style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
          <Scan size={48} color="var(--primary-color)" style={{ margin: '0 auto 1rem auto', opacity: 0.8 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '800' }}>POS Esperando Cliente</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.3rem', marginBottom: '1.25rem' }}>
            Escanea el código QR de la tarjeta digital del cliente o ingresa su número arriba.
          </p>
          <Button onClick={() => setIsScannerOpen(true)}>
            <Scan size={18} /> Abrir Escáner Cámara
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
          {/* Perfil del Cliente */}
          <Card title="Perfil de Cliente">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.25rem' }}>
              <div style={{
                width: '46px',
                height: '46px',
                borderRadius: '50%',
                backgroundColor: 'var(--primary-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontWeight: '800'
              }}>
                <UserCheck size={22} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: '800' }}>{selectedCustomer.full_name}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{selectedCustomer.email || 'Sin correo'}</p>
                <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.2rem' }}>
                  <Badge variant="primary">{selectedCustomer.card_number}</Badge>
                  {selectedCustomer.phone && <Badge variant="success">{selectedCustomer.phone}</Badge>}
                </div>
              </div>
            </div>

            <div style={{
              backgroundColor: 'var(--input-bg)',
              border: '1px solid var(--card-border)',
              padding: '1rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center'
            }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '700' }}>PUNTOS</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary-color)' }}>
                  {selectedCustomer.points_balance} pts
                </h3>
              </div>
              <div style={{ borderRight: '1px solid var(--card-border)' }} />
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.7rem', fontWeight: '700' }}>SELLOS</p>
                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--secondary-color)' }}>
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
      )}

      {/* Modal de Escáner QR */}
      <QrScannerModal
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </div>
  );
};
