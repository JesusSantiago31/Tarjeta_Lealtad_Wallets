import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/Card';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { Badge } from '../../../shared/components/Badge';
import { apiClient } from '../../../core/api/client';
import { Users, Search, RefreshCw, UserPlus, QrCode, Pencil, Trash2, X, CheckCircle2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';

export const AdminCustomersView = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modales
  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedQrCustomer, setSelectedQrCustomer] = useState(null);
  const [editingCustomer, setEditingCustomer] = useState(null);

  // Formulario Nuevo Cliente
  const [newForm, setNewForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    email: '',
    initial_points: 0
  });

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const url = searchQuery.trim() ? `/admin/customers?q=${encodeURIComponent(searchQuery.trim())}` : '/admin/customers';
      const res = await apiClient.get(url);
      if (res.success && res.data) {
        setCustomers(res.data);
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCustomers();
  };

  const handleCreateCustomer = async (e) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/admin/customers', newForm);
      if (res.success) {
        setShowNewModal(false);
        setNewForm({ first_name: '', last_name: '', phone: '', email: '', initial_points: 0 });
        fetchCustomers();
      }
    } catch (err) {
      alert(err.detail || err.message || "Error al crear cliente");
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`¿Estás seguro de eliminar a ${name}?`)) return;
    try {
      await apiClient.delete(`/admin/customers/${id}`);
      fetchCustomers();
    } catch (err) {
      console.error("Error deleting customer:", err);
    }
  };

  return (
    <div className="animate-fade-in">
      {/* TÍTULO Y DESCRIPCIÓN */}
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '800', color: 'var(--text-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
          🛡️ Gestión de Clientes
        </h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.2rem' }}>
          Módulo administrativo protegido para el control del directorio, alta de clientes y auditoría.
        </p>
      </div>

      {/* METRIC CARD: TOTAL CLIENTES */}
      <div style={{
        backgroundColor: '#ffffff',
        border: '1.5px solid var(--card-border)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem 1.5rem',
        maxWidth: '260px',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        boxShadow: 'var(--shadow-soft)'
      }}>
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '12px',
          backgroundColor: 'rgba(107, 142, 100, 0.15)',
          color: 'var(--primary-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Users size={24} />
        </div>
        <div>
          <span style={{ fontSize: '0.75rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.05em' }}>
            TOTAL CLIENTES
          </span>
          <h3 style={{ fontSize: '1.8rem', fontWeight: '800', color: '#0f172a', lineHeight: 1 }}>
            {customers.length}
          </h3>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y BOTONES DE ACCIÓN */}
      <div style={{ marginBottom: '1.5rem' }}>
        <label className="form-label" style={{ marginBottom: '0.35rem' }}>
          BUSCAR EN EL DIRECTORIO
        </label>
        
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <div style={{ position: 'relative' }}>
            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              className="form-input"
              style={{ paddingLeft: '2.75rem' }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Por nombre o número de teléfono..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <button
              type="button"
              onClick={fetchCustomers}
              className="btn-tenant-secondary"
              style={{ width: '100%', minHeight: '46px' }}
            >
              <RefreshCw size={16} /> Actualizar
            </button>

            <button
              type="button"
              onClick={() => setShowNewModal(true)}
              className="btn-tenant-primary"
              style={{ width: '100%', minHeight: '46px' }}
            >
              <UserPlus size={16} /> Nuevo Cliente
            </button>
          </div>
        </form>
      </div>

      {/* TABLA DE CLIENTES (IDENTICA A IMAGEN 2) */}
      <div className="responsive-table-wrapper">
        <table className="responsive-table">
          <thead>
            <tr>
              <th>Cliente</th>
              <th>Teléfono</th>
              <th>Puntos</th>
              <th style={{ textAlign: 'center' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  Cargando directorio...
                </td>
              </tr>
            ) : customers.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No se encontraron clientes.
                </td>
              </tr>
            ) : (
              customers.map((c) => (
                <tr key={c.id}>
                  <td>
                    <span style={{ fontWeight: '800', color: '#0f172a' }}>
                      {c.full_name || c.first_name}
                    </span>
                  </td>

                  <td>
                    <span style={{ color: '#475569', fontWeight: '600' }}>
                      {c.phone || 'Sin teléfono'}
                    </span>
                  </td>

                  <td>
                    {/* Badge Pill idéntico al screenshot */}
                    <span style={{
                      backgroundColor: 'rgba(107, 142, 100, 0.2)',
                      color: 'var(--primary-color)',
                      fontWeight: '800',
                      fontSize: '0.8rem',
                      padding: '0.25rem 0.65rem',
                      borderRadius: '16px',
                      display: 'inline-block'
                    }}>
                      {c.current_points} PTS
                    </span>
                  </td>

                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
                      {/* Botón QR */}
                      <button
                        onClick={() => setSelectedQrCustomer(c)}
                        title="Ver Código QR"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(107, 142, 100, 0.15)',
                          color: 'var(--primary-color)',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <QrCode size={16} />
                      </button>

                      {/* Botón Editar */}
                      <button
                        onClick={() => alert(`Cliente: ${c.full_name}\nTeléfono: ${c.phone}\nCódigo: ${c.loyalty_code}`)}
                        title="Editar"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: '#f1f5f9',
                          color: '#475569',
                          border: '1px solid #cbd5e1',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Pencil size={15} />
                      </button>

                      {/* Botón Eliminar */}
                      <button
                        onClick={() => handleDeleteCustomer(c.id, c.full_name)}
                        title="Eliminar"
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          backgroundColor: 'rgba(239, 68, 68, 0.1)',
                          color: '#ef4444',
                          border: '1px solid rgba(239, 68, 68, 0.25)',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL QR CLIENTE */}
      {selectedQrCustomer && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '380px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>Código QR del Cliente</h4>
              <button onClick={() => setSelectedQrCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <div style={{ backgroundColor: '#ffffff', padding: '1.25rem', borderRadius: '16px', display: 'inline-block', boxShadow: 'var(--shadow-soft)', border: '1px solid var(--card-border)', margin: '1rem 0' }}>
              <QRCodeSVG value={selectedQrCustomer.loyalty_code} size={180} />
            </div>

            <p style={{ fontWeight: '800', fontSize: '1.05rem', color: '#0f172a' }}>{selectedQrCustomer.full_name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{selectedQrCustomer.phone}</p>
            <Badge variant="primary" style={{ marginTop: '0.5rem' }}>{selectedQrCustomer.loyalty_code}</Badge>
          </div>
        </div>
      )}

      {/* MODAL NUEVO CLIENTE */}
      {showNewModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-fade-in" style={{ maxWidth: '440px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem', paddingBottom: '0.5rem', borderBottom: '1px solid var(--card-border)' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>Nuevo Cliente</h3>
              <button onClick={() => setShowNewModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer}>
              <Input
                label="Nombre *"
                value={newForm.first_name}
                onChange={(e) => setNewForm({ ...newForm, first_name: e.target.value })}
                placeholder="Nombre del cliente"
                required
              />

              <Input
                label="Apellidos"
                value={newForm.last_name}
                onChange={(e) => setNewForm({ ...newForm, last_name: e.target.value })}
                placeholder="Apellidos"
              />

              <Input
                label="Teléfono Móvil *"
                value={newForm.phone}
                onChange={(e) => setNewForm({ ...newForm, phone: e.target.value })}
                placeholder="5512345678"
                required
              />

              <Input
                label="Correo Electrónico (Opcional)"
                type="email"
                value={newForm.email}
                onChange={(e) => setNewForm({ ...newForm, email: e.target.value })}
                placeholder="cliente@email.com"
              />

              <Input
                label="Puntos Iniciales de Bienvenida"
                type="number"
                value={newForm.initial_points}
                onChange={(e) => setNewForm({ ...newForm, initial_points: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <Button type="button" variant="secondary" onClick={() => setShowNewModal(false)} style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
                  Cancelar
                </Button>
                <Button type="submit">
                  Guardar Cliente
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
