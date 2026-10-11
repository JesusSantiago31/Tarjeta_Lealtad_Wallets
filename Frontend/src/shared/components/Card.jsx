import React from 'react';

export const Card = ({ children, title, subtitle, className = '' }) => {
  return (
    <div className={`glass-panel ${className}`} style={{ padding: '1.5rem' }}>
      {(title || subtitle) && (
        <div style={{ marginBottom: '1.25rem' }}>
          {title && <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>{title}</h3>}
          {subtitle && <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  );
};
