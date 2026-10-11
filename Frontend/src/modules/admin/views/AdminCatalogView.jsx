import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Badge } from '../../../shared/components/Badge';
import { Modal } from '../../../shared/components/Modal';
import { apiClient } from '../../../core/api/client';
import { Gift, Plus, Edit2, Trash2, CheckCircle2, Package, Star, Award, Search, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';

export const AdminCatalogView = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [uploadingImg, setUploadingImg] = useState(false);

  const [form, setForm] = useState({
    title: '',
    price: 0,
    points_required: 50,
    stock: 10,
    image_url: ''
  });

  useEffect(() => {
    fetchCatalog();
  }, []);

  const fetchCatalog = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/admin/catalog');
      if (res.success && res.data) {
        setProducts(res.data);
      }
    } catch (err) {
      console.error("Error fetching catalog:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (product = null) => {
    setErrorMsg('');
    if (product) {
      setEditingProduct(product);
      setForm({
        title: product.title,
        price: product.price || 0,
        points_required: product.points_required || 0,
        stock: product.stock || 0,
        image_url: product.image_url || ''
      });
    } else {
      setEditingProduct(null);
      setForm({
        title: '',
        price: 0,
        points_required: 50,
        stock: 10,
        image_url: ''
      });
    }
    setIsModalOpen(true);
  };

  // Subir imagen directamente a ImgBB mediante la API
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingImg(true);
    setErrorMsg('');
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await apiClient.post('/admin/catalog/upload-image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      if (res.success && res.data?.image_url) {
        setForm(prev => ({ ...prev, image_url: res.data.image_url }));
      }
    } catch (err) {
      console.error("Error uploading to ImgBB:", err);
      setErrorMsg("Error al subir imagen a ImgBB. Intenta de nuevo.");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (editingProduct) {
        const res = await apiClient.put(`/admin/catalog/${editingProduct.id}`, form);
        if (res.success) {
          setSuccessMsg('Recompensa actualizada');
          fetchCatalog();
          setIsModalOpen(false);
        }
      } else {
        const res = await apiClient.post('/admin/catalog', form);
        if (res.success) {
          setSuccessMsg('Nueva recompensa creada en Supabase');
          fetchCatalog();
          setIsModalOpen(false);
        }
      }
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setErrorMsg(err.detail || err.message || 'Error al guardar');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Eliminar esta recompensa?')) return;
    try {
      const res = await apiClient.delete(`/admin/catalog/${productId}`);
      if (res.success) {
        setSuccessMsg('Recompensa eliminada');
        fetchCatalog();
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  // Filtrado por buscador
  const filteredProducts = products.filter(p => 
    p.title.toLowerCase().includes(searchQuery.toLowerCase().trim())
  );

  // Cálculos Métricos (Imagen 3)
  const totalItems = products.length;
  const avgPoints = totalItems > 0 
    ? Math.round(products.reduce((acc, curr) => acc + (curr.points_required || 0), 0) / totalItems) 
    : 0;
  const outOfStockCount = products.filter(p => (p.stock || 0) <= 0).length;

  return (
    <div className="animate-fade-in">
      
      {/* 3 METRIC CARDS SUPERIORES (IDÉNTICO A IMAGEN 3) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        {/* Métrica 1: Catálogo Total */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#f6f1ea',
            color: '#8c6b4f',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Gift size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              CATÁLOGO TOTAL
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
              {totalItems} <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>items</span>
            </h3>
          </div>
        </div>

        {/* Métrica 2: Promedio de Puntos */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#edf4e8',
            color: '#5a7a48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Award size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              PROMEDIO DE PUNTOS
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
              {avgPoints} <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>pts</span>
            </h3>
          </div>
        </div>

        {/* Métrica 3: Sin Stock */}
        <div style={{
          backgroundColor: '#ffffff',
          border: '1.5px solid var(--card-border)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          boxShadow: 'var(--shadow-soft)'
        }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#edf4e8',
            color: '#5a7a48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Package size={24} />
          </div>
          <div>
            <span style={{ fontSize: '0.72rem', fontWeight: '800', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.04em' }}>
              SIN STOCK
            </span>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '800', color: '#0f172a', lineHeight: 1.1 }}>
              {outOfStockCount} <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#64748b' }}>agotados</span>
            </h3>
          </div>
        </div>
      </div>

      {/* FILA DE BÚSQUEDA Y ACCIÓN NUEVA RECOMPENSA */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        flexWrap: 'wrap',
        marginBottom: '1.75rem'
      }}>
        <div style={{ flex: 1, minWidth: '240px', position: 'relative' }}>
          <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)' }} />
          <input
            className="form-input"
            style={{ paddingLeft: '2.75rem' }}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar recompensa por nombre..."
          />
        </div>

        <button
          onClick={fetchCatalog}
          title="Actualizar catálogo"
          style={{
            width: '48px',
            height: '48px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: '#ffffff',
            border: '1.5px solid var(--card-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'var(--text-muted)'
          }}
        >
          <RefreshCw size={18} />
        </button>

        <button
          onClick={() => handleOpenModal()}
          className="btn-tenant-primary"
          style={{ minHeight: '48px' }}
        >
          <Plus size={18} /> Nueva Recompensa
        </button>
      </div>

      {successMsg && (
        <div style={{
          backgroundColor: 'rgba(22, 163, 74, 0.12)',
          border: '1.5px solid rgba(22, 163, 74, 0.35)',
          color: 'var(--success-color)',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem',
          fontWeight: '700'
        }}>
          <CheckCircle2 size={18} /> {successMsg}
        </div>
      )}

      {/* GRID DE CARDS DE RECOMPENSAS (IDÉNTICO A IMAGEN 3) */}
      {loading ? (
        <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Cargando catálogo...</p>
      ) : filteredProducts.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', backgroundColor: '#ffffff', borderRadius: 'var(--radius-lg)', border: '1.5px solid var(--card-border)' }}>
          <Gift size={44} color="var(--primary-color)" style={{ margin: '0 auto 1rem auto', opacity: 0.7 }} />
          <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a' }}>No hay recompensas encontradas</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Añade productos canjeables haciendo clic en "+ Nueva Recompensa"
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
          {filteredProducts.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 'var(--radius-lg)',
                border: '1.5px solid var(--card-border)',
                overflow: 'hidden',
                boxShadow: 'var(--shadow-soft)',
                display: 'flex',
                flexDirection: 'column'
              }}
            >
              {/* Imagen con Badge Dorado en Esquina */}
              <div style={{ position: 'relative', width: '100%', height: '170px', backgroundColor: '#f1f5f9' }}>
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93'}
                  alt={item.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1509042239860-f550ce710b93'; }}
                />
                
                {/* Badge Dorado idéntico a imagen 3 */}
                <div style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  backgroundColor: '#6b462b',
                  color: '#fbbf24',
                  padding: '0.3rem 0.7rem',
                  borderRadius: '16px',
                  fontWeight: '800',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.3rem',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.25)'
                }}>
                  ★ {item.points_required} pts
                </div>
              </div>

              {/* Contenido del Producto */}
              <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <h4 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0f172a', marginBottom: '0.5rem' }}>
                    {item.title}
                  </h4>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', borderTop: '1px dashed var(--card-border)', paddingTop: '0.6rem', marginBottom: '1.25rem' }}>
                    Stock actual: <strong style={{ color: '#0f172a' }}>{item.stock} piezas</strong> | Precio ref: <strong style={{ color: '#0f172a' }}>${item.price}</strong>
                  </div>
                </div>

                {/* Botones de Acción (Editar y Borrar) */}
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <button
                    onClick={() => handleOpenModal(item)}
                    style={{
                      flex: 1,
                      backgroundColor: '#ffffff',
                      border: '1.5px solid var(--card-border)',
                      padding: '0.55rem',
                      borderRadius: 'var(--radius-md)',
                      fontWeight: '700',
                      fontSize: '0.85rem',
                      color: '#0f172a',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.4rem',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#f8fafc'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                  >
                    <Edit2 size={14} /> Editar
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    style={{
                      width: '40px',
                      height: '38px',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: '#ffffff',
                      border: '1.5px solid #fecaca',
                      color: '#ef4444',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#fee2e2'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#ffffff'; }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* MODAL EDITAR / CREAR */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Recompensa' : 'Nueva Recompensa'}
      >
        {errorMsg && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', color: '#ef4444', padding: '0.75rem', borderRadius: '8px', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: '700' }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre del Producto / Recompensa *"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ej: Capuchino Grande 400 ml"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Puntos Requeridos *"
              type="number"
              value={form.points_required}
              onChange={(e) => setForm({ ...form, points_required: parseInt(e.target.value) || 0 })}
              required
            />
            <Input
              label="Precio Referencial ($ MXN)"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <Input
            label="Piezas Disponibles (Stock) *"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
            required
          />

          {/* SUBIDA DIRECTA DE IMAGEN A IMGBB O URL */}
          <div style={{ marginBottom: '1.25rem' }}>
            <label className="form-label">IMAGEN DEL PRODUCTO (IMGBB)</label>
            
            {/* Input URL */}
            <input
              className="form-input"
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              placeholder="https://i.ibb.co/... o sube un archivo abajo"
            />

            {/* Botón para seleccionar y subir archivo directo */}
            <div style={{ marginTop: '0.6rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <label style={{
                cursor: uploadingImg ? 'not-allowed' : 'pointer',
                backgroundColor: '#f1f5f9',
                color: 'var(--primary-color)',
                border: '1.5px dashed var(--primary-color)',
                padding: '0.6rem 1rem',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Upload size={16} /> {uploadingImg ? 'Subiendo a ImgBB...' : 'Subir Imagen desde el equipo'}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={uploadingImg}
                  style={{ display: 'none' }}
                />
              </label>

              {form.image_url && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={form.image_url}
                    alt="Preview"
                    style={{ width: '38px', height: '38px', borderRadius: '6px', objectFit: 'cover', border: '1px solid var(--card-border)' }}
                  />
                  <span style={{ fontSize: '0.75rem', color: '#16a34a', fontWeight: '700' }}>✓ Imagen cargada</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
            <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} style={{ backgroundColor: '#f1f5f9', color: '#334155' }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploadingImg}>
              {editingProduct ? 'Guardar Cambios' : 'Crear Recompensa'}
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
