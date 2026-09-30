import React, { useState } from 'react';
import { Home, CheckCircle2, Building, ShieldCheck, KeyRound } from 'lucide-react';
import { CAMPS, BLOCKS } from '../../types/constants';

export const Step5Camp = ({ initialData, worker, onSave, isReadOnly }) => {
  const [formData, setFormData] = useState({
    campName: initialData?.campName || CAMPS[0],
    blockNumber: initialData?.blockNumber || BLOCKS[0],
    roomNumber: initialData?.roomNumber || 'A-104',
    bedNumber: initialData?.bedNumber || 'Bed 1',
    contractorSupervisor: initialData?.contractorSupervisor || 'Sunil Verma (Site Supervisor)',
    supervisorMobile: initialData?.supervisorMobile || '9822001144',
    allocatedBy: initialData?.allocatedBy || 'Mahesh Kulkarni (Camp Supv)',
    allocationDate: initialData?.allocationDate || new Date().toISOString().slice(0, 10)
  });

  const [errors, setErrors] = useState({});

  const handleChange = (field, val) => {
    if (isReadOnly) return;
    setFormData({ ...formData, [field]: val });
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    const errs = {};
    if (!formData.campName) errs.campName = 'Camp selection is required.';
    if (!formData.blockNumber) errs.blockNumber = 'Block selection is required.';
    if (!formData.roomNumber.trim()) errs.roomNumber = 'Room number is required.';
    if (!formData.bedNumber.trim()) errs.bedNumber = 'Bed number is required.';
    if (!formData.contractorSupervisor.trim()) errs.contractorSupervisor = 'Contractor Supervisor is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onSave({
      ...formData,
      gatePassActive: true
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-card" style={{ marginBottom: 0 }}>
      <div className="form-section-header">
        <h3>
          <Home size={20} color="var(--warning-solid)" />
          <span>Step 5: Camp Housing & Final Onboarding Activation</span>
        </h3>
        {isReadOnly && (
          <span className="badge badge-success">Onboarding Completed & Gate Pass Active</span>
        )}
      </div>

      {/* Accommodation Details */}
      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
        Worker Accommodation Allocation
      </h4>

      <div className="form-grid">
        {/* Camp Name */}
        <div className="form-group">
          <label htmlFor="camp-name">Camp Name <span className="required">*</span></label>
          <select
            id="camp-name"
            className="form-select"
            value={formData.campName}
            onChange={(e) => handleChange('campName', e.target.value)}
            disabled={isReadOnly}
          >
            {CAMPS.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          {errors.campName && <span className="error-text">{errors.campName}</span>}
        </div>

        {/* Block */}
        <div className="form-group">
          <label htmlFor="camp-block">Block Number / Wing <span className="required">*</span></label>
          <select
            id="camp-block"
            className="form-select"
            value={formData.blockNumber}
            onChange={(e) => handleChange('blockNumber', e.target.value)}
            disabled={isReadOnly}
          >
            {BLOCKS.map(b => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
          {errors.blockNumber && <span className="error-text">{errors.blockNumber}</span>}
        </div>

        {/* Room */}
        <div className="form-group">
          <label htmlFor="camp-room">Room Number <span className="required">*</span></label>
          <input
            id="camp-room"
            type="text"
            className={`form-input ${errors.roomNumber ? 'error' : ''}`}
            placeholder="e.g. A-102"
            value={formData.roomNumber}
            onChange={(e) => handleChange('roomNumber', e.target.value)}
            disabled={isReadOnly}
          />
          {errors.roomNumber && <span className="error-text">{errors.roomNumber}</span>}
        </div>

        {/* Bed */}
        <div className="form-group">
          <label htmlFor="camp-bed">Bed Number <span className="required">*</span></label>
          <select
            id="camp-bed"
            className="form-select"
            value={formData.bedNumber}
            onChange={(e) => handleChange('bedNumber', e.target.value)}
            disabled={isReadOnly}
          >
            <option value="Bed 1">Bed 1 (Lower Bunk)</option>
            <option value="Bed 2">Bed 2 (Upper Bunk)</option>
            <option value="Bed 3">Bed 3 (Lower Bunk)</option>
            <option value="Bed 4">Bed 4 (Upper Bunk)</option>
          </select>
          {errors.bedNumber && <span className="error-text">{errors.bedNumber}</span>}
        </div>
      </div>

      {/* Contractor Confirmation */}
      <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '1.75rem', marginBottom: '0.75rem' }}>
        Contractor / Agency Confirmation & Verification
      </h4>

      <div className="form-grid">
        <div className="form-group">
          <label htmlFor="contractor-supv">Contractor Supervisor Name <span className="required">*</span></label>
          <input
            id="contractor-supv"
            type="text"
            className={`form-input ${errors.contractorSupervisor ? 'error' : ''}`}
            value={formData.contractorSupervisor}
            onChange={(e) => handleChange('contractorSupervisor', e.target.value)}
            disabled={isReadOnly}
          />
          {errors.contractorSupervisor && <span className="error-text">{errors.contractorSupervisor}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="supv-mobile">Supervisor Mobile Number</label>
          <input
            id="supv-mobile"
            type="tel"
            maxLength={10}
            className="form-input"
            value={formData.supervisorMobile}
            onChange={(e) => handleChange('supervisorMobile', e.target.value.replace(/\D/g, ''))}
            disabled={isReadOnly}
          />
        </div>

        <div className="form-group">
          <label htmlFor="camp-allocator">Camp Allocation Officer</label>
          <input
            id="camp-allocator"
            type="text"
            className="form-input"
            value={formData.allocatedBy}
            onChange={(e) => handleChange('allocatedBy', e.target.value)}
            disabled={isReadOnly}
          />
        </div>
      </div>

      {/* Activation Banner */}
      <div style={{
        marginTop: '1.75rem',
        padding: '1.25rem',
        backgroundColor: 'var(--success-bg)',
        border: '1px solid var(--success-border)',
        borderRadius: 'var(--radius-md)',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem'
      }}>
        <KeyRound size={28} color="var(--success-solid)" />
        <div>
          <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--success-text)' }}>
            Turnstile Gate Pass & Biometric Access Activation
          </div>
          <div style={{ fontSize: '0.775rem', color: 'var(--success-text)', opacity: 0.9 }}>
            Submitting this final step issues active gate access for <strong>{worker?.hr?.fullName || 'Worker'}</strong> (ID: {worker?.assignedWorkerId || 'Pending'}).
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button id="btn-save-step5" type="submit" className="btn btn-primary">
            <span>Allocate Housing & Activate Gate Pass</span>
            <CheckCircle2 size={16} />
          </button>
        </div>
      )}
    </form>
  );
};
