import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { useTheme } from '../../../core/theme/useTheme';
import { apiClient } from '../../../core/api/client';
import { Palette, CheckCircle2, Image as ImageIcon } from 'lucide-react';

export const AdminBrandingView = () => {
  const { theme, updateThemeLocally } = useTheme();
  const [form, setForm] = useState({
    name: 'Cafetería Gourmet',
    primary_color: theme.primaryColor || '#788C5A',
    secondary_color: theme.secondaryColor || '#CFD989',
    bg_color: theme.bgColor || '#FAF7F2',
    text_color: theme.textColor || '#734F2F',
    logo_url: ''
  });
  const [savedMsg, setSavedMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchBranding();
  }, []);

  const fetchBranding = async () => {
    try {
      const res = await apiClient.get('/admin/branding');
      if (res.success && res.data) {
        const d = res.data;
        const brandForm = {
          name: d.name || 'Cafetería Gourmet',
          primary_color: d.primary_color || '#788C5A',
          secondary_color: d.secondary_color || '#CFD989',
          bg_color: d.bg_color || '#FAF7F2',
          text_color: d.text_color || '#734F2F',
          logo_url: d.logo_url || ''
        };
        setForm(brandForm);
        updateThemeLocally({
          primaryColor: brandForm.primary_color,
          secondaryColor: brandForm.secondary_color,
          bgColor: brandForm.bg_color,
          textColor: brandForm.text_color
        });
      }
    } catch (err) {
      console.error("Error fetching branding:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));

    // Inyección inmediata en tiempo real en :root para previsualizar sin guardar
    if (name === 'primary_color') updateThemeLocally({ primaryColor: value });
    if (name === 'secondary_color') updateThemeLocally({ secondaryColor: value });
    if (name === 'bg_color') updateThemeLocally({ bgColor: value });
    if (name === 'text_color') updateThemeLocally({ textColor: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await apiClient.put('/admin/branding', form);
      if (res.success) {
        setSavedMsg('¡Configuración de marca e imagen guardada con éxito en la base de datos!');
        setTimeout(() => setSavedMsg(''), 4000);
      }
    } catch (err) {
      console.error("Error updating branding:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '0 1rem 3rem 1rem' }} className="animate-fade-in">
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Palette color="var(--primary-color)" /> Personalización de Marca y Paleta de Colores
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
          Inyección en tiempo real de las variables CSS nativas (`--primary-color`, `--secondary-color`) en todos los portales.
        </p>
      </div>

      {savedMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          padding: '1rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={20} /> {savedMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
        {/* Formulario de Configuración */}
        <Card title="Paleta Hexadecimal & Logotipo">
          <form onSubmit={handleSubmit}>
            <Input
              label="Nombre Comercial del Negocio"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
            />

            <Input
              label="URL del Logotipo (ImgBB / Cloudinary)"
              name="logo_url"
              value={form.logo_url}
              onChange={handleChange}
              placeholder="https://i.ibb.co/example/logo.png"
            />

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                Color Primario (--primary-color)
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="color"
                  name="primary_color"
                  value={form.primary_color}
                  onChange={handleChange}
                  style={{ width: '45px', height: '45px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                />
                <Input
                  name="primary_color"
                  value={form.primary_color}
                  onChange={handleChange}
                  style={{ flex: 1, marginBottom: 0 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                Color Secundario (--secondary-color)
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="color"
                  name="secondary_color"
                  value={form.secondary_color}
                  onChange={handleChange}
                  style={{ width: '45px', height: '45px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                />
                <Input
                  name="secondary_color"
                  value={form.secondary_color}
                  onChange={handleChange}
                  style={{ flex: 1, marginBottom: 0 }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{ fontSize: '0.875rem', fontWeight: '500', display: 'block', marginBottom: '0.5rem' }}>
                Color de Fondo (--bg-color)
              </label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                <input
                  type="color"
                  name="bg_color"
                  value={form.bg_color}
                  onChange={handleChange}
                  style={{ width: '45px', height: '45px', borderRadius: '10px', border: 'none', cursor: 'pointer' }}
                />
                <Input
                  name="bg_color"
                  value={form.bg_color}
                  onChange={handleChange}
                  style={{ flex: 1, marginBottom: 0 }}
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Guardando...' : 'Guardar Branding en Supabase'}
            </Button>
          </form>
        </Card>

        {/* Live Preview de Tarjeta y Botones */}
        <Card title="Previsualización en Vivo">
          <div style={{
            background: 'linear-gradient(135deg, var(--primary-color), var(--secondary-color))',
            borderRadius: 'var(--radius-lg)',
            padding: '1.75rem',
            color: 'white',
            boxShadow: 'var(--shadow-glow)',
            minHeight: '220px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {form.logo_url ? (
                  <img src={form.logo_url} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <ImageIcon size={20} />
                  </div>
                )}
                <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>{form.name}</h3>
              </div>
              <span style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.2)', padding: '0.2rem 0.6rem', borderRadius: '12px' }}>
                TARJETA DIGITAL
              </span>
            </div>

            <div style={{ margin: '1rem 0' }}>
              <p style={{ fontSize: '0.75rem', opacity: 0.85 }}>PUNTOS ACUMULADOS</p>
              <h2 style={{ fontSize: '2rem', fontWeight: '800' }}>1,450 PTS</h2>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', opacity: 0.9 }}>
              <span>Cliente: Ana Pérez</span>
              <span>7 de 10 Sellos</span>
            </div>
          </div>

          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '0.5rem', fontWeight: '600' }}>
            BOTONES DINÁMICOS DE TENANT:
          </p>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn-tenant-primary" style={{ flex: 1 }}>Botón Primario</button>
            <button className="btn-tenant-secondary" style={{ flex: 1 }}>Botón Secundario</button>
          </div>
        </Card>
      </div>
    </div>
  );
};
