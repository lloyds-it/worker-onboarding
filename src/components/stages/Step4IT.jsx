import React, { useState } from 'react';
import { Fingerprint, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';

export const Step4IT = ({ initialData, worker, onSave, isReadOnly }) => {
  const [faceBiometricRegistered, setFaceBiometricRegistered] = useState(
    initialData?.faceBiometricRegistered ?? true
  );
  const [cwmsRegistered, setCwmsRegistered] = useState(
    initialData?.cwmsRegistered ?? true
  );
  const [campusMasterUploaded, setCampusMasterUploaded] = useState(
    initialData?.campusMasterUploaded ?? true
  );
  const [itAdminSignature, setItAdminSignature] = useState(
    initialData?.itAdminSignature || 'Rajesh Sharma (Sr. IT Systems Admin)'
  );
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (!faceBiometricRegistered) {
      setError('Face biometric capture is mandatory for site turnstile punch system.');
      return;
    }
    if (!itAdminSignature.trim()) {
      setError('IT Admin signature/confirmation is required.');
      return;
    }

    onSave({
      faceBiometricRegistered,
      cwmsRegistered,
      campusMasterUploaded,
      undertakingAccepted: true,
      itAdminSignature,
      itDate: new Date().toISOString().slice(0, 10)
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-card" style={{ marginBottom: 0 }}>
      <div className="form-section-header">
        <h3>
          <Fingerprint size={20} color="var(--info-solid)" />
          <span>Step 4: IT Enrollment & Digital Master Registration</span>
        </h3>
        {isReadOnly && (
          <span className="badge badge-info">Completed by IT Specialist</span>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: 'var(--danger-bg)',
          color: 'var(--danger-text)',
          border: '1px solid var(--danger-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {error}
        </div>
      )}

      {/* Biometric Integration Controls */}
      <div style={{
        backgroundColor: 'var(--bg-surface-subtle)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-md)',
        padding: '1.25rem',
        marginBottom: '1.5rem'
      }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
          Digital Enrollment & Site Gate Access Master
        </h4>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
          {/* Face Biometric Punch Toggle */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem'
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              Face Punch Biometric Setup <span className="required">*</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Facial features registered on turnstile access gates.
            </div>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="faceBio"
                  checked={faceBiometricRegistered === true}
                  onChange={() => setFaceBiometricRegistered(true)}
                  disabled={isReadOnly}
                />
                <span style={{ fontWeight: 600, color: 'var(--success-solid)' }}>Registered (YES)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="faceBio"
                  checked={faceBiometricRegistered === false}
                  onChange={() => setFaceBiometricRegistered(false)}
                  disabled={isReadOnly}
                />
                <span style={{ fontWeight: 600, color: 'var(--danger-solid)' }}>Pending (NO)</span>
              </label>
            </div>
          </div>

          {/* CWMS Registration */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-medium)',
            borderRadius: 'var(--radius-sm)',
            padding: '1rem'
          }}>
            <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.25rem' }}>
              CWMS Master Sync
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
              Contract Worker Management System central DB sync.
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={cwmsRegistered}
                onChange={(e) => setCwmsRegistered(e.target.checked)}
                disabled={isReadOnly}
              />
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Synchronized with CWMS Database</span>
            </label>
          </div>
        </div>
      </div>

      {/* IT Admin Sign */}
      <div className="form-group">
        <label htmlFor="it-admin-sig">IT Specialist Confirmation & Signature <span className="required">*</span></label>
        <input
          id="it-admin-sig"
          type="text"
          className="form-input"
          value={itAdminSignature}
          onChange={(e) => setItAdminSignature(e.target.value)}
          disabled={isReadOnly}
        />
      </div>

      {!isReadOnly && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button id="btn-save-step4" type="submit" className="btn btn-primary">
            <span>Issue Worker ID & Route to Camp Accommodation</span>
            <CheckCircle2 size={16} />
          </button>
        </div>
      )}
    </form>
  );
};
