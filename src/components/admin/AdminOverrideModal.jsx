import React, { useState } from 'react';
import { ShieldAlert, X, CheckCircle2 } from 'lucide-react';
import { STAGES, STAGE_META } from '../../types/constants';
import { useWorkers } from '../../context/WorkerContext';

export const AdminOverrideModal = ({ worker, onClose }) => {
  const { adminOverrideWorker } = useWorkers();
  const [targetStage, setTargetStage] = useState(worker.stage);
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  if (!worker) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError('A formal executive justification is required for stage override audits.');
      return;
    }
    adminOverrideWorker(worker.id, Number(targetStage), reason);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" style={{ maxWidth: '550px' }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <ShieldAlert size={22} color="var(--brand-primary)" />
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Admin Stage Override Authority</h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Target: {worker.hr?.fullName} ({worker.assignedWorkerId || worker.id})
              </span>
            </div>
          </div>
          <button onClick={onClose} style={{ color: 'var(--text-muted)' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div style={{
              padding: '0.85rem',
              backgroundColor: 'var(--warning-bg)',
              color: 'var(--warning-text)',
              border: '1px solid var(--warning-border)',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.8rem',
              marginBottom: '1.25rem'
            }}>
              <strong>Executive Caution:</strong> Manually changing a worker's pipeline stage will be permanently logged to the system audit trail with your admin credentials.
            </div>

            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <label>Current Status & Stage</label>
              <div style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                Stage {worker.stage}: {STAGE_META[worker.stage]?.label || 'Unknown'}
              </div>
            </div>

            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="override-target-stage">Target Override Stage</label>
              <select
                id="override-target-stage"
                className="form-select"
                value={targetStage}
                onChange={(e) => setTargetStage(e.target.value)}
              >
                <option value={STAGES.HR}>Step 1: HR Profile Registration</option>
                <option value={STAGES.MEDICAL}>Step 2: Medical Examination</option>
                <option value={STAGES.SAFETY}>Step 3: EHS Safety Induction</option>
                <option value={STAGES.IT}>Step 4: IT Biometrics & ID</option>
                <option value={STAGES.CAMP}>Step 5: Camp Accommodation</option>
                <option value={STAGES.COMPLETED}>Stage Completed & Gate Pass Active</option>
                <option value={STAGES.FLAGGED}>Medical Flagged / Unfit (Halt)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="override-reason">Audit Justification & Rationale <span className="required">*</span></label>
              <textarea
                id="override-reason"
                className="form-textarea"
                rows={3}
                placeholder="State the clinical, operational, or executive justification for this override..."
                value={reason}
                onChange={(e) => {
                  setReason(e.target.value);
                  if (error) setError('');
                }}
              />
              {error && <span className="error-text">{error}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>Apply Admin Override</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
