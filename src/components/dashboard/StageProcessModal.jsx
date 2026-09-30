import React, { useState } from 'react';
import { X, CheckCircle2, ShieldAlert, ArrowRight, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkers } from '../../context/WorkerContext';
import { STAGES, STAGE_META, ROLES, ROLE_LABELS } from '../../types/constants';
import { Step1HR } from '../stages/Step1HR';
import { Step2Medical } from '../stages/Step2Medical';
import { Step3Safety } from '../stages/Step3Safety';
import { Step4IT } from '../stages/Step4IT';
import { Step5Camp } from '../stages/Step5Camp';

export const StageProcessModal = ({ worker, onClose }) => {
  const { currentRole, canEditStage } = useAuth();
  const { 
    updateWorkerMedical, 
    updateWorkerSafety, 
    updateWorkerIT, 
    updateWorkerCamp 
  } = useWorkers();

  // Active viewing stage tab (defaults to worker's active stage, or stage 2 if flagged)
  const initialTab = worker.stage === STAGES.FLAGGED ? STAGES.MEDICAL : (worker.stage === STAGES.COMPLETED ? STAGES.CAMP : worker.stage);
  const [activeStageTab, setActiveStageTab] = useState(initialTab);

  if (!worker) return null;

  const isCurrentActiveStage = worker.stage === activeStageTab;
  const isAuthorizedToEdit = canEditStage(activeStageTab) && isCurrentActiveStage;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.2rem' }}>
              <span className={`badge badge-${STAGE_META[worker.stage]?.color || 'info'}`}>
                Active: {STAGE_META[worker.stage]?.label || 'Stage'}
              </span>
              <span style={{ fontSize: '0.75rem', fontFamily: 'var(--font-family-mono)', color: 'var(--text-muted)' }}>
                {worker.assignedWorkerId || worker.id}
              </span>
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Onboarding Dossier: {worker.hr?.fullName}
            </h3>
          </div>

          <button onClick={onClose} style={{ color: 'var(--text-muted)', padding: '0.35rem' }}>
            <X size={20} />
          </button>
        </div>

        {/* Stage Navigation Tabs inside Modal */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-surface-subtle)',
          padding: '0 1rem',
          overflowX: 'auto'
        }}>
          {[
            { id: STAGES.HR, label: '1. HR Profile' },
            { id: STAGES.MEDICAL, label: '2. Medical Exam' },
            { id: STAGES.SAFETY, label: '3. EHS Safety' },
            { id: STAGES.IT, label: '4. IT Biometrics' },
            { id: STAGES.CAMP, label: '5. Camp Housing' }
          ].map(tab => {
            const isTabActive = activeStageTab === tab.id;
            const isTabDone = worker.stage > tab.id || worker.stage === STAGES.COMPLETED;
            const isTabCurrent = worker.stage === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveStageTab(tab.id)}
                style={{
                  padding: '0.75rem 1rem',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: isTabActive ? 'var(--brand-primary)' : (isTabDone ? 'var(--success-solid)' : 'var(--text-muted)'),
                  borderBottom: isTabActive ? '2px solid var(--brand-primary)' : '2px solid transparent',
                  background: 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  whiteSpace: 'nowrap'
                }}
              >
                {isTabDone && <CheckCircle2 size={13} />}
                {isTabCurrent && <span style={{ color: 'var(--brand-primary)' }}>●</span>}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Permissions & Security Banner */}
        <div style={{
          padding: '0.65rem 1.75rem',
          backgroundColor: isAuthorizedToEdit ? 'var(--info-bg)' : 'var(--bg-surface-subtle)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.75rem'
        }}>
          <div>
            Logged in as: <strong>{ROLE_LABELS[currentRole]}</strong>
          </div>
          <div>
            {isAuthorizedToEdit ? (
              <span style={{ color: 'var(--info-solid)', fontWeight: 700 }}>
                ● Editing Authorized for Stage {activeStageTab}
              </span>
            ) : (
              <span style={{ color: 'var(--text-muted)' }}>
                {isCurrentActiveStage 
                  ? `(Locked: Log in as ${STAGE_META[activeStageTab]?.dept} or Admin to edit)`
                  : '(Read-Only Historical Record)'}
              </span>
            )}
          </div>
        </div>

        {/* Modal Body with Stage Components */}
        <div className="modal-body">
          {activeStageTab === STAGES.HR && (
            <Step1HR
              initialData={worker.hr}
              onSave={() => {}}
              isReadOnly={true}
            />
          )}

          {activeStageTab === STAGES.MEDICAL && (
            <Step2Medical
              initialData={worker.medical}
              onSave={(data) => {
                updateWorkerMedical(worker.id, data);
                onClose();
              }}
              isReadOnly={!isAuthorizedToEdit}
            />
          )}

          {activeStageTab === STAGES.SAFETY && (
            <Step3Safety
              initialData={worker.safety}
              onSave={(data) => {
                updateWorkerSafety(worker.id, data);
                onClose();
              }}
              isReadOnly={!isAuthorizedToEdit}
            />
          )}

          {activeStageTab === STAGES.IT && (
            <Step4IT
              initialData={worker.it}
              worker={worker}
              onSave={(data) => {
                updateWorkerIT(worker.id, data);
                onClose();
              }}
              isReadOnly={!isAuthorizedToEdit}
            />
          )}

          {activeStageTab === STAGES.CAMP && (
            <Step5Camp
              initialData={worker.camp}
              worker={worker}
              onSave={(data) => {
                updateWorkerCamp(worker.id, data);
                onClose();
              }}
              isReadOnly={!isAuthorizedToEdit}
            />
          )}
        </div>
      </div>
    </div>
  );
};
