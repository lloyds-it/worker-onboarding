import React, { useState, useRef, useEffect } from 'react';
import { Home, CheckCircle2, Building, ShieldCheck, KeyRound } from 'lucide-react';
import { CAMPS, BLOCKS } from '../../types/constants';
import { useAuth } from '../../context/AuthContext';

export const Step5Camp = ({ initialData, worker, onSave, isReadOnly }) => {
  const { currentUser } = useAuth();
  const loggedInCampOfficer = currentUser?.name
    ? `${currentUser.name}${currentUser.designation ? ` (${currentUser.designation})` : ''}`
    : '';

  const buildInitialCamp = (data, officer) => ({
    campName: data?.campName || CAMPS[0],
    blockNumber: data?.blockNumber || BLOCKS[0],
    roomNumber: data?.roomNumber || 'A-104',
    bedNumber: data?.bedNumber || 'Bed 1',
    contractorSupervisor: data?.contractorSupervisor || '',
    supervisorMobile: data?.supervisorMobile || '',
    allocatedBy: data?.allocatedBy || officer,
    allocationDate: data?.allocationDate || new Date().toISOString().slice(0, 10)
  });

  const [formData, setFormData] = useState(() => buildInitialCamp(initialData, loggedInCampOfficer));
  const [errors, setErrors] = useState({});
  const isDirtyRef = useRef(false);
  const lastInitialJsonRef = useRef(JSON.stringify(initialData || null));

  useEffect(() => {
    const serialized = JSON.stringify(initialData || null);
    if (serialized === lastInitialJsonRef.current) return;
    lastInitialJsonRef.current = serialized;
    if (isDirtyRef.current) return;
    if (initialData) {
      setFormData(buildInitialCamp(initialData, loggedInCampOfficer));
      setErrors({});
    }
  }, [initialData, loggedInCampOfficer]);

  useEffect(() => {
    if (!initialData?.allocatedBy && loggedInCampOfficer && !isDirtyRef.current) {
      setFormData(prev => (prev.allocatedBy ? prev : { ...prev, allocatedBy: loggedInCampOfficer }));
    }
  }, [loggedInCampOfficer, initialData]);

  const handleChange = (field, val) => {
    if (isReadOnly) return;
    isDirtyRef.current = true;
    setFormData(prev => ({ ...prev, [field]: val }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    const errs = {};
    if (!formData.campName) errs.campName = 'Camp selection is required.';
    if (!formData.roomNumber?.trim()) errs.roomNumber = 'Room number is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    isDirtyRef.current = false;
    onSave({
      ...formData,
      blockNumber: formData.blockNumber || BLOCKS[0],
      bedNumber: formData.bedNumber || 'Bed 1',
      contractorSupervisor: formData.contractorSupervisor || '',
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

      {Object.keys(errors).length > 0 && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid var(--danger-solid, #EF4444)',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem'
        }}>
          <div style={{ fontWeight: 700, color: 'var(--danger-solid, #EF4444)', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
            Please correct the following accommodation field(s):
          </div>
          <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            {Object.entries(errors).map(([field, msg]) => (
              <li key={field} style={{ marginBottom: '2px' }}>{msg}</li>
            ))}
          </ul>
        </div>
      )}

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
