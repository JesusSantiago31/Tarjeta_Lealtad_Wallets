import React from 'react';

export const Badge = ({ children, variant = 'primary' }) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)' };
      case 'warning':
        return { bg: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', border: '1px solid rgba(251, 191, 36, 0.3)' };
      case 'danger':
        return { bg: 'rgba(239, 68, 68, 0.15)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.3)' };
      default:
        return { bg: 'rgba(99, 102, 241, 0.15)', color: 'var(--primary-color)', border: '1px solid rgba(99, 102, 241, 0.3)' };
    }
  };

  const style = getColors();

  return (
    <span style={{
      background: style.bg,
      color: style.color,
      border: style.border,
      padding: '0.25rem 0.65rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.25rem'
    }}>
      {children}
    </span>
  );
};
