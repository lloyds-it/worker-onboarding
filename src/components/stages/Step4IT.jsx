import React, { useState, useRef, useEffect } from 'react';
import { Fingerprint, CheckCircle2, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkers } from '../../context/WorkerContext';
import { WorkerPhotoUpload } from '../common/WorkerPhotoUpload';

export const Step4IT = ({ initialData, worker, onSave, isReadOnly }) => {
  const { currentUser } = useAuth();
  const { updateWorkerPhoto } = useWorkers();
  const loggedInIT = currentUser?.name
    ? `${currentUser.name}${currentUser.designation ? ` (${currentUser.designation})` : ''}`
    : '';

  const hasSubmittedIT = Boolean(initialData?.itAdminSignature || initialData?.itDate);

  const [faceBiometricRegistered, setFaceBiometricRegistered] = useState(
    hasSubmittedIT ? (initialData?.faceBiometricRegistered ?? true) : true
  );
  const [cwmsRegistered, setCwmsRegistered] = useState(
    hasSubmittedIT ? (initialData?.cwmsRegistered ?? true) : true
  );
  const [campusMasterUploaded, setCampusMasterUploaded] = useState(
    hasSubmittedIT ? (initialData?.campusMasterUploaded ?? true) : true
  );
  const [itAdminSignature, setItAdminSignature] = useState(
    initialData?.itAdminSignature || loggedInIT
  );
  const [error, setError] = useState(null);
  const isDirtyRef = useRef(false);
  const lastInitialJsonRef = useRef(JSON.stringify(initialData || null));

  useEffect(() => {
    const serialized = JSON.stringify(initialData || null);
    if (serialized === lastInitialJsonRef.current) return;
    lastInitialJsonRef.current = serialized;
    if (isDirtyRef.current) return;
    if (initialData && (initialData.itAdminSignature || initialData.itDate)) {
      setFaceBiometricRegistered(initialData.faceBiometricRegistered ?? true);
      setCwmsRegistered(initialData.cwmsRegistered ?? true);
      setCampusMasterUploaded(initialData.campusMasterUploaded ?? true);
      setItAdminSignature(initialData.itAdminSignature || loggedInIT);
      setError(null);
    }
  }, [initialData, loggedInIT]);

  useEffect(() => {
    if (!initialData?.itAdminSignature && loggedInIT && !isDirtyRef.current) {
      setItAdminSignature(prev => prev || loggedInIT);
    }
  }, [loggedInIT, initialData]);

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

    isDirtyRef.current = false;
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            Digital Enrollment & Site Gate Access Master
          </h4>
          <span style={{
            fontFamily: 'var(--font-family-mono)',
            fontSize: '0.8rem',
            fontWeight: 800,
            padding: '0.25rem 0.65rem',
            borderRadius: '6px',
            backgroundColor: 'rgba(37, 99, 235, 0.1)',
            color: '#2563EB',
            border: '1px solid rgba(37, 99, 235, 0.25)'
          }}>
            Employee ID: {worker?.assignedWorkerId || 'Pending'}
          </span>
        </div>

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
                  onChange={() => {
                    isDirtyRef.current = true;
                    setFaceBiometricRegistered(true);
                  }}
                  disabled={isReadOnly}
                />
                <span style={{ fontWeight: 600, color: 'var(--success-solid)' }}>Registered (YES)</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="faceBio"
                  checked={faceBiometricRegistered === false}
                  onChange={() => {
                    isDirtyRef.current = true;
                    setFaceBiometricRegistered(false);
                  }}
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
                onChange={(e) => {
                  isDirtyRef.current = true;
                  setCwmsRegistered(e.target.checked);
                }}
                disabled={isReadOnly}
              />
              <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>Synchronized with CWMS Database</span>
            </label>
          </div>
        </div>
      </div>

      {/* Biometric Photograph Upload / Overwrite HR Photo */}
      <div style={{ marginBottom: '1.25rem' }}>
        <WorkerPhotoUpload
          photo={worker?.hr?.photo || ''}
          onChange={(photoDataUrl) => {
            if (worker?.id && updateWorkerPhoto) {
              updateWorkerPhoto(worker.id, photoDataUrl);
            }
          }}
          isReadOnly={isReadOnly}
          label="Biometric / Gate Pass Portrait Photograph (Upload here overwrites HR photo)"
        />
      </div>

      {/* IT Admin Sign */}
      <div className="form-group">
        <label htmlFor="it-admin-sig">IT Specialist Confirmation & Signature <span className="required">*</span></label>
        <input
          id="it-admin-sig"
          type="text"
          className="form-input"
          value={itAdminSignature}
          onChange={(e) => {
            isDirtyRef.current = true;
            setItAdminSignature(e.target.value);
          }}
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
