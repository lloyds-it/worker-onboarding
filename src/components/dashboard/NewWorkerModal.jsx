import React from 'react';
import { X, UserPlus } from 'lucide-react';
import { Step1HR } from '../stages/Step1HR';
import { useWorkers } from '../../context/WorkerContext';

export const NewWorkerModal = ({ onClose }) => {
  const { registerWorkerHR } = useWorkers();

  const handleSave = (hrData) => {
    registerWorkerHR(hrData);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <UserPlus size={22} color="var(--brand-primary)" />
            <div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Register New Candidate (HR Intake)</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Stage 1 of 5 • Standardized Lloyds Onboarding Pipeline
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <Step1HR
            initialData={null}
            onSave={handleSave}
            isReadOnly={false}
          />
        </div>
      </div>
    </div>
  );
};
