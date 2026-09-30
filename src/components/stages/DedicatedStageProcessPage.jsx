import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  User, 
  ShieldAlert, 
  CheckCircle2, 
  Clock, 
  Stethoscope, 
  HardHat, 
  Fingerprint, 
  Home, 
  ChevronRight,
  UserPlus
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkers } from '../../context/WorkerContext';
import { STAGES, STAGE_META, ROLES, ROLE_LABELS } from '../../types/constants';
import { Step1HR } from './Step1HR';
import { Step2Medical } from './Step2Medical';
import { Step3Safety } from './Step3Safety';
import { Step4IT } from './Step4IT';
import { Step5Camp } from './Step5Camp';

export const DedicatedStageProcessPage = ({ worker: propWorker, onSelectWorker, onBack }) => {
  const { currentRole, canEditStage } = useAuth();
  const { 
    workers = [], 
    updateWorkerHR, 
    updateWorkerMedical, 
    updateWorkerSafety, 
    updateWorkerIT, 
    updateWorkerCamp 
  } = useWorkers();

  // Resilient worker resolution - never allow a null/blank page if workers exist
  const worker = propWorker || (workers.length > 0 ? workers[0] : null);

  // Active stage tab (1 = HR, 2 = Medical, 3 = Safety, 4 = IT, 5 = Camp)
  const [selectedStageTab, setSelectedStageTab] = useState(() => {
    if (!worker) return STAGES.HR;
    return worker.stage === STAGES.FLAGGED 
      ? STAGES.MEDICAL 
      : (worker.stage === STAGES.COMPLETED ? STAGES.CAMP : (worker.stage || STAGES.HR));
  });

  // Keep stage tab updated when candidate changes
  useEffect(() => {
    if (worker) {
      setSelectedStageTab(
        worker.stage === STAGES.FLAGGED 
          ? STAGES.MEDICAL 
          : (worker.stage === STAGES.COMPLETED ? STAGES.CAMP : (worker.stage || STAGES.HR))
      );
    }
  }, [worker?.id]);

  // Fallback: If no workers exist in the system at all
  if (!worker) {
    return (
      <div style={{
        maxWidth: '600px',
        margin: '3rem auto',
        padding: '2.5rem',
        textAlign: 'center',
        backgroundColor: 'var(--bg-surface, #FFFFFF)',
        borderRadius: '14px',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-sm)'
      }}>
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          backgroundColor: '#EFF6FF',
          color: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}>
          <User size={28} />
        </div>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
          No Candidate Profile Available
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          There are currently no candidates registered in the onboarding pipeline. Please register a new candidate to begin processing.
        </p>
        <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Return to Roster</span>
          </button>
          <button 
            className="btn btn-primary" 
            onClick={() => { window.location.hash = '#register'; }}
          >
            <UserPlus size={16} />
            <span>+ Register New Candidate</span>
          </button>
        </div>
      </div>
    );
  }

  const isAuthorized = canEditStage(selectedStageTab);

  const STAGE_TABS = [
    { stage: STAGES.HR, label: 'Step 1: HR Profile', icon: <User size={15} /> },
    { stage: STAGES.MEDICAL, label: 'Step 2: Medical Exam', icon: <Stethoscope size={15} /> },
    { stage: STAGES.SAFETY, label: 'Step 3: EHS Safety', icon: <HardHat size={15} /> },
    { stage: STAGES.IT, label: 'Step 4: IT Biometrics', icon: <Fingerprint size={15} /> },
    { stage: STAGES.CAMP, label: 'Step 5: Camp Housing', icon: <Home size={15} /> }
  ];

  return (
    <div>
      {/* Top Breadcrumb & Candidate Switcher Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-light)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.45rem 0.85rem' }}>
            <ArrowLeft size={16} />
            <span>Back to Queue</span>
          </button>
          <div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', fontWeight: 700 }}>
              {ROLE_LABELS[currentRole]} • Dedicated Processing Workspace
            </div>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, color: 'var(--text-primary)', lineHeight: 1.2, margin: 0 }}>
              Processing: {worker.hr?.fullName || 'Candidate'}
            </h2>
          </div>
        </div>

        {/* Quick Candidate Switcher Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {workers.length > 1 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 600 }}>Switch Worker:</span>
              <select
                id="select-active-worker"
                value={worker.id}
                onChange={(e) => {
                  const match = workers.find(w => w.id === e.target.value);
                  if (match && onSelectWorker) {
                    onSelectWorker(match);
                  }
                }}
                className="form-select"
                style={{
                  fontSize: '0.8rem',
                  padding: '0.35rem 0.65rem',
                  maxWidth: '260px',
                  fontWeight: 600
                }}
              >
                {workers.map(w => (
                  <option key={w.id} value={w.id}>
                    {w.assignedWorkerId || w.id} — {w.hr?.fullName} (Stage {w.stage})
                  </option>
                ))}
              </select>
            </div>
          )}

          <span className={`badge badge-${STAGE_META[worker.stage]?.color || 'info'}`} style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
            Stage {worker.stage}: {STAGE_META[worker.stage]?.label}
          </span>
          <span style={{
            fontFamily: 'var(--font-family-mono)',
            fontSize: '0.85rem',
            fontWeight: 800,
            padding: '0.35rem 0.65rem',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-medium)'
          }}>
            {worker.assignedWorkerId || worker.id}
          </span>
        </div>
      </div>

      {/* Main Process Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 320px) 1fr',
        gap: '1.5rem',
        alignItems: 'start'
      }}>
        {/* Left Column: Candidate Summary Card */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)',
          position: 'sticky',
          top: '90px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.25rem' }}>
            <div style={{
              width: '54px',
              height: '58px',
              borderRadius: '6px',
              border: '1.5px solid var(--border-medium)',
              backgroundColor: '#FFFFFF',
              overflow: 'hidden',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.35rem',
              color: 'var(--brand-primary)',
              boxShadow: '0 2px 5px rgba(0,0,0,0.1)'
            }}>
              {worker.hr?.photo ? (
                <img src={worker.hr.photo} alt={worker.hr?.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                worker.hr?.fullName?.charAt(0) || 'W'
              )}
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                {worker.hr?.fullName}
              </h3>
              <span className="badge badge-purple" style={{ marginTop: '0.25rem', display: 'inline-block' }}>
                {worker.hr?.trade || 'General Worker'}
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.8rem', borderTop: '1px solid var(--border-light)', paddingTop: '1rem' }}>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Father/Husband:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{worker.hr?.fatherHusbandName || '—'}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Age &amp; Gender:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{worker.hr?.age} yrs • {worker.hr?.gender === 'M' ? 'Male' : (worker.hr?.gender === 'F' ? 'Female' : 'Other')}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Contractor / Agency:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{worker.hr?.contractorName}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Contact Mobile:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>📱 {worker.hr?.mobileNumber}</div>
            </div>
            <div>
              <span style={{ color: 'var(--text-muted)' }}>Emergency Contact:</span>
              <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                {worker.hr?.emergencyPerson} ({worker.hr?.emergencyRelationship}) • {worker.hr?.emergencyMobile}
              </div>
            </div>
          </div>

          {/* Department Authorization Indicator */}
          <div style={{
            marginTop: '1.25rem',
            padding: '0.75rem',
            borderRadius: 'var(--radius-sm)',
            backgroundColor: isAuthorized ? 'var(--info-bg)' : 'var(--warning-bg)',
            border: `1px solid ${isAuthorized ? 'var(--info-border)' : 'var(--warning-border)'}`,
            fontSize: '0.75rem'
          }}>
            <div style={{ fontWeight: 700, color: isAuthorized ? 'var(--info-text)' : 'var(--warning-text)', marginBottom: '0.2rem' }}>
              {isAuthorized ? '● Active Processing Authority' : '⚠ Read-Only Audit Record'}
            </div>
            <div style={{ color: isAuthorized ? 'var(--info-text)' : 'var(--warning-text)' }}>
              {isAuthorized 
                ? `You have authority to record or modify Step ${selectedStageTab} as ${ROLE_LABELS[currentRole]}.`
                : `Logged in as ${ROLE_LABELS[currentRole]}. Only assigned department or Admin can modify.`}
            </div>
          </div>
        </div>

        {/* Right Column: Stage Tabs + Dedicated Processing Form */}
        <div>
          {/* Stage Selection Navigation Tabs */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            marginBottom: '1rem',
            backgroundColor: 'var(--bg-surface-subtle, #F8FAFC)',
            padding: '0.35rem',
            borderRadius: '10px',
            border: '1px solid var(--border-light, #E2E8F0)',
            overflowX: 'auto'
          }}>
            {STAGE_TABS.map(tab => {
              const isCurrentPipelineStage = worker.stage === tab.stage;
              const isSelected = selectedStageTab === tab.stage;
              const isPastStage = worker.stage > tab.stage || worker.stage === STAGES.COMPLETED;

              return (
                <button
                  key={tab.stage}
                  type="button"
                  onClick={() => setSelectedStageTab(tab.stage)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '8px',
                    border: isSelected ? '1px solid var(--brand-primary, #E82329)' : '1px solid transparent',
                    backgroundColor: isSelected ? 'var(--bg-surface, #FFFFFF)' : 'transparent',
                    color: isSelected ? 'var(--brand-primary, #E82329)' : 'var(--text-secondary, #64748B)',
                    fontWeight: isSelected ? 800 : 600,
                    fontSize: '0.78rem',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    boxShadow: isSelected ? '0 1px 3px rgba(0,0,0,0.08)' : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                  {isPastStage && (
                    <CheckCircle2 size={13} color="var(--success-solid, #10B981)" style={{ marginLeft: '2px' }} />
                  )}
                  {isCurrentPipelineStage && (
                    <span style={{
                      fontSize: '0.62rem',
                      fontWeight: 800,
                      backgroundColor: 'var(--brand-primary, #E82329)',
                      color: '#FFFFFF',
                      padding: '0.1rem 0.35rem',
                      borderRadius: '8px',
                      marginLeft: '2px'
                    }}>
                      QUEUE
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* STEP 1: HR PROFILE */}
          {selectedStageTab === STAGES.HR && (
            <Step1HR
              key={worker.id}
              initialData={worker.hr}
              onSave={(hrData) => {
                if (updateWorkerHR) updateWorkerHR(worker.id, hrData);
              }}
              isReadOnly={!canEditStage(STAGES.HR)}
            />
          )}

          {/* STEP 2: MEDICAL FITNESS */}
          {selectedStageTab === STAGES.MEDICAL && (
            <Step2Medical
              key={worker.id}
              initialData={worker.medical}
              onSave={(data) => {
                updateWorkerMedical(worker.id, data);
              }}
              isReadOnly={!canEditStage(STAGES.MEDICAL)}
            />
          )}

          {/* STEP 3: EHS SAFETY INDUCTION */}
          {selectedStageTab === STAGES.SAFETY && (
            <Step3Safety
              key={worker.id}
              initialData={worker.safety}
              onSave={(data) => {
                updateWorkerSafety(worker.id, data);
              }}
              isReadOnly={!canEditStage(STAGES.SAFETY)}
            />
          )}

          {/* STEP 4: IT BIOMETRICS */}
          {selectedStageTab === STAGES.IT && (
            <Step4IT
              key={worker.id}
              initialData={worker.it}
              worker={worker}
              onSave={(data) => {
                updateWorkerIT(worker.id, data);
              }}
              isReadOnly={!canEditStage(STAGES.IT)}
            />
          )}

          {/* STEP 5: CAMP HOUSING & GATE PASS */}
          {selectedStageTab === STAGES.CAMP && (
            <Step5Camp
              key={worker.id}
              initialData={worker.camp}
              worker={worker}
              onSave={(data) => {
                updateWorkerCamp(worker.id, data);
              }}
              isReadOnly={!canEditStage(STAGES.CAMP)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default DedicatedStageProcessPage;
