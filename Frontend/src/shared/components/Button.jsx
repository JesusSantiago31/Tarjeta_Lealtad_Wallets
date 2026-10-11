import React from 'react';

export const Button = ({
  children,
  variant = 'primary',
  size = 'md',
  onClick,
  disabled = false,
  type = 'button',
  className = ''
}) => {
  const baseClass = variant === 'primary' ? 'btn-tenant-primary' : 'btn-tenant-secondary';
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClass} ${className}`}
      style={{ opacity: disabled ? 0.6 : 1 }}
    >
      {children}
    </button>
  );
};
