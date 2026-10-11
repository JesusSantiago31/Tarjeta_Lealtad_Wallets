import React, { useState, useEffect, useRef } from 'react';
import { Modal } from '../../../shared/components/Modal';
import { Input } from '../../../shared/components/Input';
import { Button } from '../../../shared/components/Button';
import { Scan, QrCode, Camera, AlertCircle } from 'lucide-react';
import jsQR from 'jsqr';

export const QrScannerModal = ({ isOpen, onClose, onScanSuccess }) => {
  const [query, setQuery] = useState('');
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const scanIntervalRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [isOpen]);

  const startCamera = async () => {
    setCameraError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Tu navegador no soporta acceso directo a la cámara.');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        startScanningLoop();
      }
    } catch (err) {
      console.warn('No se pudo acceder a la cámara:', err);
      setCameraError('No se pudo abrir la cámara (permiso denegado o no disponible).');
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  const startScanningLoop = () => {
    if (scanIntervalRef.current) clearInterval(scanIntervalRef.current);
    scanIntervalRef.current = setInterval(() => {
      if (!videoRef.current || !canvasRef.current || videoRef.current.readyState !== videoRef.current.HAVE_ENOUGH_DATA) {
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert'
      });

      if (code && code.data) {
        stopCamera();
        onScanSuccess(code.data);
        onClose();
      }
    }, 250);
  };

  const handleManualSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      stopCamera();
      onScanSuccess(query.trim());
      onClose();
    }
  };

  const handleSimulatedScan = () => {
    stopCamera();
    onScanSuccess('QR-5512345678');
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Cámara en Vivo - Escaneo QR">
      <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
        {/* Visor de cámara en vivo */}
        <div style={{
          width: '260px',
          height: '260px',
          margin: '0 auto 1.25rem auto',
          borderRadius: '16px',
          border: '3px solid var(--primary-color)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#000000',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <video
            ref={videoRef}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              display: cameraActive ? 'block' : 'none'
            }}
          />
          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {!cameraActive && (
            <div style={{ padding: '1rem', color: '#ffffff', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <QrCode size={64} color="var(--primary-color)" />
              <p style={{ fontSize: '0.8rem', marginTop: '0.75rem', opacity: 0.85 }}>
                {cameraError || 'Iniciando cámara...'}
              </p>
            </div>
          )}

          {cameraActive && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '3px',
              background: '#22c55e',
              boxShadow: '0 0 12px #22c55e',
              animation: 'pulseGlow 2s infinite ease-in-out'
            }} />
          )}
        </div>

        <div style={{ marginBottom: '1.25rem' }}>
          <button
            type="button"
            onClick={handleSimulatedScan}
            className="btn-tenant-secondary"
            style={{ width: '100%', fontSize: '0.85rem', gap: '0.5rem', borderRadius: '12px', padding: '0.75rem' }}
          >
            <Camera size={16} /> Probar con QR Demo (QR-5512345678)
          </button>
        </div>

        <form onSubmit={handleManualSearch}>
          <Input
            label="O escribe Celular / Código de Tarjeta"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ej: 5512345678"
          />
          <Button type="submit" style={{ width: '100%', marginTop: '0.5rem', borderRadius: '12px' }}>
            <Scan size={18} /> Buscar Cliente
          </Button>
        </form>
      </div>
    </Modal>
  );
};
