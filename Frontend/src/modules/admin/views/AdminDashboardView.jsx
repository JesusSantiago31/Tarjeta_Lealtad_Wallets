import React, { useState } from 'react';
import { useAuth } from '../../../core/auth/useAuth';
import { AdminCustomersView } from './AdminCustomersView';
import { AdminCatalogView } from './AdminCatalogView';
import { AdminRulesView } from './AdminRulesView';
import { Users, Gift, Sliders, ShieldCheck, LogOut } from 'lucide-react';

export const AdminDashboardView = () => {
  const { logout, user } = useAuth();
  const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'rewards', 'rules'

  return (
    <div className="app-container animate-fade-in" style={{ maxWidth: '900px' }}>
      
      {/* BANNER SUPERIOR: SESIÓN DE ADMINISTRACIÓN SEGURA */}
      <div style={{
        backgroundColor: '#e6edd8',
        border: '1.5px solid #c9d7b4',
        borderRadius: 'var(--radius-md)',
        padding: '0.75rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#3f5627', fontWeight: '700', fontSize: '0.95rem' }}>
          <ShieldCheck size={20} color="#557335" /> Sesión de Administración Segura
        </div>

        <button
          onClick={logout}
          style={{
            backgroundColor: '#6b462b',
            color: '#ffffff',
            border: 'none',
            padding: '0.5rem 1.1rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '700',
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.4rem',
            boxShadow: '0 2px 6px rgba(0,0,0,0.15)'
          }}
        >
          <LogOut size={15} /> Cerrar Sesión Admin
        </button>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN: DIRECTORIO | RECOMPENSAS | REGLAS Y SELLOS */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '0.65rem',
        backgroundColor: '#ffffff',
        padding: '0.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1.5px solid var(--card-border)',
        boxShadow: 'var(--shadow-soft)',
        marginBottom: '1.75rem'
      }}>
        {/* Pestaña 1: Directorio */}
        <button
          onClick={() => setActiveTab('directory')}
          style={{
            backgroundColor: activeTab === 'directory' ? '#6b462b' : 'transparent',
            color: activeTab === 'directory' ? '#ffffff' : '#475569',
            border: 'none',
            padding: '0.75rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '700',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'directory' ? '0 4px 12px rgba(107, 70, 43, 0.3)' : 'none'
          }}
        >
          <Users size={18} /> Directorio
        </button>

        {/* Pestaña 2: Recompensas */}
        <button
          onClick={() => setActiveTab('rewards')}
          style={{
            backgroundColor: activeTab === 'rewards' ? '#6b8e64' : 'transparent',
            color: activeTab === 'rewards' ? '#ffffff' : '#475569',
            border: 'none',
            padding: '0.75rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '700',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'rewards' ? '0 4px 12px rgba(107, 142, 100, 0.3)' : 'none'
          }}
        >
          <Gift size={18} /> Recompensas
        </button>

        {/* Pestaña 3: Reglas y Sellos */}
        <button
          onClick={() => setActiveTab('rules')}
          style={{
            backgroundColor: activeTab === 'rules' ? '#6b8e64' : 'transparent',
            color: activeTab === 'rules' ? '#ffffff' : '#475569',
            border: 'none',
            padding: '0.75rem 0.5rem',
            borderRadius: 'var(--radius-md)',
            fontWeight: '700',
            fontSize: '0.92rem',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            transition: 'all 0.2s ease',
            boxShadow: activeTab === 'rules' ? '0 4px 12px rgba(107, 142, 100, 0.3)' : 'none'
          }}
        >
          <Sliders size={18} /> Reglas y Sellos
        </button>
      </div>

      {/* RENDERIZADO DE LAS 3 PESTAÑAS EXACTAS */}
      <div className="animate-fade-in">
        {activeTab === 'directory' && <AdminCustomersView />}
        {activeTab === 'rewards' && <AdminCatalogView />}
        {activeTab === 'rules' && <AdminRulesView />}
      </div>

    </div>
  );
};
