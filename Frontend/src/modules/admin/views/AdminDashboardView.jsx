import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../core/auth/useAuth';
import { useTheme } from '../../../core/theme/useTheme';
import { apiClient } from '../../../core/api/client';
import { AdminCustomersView } from './AdminCustomersView';
import { AdminCatalogView } from './AdminCatalogView';
import { AdminRulesView } from './AdminRulesView';
import { Users, Gift, Sliders, ShieldCheck, LogOut } from 'lucide-react';

export const AdminDashboardView = () => {
  const { logout, user } = useAuth();
  const { updateThemeLocally } = useTheme();
  const [activeTab, setActiveTab] = useState('directory'); // 'directory', 'rewards', 'rules'

  // Sincronizar en tiempo real los colores oficiales del Tenant desde Supabase
  useEffect(() => {
    const syncTenantTheme = async () => {
      try {
        const res = await apiClient.get('/admin/branding');
        if (res.success && res.data) {
          updateThemeLocally({
            primaryColor: res.data.primary_color || '#6b8e64',
            secondaryColor: res.data.secondary_color || '#6b462b',
            bgColor: res.data.bg_color || '#faf8f2',
            textColor: res.data.text_color || '#2b261f'
          });
        }
      } catch (err) {
        console.error("Error syncing tenant branding:", err);
      }
    };
    syncTenantTheme();
  }, []);

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
            backgroundColor: 'var(--secondary-color)',
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
            backgroundColor: activeTab === 'directory' ? 'var(--secondary-color)' : 'transparent',
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
            boxShadow: activeTab === 'directory' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
          }}
        >
          <Users size={18} /> Directorio
        </button>

        {/* Pestaña 2: Recompensas */}
        <button
          onClick={() => setActiveTab('rewards')}
          style={{
            backgroundColor: activeTab === 'rewards' ? 'var(--primary-color)' : 'transparent',
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
            boxShadow: activeTab === 'rewards' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
          }}
        >
          <Gift size={18} /> Recompensas
        </button>

        {/* Pestaña 3: Reglas y Sellos */}
        <button
          onClick={() => setActiveTab('rules')}
          style={{
            backgroundColor: activeTab === 'rules' ? 'var(--primary-color)' : 'transparent',
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
            boxShadow: activeTab === 'rules' ? '0 4px 12px rgba(0,0,0,0.2)' : 'none'
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
