import React from 'react';
import { Check } from 'lucide-react';
import { Badge } from '../../../shared/components/Badge';

export const DynamicStampCard = ({ stampsCount = 0, stampsTarget = 10, walletHeroImageUrl = '' }) => {
  const stamps = Array.from({ length: stampsTarget });

  return (
    <div style={{ marginTop: '1rem' }}>
      {/* ImgBB Dynamic Banner Image if available */}
      {walletHeroImageUrl && (
        <div style={{ marginBottom: '1rem', textAlign: 'center' }}>
          <img
            src={walletHeroImageUrl}
            alt={`Banner de sellos: ${stampsCount} de ${stampsTarget}`}
            style={{
              width: '100%',
              maxHeight: '180px',
              objectFit: 'cover',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-soft)',
              border: '1px solid var(--card-border)'
            }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>
      )}

      {/* Grid Interactivo de Sellos (Móvil First) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(5, 1fr)',
        gap: '0.6rem',
        padding: '1rem',
        backgroundColor: 'var(--input-bg)',
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
                backgroundColor: isStamped ? 'var(--primary-color)' : 'var(--card-bg)',
                border: isStamped ? 'none' : '2px dashed var(--input-border)',
                boxShadow: isStamped ? '0 4px 10px rgba(0,0,0,0.15)' : 'none',
                transition: 'all 0.25s ease'
              }}
            >
              {isStamped ? (
                <Check size={20} color="#ffffff" strokeWidth={3} />
              ) : (
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: '700' }}>
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
