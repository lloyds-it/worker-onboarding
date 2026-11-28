import React, { useState } from 'react';
import { ArrowLeft, UserPlus, CheckCircle2, QrCode } from 'lucide-react';
import { Step1HR } from './Step1HR';
import { useWorkers } from '../../context/WorkerContext';
import { WorkerQrCode } from '../common/WorkerQrCode';

export const DedicatedRegistrationPage = ({ onBack }) => {
  const { registerWorkerHR } = useWorkers();
  const [registeredWorker, setRegisteredWorker] = useState(null);
  const [formResetKey, setFormResetKey] = useState(0);

  const handleSave = async (hrData) => {
    const saved = await registerWorkerHR(hrData);
    if (saved) {
      setRegisteredWorker(saved);
    }
  };

  return (
    <div>
      {/* Top Breadcrumb */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-light)',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.45rem 0.85rem' }}>
            <ArrowLeft size={16} />
            <span>Back to Candidate Pipeline</span>
          </button>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              Human Resources Department • Stage 1 Intake
            </div>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              New Worker Onboarding Registration
            </h2>
          </div>
        </div>

        <span className="badge badge-info" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
          Stage 1: HR Profile Creation
        </span>
      </div>

      {/* QR Confirmation Card upon Successful Registration */}
      {registeredWorker ? (
        <div style={{
          maxWidth: '640px',
          margin: '1.5rem auto',
          backgroundColor: 'var(--bg-surface)',
          border: '2px solid var(--success-solid, #059669)',
          borderRadius: 'var(--radius-lg)',
          padding: '2rem',
          textAlign: 'center',
          boxShadow: 'var(--shadow-md)'
        }}>
          <div style={{
            width: '54px',
            height: '54px',
            borderRadius: '50%',
            backgroundColor: 'var(--success-bg)',
            color: 'var(--success-solid)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem'
          }}>
            <CheckCircle2 size={28} />
          </div>

          <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
            Worker Registered &amp; Routed to Medical Team
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            QR Code generated for <strong>{registeredWorker.hr?.fullName}</strong> ({registeredWorker.assignedWorkerId || registeredWorker.id}).
          </p>

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: '1.25rem',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--border-light)',
            marginBottom: '1.5rem'
          }}>
            <WorkerQrCode worker={registeredWorker} size={180} showActions={true} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => {
                setRegisteredWorker(null);
                setFormResetKey(k => k + 1);
              }}
            >
              <UserPlus size={16} />
              <span>Register Another Worker</span>
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={onBack}
            >
              <QrCode size={16} />
              <span>Done &amp; Return to Pipeline</span>
            </button>
          </div>
        </div>
      ) : (
        <div style={{ maxWidth: '980px', margin: '0 auto' }}>
          <Step1HR
            key={formResetKey}
            initialData={null}
            onSave={handleSave}
            isReadOnly={false}
          />
        </div>
      )}
    </div>
  );
};
