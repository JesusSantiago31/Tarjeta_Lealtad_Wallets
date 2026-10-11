import React, { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Badge } from '../../../shared/components/Badge';
import { QrScannerModal } from '../components/QrScannerModal';
import { IndependentAccumulationForm } from '../components/IndependentAccumulationForm';
import { apiClient } from '../../../core/api/client';
import { Scan, UserCheck, Search, Award, CreditCard, AlertCircle } from 'lucide-react';

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
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem 3rem 1rem' }} className="animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Terminal POS Cajero</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Escáner QR, búsqueda rápida de clientes y acumulación independiente de Puntos y Sellos
          </p>
        </div>
        <Button onClick={() => setIsScannerOpen(true)} className="glow-effect">
          <Scan size={20} /> Escanear Código QR
        </Button>
      </div>

      {/* Barra de Búsqueda Rápida */}
      <Card style={{ marginBottom: '1.5rem' }}>
        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <div style={{ flex: 1, marginBottom: 0 }}>
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Ingresa número celular, correo electrónico o código QR (ej: 5512345678)"
            />
          </div>
          <Button type="submit" disabled={loading} style={{ height: '48px', padding: '0 1.5rem' }}>
            <Search size={18} /> {loading ? 'Buscando...' : 'Buscar Cliente'}
          </Button>
        </form>
      </Card>

      {errorMsg && (
        <div style={{
          background: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          color: '#ef4444',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <AlertCircle size={20} /> {errorMsg}
        </div>
      )}

      {!selectedCustomer ? (
        <Card style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Scan size={56} color="var(--primary-color)" style={{ margin: '0 auto 1.25rem auto', opacity: 0.7 }} />
          <h3 style={{ fontSize: '1.3rem', fontWeight: '700' }}>Terminal POS Esperando Cliente</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.4rem', marginBottom: '1.75rem' }}>
            Escanea el código QR de la tarjeta digital del cliente o ingresa su teléfono/correo en la barra superior.
          </p>
          <Button onClick={() => setIsScannerOpen(true)}>
            <Scan size={18} /> Abrir Escáner QR
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Ficha del Cliente */}
          <Card title="Perfil y Tarjeta del Cliente">
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{
                width: '52px',
                height: '52px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontWeight: '800',
                fontSize: '1.2rem'
              }}>
                <UserCheck size={26} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{selectedCustomer.full_name}</h4>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedCustomer.email || 'Sin correo registrado'}</p>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.3rem' }}>
                  <Badge variant="primary">{selectedCustomer.card_number}</Badge>
                  {selectedCustomer.phone && <Badge variant="success">{selectedCustomer.phone}</Badge>}
                </div>
              </div>
            </div>

            <div style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid var(--card-border)',
              padding: '1.25rem',
              borderRadius: 'var(--radius-md)',
              display: 'flex',
              justifyContent: 'space-around',
              textAlign: 'center'
            }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>MONEDERO PUNTOS</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--primary-color)', marginTop: '0.2rem' }}>
                  {selectedCustomer.points_balance} pts
                </h3>
              </div>
              <div style={{ borderRight: '1px solid var(--card-border)' }} />
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '600' }}>TARJETA SELLOS</p>
                <h3 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--secondary-color)', marginTop: '0.2rem' }}>
                  {selectedCustomer.stamps_balance} / {selectedCustomer.stamps_target || 10}
                </h3>
              </div>
            </div>
          </Card>

          {/* Formulario Doble Control Acumulación & Canje */}
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
