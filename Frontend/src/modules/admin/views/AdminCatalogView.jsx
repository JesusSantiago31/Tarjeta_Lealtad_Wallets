import React, { useState, useEffect } from 'react';
import { Card } from '../../../shared/components/Card';
import { Button } from '../../../shared/components/Button';
import { Input } from '../../../shared/components/Input';
import { Badge } from '../../../shared/components/Badge';
import { Modal } from '../../../shared/components/Modal';
import { apiClient } from '../../../core/api/client';
import { Gift, Plus, Edit2, Trash2, CheckCircle2, Package, Star } from 'lucide-react';

export const AdminCatalogView = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [form, setForm] = useState({
    title: '',
    price: 0,
    points_required: 100,
    stock: 50,
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
        points_required: 100,
        stock: 50,
        image_url: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      if (editingProduct) {
        const res = await apiClient.put(`/admin/catalog/${editingProduct.id}`, form);
        if (res.success) {
          setSuccessMsg('Producto actualizado con éxito');
          fetchCatalog();
          setIsModalOpen(false);
        }
      } else {
        const res = await apiClient.post('/admin/catalog', form);
        if (res.success) {
          setSuccessMsg('Nuevo producto creado en el catálogo');
          fetchCatalog();
          setIsModalOpen(false);
        }
      }
      setTimeout(() => setSuccessMsg(''), 3500);
    } catch (err) {
      setErrorMsg(err.detail || err.message || 'Error al guardar el producto');
    }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto del catálogo?')) return;
    try {
      const res = await apiClient.delete(`/admin/catalog/${productId}`);
      if (res.success) {
        setSuccessMsg('Producto eliminado con éxito');
        fetchCatalog();
        setTimeout(() => setSuccessMsg(''), 3500);
      }
    } catch (err) {
      console.error("Error deleting product:", err);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '0 1rem 3rem 1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <Gift color="var(--primary-color)" /> Catálogo de Productos y Recompensas
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.2rem' }}>
            Gestión CRUD completa de premios canjeables por puntos para la empresa activa.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()} className="glow-effect">
          <Plus size={18} /> Nuevo Producto
        </Button>
      </div>

      {successMsg && (
        <div style={{
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          color: '#10b981',
          padding: '0.85rem 1.25rem',
          borderRadius: 'var(--radius-md)',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontSize: '0.9rem'
        }}>
          <CheckCircle2 size={20} /> {successMsg}
        </div>
      )}

      {loading ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>Cargando productos...</p>
      ) : products.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
          <Package size={48} color="var(--primary-color)" style={{ margin: '0 auto 1rem auto', opacity: 0.6 }} />
          <h3 style={{ fontSize: '1.2rem', fontWeight: '700' }}>Sin Productos en el Catálogo</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.4rem', marginBottom: '1.5rem' }}>
            Añade el primer producto o premio canjeable para tus clientes.
          </p>
          <Button onClick={() => handleOpenModal()}>
            <Plus size={16} /> Crear Producto
          </Button>
        </Card>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {products.map((item) => (
            <Card key={item.id}>
              <div style={{ position: 'relative' }}>
                <img
                  src={item.image_url || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93'}
                  alt={item.title}
                  style={{
                    width: '100%',
                    height: '160px',
                    objectFit: 'cover',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: '1rem'
                  }}
                />
                <div style={{ position: 'absolute', top: '10px', right: '10px' }}>
                  <Badge variant="warning"><Star size={12} /> {item.points_required} PTS</Badge>
                </div>
              </div>

              <h3 style={{ fontSize: '1.15rem', fontWeight: '700' }}>{item.title}</h3>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0.5rem 0 1.25rem 0' }}>
                <span>Precio comercial: <strong>${item.price.toFixed(2)} MXN</strong></span>
                <span>Stock: <strong>{item.stock} pzas</strong></span>
              </div>

              <div style={{ display: 'flex', gap: '0.5rem', borderTop: '1px solid var(--card-border)', paddingTop: '1rem' }}>
                <button
                  onClick={() => handleOpenModal(item)}
                  className="btn-tenant-secondary"
                  style={{ flex: 1, padding: '0.45rem', fontSize: '0.8rem' }}
                >
                  <Edit2 size={14} /> Editar
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={{
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    color: '#ef4444',
                    padding: '0.45rem 0.8rem',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.3rem'
                  }}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal Formulario Crear/Editar Producto */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingProduct ? 'Editar Producto del Catálogo' : 'Crear Nuevo Producto de Recompensa'}
      >
        {errorMsg && (
          <div style={{
            background: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#ef4444',
            padding: '0.75rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1rem',
            fontSize: '0.85rem'
          }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <Input
            label="Nombre del Producto / Recompensa"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder="Ej: Café Americano o Latte 16oz"
            required
          />

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <Input
              label="Puntos Requeridos"
              type="number"
              value={form.points_required}
              onChange={(e) => setForm({ ...form, points_required: parseInt(e.target.value) || 0 })}
              required
            />
            <Input
              label="Precio Comercial ($ MXN)"
              type="number"
              step="0.5"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: parseFloat(e.target.value) || 0 })}
              required
            />
          </div>

          <Input
            label="Piezas Disponibles (Stock)"
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: parseInt(e.target.value) || 0 })}
            required
          />

          <Input
            label="URL Imagen del Producto (ImgBB / Unsplash)"
            value={form.image_url}
            onChange={(e) => setForm({ ...form, image_url: e.target.value })}
            placeholder="https://i.ibb.co/..."
          />

          <Button type="submit" style={{ width: '100%', marginTop: '1rem' }}>
            {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
          </Button>
        </form>
      </Modal>
    </div>
  );
};
