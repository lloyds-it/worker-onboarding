import React, { useState, useEffect } from 'react';
import {
  FileText,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Home,
  ShieldAlert,
  ArrowRight,
  Printer,
  Stethoscope,
  HardHat,
  Fingerprint,
  UserCheck,
  CreditCard,
  Camera,
  Phone,
  Search,
  RotateCcw,
  QrCode,
  Pencil,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkers } from '../../context/WorkerContext';
import { STAGES, STAGE_META, ROLES } from '../../types/constants';
import { formatTimestamp, formatDuration, getMedicalFitnessMeta } from '../../services/validationService';
import { WorkerQrCode } from '../common/WorkerQrCode';

export const WorkerTable = ({ onOpenProcessModal, onViewInductionDoc, onGenerateIdCard, onOpenAdminOverride }) => {
  const { currentRole } = useAuth();
  const { workers, searchQuery, setSearchQuery, selectedStageFilter } = useWorkers();
  const [stageQueueTab, setStageQueueTab] = useState('ALL');
  const [searchInput, setSearchInput] = useState(searchQuery || '');
  const [qrModalWorker, setQrModalWorker] = useState(null);

  useEffect(() => {
    setSearchInput(searchQuery || '');
  }, [searchQuery]);

  // Helper to identify whether the logged-in department has completed its own stage for a worker
  const isStageCompletedForRole = (w, role) => {
    if (role === ROLES.HR) return w.stage !== STAGES.HR;
    if (role === ROLES.MEDICAL) return Boolean(w.medical?.fitnessStatus);
    if (role === ROLES.SAFETY) return Boolean(w.safety?.briefingDone);
    if (role === ROLES.IT) return Boolean(w.it?.faceBiometricRegistered || w.it?.itAdminSignature);
    if (role === ROLES.CAMP) return w.stage === STAGES.COMPLETED || Boolean(w.camp?.campName);
    return w.stage === STAGES.COMPLETED;
  };

  // Helper to determine if current department has an active pending action on this worker
  const canProcessWorker = (worker) => {
    if (currentRole === ROLES.ADMIN) return worker.stage !== STAGES.COMPLETED;
    if (currentRole === ROLES.HR) return worker.stage === STAGES.HR;
    if (currentRole === ROLES.MEDICAL) return worker.stage === STAGES.MEDICAL;
    if (currentRole === ROLES.SAFETY) return worker.stage === STAGES.SAFETY;
    if (currentRole === ROLES.IT) return worker.stage === STAGES.IT;
    if (currentRole === ROLES.CAMP) return worker.stage === STAGES.CAMP;
    return false;
  };

  // 1. Strict Department Data Scoping (Each department sees pending + completed workers they handled)
  const scopedWorkers = workers.filter(w => {
    if (currentRole === ROLES.ADMIN) return true; // Admin sees all
    if (currentRole === ROLES.HR) {
      // HR sees workers in HR intake and all workers they registered
      return true;
    }
    if (currentRole === ROLES.MEDICAL) {
      // Medical sees workers waiting for Medical (Stage 2) or evaluated by Medical
      return w.stage === STAGES.MEDICAL || w.stage === STAGES.FLAGGED || Boolean(w.medical?.fitnessStatus);
    }
    if (currentRole === ROLES.SAFETY) {
      // Safety sees workers certified FIT by Medical and currently in Safety or briefed
      return w.stage === STAGES.SAFETY || Boolean(w.safety?.briefingDone);
    }
    if (currentRole === ROLES.IT) {
      // IT sees workers who passed Safety and need IT biometrics or are enrolled
      return w.stage === STAGES.IT || Boolean(w.it?.faceBiometricRegistered || w.it?.itAdminSignature);
    }
    if (currentRole === ROLES.CAMP) {
      // Camp sees workers who completed IT and need housing, or completed workers
      return w.stage === STAGES.CAMP || w.stage === STAGES.COMPLETED || Boolean(w.camp?.campName);
    }
    return false;
  });

  const pendingCount = scopedWorkers.filter(w => canProcessWorker(w)).length;
  const completedByStageCount = scopedWorkers.filter(w => isStageCompletedForRole(w, currentRole)).length;

  // 2. Filter by queue tab / Admin stage filter and search query (Name, Emp ID, Aadhaar, Contractor, Trade, Mobile)
  const filteredWorkers = scopedWorkers.filter(w => {
    if (currentRole === ROLES.ADMIN) {
      if (selectedStageFilter !== 'ALL' && w.stage !== selectedStageFilter) return false;
    } else {
      if (stageQueueTab === 'PENDING' && !canProcessWorker(w)) return false;
      if (stageQueueTab === 'COMPLETED' && !isStageCompletedForRole(w, currentRole)) return false;
    }

    const activeQuery = (searchQuery || searchInput).trim();
    if (activeQuery) {
      const q = activeQuery.toLowerCase();
      const qCompact = q.replace(/\s+/g, '');
      const matchName = w.hr?.fullName?.toLowerCase().includes(q);
      const matchId = w.assignedWorkerId?.toLowerCase().includes(q) || w.id?.toLowerCase().includes(q);
      const matchAadhaar = qCompact
        ? String(w.hr?.idProofRef || '').toLowerCase().replace(/\s+/g, '').includes(qCompact)
        : false;
      const matchContractor = w.hr?.contractorName?.toLowerCase().includes(q);
      const matchTrade = w.hr?.trade?.toLowerCase().includes(q);
      const matchMobile = w.hr?.mobileNumber?.includes(q);
      return matchName || matchId || matchAadhaar || matchContractor || matchTrade || matchMobile;
    }

    return true;
  });

  const handleStageSearchSubmit = (e) => {
    e.preventDefault();
    setSearchQuery(searchInput);
  };

  const getStageBadge = (stage) => {
    const meta = STAGE_META[stage] || { label: 'Unknown', color: 'info' };
    return (
      <span className={`badge badge-${meta.color}`}>
        {stage === STAGES.COMPLETED && <CheckCircle2 size={12} />}
        {stage === STAGES.FLAGGED && <ShieldAlert size={12} />}
        {stage > 0 && stage < STAGES.COMPLETED && <Clock size={12} />}
        {meta.label}
      </span>
    );
  };

  const getActionLabel = () => {
    if (currentRole === ROLES.MEDICAL) return 'Perform Medical Exam';
    if (currentRole === ROLES.SAFETY) return 'Conduct EHS Briefing';
    if (currentRole === ROLES.IT) return 'Enroll Face Biometrics';
    if (currentRole === ROLES.CAMP) return 'Allocate Camp Bed';
    return 'Process Stage';
  };

  return (
    <div className="table-card">
      <div className="table-header-toolbar">
        <div className="table-title-area">
          <h2>
            {currentRole === ROLES.ADMIN ? 'Workforce Master Register' : `${STAGE_META[currentRole === ROLES.HR ? 1 : (currentRole === ROLES.MEDICAL ? 2 : (currentRole === ROLES.SAFETY ? 3 : (currentRole === ROLES.IT ? 4 : 5)))]?.label || 'Department'} Queue`}
          </h2>
          <p>
            Showing {filteredWorkers.length} candidate record{filteredWorkers.length === 1 ? '' : 's'} ({pendingCount} pending, {completedByStageCount} completed by your stage)
          </p>
        </div>

        {/* Dedicated Search Bar + Button (Search by Name, Employee ID, or Aadhaar Card) */}
        <form
          onSubmit={handleStageSearchSubmit}
          style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search
              size={15}
              style={{ position: 'absolute', left: '0.7rem', color: 'var(--text-muted)', pointerEvents: 'none' }}
            />
            <input
              id="stage-worker-search-input"
              type="text"
              className="form-control"
              style={{ paddingLeft: '2.1rem', paddingRight: '0.75rem', width: '275px', fontSize: '0.82rem' }}
              placeholder="Name, Employee ID, or Aadhaar..."
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setSearchQuery(e.target.value);
              }}
            />
          </div>
          <button
            id="btn-stage-worker-search"
            type="submit"
            className="btn btn-primary"
            style={{ padding: '0.45rem 0.85rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
          >
            <Search size={14} />
            <span>Search</span>
          </button>
          {(searchInput || searchQuery) && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.45rem 0.7rem', fontSize: '0.78rem' }}
              onClick={() => {
                setSearchInput('');
                setSearchQuery('');
              }}
            >
              Clear
            </button>
          )}
        </form>
      </div>

      {/* Stage Queue Tabs: Pending vs Completed Lists */}
      {currentRole !== ROLES.ADMIN && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: '0.5rem',
          padding: '0.65rem 1.25rem',
          borderBottom: '1px solid var(--border-light)',
          backgroundColor: 'var(--bg-subtle, #F8FAFC)'
        }}>
          {[
            { id: 'ALL', label: `All Records (${scopedWorkers.length})` },
            { id: 'PENDING', label: `Pending Action (${pendingCount})` },
            { id: 'COMPLETED', label: `Completed (${completedByStageCount})` }
          ].map(tab => {
            const active = stageQueueTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                id={`btn-queue-tab-${tab.id.toLowerCase()}`}
                onClick={() => setStageQueueTab(tab.id)}
                style={{
                  padding: '0.38rem 0.85rem',
                  borderRadius: '999px',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: active ? '1.5px solid var(--brand-primary)' : '1px solid var(--border-medium)',
                  backgroundColor: active ? 'var(--brand-primary)' : '#FFFFFF',
                  color: active ? '#FFFFFF' : 'var(--text-secondary)'
                }}
              >
                {tab.label}
              </button>
            );
          })}
          {currentRole === ROLES.MEDICAL && (
            <span style={{ marginLeft: 'auto', fontSize: '0.74rem', color: 'var(--info-text)', fontWeight: 600 }}>
              Tip: Select &ldquo;Re-Perform Test&rdquo; on any completed worker to log a follow-up exam (all prior records stay archived).
            </span>
          )}
        </div>
      )}

      {/* QR Code Preview Modal */}
      {qrModalWorker && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.55)',
            zIndex: 1200,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem'
          }}
          onClick={() => setQrModalWorker(null)}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: 'var(--radius-lg)',
              padding: '1.5rem',
              maxWidth: '360px',
              width: '100%',
              boxShadow: 'var(--shadow-lg)',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '0.75rem'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setQrModalWorker(null)}
              aria-label="Close QR Modal"
              style={{
                position: 'absolute',
                top: '0.75rem',
                right: '0.75rem',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                color: 'var(--text-muted)'
              }}
            >
              <X size={18} />
            </button>
            <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              Worker Onboarding QR Code
            </h3>
            <WorkerQrCode worker={qrModalWorker} size={190} showActions={true} />
          </div>
        </div>
      )}

      <div className="data-table-wrapper">
        <table className="data-table">
          <thead>
            <tr>
              <th>Worker ID / Ref</th>
              <th>Candidate Identity</th>
              <th>Trade & Contractor</th>

              {/* Conditional columns per department */}
              {currentRole === ROLES.ADMIN && (
                <>
                  <th>Current Stage</th>
                  <th>Medical Vitals</th>
                  <th>Living Quarters</th>
                </>
              )}

              {currentRole === ROLES.HR && (
                <>
                  <th>Emergency Contact</th>
                  <th>Current Status</th>
                </>
              )}

              {currentRole === ROLES.MEDICAL && (
                <>
                  <th>Blood Group & Vitals</th>
                  <th>Alcohol Screening</th>
                  <th>Fitness Verdict</th>
                </>
              )}

              {currentRole === ROLES.SAFETY && (
                <>
                  <th>Medical Clearance</th>
                  <th>EHS Induction Briefing</th>
                  <th>PPE Kit Issuance</th>
                </>
              )}

              {currentRole === ROLES.IT && (
                <>
                  <th>Assigned ID</th>
                  <th>Face Biometrics</th>
                  <th>CWMS Integration</th>
                </>
              )}

              {currentRole === ROLES.CAMP && (
                <>
                  <th>Assigned ID</th>
                  <th>Living Quarters</th>
                  <th>Gate Pass Status</th>
                </>
              )}

              <th>Process Timeline</th>
              <th style={{ textAlign: 'right' }}>Department Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkers.length === 0 ? (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                  No candidates currently in your department's queue.
                </td>
              </tr>
            ) : (
              filteredWorkers.map(worker => {
                const canProcess = canProcessWorker(worker);
                const isFlagged = worker.stage === STAGES.FLAGGED;

                return (
                  <tr key={worker.id}>
                    <td>
                      <div style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {worker.assignedWorkerId || worker.id}
                      </div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                        Ref: {worker.id}
                      </div>
                    </td>

                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        {/* Worker Portrait Thumbnail for Gate Pass ID */}
                        <div style={{
                          width: '38px',
                          height: '42px',
                          borderRadius: '4px',
                          border: '1.5px solid var(--border-medium)',
                          backgroundColor: '#FFFFFF',
                          overflow: 'hidden',
                          flexShrink: 0,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
                        }}>
                          {worker.hr?.photo ? (
                            <img src={worker.hr.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <span style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--brand-primary)' }}>
                              {worker.hr?.fullName?.charAt(0) || 'W'}
                            </span>
                          )}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                            {worker.hr?.fullName || 'Untitled Profile'}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            S/o: {worker.hr?.fatherHusbandName || 'N/A'} • {worker.hr?.age || '—'} yrs • {worker.hr?.gender || '—'}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                            <Phone size={11} style={{ opacity: 0.7 }} /> {worker.hr?.mobileNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-purple" style={{ marginBottom: '0.25rem' }}>
                        {worker.hr?.trade || 'Unassigned'}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {worker.hr?.contractorCode ? `${worker.hr.contractorCode} — ` : ''}{worker.hr?.contractorName || 'N/A'}
                      </div>
                    </td>

                    {/* ADMIN VIEW COLUMNS */}
                    {currentRole === ROLES.ADMIN && (
                      <>
                        <td>{getStageBadge(worker.stage)}</td>
                        <td>
                          {worker.medical?.fitnessStatus ? (() => {
                            const fm = getMedicalFitnessMeta(worker.medical.fitnessStatus);
                            return (
                              <span className={`badge badge-${fm.badge}`}>
                                {fm.shortLabel}
                              </span>
                            );
                          })() : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Pending</span>
                          )}
                        </td>
                        <td>
                          {worker.camp?.campName ? (
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{worker.camp.campName} ({worker.camp.bedNumber})</span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unallocated</span>
                          )}
                        </td>
                      </>
                    )}

                    {/* HR VIEW COLUMNS */}
                    {currentRole === ROLES.HR && (
                      <>
                        <td>
                          <div style={{ fontSize: '0.8rem' }}>
                            {worker.hr?.emergencyPerson
                              ? `${worker.hr.emergencyPerson}${worker.hr?.emergencyRelationship ? ` (${worker.hr.emergencyRelationship})` : ''}`
                              : '—'}
                          </div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.15rem' }}>
                            <Phone size={11} style={{ opacity: 0.7 }} /> {worker.hr?.emergencyMobile || '—'}
                          </div>
                        </td>
                        <td>{getStageBadge(worker.stage)}</td>
                      </>
                    )}

                    {/* MEDICAL VIEW COLUMNS */}
                    {currentRole === ROLES.MEDICAL && (
                      <>
                        <td>
                          {worker.medical?.bloodGroup ? (
                            <div>
                              <span className="badge badge-info">{worker.medical?.bloodGroup}</span>
                              <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
                                BP: {worker.medical?.bpSystolic}/{worker.medical?.bpDiastolic} • SpO2: {worker.medical?.spo2}%
                              </div>
                            </div>
                          ) : (
                            <span className="badge badge-warning">Awaiting Vitals</span>
                          )}
                        </td>
                        <td>
                          {worker.medical?.alcoholTest ? (
                            <span className={`badge badge-${worker.medical?.alcoholTest === 'Pass' ? 'success' : 'danger'}`}>
                              {worker.medical?.alcoholTest}
                            </span>
                          ) : '—'}
                        </td>
                        <td>
                          {worker.medical?.fitnessStatus ? (() => {
                            const fm = getMedicalFitnessMeta(worker.medical.fitnessStatus);
                            return (
                              <span className={`badge badge-${fm.badge}`}>
                                {fm.shortLabel}
                              </span>
                            );
                          })() : (
                            <span className="badge badge-warning">Exam Pending</span>
                          )}
                        </td>
                      </>
                    )}

                    {/* SAFETY VIEW COLUMNS */}
                    {currentRole === ROLES.SAFETY && (
                      <>
                        <td>
                          {(() => {
                            const fm = getMedicalFitnessMeta(worker.medical?.fitnessStatus);
                            return (
                              <span className={`badge badge-${fm.badge}`}>
                                {fm.shortLabel}
                              </span>
                            );
                          })()}
                        </td>
                        <td>
                          <span className={`badge badge-${worker.safety?.briefingDone ? 'success' : 'warning'}`}>
                            {worker.safety?.briefingDone ? 'BRIEFING COMPLETED' : 'PENDING BRIEFING'}
                          </span>
                        </td>
                        <td>
                          {worker.safety?.ppeIssued?.length ? (
                            <span className="badge badge-purple">{worker.safety.ppeIssued.length} Items Dispatched</span>
                          ) : (
                            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Not Dispatched</span>
                          )}
                        </td>
                      </>
                    )}

                    {/* IT VIEW COLUMNS */}
                    {currentRole === ROLES.IT && (
                      <>
                        <td>
                          <span style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 700, color: 'var(--brand-primary)' }}>
                            {worker.assignedWorkerId || 'TO BE GENERATED'}
                          </span>
                        </td>
                        <td>
                          <span className={`badge badge-${worker.it?.faceBiometricRegistered ? 'success' : 'danger'}`}>
                            {worker.it?.faceBiometricRegistered ? 'ENROLLED (YES)' : 'PENDING (NO)'}
                          </span>
                        </td>
                        <td>
                          <span className="badge badge-info">
                            {worker.it?.cwmsRegistered ? 'CWMS SYNCED' : 'PENDING SYNC'}
                          </span>
                        </td>
                      </>
                    )}

                    {/* CAMP VIEW COLUMNS */}
                    {currentRole === ROLES.CAMP && (
                      <>
                        <td>
                          <span style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 700 }}>
                            {worker.assignedWorkerId}
                          </span>
                        </td>
                        <td>
                          {worker.camp?.campName ? (
                            <div>
                              <strong>{worker.camp.campName}</strong>
                              <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                                {worker.camp.blockNumber} • {worker.camp.roomNumber} • {worker.camp.bedNumber}
                              </div>
                            </div>
                          ) : (
                            <span className="badge badge-warning">Awaiting Housing</span>
                          )}
                        </td>
                        <td>
                          <span className={`badge badge-${worker.camp?.gatePassActive ? 'success' : 'warning'}`}>
                            {worker.camp?.gatePassActive ? 'GATE PASS ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                      </>
                    )}

                    {/* PROCESS TIMELINE COLUMN */}
                    <td>
                      <div style={{ fontSize: '0.73rem', lineHeight: 1.45, minWidth: '175px' }}>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Start: </span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{formatTimestamp(worker.createdAt)}</span>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-muted)', fontWeight: 600 }}>End: </span>
                          {worker.completedAt ? (
                            <span style={{ color: 'var(--success-text, #047857)', fontWeight: 600 }}>{formatTimestamp(worker.completedAt)}</span>
                          ) : (
                            <span style={{ color: 'var(--text-muted)' }}>In Progress</span>
                          )}
                        </div>
                        {worker.completedAt && formatDuration(worker.createdAt, worker.completedAt) && (
                          <div style={{ fontSize: '0.68rem', color: 'var(--brand-primary)', fontWeight: 700, marginTop: '1px' }}>
                            Duration: {formatDuration(worker.createdAt, worker.completedAt)}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* ACTION COLUMN */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.45rem', flexWrap: 'wrap' }}>
                        {/* Process Button strictly if authorized to process this stage */}
                        {canProcess && (
                          <button
                            id={`btn-process-${worker.id}`}
                            className="btn btn-primary"
                            style={{ padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                            onClick={() => onOpenProcessModal(worker)}
                            title={`Open dedicated processing workspace for ${worker.hr?.fullName}`}
                          >
                            <span>{getActionLabel()}</span>
                            <ArrowRight size={14} />
                          </button>
                        )}

                        {/* Medical Role: Re-Perform Medical Test on any completed or flagged worker */}
                        {currentRole === ROLES.MEDICAL && !canProcess && (
                          <button
                            id={`btn-reperform-medical-${worker.id}`}
                            className="btn btn-secondary"
                            style={{
                              padding: '0.35rem 0.7rem',
                              fontSize: '0.76rem',
                              borderColor: isFlagged ? 'var(--danger-border)' : 'var(--info-border)',
                              color: isFlagged ? 'var(--danger-text)' : 'var(--info-text)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                            onClick={() => onOpenProcessModal(worker)}
                            title="Re-perform medical tests (previous and new records are both archived)"
                          >
                            <RotateCcw size={13} />
                            <span>{isFlagged ? 'Re-Test Unfit' : 'Re-Perform Test'}</span>
                          </button>
                        )}

                        {/* HR Role: Edit Registered Worker Information */}
                        {currentRole === ROLES.HR && !canProcess && (
                          <button
                            id={`btn-edit-hr-${worker.id}`}
                            className="btn btn-secondary"
                            style={{
                              padding: '0.35rem 0.7rem',
                              fontSize: '0.76rem',
                              borderColor: 'var(--info-border)',
                              color: 'var(--info-text)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem',
                              fontWeight: 700
                            }}
                            onClick={() => onOpenProcessModal(worker)}
                            title="Edit worker personal, trade, or contractor details"
                          >
                            <Pencil size={13} />
                            <span>Edit Record</span>
                          </button>
                        )}

                        {/* Other Non-Medical Roles: Inspect Completed Stage Record */}
                        {currentRole !== ROLES.ADMIN && currentRole !== ROLES.MEDICAL && currentRole !== ROLES.HR && !canProcess && isStageCompletedForRole(worker, currentRole) && (
                          <button
                            id={`btn-view-completed-${worker.id}`}
                            className="btn btn-secondary"
                            style={{
                              padding: '0.35rem 0.65rem',
                              fontSize: '0.75rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '0.3rem'
                            }}
                            onClick={() => onOpenProcessModal(worker)}
                            title="View completed stage details"
                          >
                            <CheckCircle2 size={13} color="var(--success-solid)" />
                            <span>View Record</span>
                          </button>
                        )}

                        {/* Quick QR Code View Button */}
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.5rem' }}
                          onClick={() => setQrModalWorker(worker)}
                          title="View / Download Worker QR Code"
                        >
                          <QrCode size={14} />
                        </button>

                        {/* If other department and worker is FLAGGED UNFIT, display clear status badge */}
                        {isFlagged && currentRole !== ROLES.ADMIN && currentRole !== ROLES.MEDICAL && (
                          <span
                            className="badge badge-danger"
                            style={{ fontSize: '0.72rem', padding: '0.3rem 0.6rem', cursor: 'help' }}
                            title="Candidate flagged medically UNFIT by Doctor. Workflow blocked pending Chief Medical Officer clearance or Executive Admin override."
                          >
                            ⚠️ Blocked (Unfit)
                          </span>
                        )}

                        {/* Only Chief Administrator can view/download Worker Induction Form & ID Card */}
                        {currentRole === ROLES.ADMIN && (
                          <>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.55rem' }}
                              onClick={() => onViewInductionDoc(worker)}
                              title="Print / View Official Lloyd Enhanced Induction Form"
                            >
                              <Printer size={15} />
                            </button>

                            <button
                              id={`btn-generate-id-card-${worker.id}`}
                              className="btn btn-secondary"
                              style={{
                                padding: '0.35rem 0.55rem',
                                color: '#1E3A8A',
                                borderColor: '#93C5FD',
                                backgroundColor: '#EFF6FF',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.25rem'
                              }}
                              onClick={() => onGenerateIdCard && onGenerateIdCard(worker)}
                              title="Generate Temporary Gate Pass ID Card"
                            >
                              <CreditCard size={15} />
                              <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>ID Card</span>
                            </button>
                          </>
                        )}

                        {/* Admin Override Only for Admin */}
                        {currentRole === ROLES.ADMIN && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.55rem', color: 'var(--purple-solid)' }}
                            onClick={() => onOpenAdminOverride(worker)}
                            title="Admin Stage Override"
                          >
                            <ShieldAlert size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
