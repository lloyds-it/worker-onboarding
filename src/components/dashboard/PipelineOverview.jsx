import React from 'react';
import { UserPlus, Stethoscope, HardHat, Fingerprint, Home, CheckCircle2, AlertOctagon } from 'lucide-react';
import { STAGES } from '../../types/constants';
import { useWorkers } from '../../context/WorkerContext';

export const PipelineOverview = () => {
  const { workers, selectedStageFilter, setSelectedStageFilter } = useWorkers();

  const counts = {
    hr: workers.filter(w => w.stage === STAGES.HR).length,
    medical: workers.filter(w => w.stage === STAGES.MEDICAL).length,
    safety: workers.filter(w => w.stage === STAGES.SAFETY).length,
    it: workers.filter(w => w.stage === STAGES.IT).length,
    camp: workers.filter(w => w.stage === STAGES.CAMP).length,
    completed: workers.filter(w => w.stage === STAGES.COMPLETED).length,
    flagged: workers.filter(w => w.stage === STAGES.FLAGGED).length,
  };

  const steps = [
    {
      id: STAGES.HR,
      title: '1. HR Profile',
      sub: 'Basic & Contractor',
      icon: <UserPlus size={18} />,
      count: counts.hr,
      color: '#3B82F6'
    },
    {
      id: STAGES.MEDICAL,
      title: '2. Medical Exam',
      sub: 'Vitals & Fit/Unfit',
      icon: <Stethoscope size={18} />,
      count: counts.medical,
      color: '#F59E0B'
    },
    {
      id: STAGES.SAFETY,
      title: '3. EHS Induction',
      sub: 'Briefing & PPE Kit',
      icon: <HardHat size={18} />,
      count: counts.safety,
      color: '#8B5CF6'
    },
    {
      id: STAGES.IT,
      title: '4. IT Biometrics',
      sub: 'Face Punch & ID',
      icon: <Fingerprint size={18} />,
      count: counts.it,
      color: '#0EA5E9'
    },
    {
      id: STAGES.CAMP,
      title: '5. Camp Housing',
      sub: 'Gondwana Bed Alloc',
      icon: <Home size={18} />,
      count: counts.camp,
      color: '#D97706'
    },
    {
      id: STAGES.COMPLETED,
      title: 'Completed',
      sub: 'Gate Pass Active',
      icon: <CheckCircle2 size={18} />,
      count: counts.completed,
      color: '#10B981'
    }
  ];

  return (
    <div style={{ marginBottom: '1.75rem' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '0.75rem'
      }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          5-Stage Sequential Pipeline Tracker
        </h3>
        <button
          style={{
            fontSize: '0.775rem',
            fontWeight: 600,
            color: selectedStageFilter === 'ALL' ? 'var(--brand-primary)' : 'var(--text-muted)'
          }}
          onClick={() => setSelectedStageFilter('ALL')}
        >
          {selectedStageFilter === 'ALL' ? '● Showing All Stages' : 'Reset Stage Filter'}
        </button>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '0.75rem'
      }}>
        {steps.map((step) => {
          const isSelected = selectedStageFilter === step.id;
          return (
            <div
              key={step.id}
              onClick={() => setSelectedStageFilter(isSelected ? 'ALL' : step.id)}
              style={{
                backgroundColor: 'var(--bg-surface)',
                border: isSelected ? `2px solid ${step.color}` : '1px solid var(--border-light)',
                borderRadius: 'var(--radius-md)',
                padding: '0.9rem 1rem',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.4rem',
                boxShadow: isSelected ? 'var(--shadow-md)' : 'var(--shadow-xs)',
                transition: 'all var(--transition-fast)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ color: step.color }}>{step.icon}</span>
                <span style={{
                  fontSize: '1.25rem',
                  fontWeight: 800,
                  color: isSelected ? step.color : 'var(--text-primary)'
                }}>
                  {step.count}
                </span>
              </div>
              <div>
                <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  {step.title}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                  {step.sub}
                </div>
              </div>
            </div>
          );
        })}

        {/* Flagged Item Card */}
        <div
          onClick={() => setSelectedStageFilter(selectedStageFilter === STAGES.FLAGGED ? 'ALL' : STAGES.FLAGGED)}
          style={{
            backgroundColor: counts.flagged > 0 ? 'var(--danger-bg)' : 'var(--bg-surface)',
            border: selectedStageFilter === STAGES.FLAGGED ? '2px solid var(--danger-solid)' : '1px solid var(--danger-border)',
            borderRadius: 'var(--radius-md)',
            padding: '0.9rem 1rem',
            cursor: 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.4rem',
            boxShadow: selectedStageFilter === STAGES.FLAGGED ? 'var(--shadow-md)' : 'var(--shadow-xs)',
            transition: 'all var(--transition-fast)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <AlertOctagon size={18} color="var(--danger-solid)" />
            <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger-solid)' }}>
              {counts.flagged}
            </span>
          </div>
          <div>
            <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--danger-text)' }}>
              Medical Flagged
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--danger-text)' }}>
              Halted / Unfit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
