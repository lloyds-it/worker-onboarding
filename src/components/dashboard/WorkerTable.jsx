import React from 'react';
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
  Camera
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkers } from '../../context/WorkerContext';
import { STAGES, STAGE_META, ROLES } from '../../types/constants';

export const WorkerTable = ({ onOpenProcessModal, onViewInductionDoc, onGenerateIdCard, onOpenAdminOverride }) => {
  const { currentRole } = useAuth();
  const { workers, searchQuery, selectedStageFilter } = useWorkers();

  // 1. Strict Department Data Scoping (Each department only sees workers assigned to them)
  const scopedWorkers = workers.filter(w => {
    if (currentRole === ROLES.ADMIN) return true; // Admin sees all
    if (currentRole === ROLES.HR) {
      // HR sees workers in HR intake or all workers they registered
      return true;
    }
    if (currentRole === ROLES.MEDICAL) {
      // Medical sees workers waiting for Medical (Stage 2) or evaluated by Medical
      return w.stage === STAGES.MEDICAL || w.stage === STAGES.FLAGGED || Boolean(w.medical?.fitnessStatus);
    }
    if (currentRole === ROLES.SAFETY) {
      // Safety only sees workers certified FIT by Medical and currently in Safety or briefed
      return w.stage === STAGES.SAFETY || Boolean(w.safety?.briefingDone);
    }
    if (currentRole === ROLES.IT) {
      // IT only sees workers who passed Safety and need IT biometrics or are enrolled
      return w.stage === STAGES.IT || Boolean(w.it?.faceBiometricRegistered);
    }
    if (currentRole === ROLES.CAMP) {
      // Camp only sees workers who completed IT and need housing, or completed workers
      return w.stage === STAGES.CAMP || w.stage === STAGES.COMPLETED || Boolean(w.camp?.campName);
    }
    return false;
  });

  // 2. Filter by search query and stage filter
  const filteredWorkers = scopedWorkers.filter(w => {
    if (selectedStageFilter !== 'ALL') {
      if (w.stage !== selectedStageFilter) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = w.hr?.fullName?.toLowerCase().includes(q);
      const matchId = w.assignedWorkerId?.toLowerCase().includes(q) || w.id.toLowerCase().includes(q);
      const matchContractor = w.hr?.contractorName?.toLowerCase().includes(q);
      const matchTrade = w.hr?.trade?.toLowerCase().includes(q);
      const matchMobile = w.hr?.mobileNumber?.includes(q);
      return matchName || matchId || matchContractor || matchTrade || matchMobile;
    }

    return true;
  });

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

  // Helper to determine if current department can process this worker
  const canProcessWorker = (worker) => {
    if (currentRole === ROLES.ADMIN) return worker.stage !== STAGES.COMPLETED;
    if (currentRole === ROLES.HR) return worker.stage === STAGES.HR;
    if (currentRole === ROLES.MEDICAL) return worker.stage === STAGES.MEDICAL;
    if (currentRole === ROLES.SAFETY) return worker.stage === STAGES.SAFETY;
    if (currentRole === ROLES.IT) return worker.stage === STAGES.IT;
    if (currentRole === ROLES.CAMP) return worker.stage === STAGES.CAMP;
    return false;
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
            Showing {filteredWorkers.length} assigned candidate record{filteredWorkers.length === 1 ? '' : 's'} (Scoped strictly to your department)
          </p>
        </div>
      </div>

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

              <th style={{ textAlign: 'right' }}>Department Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredWorkers.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
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
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                            📱 {worker.hr?.mobileNumber || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span className="badge badge-purple" style={{ marginBottom: '0.25rem' }}>
                        {worker.hr?.trade || 'Unassigned'}
                      </span>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        {worker.hr?.contractorName || 'N/A'}
                      </div>
                    </td>

                    {/* ADMIN VIEW COLUMNS */}
                    {currentRole === ROLES.ADMIN && (
                      <>
                        <td>{getStageBadge(worker.stage)}</td>
                        <td>
                          {worker.medical?.fitnessStatus ? (
                            <span className={`badge badge-${worker.medical?.fitnessStatus === 'FIT' ? 'success' : 'danger'}`}>
                              {worker.medical?.fitnessStatus}
                            </span>
                          ) : (
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
                          <div style={{ fontSize: '0.8rem' }}>{worker.hr?.emergencyPerson} ({worker.hr?.emergencyRelationship})</div>
                          <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>📱 {worker.hr?.emergencyMobile}</div>
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
                          {worker.medical?.fitnessStatus ? (
                            <span className={`badge badge-${worker.medical?.fitnessStatus === 'FIT' ? 'success' : 'danger'}`}>
                              {worker.medical?.fitnessStatus}
                            </span>
                          ) : (
                            <span className="badge badge-warning">Exam Pending</span>
                          )}
                        </td>
                      </>
                    )}

                    {/* SAFETY VIEW COLUMNS */}
                    {currentRole === ROLES.SAFETY && (
                      <>
                        <td>
                          <span className="badge badge-success">
                            FIT FOR GENERAL WORK
                          </span>
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

                    {/* ACTION COLUMN */}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
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

                        {/* If Medical and worker is flagged UNFIT, allow viewing or re-examining */}
                        {isFlagged && currentRole === ROLES.MEDICAL && (
                          <button
                            className="btn btn-secondary"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem', borderColor: 'var(--danger-border)', color: 'var(--danger-text)' }}
                            onClick={() => onOpenProcessModal(worker)}
                          >
                            Review Medical Unfit
                          </button>
                        )}

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

                        {/* View Printable Induction Doc */}
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '0.35rem 0.55rem' }}
                          onClick={() => onViewInductionDoc(worker)}
                          title="Print official Lloyd Enhanced Induction Form"
                        >
                          <Printer size={15} />
                        </button>

                        {/* Generate Temporary Gate Pass ID Card (Beside Print) */}
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
                          {currentRole === ROLES.ADMIN && (
                            <span style={{ fontSize: '0.72rem', fontWeight: 700 }}>ID Card</span>
                          )}
                        </button>

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
