import React, { useMemo } from 'react';
import { QrCode, Download, Printer } from 'lucide-react';
import { generateQrMatrix, buildWorkerQrPayload, generateQrSvgDataUrl } from '../../services/qrService';

export const WorkerQrCode = ({ worker, size = 148, showActions = false }) => {
  const payload = useMemo(() => buildWorkerQrPayload(worker), [worker]);
  const matrix = useMemo(() => generateQrMatrix(payload), [payload]);
  const quiet = 2;
  const total = matrix.length + quiet * 2;

  const handleDownload = () => {
    const dataUrl = generateQrSvgDataUrl(payload, 320);
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QR_${worker?.assignedWorkerId || worker?.id || 'worker'}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
      <div
        style={{
          padding: '0.5rem',
          backgroundColor: '#FFFFFF',
          border: '1px solid var(--border-medium, #CBD5E1)',
          borderRadius: '10px',
          boxShadow: 'var(--shadow-xs)',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        title={`Worker QR: ${worker?.assignedWorkerId || worker?.id || ''}`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox={`0 0 ${total} ${total}`}
          width={size}
          height={size}
          shapeRendering="crispEdges"
          role="img"
          aria-label={`QR Code for ${worker?.hr?.fullName || worker?.id || 'Worker'}`}
        >
          <rect width={total} height={total} fill="#FFFFFF" />
          {matrix.map((row, r) =>
            row.map((cell, c) =>
              cell ? (
                <rect
                  key={`${r}-${c}`}
                  x={c + quiet}
                  y={r + quiet}
                  width={1}
                  height={1}
                  fill="#0F172A"
                />
              ) : null
            )
          )}
        </svg>
      </div>

      <div style={{ textAlign: 'center', fontSize: '0.72rem', lineHeight: 1.35 }}>
        <div style={{ fontWeight: 800, fontFamily: 'var(--font-family-mono)', color: 'var(--brand-primary)' }}>
          {worker?.assignedWorkerId || worker?.id}
        </div>
        {worker?.hr?.fullName && (
          <div style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{worker.hr.fullName}</div>
        )}
      </div>

      {showActions && (
        <div style={{ display: 'flex', gap: '0.4rem' }}>
          <button type="button" className="btn btn-secondary" onClick={handleDownload} style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem' }}>
            <Download size={13} />
            <span>Download QR</span>
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => window.print()} style={{ padding: '0.3rem 0.65rem', fontSize: '0.74rem' }}>
            <Printer size={13} />
            <span>Print</span>
          </button>
        </div>
      )}
    </div>
  );
};
