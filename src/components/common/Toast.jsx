import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';

export const Toast = ({ toast }) => {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 size={18} className="toast-icon-success" />,
    danger: <AlertCircle size={18} className="toast-icon-danger" />,
    warning: <AlertTriangle size={18} className="toast-icon-warning" />,
    info: <Info size={18} className="toast-icon-info" />
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '1.5rem',
      right: '1.5rem',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '0.75rem',
      backgroundColor: '#0F172A',
      color: '#FFFFFF',
      padding: '0.85rem 1.25rem',
      borderRadius: '10px',
      boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
      fontSize: '0.875rem',
      fontWeight: 500,
      maxWidth: '420px',
      borderLeft: `4px solid ${toast.type === 'danger' ? '#EF4444' : (toast.type === 'info' ? '#3B82F6' : '#10B981')}`
    }}>
      {icons[toast.type] || icons.info}
      <span>{toast.message}</span>
    </div>
  );
};
