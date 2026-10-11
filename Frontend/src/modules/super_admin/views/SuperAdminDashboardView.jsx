import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { apiClient } from '../../../core/api/client';
import { Building, Plus, CheckCircle2, ShieldCheck, Palette, Store, Image, RefreshCw, CreditCard } from 'lucide-react';

export const SuperAdminDashboardView = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Formulario para Crear Nueva Empresa (Tenant + Paleta de Colores)
  const [form, setForm] = useState({
    name: '',
    slug: '',
    logo_url: '',
    admin_email: '',
    admin_name: '',
    primary_color: '#6b8e64',
    secondary_color: '#6b462b',
    bg_color: '#faf8f2'
  });

  useEffect(() => {
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/super-admin/tenants');
      if (res.success && res.data) {
        setTenants(res.data);
      }
    } catch (err) {
      console.error("Error fetching tenants:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    const nameVal = e.target.value;
    // Generar slug automático sugerido a partir del nombre
    const generatedSlug = nameVal
      .toLowerCase()
      .trim()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setForm({
      ...form,
      name: nameVal,
      slug: generatedSlug
    });
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    try {
      const res = await apiClient.post('/super-admin/tenants', form);
      if (res.success && res.data) {
        setSuccessMsg(`¡Empresa '${res.data.name}' dada de alta exitosamente en Supabase!`);
        setForm({
          name: '',
          slug: '',
          logo_url: '',
          admin_email: '',
          admin_name: '',
          primary_color: '#6b8e64',
          secondary_color: '#6b462b',
          bg_color: '#faf8f2'
        });
        fetchTenants();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setErrorMsg(err.detail || err.message || 'Error al registrar la empresa');
    }
  };

  return (
    <div className="app-container animate-fade-in">
      {/* Header General del Super Admin */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-color)',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Building size={22} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Panel Super Admin Global</h1>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Gestión centralizada de empresas registradas, asignación de gerentes y paletas de colores.
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <Badge variant="success">
            <ShieldCheck size={14} /> Acceso Exclusivo Super Admin
          </Badge>
          <Button
            onClick={() => setShowCreatePanel(!showCreatePanel)}
            style={{ borderRadius: 'var(--radius-md)' }}
          >
            <Plus size={18} /> {showCreatePanel ? 'Ocultar Formulario' : 'Dar de Alta Nueva Empresa'}
          </Button>
        </div>
      </div>

      {/* PANEL SUPERIOR: REGISTRO Y CONFIGURACIÓN DE PALETA DE NUEVA EMPRESA */}
      {showCreatePanel && (
        <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
          <Card
            title="🎨 Dar de Alta Nueva Empresa & Personalización de Marca"
            subtitle="Configura el nombre comercial, slug único y paleta de colores nativa nativa de la empresa"
          >
            {successMsg && (
              <div style={{
                backgroundColor: 'rgba(22, 163, 74, 0.12)',
                border: '1px solid rgba(22, 163, 74, 0.3)',
                color: 'var(--success-color)',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontSize: '0.9rem',
                fontWeight: '700'
              }}>
                <CheckCircle2 size={20} /> {successMsg}
              </div>
            )}

            {errorMsg && (
              <div style={{
                backgroundColor: 'rgba(220, 38, 38, 0.12)',
                border: '1px solid rgba(220, 38, 38, 0.3)',
                color: 'var(--danger-color)',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.25rem',
                fontSize: '0.85rem',
                fontWeight: '700'
              }}>
                {errorMsg}
              </div>
            )}

            <form onSubmit={handleCreateTenant}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
                alignItems: 'start'
              }}>
                
                {/* COLUMNA IZQUIERDA: FORMULARIO DE DATOS Y COLORES */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Palette size={18} color="var(--primary-color)" /> Paleta Hexadecimal & Logotipo
                  </h4>

                  <Input
                    label="Nombre Comercial del Negocio *"
                    value={form.name}
                    onChange={handleNameChange}
                    placeholder="Ej: Café Lealtad Manager"
                    required
                  />

                  <Input
                    label="Identificador Único (Slug URL) *"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                    placeholder="ej: cafe-lealtad"
                    required
                  />

                  <Input
                    label="URL del Logotipo (ImgBB / Cloudinary)"
                    value={form.logo_url}
                    onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
                    placeholder="https://i.ibb.co/example/logo.png"
                  />

                  <Input
                    label="Correo del Gerente / Admin de Empresa (Opcional)"
                    type="email"
                    value={form.admin_email}
                    onChange={(e) => setForm({ ...form, admin_email: e.target.value })}
                    placeholder="gerente@empresa.com"
                  />

                  {/* SELECTOR DE COLORES HEXADECIMALES */}
                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    
                    {/* Color Primario */}
                    <div>
                      <label className="form-label">Color Primario (--primary-color)</label>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={form.primary_color}
                          onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                          style={{ width: '48px', height: '44px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        />
                        <input
                          className="form-input"
                          value={form.primary_color}
                          onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                          placeholder="#6b8e64"
                        />
                      </div>
                    </div>

                    {/* Color Secundario */}
                    <div>
                      <label className="form-label">Color Secundario (--secondary-color)</label>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={form.secondary_color}
                          onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                          style={{ width: '48px', height: '44px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        />
                        <input
                          className="form-input"
                          value={form.secondary_color}
                          onChange={(e) => setForm({ ...form, secondary_color: e.target.value })}
                          placeholder="#6b462b"
                        />
                      </div>
                    </div>

                    {/* Color de Fondo */}
                    <div>
                      <label className="form-label">Color de Fondo (--bg-color)</label>
                      <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <input
                          type="color"
                          value={form.bg_color}
                          onChange={(e) => setForm({ ...form, bg_color: e.target.value })}
                          style={{ width: '48px', height: '44px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                        />
                        <input
                          className="form-input"
                          value={form.bg_color}
                          onChange={(e) => setForm({ ...form, bg_color: e.target.value })}
                          placeholder="#faf8f2"
                        />
                      </div>
                    </div>

                  </div>

                  <div style={{ marginTop: '1.5rem' }}>
                    <Button type="submit" style={{ width: '100%' }}>
                      Guardar Empresa en Supabase
                    </Button>
                  </div>
                </div>

                {/* COLUMNA DERECHA: PREVISUALIZACIÓN EN VIVO (LIVE PREVIEW) */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem' }}>
                    Previsualización en Vivo de Tarjeta
                  </h4>

                  <div style={{
                    backgroundColor: form.bg_color || '#faf8f2',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--card-border)'
                  }}>
                    {/* Tarjeta Simulación */}
                    <div style={{
                      background: `linear-gradient(135deg, ${form.primary_color || '#6b8e64'}, ${form.secondary_color || '#6b462b'})`,
                      borderRadius: 'var(--radius-lg)',
                      padding: '1.5rem',
                      color: '#ffffff',
                      boxShadow: 'var(--shadow-soft)',
                      marginBottom: '1.25rem'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          {form.logo_url ? (
                            <img src={form.logo_url} alt="Logo Preview" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Image size={20} color="#fff" />
                            </div>
                          )}
                          <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
                              {form.name || 'Nombre Comercial'}
                            </h3>
                            <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{form.slug || 'slug-empresa'}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'rgba(0,0,0,0.25)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                          TARJETA DIGITAL
                        </span>
                      </div>

                      <div style={{ marginTop: '1.25rem' }}>
                        <p style={{ fontSize: '0.7rem', opacity: 0.85, fontWeight: '700' }}>PUNTOS ACUMULADOS</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>
                          1,450 <span style={{ fontSize: '0.9rem' }}>PTS</span>
                        </h2>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '1rem', opacity: 0.9 }}>
                        <span>Cliente: Ana Pérez</span>
                        <span>7 de 10 Sellos</span>
                      </div>
                    </div>

                    {/* Botones Dinámicos Muestra */}
                    <p style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                      BOTONES DINÁMICOS DE TENANT:
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                      <button
                        type="button"
                        style={{
                          backgroundColor: form.primary_color || '#6b8e64',
                          color: '#ffffff',
                          border: 'none',
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: '700',
                          fontSize: '0.85rem'
                        }}
                      >
                        Botón Primario
                      </button>

                      <button
                        type="button"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.7)',
                          color: form.secondary_color || '#6b462b',
                          border: `1.5px solid ${form.secondary_color || '#6b462b'}`,
                          padding: '0.75rem',
                          borderRadius: 'var(--radius-md)',
                          fontWeight: '700',
                          fontSize: '0.85rem'
                        }}
                      >
                        Botón Secundario
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </form>
          </Card>
        </div>
      )}

      {/* SECCIÓN PRINCIPAL: LISTADO DE TODAS LAS EMPRESAS REGISTRADAS */}
      <Card
        title="Empresas Registradas en la Plataforma"
        subtitle="Listado simplificado de tenants activos con sus paletas de colores y estado"
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <RefreshCw size={24} className="animate-pulse" style={{ margin: '0 auto 0.5rem auto' }} />
            <p>Cargando empresas desde Supabase...</p>
          </div>
        ) : tenants.length === 0 ? (
          <p style={{ textAling: 'center', color: 'var(--text-muted)', padding: '1.5rem 0' }}>
            No hay empresas registradas aún. Haz clic en "Dar de Alta Nueva Empresa" para agregar la primera.
          </p>
        ) : (
          <div className="responsive-table-wrapper">
            <table className="responsive-table">
              <thead>
                <tr>
                  <th>Empresa</th>
                  <th>Slug ID</th>
                  <th>Paleta de Colores</th>
                  <th>Estado</th>
                  <th>Fecha de Alta</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {t.logo_url ? (
                          <img src={t.logo_url} alt={t.name} style={{ width: '32px', height: '32px', borderRadius: '6px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '6px', backgroundColor: t.primary_color || 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.85rem' }}>
                            {t.name.charAt(0)}
                          </div>
                        )}
                        <span style={{ fontWeight: '700', color: 'var(--text-color)' }}>{t.name}</span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '700' }}>
                        {t.slug}
                      </span>
                    </td>

                    <td>
                      {/* Muestra visual de los 3 colores de la paleta */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <div title={`Primario: ${t.primary_color}`} style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: t.primary_color, border: '1px solid var(--card-border)' }} />
                        <div title={`Secundario: ${t.secondary_color}`} style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: t.secondary_color, border: '1px solid var(--card-border)' }} />
                        <div title={`Fondo: ${t.bg_color}`} style={{ width: '22px', height: '22px', borderRadius: '50%', backgroundColor: t.bg_color, border: '1px solid var(--card-border)' }} />
                      </div>
                    </td>

                    <td>
                      <Badge variant={t.is_active ? 'success' : 'danger'}>
                        {t.is_active ? 'ACTIVA' : 'INACTIVA'}
                      </Badge>
                    </td>

                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
};
