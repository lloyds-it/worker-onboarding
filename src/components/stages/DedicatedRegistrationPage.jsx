import React from 'react';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Step1HR } from './Step1HR';
import { useWorkers } from '../../context/WorkerContext';

export const DedicatedRegistrationPage = ({ onBack }) => {
  const { registerWorkerHR } = useWorkers();

  const handleSave = (hrData) => {
    registerWorkerHR(hrData);
    onBack();
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
        borderBottom: '1px solid var(--border-light)'
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

      {/* Registration Form Component */}
      <div style={{ maxWidth: '980px', margin: '0 auto' }}>
        <Step1HR
          initialData={null}
          onSave={handleSave}
          isReadOnly={false}
        />
      </div>
    </div>
  );
};
