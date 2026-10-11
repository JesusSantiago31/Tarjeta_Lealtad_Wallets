import React from 'react';

export const Badge = ({ children, variant = 'primary' }) => {
  const getColors = () => {
    switch (variant) {
      case 'success':
        return { bg: 'rgba(22, 163, 74, 0.12)', color: 'var(--success-color)', border: '1px solid rgba(22, 163, 74, 0.25)' };
      case 'warning':
        return { bg: 'rgba(217, 119, 6, 0.12)', color: 'var(--accent-gold)', border: '1px solid rgba(217, 119, 6, 0.25)' };
      case 'danger':
        return { bg: 'rgba(220, 38, 38, 0.12)', color: 'var(--danger-color)', border: '1px solid rgba(220, 38, 38, 0.25)' };
      case 'secondary':
        return { bg: 'rgba(107, 70, 43, 0.12)', color: 'var(--secondary-color)', border: '1px solid rgba(107, 70, 43, 0.25)' };
      default:
        return { bg: 'rgba(107, 142, 100, 0.15)', color: 'var(--primary-color)', border: '1px solid rgba(107, 142, 100, 0.3)' };
    }
  };

  const style = getColors();

  return (
    <span style={{
      backgroundColor: style.bg,
      color: style.color,
      border: style.border,
      padding: '0.25rem 0.65rem',
      borderRadius: '20px',
      fontSize: '0.75rem',
      fontWeight: '700',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '0.3rem',
      lineHeight: 1.2
    }}>
      {children}
    </span>
  );
};
