import React, { useState, useMemo, useEffect } from 'react';
import { 
  Printer, 
  ArrowLeft, 
  CreditCard, 
  RotateCw, 
  Layers, 
  Sparkles, 
  FileText, 
  Calendar, 
  MapPin, 
  Briefcase, 
  User, 
  Phone, 
  Camera, 
  Check, 
  Edit3,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Lock,
  ShieldAlert
} from 'lucide-react';
import { useWorkers } from '../../context/WorkerContext';
import { useAuth } from '../../context/AuthContext';
import { WorkerPhotoUpload } from '../common/WorkerPhotoUpload';
import { getWorkerMissingDetails } from '../../services/validationService';

export const TemporaryGatePassIdCard = ({ initialWorker, onBack }) => {
  const { workers = [], updateWorkerPhoto } = useWorkers();
  const { currentUser, users = [] } = useAuth();

  const issuingSignature = currentUser?.signature || users.find(u => u.role === 'ADMIN' || u.role === 'HR')?.signature || null;

  // Selected worker state
  const [selectedWorkerId, setSelectedWorkerId] = useState(() => {
    return initialWorker?.id || (workers.length > 0 ? workers[0].id : null);
  });

  // Keep selectedWorkerId in sync with props/data changes
  useEffect(() => {
    if (initialWorker?.id) {
      setSelectedWorkerId(initialWorker.id);
    } else if (!selectedWorkerId && workers.length > 0) {
      setSelectedWorkerId(workers[0].id);
    }
  }, [initialWorker?.id, workers]);

  // Resolve active worker
  const currentWorker = useMemo(() => {
    if (selectedWorkerId && workers.length > 0) {
      const match = workers.find(w => w.id === selectedWorkerId);
      if (match) return match;
    }
    if (initialWorker) return initialWorker;
    if (workers.length > 0) return workers[0];
    return null;
  }, [workers, selectedWorkerId, initialWorker]);

  // Safe object references
  const hr = currentWorker?.hr || {};
  const medical = currentWorker?.medical || {};
  const workerPhoto = hr?.photo || '';

  // View modes: 'both' (side-by-side), 'flip' (3D flip card), 'front', 'back'
  const [viewMode, setViewMode] = useState('both');
  const [isFlipped, setIsFlipped] = useState(false);
  const [isBlankTemplate, setIsBlankTemplate] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);

  // Editable fields with default calculated values
  const defaultDates = useMemo(() => {
    const today = new Date();
    const nextYear = new Date();
    nextYear.setFullYear(today.getFullYear() + 1);

    const formatDate = (d) => {
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    return {
      validFrom: formatDate(today),
      validTo: formatDate(nextYear)
    };
  }, []);

  const [validFrom, setValidFrom] = useState(defaultDates.validFrom);
  const [validTo, setValidTo] = useState(defaultDates.validTo);
  const [companyName, setCompanyName] = useState('LLOYDS METALS AND ENERGY LIMITED HEDRI');
  const [workingLocation, setWorkingLocation] = useState('LLOYDS METALS AND ENERGY LIMITED HEDRI');
  const [activity, setActivity] = useState('Welding & Structural Fabrication');
  const [customAddress, setCustomAddress] = useState(
    'LLOYDS METALS AND ENERGY LIMITED HEDRI'
  );

  // Synchronize location, activity, address when worker changes
  useEffect(() => {
    if (currentWorker?.hr) {
      setWorkingLocation(currentWorker.hr.workingLocation || 'LLOYDS METALS AND ENERGY LIMITED HEDRI');
      setActivity(currentWorker.hr.activity || currentWorker.hr.trade || 'Welding & Structural Fabrication');
      setCustomAddress(currentWorker.hr.idCardAddress || 'LLOYDS METALS AND ENERGY LIMITED HEDRI');
    }
  }, [currentWorker?.id]);

  // When worker selection dropdown changes
  const handleWorkerChange = (e) => {
    const newId = e.target.value;
    setSelectedWorkerId(newId);
    const worker = workers.find(w => w.id === newId);
    if (worker?.hr) {
      if (worker.hr.workingLocation) setWorkingLocation(worker.hr.workingLocation);
      if (worker.hr.activity || worker.hr.trade) setActivity(worker.hr.activity || worker.hr.trade);
      setCustomAddress(worker.hr.idCardAddress || 'LLOYDS METALS AND ENERGY LIMITED HEDRI');
    }
  };

  // Extract Aadhaar 12 digits
  const aadharDigits = useMemo(() => {
    const raw = (hr?.idProofRef || '').replace(/\D/g, '');
    const digits = [];
    for (let i = 0; i < 12; i++) {
      digits.push(raw[i] || '');
    }
    return digits;
  }, [hr?.idProofRef]);

  // Format DOB to DD/MM/YYYY
  const formattedDob = useMemo(() => {
    if (!hr?.dob) return '';
    try {
      const parts = String(hr.dob).split('-');
      if (parts.length === 3) {
        return `${parts[2]}/${parts[1]}/${parts[0]}`;
      }
    } catch {}
    return hr.dob || '';
  }, [hr?.dob]);

  // Split address over 5 horizontal lines
  const addressLines = useMemo(() => {
    if (isBlankTemplate) return ['', '', '', '', ''];
    const addr = customAddress || 'LLOYDS METALS AND ENERGY LIMITED HEDRI';
    
    // Support explicit line breaks if user typed multiple lines in the textarea
    if (addr.includes('\n')) {
      const explicit = addr.split('\n').map(s => s.trim()).filter(Boolean);
      const lines = ['', '', '', '', ''];
      for (let i = 0; i < Math.min(explicit.length, 5); i++) {
        lines[i] = explicit[i];
      }
      return lines;
    }

    // Split neatly into up to 5 lines of ~30-36 characters
    const words = addr.split(' ');
    const lines = ['', '', '', '', ''];
    let currentLine = 0;

    for (const word of words) {
      if (currentLine >= 5) break;
      const maxLen = currentLine === 0 ? 32 : 36;
      if ((lines[currentLine] + ' ' + word).trim().length <= maxLen) {
        lines[currentLine] = (lines[currentLine] + ' ' + word).trim();
      } else {
        currentLine++;
        if (currentLine < 5) {
          lines[currentLine] = word;
        }
      }
    }
    return lines;
  }, [customAddress, isBlankTemplate]);

  const handlePrint = () => {
    window.print();
  };

  // Fallback view if no candidate is available
  if (!currentWorker) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center', backgroundColor: 'var(--bg-surface)', borderRadius: '12px', border: '1px solid var(--border-medium)' }}>
        <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
          No Worker Selected
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
          Please select a worker from the Master Pipeline Roster to generate an ID Card.
        </p>
        <button className="btn btn-primary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Return to Roster Table</span>
        </button>
      </div>
    );
  }

  // Validate onboarding completeness across all 5 steps
  const completion = getWorkerMissingDetails(currentWorker);

  // If worker is incomplete, DO NOT generate or print the official ID Card.
  // Instead, show exactly what details are missing.
  if (!completion.isComplete) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Navigation Toolbar with Candidate Switcher */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
            <button className="btn btn-secondary" onClick={onBack}>
              <ArrowLeft size={16} />
              <span>Back to Master Pipeline</span>
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="worker-picker-incomplete" style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)' }}>
                Select Candidate:
              </label>
              <select
                id="worker-picker-incomplete"
                className="form-select"
                style={{ padding: '0.35rem 0.65rem', fontSize: '0.82rem', minWidth: '240px' }}
                value={selectedWorkerId || ''}
                onChange={handleWorkerChange}
              >
                {workers.map(w => {
                  const wComp = getWorkerMissingDetails(w);
                  return (
                    <option key={w.id} value={w.id}>
                      {w.hr?.fullName || w.id} ({w.assignedWorkerId || w.id}) {wComp.isComplete ? '✔ (Complete)' : `⚠️ (${wComp.totalMissing} missing)`}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={13} />
              <span>ID Card Issuance Locked (Incomplete)</span>
            </span>
          </div>
        </div>

        {/* High-Visibility Incomplete Notice Card */}
        <div style={{
          backgroundColor: '#FFFBEB',
          border: '1.5px solid #FCD34D',
          borderRadius: '12px',
          padding: '1.5rem',
          marginBottom: '1.75rem',
          boxShadow: '0 4px 12px rgba(245, 158, 11, 0.08)'
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              backgroundColor: '#FEF3C7',
              color: '#D97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <AlertTriangle size={24} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#92400E', margin: '0 0 0.35rem 0' }}>
                Cannot Generate Temporary Gate Pass ID Card — Incomplete Onboarding
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                This worker's profile is currently <strong>incomplete</strong> ({completion.totalMissing} mandatory {completion.totalMissing === 1 ? 'detail' : 'details'} missing across {completion.missingSteps.length} {completion.missingSteps.length === 1 ? 'department step' : 'department steps'}). Under security &amp; safety regulations, official Temporary Gate Pass ID Cards cannot be issued until all 5 steps (HR, Medical, Safety, IT Biometrics, and Camp Housing) are certified.
              </p>
            </div>
          </div>
        </div>

        {/* Worker Candidate Banner */}
        <div style={{
          backgroundColor: 'var(--bg-surface, #FFFFFF)',
          border: '1px solid var(--border-light, #E2E8F0)',
          borderRadius: '12px',
          padding: '1.25rem 1.5rem',
          marginBottom: '1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '56px',
              height: '62px',
              borderRadius: '8px',
              backgroundColor: '#F1F5F9',
              border: '1px solid #CBD5E1',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              fontSize: '1.4rem',
              color: 'var(--brand-primary)',
              flexShrink: 0
            }}>
              {workerPhoto ? (
                <img src={workerPhoto} alt={hr?.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                hr?.fullName?.charAt(0) || 'W'
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {hr?.fullName || 'Unnamed Candidate'}
                </h3>
                <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                  {hr?.trade || 'General Worker'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                ID: <strong>{currentWorker.assignedWorkerId || currentWorker.id}</strong> • Agency: <strong>{hr?.contractorName || '—'}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              Current Pipeline: Stage {currentWorker.stage || 1}
            </span>
          </div>
        </div>

        {/* Missing Details Checklist Card */}
        <div style={{
          backgroundColor: 'var(--bg-surface, #FFFFFF)',
          border: '1px solid var(--border-light, #E2E8F0)',
          borderRadius: '12px',
          padding: '1.5rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldAlert size={18} color="var(--brand-primary)" />
            <span>Missing Onboarding Details Checklist</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {/* Missing Steps */}
            {completion.missingSteps.map((s, idx) => (
              <div key={idx} style={{
                backgroundColor: '#FEF2F2',
                border: '1.5px solid #FECACA',
                borderRadius: '10px',
                padding: '1.1rem 1.25rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <XCircle size={18} color="#DC2626" />
                    <span style={{ fontWeight: 800, color: '#991B1B', fontSize: '0.92rem' }}>
                      {s.title}
                    </span>
                    <span style={{ fontSize: '0.72rem', backgroundColor: '#FEE2E2', color: '#B91C1C', padding: '0.15rem 0.5rem', borderRadius: '6px', fontWeight: 700 }}>
                      {s.dept}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#DC2626' }}>
                    {s.items.length} Missing {s.items.length === 1 ? 'Item' : 'Items'}
                  </span>
                </div>

                <div style={{ paddingLeft: '1.65rem' }}>
                  <ul style={{ margin: 0, padding: 0, listStyleType: 'none', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                    {s.items.map((item, itemIdx) => (
                      <li key={itemIdx} style={{ fontSize: '0.82rem', color: '#7F1D1D', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#DC2626', display: 'inline-block' }}></span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}

            {/* Completed Steps */}
            {completion.completedSteps.map((c, idx) => (
              <div key={idx} style={{
                backgroundColor: '#F0FDF4',
                border: '1px solid #BBF7D0',
                borderRadius: '10px',
                padding: '0.9rem 1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <CheckCircle2 size={17} color="#16A34A" />
                  <span style={{ fontWeight: 700, color: '#166534', fontSize: '0.88rem' }}>
                    {c.title}
                  </span>
                  <span style={{ fontSize: '0.7rem', backgroundColor: '#DCFCE7', color: '#15803D', padding: '0.1rem 0.45rem', borderRadius: '6px', fontWeight: 700 }}>
                    {c.dept}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#15803D', fontWeight: 600 }}>
                  Signed off by {c.completedBy}
                </span>
              </div>
            ))}
          </div>

          <div style={{ marginTop: '1.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-light)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button className="btn btn-secondary" onClick={onBack}>
              Return to Pipeline
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER CARD FRONT (EXACT MATCH TO IMAGE 2)
  // ==========================================
  const renderCardFront = () => (
    <div className="id-card-face id-card-front">
      {/* Top Header */}
      <div className="id-card-header">
        <h2 className="id-card-title-red">TEMPORARY GATE PASS</h2>
        <div className="id-card-subtitle-working">Working at</div>
        <div className="id-card-company-name">{companyName}</div>
      </div>

      {/* Worker Photo Frame */}
      <div className="id-photo-container">
        <div 
          className="id-photo-box"
          onClick={() => setShowPhotoModal(true)}
          title="Click to change or upload worker photo"
        >
          {!isBlankTemplate && workerPhoto ? (
            <img src={workerPhoto} alt={hr?.fullName || 'Worker'} className="id-worker-img" />
          ) : (
            <div className="id-photo-placeholder">
              {/* Blue pen dot in center matching Image 2 */}
              <div className="id-photo-blue-dot" />
            </div>
          )}
        </div>
      </div>

      {/* Form Fields with Underlined Lines */}
      <div className="id-fields-list">
        {/* Employee ID */}
        <div className="id-field-row">
          <span className="id-field-label id-front-label">
            <span>Employee ID</span>
            <span>:</span>
          </span>
          <span className="id-field-line">
            {!isBlankTemplate ? (currentWorker.assignedWorkerId || currentWorker.id || '') : ''}
          </span>
        </div>

        {/* Valid From ... To: ... */}
        <div className="id-field-row">
          <span className="id-field-label id-front-label">
            <span>Valid From</span>
            <span>:</span>
          </span>
          <span className="id-field-line id-line-short">
            {!isBlankTemplate ? validFrom : ''}
          </span>
          <span className="id-field-label id-label-inline">To:</span>
          <span className="id-field-line id-line-short">
            {!isBlankTemplate ? validTo : ''}
          </span>
        </div>

        {/* Name */}
        <div className="id-field-row">
          <span className="id-field-label id-front-label">
            <span>Name</span>
            <span>:</span>
          </span>
          <span className="id-field-line">
            {!isBlankTemplate ? (hr?.fullName || '') : ''}
          </span>
        </div>

        {/* Agency */}
        <div className="id-field-row">
          <span className="id-field-label id-front-label">
            <span>Agency</span>
            <span>:</span>
          </span>
          <span className="id-field-line">
            {!isBlankTemplate ? (hr?.contractorName || '') : ''}
          </span>
        </div>

        {/* Designation */}
        <div className="id-field-row">
          <span className="id-field-label id-front-label">
            <span>Designation</span>
            <span>:</span>
          </span>
          <span className="id-field-line">
            {!isBlankTemplate ? (hr?.trade || 'Worker') : ''}
          </span>
        </div>

        {/* Blood Group */}
        <div className="id-field-row">
          <span className="id-field-label id-front-label">
            <span>Blood Group</span>
            <span>:</span>
          </span>
          <span className="id-field-line">
            {!isBlankTemplate ? (medical?.bloodGroup || 'B+') : ''}
          </span>
        </div>

        {/* Date of Birth */}
        <div className="id-field-row">
          <span className="id-field-label id-front-label">
            <span>Date of Birth</span>
            <span>:</span>
          </span>
          <span className="id-field-line">
            {!isBlankTemplate ? formattedDob : ''}
          </span>
        </div>
      </div>

      {/* Footer: Issuing Authority */}
      <div className="id-card-footer" style={{ position: 'relative' }}>
        {issuingSignature && (
          <img 
            src={issuingSignature} 
            alt="Issuing Signature" 
            style={{
              position: 'absolute',
              bottom: '12px',
              right: '6px',
              maxHeight: '26px',
              maxWidth: '85px',
              objectFit: 'contain',
              opacity: 0.95,
              pointerEvents: 'none'
            }}
          />
        )}
        <div className="id-issuing-red">Issuing Authority</div>
        <div className="id-issuing-company">{companyName}</div>
      </div>
    </div>
  );

  // =========================================
  // RENDER CARD BACK (EXACT MATCH TO IMAGE 1)
  // =========================================
  const renderCardBack = () => (
    <div className="id-card-face id-card-back">
      {/* Top Row: Aadhar No. with 12 Square Boxes */}
      <div className="id-aadhar-row">
        <span className="id-field-label id-aadhar-label">Aadhar No. :</span>
        <div className="id-aadhar-grid">
          {aadharDigits.map((digit, idx) => (
            <div key={idx} className="id-aadhar-box">
              {!isBlankTemplate ? digit : ''}
            </div>
          ))}
        </div>
      </div>

      {/* Address with 5 Lines */}
      <div className="id-address-section">
        <div className="id-address-first-row">
          <span className="id-field-label id-address-label">Address. :</span>
          <span className="id-field-line id-address-first-line">
            {addressLines[0]}
          </span>
        </div>
        <div className="id-address-line">{addressLines[1]}</div>
        <div className="id-address-line">{addressLines[2]}</div>
        <div className="id-address-line">{addressLines[3]}</div>
        <div className="id-address-line">{addressLines[4]}</div>
      </div>

      {/* Contact No. */}
      <div className="id-field-row id-back-row">
        <span className="id-field-label id-back-label">Contact No. :</span>
        <span className="id-field-line">
          {!isBlankTemplate ? (hr?.mobileNumber || '') : ''}
        </span>
      </div>

      {/* Working Location */}
      <div className="id-field-row id-back-row">
        <span className="id-field-label id-back-label">Working Location:</span>
        <span className="id-field-line">
          {!isBlankTemplate ? workingLocation : ''}
        </span>
      </div>

      {/* Activity */}
      <div className="id-field-row id-back-row">
        <span className="id-field-label id-back-label">Activity :</span>
        <span className="id-field-line">
          {!isBlankTemplate ? activity : ''}
        </span>
      </div>

      {/* Emergency Contact No. */}
      <div className="id-field-row id-back-row">
        <span className="id-field-label id-back-label">Emergency Contact No. :</span>
        <span className="id-field-line">
          {!isBlankTemplate ? (hr?.emergencyMobile || '') : ''}
        </span>
      </div>

      {/* Bottom Disclaimer Note */}
      <div className="id-back-disclaimer">
        *The Temporary Gatepass is valid inside LMEL Premises Only.
      </div>
    </div>
  );

  return (
    <div>
      {/* Top Action Toolbar (Hidden during printing) */}
      <div className="no-print" style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '1rem',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border-light)'
      }}>
        {/* Left: Back & Worker Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <button className="btn btn-secondary" onClick={onBack} style={{ padding: '0.45rem 0.85rem' }}>
            <ArrowLeft size={16} />
            <span>Back to Workspace</span>
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <label htmlFor="worker-picker-idcard" style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)' }}>
              Select Worker:
            </label>
            <select
              id="worker-picker-idcard"
              className="form-select"
              style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', minWidth: '220px' }}
              value={selectedWorkerId || ''}
              onChange={handleWorkerChange}
            >
              {workers.map(w => {
                const wComp = getWorkerMissingDetails(w);
                return (
                  <option key={w.id} value={w.id}>
                    {w.hr?.fullName || w.id} ({w.assignedWorkerId || w.id}) {wComp.isComplete ? '✔ (Complete)' : `⚠️ (${wComp.totalMissing} missing)`}
                  </option>
                );
              })}
            </select>
          </div>
        </div>

        {/* Center: View Switcher */}
        <div style={{
          display: 'flex',
          backgroundColor: 'var(--bg-surface)',
          padding: '0.25rem',
          borderRadius: 'var(--radius-md)',
          border: '1px solid var(--border-medium)',
          gap: '0.25rem'
        }}>
          <button
            type="button"
            className={`btn ${viewMode === 'both' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
            onClick={() => setViewMode('both')}
            title="Side-by-side Front & Back for dual printing"
          >
            <Layers size={14} />
            <span>Dual Sheet View</span>
          </button>

          <button
            type="button"
            className={`btn ${viewMode === 'flip' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
            onClick={() => setViewMode('flip')}
            title="3D interactive flippable badge"
          >
            <RotateCw size={14} />
            <span>3D Flip Badge</span>
          </button>

          <button
            type="button"
            className={`btn ${viewMode === 'front' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
            onClick={() => setViewMode('front')}
          >
            <span>Front</span>
          </button>

          <button
            type="button"
            className={`btn ${viewMode === 'back' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '0.35rem 0.7rem', fontSize: '0.75rem' }}
            onClick={() => setViewMode('back')}
          >
            <span>Back</span>
          </button>
        </div>

        {/* Right: Blank Template Toggle & Print Action */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <button
            type="button"
            className={`btn ${isBlankTemplate ? 'btn-warning' : 'btn-secondary'}`}
            style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}
            onClick={() => setIsBlankTemplate(!isBlankTemplate)}
            title="Toggle blank pre-printed template matching physical paper sample"
          >
            <FileText size={14} />
            <span>{isBlankTemplate ? 'Blank Form Mode (Active)' : 'Print Blank Template'}</span>
          </button>

          <button
            type="button"
            id="btn-print-gate-pass"
            className="btn btn-primary"
            style={{ padding: '0.45rem 1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700 }}
            onClick={handlePrint}
          >
            <Printer size={16} />
            <span>Print Official ID Card</span>
          </button>
        </div>
      </div>

      {/* Content Layout: Options Drawer + Displayed Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(280px, 320px) 1fr',
        gap: '2rem',
        alignItems: 'start'
      }}>
        {/* Left Side: On-the-Fly Adjustments Panel (Hidden in print) */}
        <div className="no-print" style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-sm)',
          boxSizing: 'border-box'
        }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Edit3 size={16} color="var(--brand-primary)" />
            <span>Card Print Specifications</span>
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {/* Worker Photo Quick Action */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-medium)',
              boxSizing: 'border-box'
            }}>
              <div style={{
                width: '44px',
                height: '48px',
                border: '1px solid #333',
                backgroundColor: '#FFF',
                overflow: 'hidden',
                borderRadius: '3px',
                flexShrink: 0
              }}>
                {workerPhoto ? (
                  <img src={workerPhoto} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94A3B8' }}>
                    <User size={20} />
                  </div>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {hr?.fullName || 'Worker'}
                </div>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.2rem 0.5rem', fontSize: '0.72rem', marginTop: '0.25rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                  onClick={() => setShowPhotoModal(true)}
                >
                  <Camera size={12} />
                  <span>{workerPhoto ? 'Change Photo' : 'Upload Photo'}</span>
                </button>
              </div>
            </div>

            {/* Validity Dates */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
              <div className="form-group" style={{ minWidth: 0 }}>
                <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Valid From
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', boxSizing: 'border-box', display: 'block', padding: '0.42rem 0.55rem', fontSize: '0.8rem' }}
                  value={validFrom}
                  onChange={(e) => setValidFrom(e.target.value)}
                  placeholder="DD/MM/YYYY"
                />
              </div>
              <div className="form-group" style={{ minWidth: 0 }}>
                <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  Valid To
                </label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%', boxSizing: 'border-box', display: 'block', padding: '0.42rem 0.55rem', fontSize: '0.8rem' }}
                  value={validTo}
                  onChange={(e) => setValidTo(e.target.value)}
                  placeholder="DD/MM/YYYY"
                />
              </div>
            </div>

            {/* Issuing Company / Unit */}
            <div className="form-group" style={{ width: '100%' }}>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Company / Unit (Front of Card)
              </label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', boxSizing: 'border-box', display: 'block', padding: '0.42rem 0.55rem', fontSize: '0.8rem' }}
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="LLOYDS METALS AND ENERGY LIMITED HEDRI"
              />
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.3rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem' }}
                  onClick={() => setCompanyName('LLOYDS METALS AND ENERGY LIMITED HEDRI')}
                >
                  Hedri Unit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem' }}
                  onClick={() => setCompanyName('LLOYDS METALS & ENERGY LTD., KONSARI')}
                >
                  Konsari Unit
                </button>
              </div>
            </div>

            {/* Working Location */}
            <div className="form-group" style={{ width: '100%' }}>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Working Location
              </label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', boxSizing: 'border-box', display: 'block', padding: '0.42rem 0.55rem', fontSize: '0.8rem' }}
                value={workingLocation}
                onChange={(e) => setWorkingLocation(e.target.value)}
                placeholder="LLOYDS METALS AND ENERGY LIMITED HEDRI"
              />
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.3rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem' }}
                  onClick={() => setWorkingLocation('LLOYDS METALS AND ENERGY LIMITED HEDRI')}
                >
                  Hedri Unit
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem' }}
                  onClick={() => setWorkingLocation('Hedri Plant Site')}
                >
                  Hedri Site
                </button>
              </div>
            </div>

            {/* Activity */}
            <div className="form-group" style={{ width: '100%' }}>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Activity / Work Task
              </label>
              <input
                type="text"
                className="form-input"
                style={{ width: '100%', boxSizing: 'border-box', display: 'block', padding: '0.42rem 0.55rem', fontSize: '0.8rem' }}
                value={activity}
                onChange={(e) => setActivity(e.target.value)}
                placeholder="Welding & Structural Fabrication"
              />
            </div>

            {/* Address (Back of Card) */}
            <div className="form-group" style={{ width: '100%' }}>
              <label style={{ display: 'block', fontSize: '0.725rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                Address. : (Back of Card)
              </label>
              <textarea
                className="form-input"
                style={{ width: '100%', boxSizing: 'border-box', display: 'block', padding: '0.45rem 0.55rem', fontSize: '0.8rem', minHeight: '65px', resize: 'vertical', lineHeight: 1.45 }}
                value={customAddress}
                onChange={(e) => setCustomAddress(e.target.value)}
                placeholder="LLOYDS METALS AND ENERGY LIMITED HEDRI"
              />
              <div style={{ display: 'flex', gap: '0.35rem', marginTop: '0.3rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem' }}
                  onClick={() => setCustomAddress('LLOYDS METALS AND ENERGY LIMITED HEDRI')}
                >
                  Hedri Address
                </button>
                {hr?.address && hr.address !== 'LLOYDS METALS AND ENERGY LIMITED HEDRI' && (
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: '0.15rem 0.45rem', fontSize: '0.68rem' }}
                    onClick={() => setCustomAddress(hr.address)}
                  >
                    Worker Home Addr
                  </button>
                )}
              </div>
            </div>

            <div style={{
              fontSize: '0.725rem',
              color: 'var(--text-muted)',
              lineHeight: 1.4,
              borderTop: '1px solid var(--border-light)',
              paddingTop: '0.65rem'
            }}>
              💡 <strong>Print Tip:</strong> When using Chrome / Edge Print Dialog, set Scale to <strong>100%</strong> and select <strong>Print Background Graphics</strong> for authentic card paper output.
            </div>
          </div>
        </div>

        {/* Right Side: The Rendered Gate Pass ID Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* VIEW MODE 1: DUAL SHEET (Both sides side-by-side with cut & fold guidelines) */}
          {viewMode === 'both' && (
            <div className="id-dual-print-sheet">
              <div className="id-card-wrapper">
                <div className="id-badge-label no-print">FRONT SIDE</div>
                {renderCardFront()}
              </div>

              {/* Center Cut / Fold Scissor Guide */}
              <div className="id-print-fold-line">
                <span className="no-print">✂ Fold / Cut Line</span>
              </div>

              <div className="id-card-wrapper">
                <div className="id-badge-label no-print">BACK SIDE</div>
                {renderCardBack()}
              </div>
            </div>
          )}

          {/* VIEW MODE 2: 3D INTERACTIVE FLIP BADGE */}
          {viewMode === 'flip' && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
              <div className="no-print" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Click card or button below to flip front &amp; back in 3D:
              </div>

              <div 
                className={`id-flip-scene ${isFlipped ? 'flipped' : ''}`}
                onClick={() => setIsFlipped(!isFlipped)}
              >
                <div className="id-flip-card-inner">
                  <div className="id-flip-face id-flip-front">
                    {renderCardFront()}
                  </div>
                  <div className="id-flip-face id-flip-back">
                    {renderCardBack()}
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn btn-secondary no-print"
                onClick={() => setIsFlipped(!isFlipped)}
                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.5rem' }}
              >
                <RotateCw size={15} />
                <span>Flip to {isFlipped ? 'Front Side' : 'Back Side'}</span>
              </button>
            </div>
          )}

          {/* VIEW MODE 3: FRONT SIDE ONLY */}
          {viewMode === 'front' && (
            <div className="id-single-card-container">
              <div className="id-card-wrapper">
                {renderCardFront()}
              </div>
            </div>
          )}

          {/* VIEW MODE 4: BACK SIDE ONLY */}
          {viewMode === 'back' && (
            <div className="id-single-card-container">
              <div className="id-card-wrapper">
                {renderCardBack()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal for Uploading Worker Photo directly from ID Card Generator */}
      {showPhotoModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '1rem'
        }}>
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '12px',
            padding: '1.75rem',
            maxWidth: '540px',
            width: '100%',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.4)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Camera size={20} color="var(--brand-primary)" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#0F172A' }}>
                  Update ID Card Photograph: {hr?.fullName || 'Worker'}
                </h3>
              </div>
              <button 
                type="button" 
                className="btn btn-secondary" 
                style={{ padding: '0.25rem 0.5rem' }} 
                onClick={() => setShowPhotoModal(false)}
              >
                ✕
              </button>
            </div>

            <WorkerPhotoUpload
              photo={workerPhoto}
              onChange={(newPhoto) => {
                if (currentWorker?.id) {
                  updateWorkerPhoto(currentWorker.id, newPhoto);
                }
              }}
              label="Worker Passport Photograph"
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowPhotoModal(false)}
              >
                <Check size={16} />
                <span>Done &amp; Update Card</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TemporaryGatePassIdCard;
