import React, { useState } from 'react';
import { Badge } from '../../../shared/components/Badge';
import { AdminRulesView } from './AdminRulesView';
import { AdminBrandingView } from './AdminBrandingView';
import { AdminCatalogView } from './AdminCatalogView';
import { Sliders, Palette, Gift, ShieldCheck } from 'lucide-react';

export const AdminDashboardView = () => {
  const [activeTab, setActiveTab] = useState('rules');

  return (
    <div className="app-container">
      {/* Header General */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        marginBottom: '1.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
          <h1 style={{ fontSize: '1.6rem', fontWeight: '800' }}>Administración de Empresa</h1>
          <Badge variant="success">
            <ShieldCheck size={14} /> Multi-Tenant RLS
          </Badge>
        </div>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          Configura sellos, catálogo de premios, reglas de acumulación y colores de tu marca.
        </p>
      </div>

      {/* Navigation Tabs - Touch Friendly Scrollable / Grid */}
      <div className="glass-panel" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
        gap: '0.5rem',
        padding: '0.5rem',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => setActiveTab('rules')}
          className={activeTab === 'rules' ? 'btn-tenant-primary' : 'btn-tenant-outline'}
          style={{ fontSize: '0.85rem', padding: '0.65rem 0.5rem' }}
        >
          <Sliders size={16} /> Reglas & Sellos
        </button>

        <button
          onClick={() => setActiveTab('catalog')}
          className={activeTab === 'catalog' ? 'btn-tenant-primary' : 'btn-tenant-outline'}
          style={{ fontSize: '0.85rem', padding: '0.65rem 0.5rem' }}
        >
          <Gift size={16} /> Premios
        </button>

        <button
          onClick={() => setActiveTab('branding')}
          className={activeTab === 'branding' ? 'btn-tenant-primary' : 'btn-tenant-outline'}
          style={{ fontSize: '0.85rem', padding: '0.65rem 0.5rem' }}
        >
          <Palette size={16} /> Marca
        </button>
      </div>

      {/* Active Tab Content */}
      <div className="animate-fade-in">
        {activeTab === 'rules' && <AdminRulesView />}
        {activeTab === 'catalog' && <AdminCatalogView />}
        {activeTab === 'branding' && <AdminBrandingView />}
      </div>
    </div>
  );
};
