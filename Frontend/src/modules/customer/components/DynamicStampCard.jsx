import React from 'react';
import { Award, Check, Image as ImageIcon } from 'lucide-react';
import { Badge } from '../../../shared/components/Badge';

export const DynamicStampCard = ({ stampsCount = 0, stampsTarget = 10, walletHeroImageUrl = '' }) => {
  const stamps = Array.from({ length: stampsTarget });

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* ImgBB Dynamic Banner Image if available */}
      {walletHeroImageUrl && (
        <div style={{ marginBottom: '1.25rem', textAlign: 'center' }}>
          <img
            src={walletHeroImageUrl}
            alt={`Banner de sellos: ${stampsCount} de ${stampsTarget}`}
            style={{
              width: '100%',
              maxHeight: '180px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)',
              border: '1px solid var(--card-border)'
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Grid Interactivo de 10 Sellos */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '0.75rem',
        padding: '1.25rem',
        background: 'rgba(15, 23, 42, 0.5)',
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--card-border)'
      }}>
        {stamps.map((_, index) => {
          const isStamped = index < stampsCount;
          return (
            <div
              key={index}
              style={{
                aspectRatio: '1/1',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: isStamped
                  ? 'linear-gradient(135deg, var(--secondary-color), var(--primary-color))'
                  : 'rgba(255, 255, 255, 0.05)',
                border: isStamped ? 'none' : '2px dashed var(--card-border)',
                boxShadow: isStamped ? '0 0 14px var(--secondary-color)' : 'none',
                transition: 'all 0.3s ease'
              }}
            >
              {isStamped ? (
                <Check size={22} color="#ffffff" strokeWidth={3} />
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '600' }}>
                  {index + 1}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div style={{ textAlign: 'center', marginTop: '0.75rem' }}>
        <Badge variant={stampsCount >= stampsTarget ? 'success' : 'primary'}>
          {stampsCount >= stampsTarget ? '¡TARJETA DE SELLOS COMPLETADA!' : `${stampsCount} DE ${stampsTarget} SELLOS ACUMULADOS`}
        </Badge>
      </div>
    </div>
  );
};
