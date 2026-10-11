import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { apiClient } from '../../../core/api/client';
import { PlusCircle, Award, Gift, CheckCircle2, Sparkles } from 'lucide-react';

export const IndependentAccumulationForm = ({ customer, onTransactionComplete }) => {
  const [activeTab, setActiveTab] = useState('points'); // 'points', 'stamps', 'redeem'
  
  // Estado Puntos
  const [pointsMode, setPointsMode] = useState('amount'); // 'amount' vs 'direct'
  const [amountSpent, setAmountSpent] = useState('');
  const [directPoints, setDirectPoints] = useState('');
  const [ruleInfo, setRuleInfo] = useState({ monto_dinero: 10, puntos_otorgados: 1 });

  // Estado Sellos
  const [stampsToAdd, setStampsToAdd] = useState(1);

  // Estado Canjes
  const [availableProducts, setAvailableProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState('');

  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActiveRule();
    fetchCatalog();
  }, []);

  const fetchActiveRule = async () => {
    try {
      const res = await apiClient.get('/admin/rules');
      if (res.success && res.data) {
        setRuleInfo({
          monto_dinero: res.data.monto_dinero || 10,
          puntos_otorgados: res.data.puntos_otorgados || 1
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCatalog = async () => {
    try {
      const res = await apiClient.get('/admin/catalog');
      if (res.success && res.data) {
        setAvailableProducts(res.data);
        if (res.data.length > 0) {
          setSelectedProductId(res.data[0].id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const calculatedPoints = pointsMode === 'amount'
    ? Math.floor((parseFloat(amountSpent || '0') / ruleInfo.monto_dinero)) * ruleInfo.puntos_otorgados
    : parseInt(directPoints || '0');

  const handleAccumulatePoints = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/cashier/accumulation/points', {
        customer_id: customer.customer_id,
        mode: pointsMode,
        amount_spent: parseFloat(amountSpent || '0'),
        direct_points: parseInt(directPoints || '0')
      });
      if (res.success) {
        setMsg(res.message);
        onTransactionComplete(res.data);
        setAmountSpent('');
        setDirectPoints('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAccumulateStamps = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.post('/cashier/accumulation/stamps', {
        customer_id: customer.customer_id,
        stamps_to_add: parseInt(stampsToAdd)
      });
      if (res.success) {
        setMsg(res.message);
        onTransactionComplete(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRedeem = async () => {
    if (!selectedProductId) return;
    setLoading(true);
    try {
      const res = await apiClient.post('/cashier/accumulation/redeem', {
        customer_id: customer.customer_id,
        reward_item_id: selectedProductId
      });
      if (res.success) {
        setMsg(res.message);
        onTransactionComplete(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title={`Operaciones: ${customer.full_name}`} subtitle={`ID Tarjeta: ${customer.card_number}`}>
      {msg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          padding: '0.75rem 1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CheckCircle2 size={18} /> {msg}
        </div>
      )}

      {/* Tabs para seleccionar el tipo de operación */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1.5rem' }}>
        <button
          type="button"
          onClick={() => { setActiveTab('points'); setMsg(''); }}
          className={activeTab === 'points' ? 'btn-tenant-primary' : 'btn-tenant-secondary'}
          style={{ fontSize: '0.85rem', padding: '0.5rem' }}
        >
          <PlusCircle size={16} /> Puntos
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('stamps'); setMsg(''); }}
          className={activeTab === 'stamps' ? 'btn-tenant-primary' : 'btn-tenant-secondary'}
          style={{ fontSize: '0.85rem', padding: '0.5rem' }}
        >
          <Award size={16} /> Sellos
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('redeem'); setMsg(''); }}
          className={activeTab === 'redeem' ? 'btn-tenant-primary' : 'btn-tenant-secondary'}
          style={{ fontSize: '0.85rem', padding: '0.5rem' }}
        >
          <Gift size={16} /> Canje
        </button>
      </div>

      {/* TAB 1: ACUMULACIÓN DE PUNTOS */}
      {activeTab === 'points' && (
        <form onSubmit={handleAccumulatePoints}>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setPointsMode('amount')}
              style={{
                flex: 1,
                padding: '0.4rem',
                fontSize: '0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--card-border)',
                background: pointsMode === 'amount' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: pointsMode === 'amount' ? 'var(--primary-color)' : 'var(--text-muted)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Por Monto ($ MXN)
            </button>
            <button
              type="button"
              onClick={() => setPointsMode('direct')}
              style={{
                flex: 1,
                padding: '0.4rem',
                fontSize: '0.8rem',
                borderRadius: '8px',
                border: '1px solid var(--card-border)',
                background: pointsMode === 'direct' ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: pointsMode === 'direct' ? 'var(--primary-color)' : 'var(--text-muted)',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Puntos Directos
            </button>
          </div>

          {pointsMode === 'amount' ? (
            <>
              <Input
                label="Monto Total Consumido ($ MXN)"
                type="number"
                step="0.5"
                value={amountSpent}
                onChange={(e) => setAmountSpent(e.target.value)}
                placeholder="150.00"
                required
              />
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.8rem'
              }}>
                <span>Regla BD: <strong>${ruleInfo.monto_dinero} MXN = +{ruleInfo.puntos_otorgados} pt</strong></span>
                <Badge variant="primary">+{calculatedPoints} PTS A SUMAR</Badge>
              </div>
            </>
          ) : (
            <Input
              label="Puntos a Otorgar Directamente"
              type="number"
              value={directPoints}
              onChange={(e) => setDirectPoints(e.target.value)}
              placeholder="15"
              required
            />
          )}

          <Button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Registrando...' : 'Confirmar Acumulación de Puntos'}
          </Button>
        </form>
      )}

      {/* TAB 2: CONTROL INDEPENDIENTE DE SELLOS */}
      {activeTab === 'stamps' && (
        <form onSubmit={handleAccumulateStamps}>
          <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
            SELECCIONA O INGRESA LOS SELLOS A OTORGAR:
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '0.5rem', marginBottom: '1rem' }}>
            <button
              type="button"
              onClick={() => setStampsToAdd(0)}
              style={{
                padding: '0.6rem',
                borderRadius: '8px',
                border: stampsToAdd === 0 ? '2px solid var(--secondary-color)' : '1px solid var(--card-border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              0 Sellos
            </button>
            <button
              type="button"
              onClick={() => setStampsToAdd(1)}
              style={{
                padding: '0.6rem',
                borderRadius: '8px',
                border: stampsToAdd === 1 ? '2px solid var(--secondary-color)' : '1px solid var(--card-border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              +1 Sello
            </button>
            <button
              type="button"
              onClick={() => setStampsToAdd(2)}
              style={{
                padding: '0.6rem',
                borderRadius: '8px',
                border: stampsToAdd === 2 ? '2px solid var(--secondary-color)' : '1px solid var(--card-border)',
                background: 'rgba(255,255,255,0.05)',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              +2 Sellos
            </button>
          </div>

          <Input
            label="O ingresa un número personalizado"
            type="number"
            value={stampsToAdd}
            onChange={(e) => setStampsToAdd(parseInt(e.target.value) || 0)}
          />

          <div style={{
            background: 'rgba(20, 184, 166, 0.08)',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.8rem',
            color: 'var(--secondary-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}>
            <Sparkles size={16} />
            <span>Nuevo saldo de sellos: <strong>{customer.stamps_balance + stampsToAdd} de {customer.stamps_target || 10} sellos</strong></span>
          </div>

          <Button type="submit" disabled={loading} style={{ width: '100%' }}>
            {loading ? 'Otorgando...' : 'Confirmar Registro de Sello(s)'}
          </Button>
        </form>
      )}

      {/* TAB 3: CANJE DE RECOMPENSAS */}
      {activeTab === 'redeem' && (
        <div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Selecciona el producto del catálogo para realizar el canje en caja:
          </p>

          <div style={{ marginBottom: '1.25rem' }}>
            <label style={{ fontSize: '0.85rem', fontWeight: '500', display: 'block', marginBottom: '0.4rem' }}>
              Producto de Recompensa
            </label>
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              style={{
                width: '100%',
                background: 'var(--input-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: 'var(--radius-md)',
                padding: '0.75rem',
                color: 'var(--text-color)',
                outline: 'none'
              }}
            >
              {availableProducts.map(p => (
                <option key={p.id} value={p.id}>
                  {p.title} ({p.points_required} pts | Stock: {p.stock} pzas)
                </option>
              ))}
            </select>
          </div>

          <Button onClick={handleRedeem} disabled={loading || !selectedProductId} style={{ width: '100%' }}>
            {loading ? 'Procesando...' : 'Entrar Recompensa al Cliente'}
          </Button>
        </div>
      )}
    </Card>
  );
};
