import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { apiClient } from '../../../core/api/client';
import { Building, Plus, CheckCircle2, ShieldCheck, Palette, Image, RefreshCw, Pencil, X, Save } from 'lucide-react';

export const SuperAdminDashboardView = () => {
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Estado para la Edición de Empresa
  const [editingTenant, setEditingTenant] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);

  // Formulario para Crear Nueva Empresa
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
        setSuccessMsg(`¡Empresa '${res.data.name}' creada exitosamente en Supabase!`);
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
        setShowCreatePanel(false);
        fetchTenants();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      setErrorMsg(err.detail || err.message || 'Error al registrar la empresa');
    }
  };

  // Abrir Modal de Edición con los datos actuales
  const handleOpenEdit = (tenant) => {
    setEditingTenant({
      id: tenant.id,
      name: tenant.name,
      slug: tenant.slug,
      logo_url: tenant.logo_url || '',
      primary_color: tenant.primary_color || '#6b8e64',
      secondary_color: tenant.secondary_color || '#6b462b',
      bg_color: tenant.bg_color || '#faf8f2',
      is_active: tenant.is_active !== undefined ? tenant.is_active : true
    });
  };

  // Guardar Cambios de la Empresa en Supabase
  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingTenant) return;

    setSavingEdit(true);
    try {
      const res = await apiClient.put(`/super-admin/tenants/${editingTenant.id}`, editingTenant);
      if (res.success && res.data) {
        setSuccessMsg(`¡Empresa '${editingTenant.name}' actualizada exitosamente en Supabase!`);
        setEditingTenant(null);
        fetchTenants();
        setTimeout(() => setSuccessMsg(''), 5000);
      }
    } catch (err) {
      console.error("Error updating tenant:", err);
      alert(err.detail || err.message || "Error al actualizar la empresa");
    } finally {
      setSavingEdit(false);
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
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '14px',
            backgroundColor: 'var(--primary-color)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)'
          }}>
            <Building size={24} />
          </div>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '800', color: 'var(--text-color)', lineHeight: 1.2 }}>
              Panel Super Admin Global
            </h1>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.15rem' }}>
              Gestión centralizada de empresas registradas, edición de colores y datos de marca.
            </p>
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
            <Plus size={18} /> {showCreatePanel ? 'Cerrar Panel' : 'Dar de Alta Nueva Empresa'}
          </Button>
        </div>
      </div>

      {successMsg && (
        <div style={{
          backgroundColor: 'rgba(22, 163, 74, 0.12)',
          border: '1.5px solid rgba(22, 163, 74, 0.35)',
          color: 'var(--success-color)',
          padding: '0.9rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.6rem',
          fontSize: '0.92rem',
          fontWeight: '700'
        }}>
          <CheckCircle2 size={20} /> {successMsg}
        </div>
      )}

      {/* PANEL SUPERIOR DESPLEGABLE: DAR DE ALTA NUEVA EMPRESA */}
      {showCreatePanel && (
        <div className="animate-fade-in" style={{ marginBottom: '2rem' }}>
          <Card
            title="🎨 Dar de Alta Nueva Empresa & Personalización de Marca"
            subtitle="Configura el nombre comercial, identificador slug y la paleta de colores de la empresa"
          >
            {errorMsg && (
              <div style={{
                backgroundColor: 'rgba(220, 38, 38, 0.12)',
                border: '1.5px solid rgba(220, 38, 38, 0.3)',
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
                {/* Formulario */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#0f172a' }}>
                    <Palette size={18} color="var(--primary-color)" /> Paleta Hexadecimal & Datos
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

                  {/* Pickers de Color */}
                  <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
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
                        />
                      </div>
                    </div>

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
                        />
                      </div>
                    </div>

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

                {/* Previsualización en Vivo */}
                <div>
                  <h4 style={{ fontSize: '1rem', fontWeight: '800', marginBottom: '1rem', color: '#0f172a' }}>
                    Previsualización en Vivo de Tarjeta
                  </h4>

                  <div style={{
                    backgroundColor: form.bg_color || '#faf8f2',
                    padding: '1.5rem',
                    borderRadius: 'var(--radius-lg)',
                    border: '1.5px solid var(--card-border)'
                  }}>
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
                            <img src={form.logo_url} alt="Logo" style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }} />
                          ) : (
                            <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Image size={20} color="#fff" />
                            </div>
                          )}
                          <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#ffffff' }}>
                              {form.name || 'Nombre Comercial'}
                            </h3>
                            <span style={{ fontSize: '0.75rem', opacity: 0.9 }}>{form.slug || 'slug-empresa'}</span>
                          </div>
                        </div>
                        <span style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: 'rgba(0,0,0,0.25)', padding: '0.2rem 0.5rem', borderRadius: '12px' }}>
                          TARJETA DIGITAL
                        </span>
                      </div>

                      <div style={{ marginTop: '1.25rem' }}>
                        <p style={{ fontSize: '0.7rem', opacity: 0.9, fontWeight: '700' }}>PUNTOS ACUMULADOS</p>
                        <h2 style={{ fontSize: '2rem', fontWeight: '800', color: '#ffffff' }}>
                          1,450 <span style={{ fontSize: '0.9rem' }}>PTS</span>
                        </h2>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.75rem', marginTop: '1rem', opacity: 0.95 }}>
                        <span>Cliente: Ana Pérez</span>
                        <span>7 de 10 Sellos</span>
                      </div>
                    </div>

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
                          backgroundColor: '#ffffff',
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

      {/* SECCIÓN PRINCIPAL: LISTADO DE TODAS LAS EMPRESAS CON ACCIONES Y BOTÓN DE LÁPIZ */}
      <Card
        title="Empresas Registradas en la Plataforma"
        subtitle="Listado simplificado de tenants activos con sus paletas de colores y opciones de edición"
      >
        {loading ? (
          <div style={{ textAlign: 'center', padding: '2.5rem', color: '#0f172a' }}>
            <RefreshCw size={24} className="animate-pulse" style={{ margin: '0 auto 0.5rem auto' }} />
            <p style={{ fontWeight: '600' }}>Cargando empresas desde Supabase...</p>
          </div>
        ) : tenants.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem 0' }}>
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
                  <th style={{ textAlign: 'center' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {t.logo_url ? (
                          <img src={t.logo_url} alt={t.name} style={{ width: '34px', height: '34px', borderRadius: '8px', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '34px', height: '34px', borderRadius: '8px', backgroundColor: t.primary_color || 'var(--primary-color)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '0.9rem' }}>
                            {t.name.charAt(0)}
                          </div>
                        )}
                        <span style={{ fontWeight: '800', color: '#0f172a' }}>{t.name}</span>
                      </div>
                    </td>

                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: '0.88rem', color: 'var(--primary-color)', fontWeight: '700' }}>
                        {t.slug}
                      </span>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <div title={`Primario: ${t.primary_color}`} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: t.primary_color, border: '2px solid #ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                        <div title={`Secundario: ${t.secondary_color}`} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: t.secondary_color, border: '2px solid #ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                        <div title={`Fondo: ${t.bg_color}`} style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: t.bg_color, border: '2px solid #ffffff', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
                      </div>
                    </td>

                    <td>
                      <Badge variant={t.is_active ? 'success' : 'danger'}>
                        {t.is_active ? 'ACTIVA' : 'INACTIVA'}
                      </Badge>
                    </td>

                    <td style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '600' }}>
                      {new Date(t.created_at).toLocaleDateString()}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      {/* BOTÓN LÁPIZ PARA MODIFICAR PROPIEDADES DE LA TIENDA */}
                      <button
                        onClick={() => handleOpenEdit(t)}
                        title="Modificar nombre, slug y colores"
                        style={{
                          backgroundColor: '#f1f6fd',
                          color: 'var(--primary-color)',
                          border: '1.5px solid var(--card-border)',
                          padding: '0.5rem 0.85rem',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.4rem',
                          fontWeight: '700',
                          fontSize: '0.85rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = 'var(--primary-color)'; e.currentTarget.style.color = '#fff'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#f1f6fd'; e.currentTarget.style.color = 'var(--primary-color)'; }}
                      >
                        <Pencil size={15} /> Editar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* MODAL PARA EDITAR PROPIEDADES DE LA TIENDA */}
      {editingTenant && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--card-border)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Pencil size={20} color="var(--primary-color)" />
                <h3 style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>
                  Modificar Propiedades de la Tienda
                </h3>
              </div>
              <button
                onClick={() => setEditingTenant(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b' }}
              >
                <X size={22} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit}>
              <Input
                label="Nombre Comercial del Negocio *"
                value={editingTenant.name}
                onChange={(e) => setEditingTenant({ ...editingTenant, name: e.target.value })}
                required
              />

              <Input
                label="Identificador Único (Slug URL) *"
                value={editingTenant.slug}
                onChange={(e) => setEditingTenant({ ...editingTenant, slug: e.target.value.toLowerCase().replace(/\s+/g, '-') })}
                required
              />

              <Input
                label="URL del Logotipo (ImgBB / Cloudinary)"
                value={editingTenant.logo_url}
                onChange={(e) => setEditingTenant({ ...editingTenant, logo_url: e.target.value })}
                placeholder="https://i.ibb.co/example/logo.png"
              />

              {/* Selectores de Color de la Tienda */}
              <div style={{ margin: '1rem 0', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                <div>
                  <label className="form-label">Color Primario (--primary-color)</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={editingTenant.primary_color}
                      onChange={(e) => setEditingTenant({ ...editingTenant, primary_color: e.target.value })}
                      style={{ width: '48px', height: '44px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <input
                      className="form-input"
                      value={editingTenant.primary_color}
                      onChange={(e) => setEditingTenant({ ...editingTenant, primary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Color Secundario (--secondary-color)</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={editingTenant.secondary_color}
                      onChange={(e) => setEditingTenant({ ...editingTenant, secondary_color: e.target.value })}
                      style={{ width: '48px', height: '44px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <input
                      className="form-input"
                      value={editingTenant.secondary_color}
                      onChange={(e) => setEditingTenant({ ...editingTenant, secondary_color: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="form-label">Color de Fondo (--bg-color)</label>
                  <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                    <input
                      type="color"
                      value={editingTenant.bg_color}
                      onChange={(e) => setEditingTenant({ ...editingTenant, bg_color: e.target.value })}
                      style={{ width: '48px', height: '44px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                    />
                    <input
                      className="form-input"
                      value={editingTenant.bg_color}
                      onChange={(e) => setEditingTenant({ ...editingTenant, bg_color: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Previsualización en Vivo de la Tarjeta Editada */}
              <div style={{
                backgroundColor: editingTenant.bg_color || '#faf8f2',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                margin: '1.25rem 0',
                border: '1px solid var(--card-border)'
              }}>
                <div style={{
                  background: `linear-gradient(135deg, ${editingTenant.primary_color}, ${editingTenant.secondary_color})`,
                  borderRadius: 'var(--radius-md)',
                  padding: '1.25rem',
                  color: '#ffffff'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {editingTenant.logo_url ? (
                        <img src={editingTenant.logo_url} alt="Logo" style={{ width: '30px', height: '30px', borderRadius: '6px', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '30px', height: '30px', borderRadius: '6px', backgroundColor: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <Image size={18} color="#fff" />
                        </div>
                      )}
                      <div>
                        <h4 style={{ fontSize: '1rem', fontWeight: '800', color: '#fff' }}>{editingTenant.name}</h4>
                        <span style={{ fontSize: '0.75rem', opacity: 0.85 }}>{editingTenant.slug}</span>
                      </div>
                    </div>
                    <Badge variant="primary">LIVE</Badge>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setEditingTenant(null)}
                  style={{ backgroundColor: '#f1f5f9', color: '#334155', border: '1px solid #cbd5e1' }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={savingEdit}>
                  <Save size={16} /> {savingEdit ? 'Guardando en Supabase...' : 'Guardar Cambios'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
