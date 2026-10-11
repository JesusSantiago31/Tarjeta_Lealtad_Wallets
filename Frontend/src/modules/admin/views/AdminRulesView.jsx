import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { apiClient } from '../../../core/api/client';
import { Sliders, Award, CheckCircle2, Image, Sparkles, RefreshCw, Upload } from 'lucide-react';

export const AdminRulesView = () => {
  // Estado de regla de puntos
  const [ruleForm, setRuleForm] = useState({
    monto_dinero: 10.0,
    puntos_otorgados: 1,
    descripcion: ''
  });
  const [ruleSuccessMsg, setRuleSuccessMsg] = useState('');
  const [ruleLoading, setRuleLoading] = useState(false);

  // Estado de galería de 11 sellos (0 a 10)
  const [stampsList, setStampsList] = useState([]);
  const [stampsSuccessMsg, setStampsSuccessMsg] = useState('');
  const [stampsLoading, setStampsLoading] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [selectedStampLevel, setSelectedStampLevel] = useState(0);

  useEffect(() => {
    fetchRules();
    fetchStampsGallery();
  }, []);

  const fetchRules = async () => {
    setRuleLoading(true);
    try {
      const res = await apiClient.get('/admin/rules');
      if (res.success && res.data) {
        setRuleForm({
          monto_dinero: res.data.monto_dinero || 10.0,
          puntos_otorgados: res.data.puntos_otorgados || 1,
          descripcion: res.data.descripcion || ''
        });
      }
    } catch (err) {
      console.error("Error fetching rules:", err);
    } finally {
      setRuleLoading(false);
    }
  };

  const fetchStampsGallery = async () => {
    setStampsLoading(true);
    try {
      const res = await apiClient.get('/admin/branding/stamps');
      if (res.success && res.data) {
        setStampsList(res.data);
      }
    } catch (err) {
      console.error("Error fetching stamps gallery:", err);
    } finally {
      setStampsLoading(false);
    }
  };

  const handleRuleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.put('/admin/rules', ruleForm);
      if (res.success) {
        setRuleSuccessMsg('Regla de acumulación de puntos guardada correctamente en Supabase.');
        setTimeout(() => setRuleSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error("Error updating rule:", err);
    }
  };

  const handleStampUrlChange = (stampCount, field, value) => {
    setStampsList(prev => prev.map(item => {
      if (item.stamp_count === stampCount) {
        return { ...item, [field]: value };
      }
      return item;
    }));
  };

  const handleFileUploadToImgBB = async (e, field) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImg(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/admin/branding/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success && res.data?.imagen_url) {
        handleStampUrlChange(selectedStampLevel, field, res.data.imagen_url);
      }
    } catch (err) {
      console.error("Error uploading image to ImgBB:", err);
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSaveStampsGallery = async () => {
    try {
      const res = await apiClient.post('/admin/branding/stamps', { stamps: stampsList });
      if (res.success) {
        setStampsSuccessMsg('Galería de 11 sellos (0 a 10) actualizada en Supabase con éxito.');
        setTimeout(() => setStampsSuccessMsg(''), 4000);
      }
    } catch (err) {
      console.error("Error saving stamps gallery:", err);
    }
  };

  const activeStampItem = stampsList.find(s => s.stamp_count === selectedStampLevel) || {
    stamp_count: selectedStampLevel,
    image_url: '',
    wallet_hero_url: ''
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem 3rem 1rem' }} className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Sliders color="var(--primary-color)" /> Reglas de Puntos & Galería de Sellos Dinámicos
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Configura la equivalencia de puntos por consumo y sube tus imágenes ImgBB para los 11 niveles de sellos.
        </p>
      </div>

      {/* SECCIÓN 1: REGLA DE PUNTOS POR CONSUMO */}
      <Card title="1. Regla de Conversión Dinámica (Monto Gastado ➔ Puntos)">
        {ruleSuccessMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <CheckCircle2 size={18} /> {ruleSuccessMsg}
          </div>
        )}

        <form onSubmit={handleRuleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
            <Input
              label="Monto Gastado ($ MXN)"
              type="number"
              step="0.5"
              value={ruleForm.monto_dinero}
              onChange={(e) => setRuleForm({ ...ruleForm, monto_dinero: parseFloat(e.target.value) || 0 })}
              placeholder="10.00"
              required
            />
            <Input
              label="Puntos Otorgados (pts)"
              type="number"
              value={ruleForm.puntos_otorgados}
              onChange={(e) => setRuleForm({ ...ruleForm, puntos_otorgados: parseInt(e.target.value) || 0 })}
              placeholder="1"
              required
            />
          </div>

          <Input
            label="Descripción Pública de la Regla"
            value={ruleForm.descripcion}
            onChange={(e) => setRuleForm({ ...ruleForm, descripcion: e.target.value })}
            placeholder="Ej: Por cada $10.00 MXN gastados en tienda física se otorga +1 punto"
          />

          <div style={{
            background: 'rgba(99, 102, 241, 0.08)',
            border: '1px solid rgba(99, 102, 241, 0.2)',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Sparkles size={20} color="var(--primary-color)" />
              <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>Resumen de Regla Activa:</span>
            </div>
            <Badge variant="primary">
              ${ruleForm.monto_dinero} MXN ➔ +{ruleForm.puntos_otorgados} PT(S)
            </Badge>
          </div>

          <Button type="submit" disabled={ruleLoading} style={{ width: '100%' }}>
            {ruleLoading ? 'Guardando...' : 'Guardar Regla de Puntos'}
          </Button>
        </form>
      </Card>

      <div style={{ marginTop: '2rem' }} />

      {/* SECCIÓN 2: GALERÍA DE SELLOS DINÁMICOS (0 A 10 SELLOS) */}
      <Card title="2. Galería de Sellos Dinámicos (11 Niveles: 0 a 10 Sellos)" subtitle="Mapeo de URLs ImgBB para la tarjeta web y hero image de Google Wallet">
        {stampsSuccessMsg && (
          <div style={{
            background: 'rgba(16, 185, 129, 0.15)',
            border: '1px solid rgba(16, 185, 129, 0.3)',
            color: '#10b981',
            padding: '0.85rem 1.25rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.25rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            fontSize: '0.9rem'
          }}>
            <CheckCircle2 size={18} /> {stampsSuccessMsg}
          </div>
        )}

        {/* Nivel Selector 0 a 10 */}
        <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.75rem', color: 'var(--text-muted)' }}>
          SELECCIONA EL NIVEL DE SELLOS PARA EDITAR (0 A 10):
        </p>
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
          {Array.from({ length: 11 }).map((_, level) => (
            <button
              key={level}
              type="button"
              onClick={() => setSelectedStampLevel(level)}
              className={selectedStampLevel === level ? 'btn-tenant-primary' : 'btn-tenant-secondary'}
              style={{
                width: '42px',
                height: '42px',
                padding: 0,
                fontSize: '0.9rem',
                fontWeight: '700',
                borderRadius: '10px'
              }}
            >
              {level}
            </button>
          ))}
        </div>

        {/* Panel de Edición del Nivel Seleccionado */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 0.8fr',
          gap: '1.5rem',
          background: 'rgba(15, 23, 42, 0.5)',
          padding: '1.5rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--card-border)'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Badge variant="primary">EDITANDO: {selectedStampLevel} SELLOS</Badge>
            </div>

            <div style={{ marginBottom: '1.25rem' }}>
              <Input
                label="URL Imagen Tarjeta Web (ImgBB)"
                value={activeStampItem.image_url || ''}
                onChange={(e) => handleStampUrlChange(selectedStampLevel, 'image_url', e.target.value)}
                placeholder="https://i.ibb.co/example/stamp-0.png"
              />
              <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--primary-color)', marginTop: '-0.5rem', fontWeight: '600' }}>
                <Upload size={14} /> Subir Imagen desde el equipo a ImgBB
                <input type="file" accept="image/*" onChange={(e) => handleFileUploadToImgBB(e, 'image_url')} style={{ display: 'none' }} />
              </label>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <Input
                label="URL Imagen Google Wallet Hero (Opcional)"
                value={activeStampItem.wallet_hero_url || ''}
                onChange={(e) => handleStampUrlChange(selectedStampLevel, 'wallet_hero_url', e.target.value)}
                placeholder="https://i.ibb.co/example/wallet-hero-0.png"
              />
              <label style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: 'var(--secondary-color)', marginTop: '-0.5rem', fontWeight: '600' }}>
                <Upload size={14} /> Subir Banner Wallet a ImgBB
                <input type="file" accept="image/*" onChange={(e) => handleFileUploadToImgBB(e, 'wallet_hero_url')} style={{ display: 'none' }} />
              </label>
            </div>
          </div>

          {/* Live Preview del Sello */}
          <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.75rem', fontWeight: '600' }}>
              PREVISUALIZACIÓN NIVEL {selectedStampLevel}
            </p>
            {activeStampItem.image_url ? (
              <img
                src={activeStampItem.image_url}
                alt={`Sello nivel ${selectedStampLevel}`}
                style={{
                  maxWidth: '140px',
                  maxHeight: '140px',
                  objectFit: 'contain',
                  borderRadius: '16px',
                  boxShadow: 'var(--shadow-glow)',
                  border: '1px solid var(--card-border)'
                }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            ) : (
              <div style={{
                width: '120px',
                height: '120px',
                borderRadius: '16px',
                border: '2px dashed var(--card-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted)'
              }}>
                <Image size={36} />
              </div>
            )}
          </div>
        </div>

        <div style={{ marginTop: '1.75rem' }}>
          <Button onClick={handleSaveStampsGallery} disabled={stampsLoading || uploadingImg} className="glow-effect" style={{ width: '100%' }}>
            <RefreshCw size={16} /> {stampsLoading ? 'Guardando...' : 'Guardar Todos los 11 Niveles de Sellos'}
          </Button>
        </div>
      </Card>
    </div>
  );
};
