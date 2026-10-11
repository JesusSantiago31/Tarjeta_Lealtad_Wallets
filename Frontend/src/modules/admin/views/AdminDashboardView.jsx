import React, { useState } from 'react';
import { Card } from '../../../shared/components/Card';
import { Badge } from '../../../shared/components/Badge';
import { AdminRulesView } from './AdminRulesView';
import { AdminBrandingView } from './AdminBrandingView';
import { AdminCatalogView } from './AdminCatalogView';
import { Sliders, Palette, Gift, Users, ShieldCheck, Award, CreditCard } from 'lucide-react';

export const AdminDashboardView = () => {
  const [activeTab, setActiveTab] = useState('rules'); // 'rules', 'catalog', 'branding'

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '0 1.5rem 3rem 1.5rem' }}>
      {/* Header General */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Panel de Administración de Empresa</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginTop: '0.25rem' }}>
            Control de reglas de acumulación, galería de sellos ImgBB, catálogo de premios y branding dinámico
          </p>
        </div>
        <Badge variant="success">
          <ShieldCheck size={14} /> Multi-Tenant RLS Activo
        </Badge>
      </div>

      {/* Pestañas de Navegación del Módulo Administrador */}
      <div className="glass-panel" style={{
        display: 'flex',
        gap: '0.5rem',
        padding: '0.5rem',
        borderRadius: 'var(--radius-md)',
        marginBottom: '2rem'
      }}>
        <button
          onClick={() => setActiveTab('rules')}
          className={activeTab === 'rules' ? 'btn-tenant-primary' : 'btn-tenant-secondary'}
          style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem' }}
        >
          <Sliders size={18} /> Reglas & Sellos
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={activeTab === 'catalog' ? 'btn-tenant-primary' : 'btn-tenant-secondary'}
          style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem' }}
        >
          <Gift size={18} /> Catálogo de Recompensas
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={activeTab === 'branding' ? 'btn-tenant-primary' : 'btn-tenant-secondary'}
          style={{ flex: 1, padding: '0.75rem', fontSize: '0.9rem' }}
        >
          <Palette size={18} /> Personalización de Marca
        </button>
      </div>

      {/* Renderizado de la Pestaña Activa */}
      {activeTab === 'rules' && <AdminRulesView />}
      {activeTab === 'catalog' && <AdminCatalogView />}
      {activeTab === 'branding' && <AdminBrandingView />}
    </div>
  );
};
