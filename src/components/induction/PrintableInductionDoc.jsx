import React from 'react';
import { 
  Printer, 
  ArrowLeft, 
  CheckSquare, 
  Square, 
  CreditCard,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Lock,
  ShieldAlert
} from 'lucide-react';
import logoMetals from '../../assets/logo_metals.png';
import logoInfra from '../../assets/logo_infra.png';
import { TRADES, SAFETY_TOPICS, PPE_ITEMS } from '../../types/constants';
import { useAuth } from '../../context/AuthContext';
import { getWorkerMissingDetails } from '../../services/validationService';

export const PrintableInductionDoc = ({ worker, onBack, onGenerateIdCard }) => {
  const { users = [] } = useAuth();

  const medSignature = users.find(u => u.role === 'MEDICAL')?.signature;
  const safetySignature = users.find(u => u.role === 'SAFETY')?.signature;
  const itSignature = users.find(u => u.role === 'IT')?.signature;
  const adminSignature = users.find(u => u.role === 'ADMIN')?.signature;

  if (!worker) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <p>No worker record selected for printing.</p>
        <button className="btn btn-primary" onClick={onBack} style={{ marginTop: '1rem' }}>
          Back to Pipeline
        </button>
      </div>
    );
  }

  // Validate onboarding completeness across all 5 steps
  const completion = getWorkerMissingDetails(worker);

  // If worker form is incomplete, DO NOT show or print the incomplete form.
  // Instead, show exactly what details are missing.
  if (!completion.isComplete) {
    return (
      <div style={{ maxWidth: '900px', margin: '0 auto', paddingBottom: '3rem' }}>
        {/* Navigation Toolbar */}
        <div className="no-print" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={onBack}>
            <ArrowLeft size={16} />
            <span>Back to Master Pipeline</span>
          </button>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <Lock size={13} />
              <span>Official Printing Locked (Incomplete)</span>
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
                Cannot Generate Official Induction Form — Incomplete Process
              </h2>
              <p style={{ color: '#78350F', fontSize: '0.875rem', lineHeight: 1.5, margin: 0 }}>
                This worker's induction dossier is currently <strong>incomplete</strong> ({completion.totalMissing} mandatory {completion.totalMissing === 1 ? 'detail' : 'details'} missing across {completion.missingSteps.length} {completion.missingSteps.length === 1 ? 'department step' : 'department steps'}). Under industrial safety &amp; compliance policy, official Lloyd Metals induction forms cannot be printed or issued until all 5 steps are certified.
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
              {worker.hr?.photo ? (
                <img src={worker.hr.photo} alt={worker.hr?.fullName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                worker.hr?.fullName?.charAt(0) || 'W'
              )}
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
                  {worker.hr?.fullName || 'Unnamed Candidate'}
                </h3>
                <span className="badge badge-purple" style={{ fontSize: '0.72rem' }}>
                  {worker.hr?.trade || 'General Worker'}
                </span>
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                ID: <strong>{worker.assignedWorkerId || worker.id}</strong> • Agency: <strong>{worker.hr?.contractorName || '—'}</strong>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span className="badge badge-warning" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}>
              Current Pipeline: Stage {worker.stage || 1}
            </span>
          </div>
        </div>

        {/* Missing vs Completed Steps Section */}
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

  const hr = worker?.hr || {};
  const medical = worker?.medical || {};
  const safety = worker?.safety || {};
  const it = worker?.it || {};
  const camp = worker?.camp || {};

  return (
    <div>
      {/* Action Toolbar (Hidden in Print) */}
      <div className="no-print" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem'
      }}>
        <button className="btn btn-secondary" onClick={onBack}>
          <ArrowLeft size={16} />
          <span>Back to Workspace</span>
        </button>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-primary" onClick={() => window.print()}>
            <Printer size={16} />
            <span>Print Official Induction Sheet</span>
          </button>

          {/* Beside Print Option: Generate ID Card */}
          {onGenerateIdCard && (
            <button
              id="btn-goto-id-card-beside-print"
              className="btn btn-secondary"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                backgroundColor: '#EFF6FF',
                borderColor: '#93C5FD',
                color: '#1E3A8A',
                fontWeight: 600
              }}
              onClick={() => onGenerateIdCard(worker)}
              title="Generate Official Temporary Gate Pass ID Card"
            >
              <CreditCard size={16} />
              <span>Generate ID Card</span>
            </button>
          )}
        </div>
      </div>

      {/* Printable Sheet Container */}
      <div className="printable-document" style={{
        backgroundColor: '#FFFFFF',
        border: '1px solid #CBD5E1',
        borderRadius: '8px',
        padding: '2.5rem',
        maxWidth: '900px',
        margin: '0 auto',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        color: '#1E293B',
        fontSize: '0.85rem'
      }}>
        {/* Logos Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '2px solid #0F172A',
          paddingBottom: '1rem',
          marginBottom: '1rem'
        }}>
          <img 
            src={logoInfra} 
            alt="Lloyds Infra" 
            style={{ height: '50px', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div style={{ textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.02em' }}>
              LLOYDS METALS & ENERGY LIMITED
            </h1>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#E82329' }}>
              STANDARDIZED WORKER INDUCTION & CAMP HOUSING ALLOCATION FORM
            </div>
          </div>
          <img 
            src={logoMetals} 
            alt="Lloyds Metals" 
            style={{ height: '38px', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        {/* Top Reference Metadata Grid */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1.25rem', fontSize: '0.8rem', border: '1px solid #CBD5E0' }}>
          <tbody>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #CBD5E0', width: '35%' }}>
                <strong>Project / Location:</strong> Lloyds Surjagarh / Plant Site
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #CBD5E0', width: '25%' }}>
                <strong>Doc Ref No:</strong> {worker.id}
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #CBD5E0', width: '20%' }}>
                <strong>Date:</strong> {new Date(worker.createdAt).toLocaleDateString()}
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #CBD5E0', width: '20%' }}>
                <strong>Gate Pass / ID:</strong> <span style={{ fontWeight: 800, color: '#E82329' }}>{worker.assignedWorkerId || 'PENDING'}</span>
              </td>
            </tr>
          </tbody>
        </table>

        {/* SECTION 1: HR DETAILS */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '0.35rem 0.65rem',
          fontWeight: 800,
          fontSize: '0.85rem',
          marginBottom: '0.5rem'
        }}>
          👤 SECTION 1: HR & WORKER PERSONAL DETAILS
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '1rem', fontSize: '0.8rem', border: '1px solid #CBD5E0' }}>
          <tbody>
            <tr>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', width: '22%', backgroundColor: '#F8FAFC' }}><strong>Contractor / Agency:</strong></td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', width: '30%' }}>{hr.contractorName || '—'}</td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', width: '18%', backgroundColor: '#F8FAFC' }}><strong>Contractor License No:</strong></td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', width: '18%' }}>{hr.contractorLicense || '—'}</td>
              <td rowSpan="4" style={{ width: '95px', textAlign: 'center', verticalAlign: 'middle', border: '1px solid #CBD5E0', padding: '4px', backgroundColor: '#FAFAFA' }}>
                {hr.photo ? (
                  <img src={hr.photo} alt="Worker" style={{ width: '80px', height: '90px', objectFit: 'cover', border: '1.5px solid #0F172A', display: 'block', margin: '0 auto' }} />
                ) : (
                  <div style={{ width: '80px', height: '90px', border: '1px dashed #94A3B8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto', fontSize: '0.7rem', color: '#64748B' }}>
                    Affix Photo
                  </div>
                )}
              </td>
            </tr>
            <tr>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', backgroundColor: '#F8FAFC' }}><strong>Worker Full Name:</strong></td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', fontWeight: 700 }}>{hr.fullName || '—'}</td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', backgroundColor: '#F8FAFC' }}><strong>Father's / Husband's Name:</strong></td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0' }}>{hr.fatherHusbandName || '—'}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', backgroundColor: '#F8FAFC' }}><strong>Date of Birth / Age:</strong></td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0' }}>{hr.dob} ({hr.age} yrs)</td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', backgroundColor: '#F8FAFC' }}><strong>Gender & Mobile:</strong></td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0' }}>{hr.gender} • {hr.mobileNumber}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', backgroundColor: '#F8FAFC' }}><strong>ID Proof Type & Ref No:</strong></td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0' }}>{hr.idProofType}: {hr.idProofRef}</td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', backgroundColor: '#F8FAFC' }}><strong>Skill / Trade Category:</strong></td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', fontWeight: 700 }}>{hr.trade}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', backgroundColor: '#F8FAFC' }}><strong>Emergency Contact:</strong></td>
              <td colSpan="4" style={{ padding: '0.45rem', border: '1px solid #CBD5E0' }}>
                {hr.emergencyPerson} ({hr.emergencyRelationship}) — Mobile: <strong>{hr.emergencyMobile}</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* SECTION 2: MEDICAL CHECK */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '0.35rem 0.65rem',
          fontWeight: 800,
          fontSize: '0.85rem',
          marginBottom: '0.5rem'
        }}>
          🩺 SECTION 2: MEDICAL & PHYSICAL FITNESS CHECK
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.5rem', fontSize: '0.8rem', border: '1px solid #CBD5E0' }}>
          <tbody>
            <tr>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', width: '25%' }}><strong>Blood Group:</strong> {medical.bloodGroup || '—'}</td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', width: '25%' }}><strong>Height/Weight/BMI:</strong> {medical.heightCm ? `${medical.heightCm}cm / ${medical.weightKg}kg (BMI: ${medical.bmi || '—'})` : '—'}</td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', width: '25%' }}><strong>BP (mmHg):</strong> {medical.bpSystolic ? `${medical.bpSystolic}/${medical.bpDiastolic}` : '—'}</td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0', width: '25%' }}><strong>SpO2:</strong> {medical.spo2 ? `${medical.spo2}%` : '—'}</td>
            </tr>
            <tr>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0' }}><strong>Pulse Rate:</strong> {medical.pulseRate ? `${medical.pulseRate} /min` : '—'}</td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0' }}><strong>Respiration Rate:</strong> {medical.respirationRate ? `${medical.respirationRate} /min` : '—'}</td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0' }}><strong>RBS (Sugar):</strong> {medical.rbs ? `${medical.rbs} mg/dL` : '—'}</td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0' }}><strong>Alcohol Test:</strong> <strong>{medical.alcoholTest || '—'}</strong></td>
            </tr>
            <tr>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0' }}><strong>Vision:</strong> {medical.visionTest || 'Normal'}</td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0' }}><strong>Hearing:</strong> {medical.hearingTest || 'Normal'}</td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0' }}><strong>Vertigo/Height:</strong> {medical.vertigoTest || 'Fit'}</td>
              <td style={{ padding: '0.45rem', border: '1px solid #CBD5E0' }}><strong>Existing Illness:</strong> {medical.existingIllness || 'No'}</td>
            </tr>
          </tbody>
        </table>

        {/* Fitness Banner Box */}
        <div style={{
          border: '2px solid #CBD5E0',
          padding: '0.65rem 1rem',
          backgroundColor: '#F8FAFC',
          marginBottom: '1rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <strong>FINAL MEDICAL FITNESS STATUS:</strong> &nbsp;&nbsp;
            <span style={{
              fontWeight: 900,
              fontSize: '0.95rem',
              color: medical.fitnessStatus === 'FIT' ? '#059669' : '#DC2626'
            }}>
              [{medical.fitnessStatus === 'FIT' ? '✔' : ' '}] FIT FOR GENERAL WORK &nbsp;&nbsp;&nbsp;&nbsp;
              [{medical.fitnessStatus === 'UNFIT' ? '✔' : ' '}] UNFIT
            </span>
            <div style={{ fontSize: '0.75rem', marginTop: '0.2rem' }}>
              <strong>Remark if any:</strong> {medical.remarks || 'None'}
            </div>
          </div>
          <div style={{ textAlign: 'right', fontSize: '0.75rem' }}>
            <div><strong>Medical Examiner:</strong> {medical.examinerName || 'Gopal Ray'}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', minHeight: '28px', marginTop: '0.2rem' }}>
              <span>Signature & Stamp:</span>
              {medSignature ? (
                <img src={medSignature} alt="Medical Sig" style={{ maxHeight: '26px', maxWidth: '90px', objectFit: 'contain' }} />
              ) : (
                <span>______________________</span>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 3: EHS SAFETY */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '0.35rem 0.65rem',
          fontWeight: 800,
          fontSize: '0.85rem',
          marginBottom: '0.5rem'
        }}>
          🛡️ SECTION 3: EHS SAFETY INDUCTION & PPE ISSUANCE
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.5rem', fontSize: '0.75rem', border: '1px solid #CBD5E0' }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top', padding: '0.5rem', width: '50%', border: '1px solid #CBD5E0' }}>
                <strong style={{ display: 'block', marginBottom: '0.3rem' }}>Safety Topics Covered in Briefing:</strong>
                {SAFETY_TOPICS.map((topic, i) => {
                  const checked = safety.topicsCovered?.includes(topic);
                  return (
                    <div key={i} style={{ marginBottom: '0.15rem' }}>
                      [{checked ? '✔' : ' '}] {topic}
                    </div>
                  );
                })}
              </td>
              <td style={{ verticalAlign: 'top', padding: '0.5rem', width: '50%', border: '1px solid #CBD5E0' }}>
                <strong style={{ display: 'block', marginBottom: '0.3rem' }}>Mandatory PPE Issued to Worker:</strong>
                {PPE_ITEMS.map((item) => {
                  const checked = safety.ppeIssued?.includes(item.id);
                  return (
                    <div key={item.id} style={{ marginBottom: '0.15rem' }}>
                      [{checked ? '✔' : ' '}] {item.label}
                    </div>
                  );
                })}
              </td>
            </tr>
            <tr>
              <td colSpan="2" style={{ padding: '0.5rem', border: '1px solid #CBD5E0', backgroundColor: '#F8FAFC' }}>
                <strong>Safety Officer Name:</strong> {safety.safetyOfficerName || 'Jithendra Parida (EHS Lead)'} &nbsp;&nbsp;&nbsp;&nbsp;
                <strong>Signature:</strong> {safetySignature ? (
                  <img src={safetySignature} alt="Safety Sig" style={{ maxHeight: '24px', maxWidth: '85px', verticalAlign: 'middle', objectFit: 'contain' }} />
                ) : '________________________'} &nbsp;&nbsp;&nbsp;&nbsp;
                <strong>Date:</strong> {safety.safetyDate || '—'}
              </td>
            </tr>
          </tbody>
        </table>

        {/* SECTION 4: IT & BIOMETRIC ENROLLMENT */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '0.35rem 0.65rem',
          fontWeight: 800,
          fontSize: '0.85rem',
          marginTop: '1rem',
          marginBottom: '0.5rem'
        }}>
          💻 SECTION 4: IT & BIOMETRIC ENROLLMENT (बायोमेट्रिक एवं आईटी पंजीकरण)
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '0.5rem', fontSize: '0.75rem', border: '1px solid #CBD5E0' }}>
          <tbody>
            <tr>
              <td style={{ padding: '0.5rem', border: '1px solid #CBD5E0', width: '30%' }}>
                <strong>Assigned Worker ID:</strong> <span style={{ fontFamily: 'monospace', fontWeight: 800 }}>{worker.assignedWorkerId || 'PENDING'}</span>
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #CBD5E0', width: '35%' }}>
                <strong>Biometric / Face Registered:</strong> [{it.faceBiometricRegistered ? '✔' : ' '}] YES &nbsp;&nbsp; [{!it.faceBiometricRegistered ? '✔' : ' '}] NO
              </td>
              <td style={{ padding: '0.5rem', border: '1px solid #CBD5E0', width: '35%' }}>
                <strong>IT Admin Signature:</strong> {itSignature ? (
                  <img src={itSignature} alt="IT Sig" style={{ maxHeight: '24px', maxWidth: '85px', verticalAlign: 'middle', objectFit: 'contain' }} />
                ) : (it.itAdminSignature || 'Chitta Ranjan Panda')}
              </td>
            </tr>
          </tbody>
        </table>

        {/* SECTION 5: CONTRACTOR & ACCOMMODATION */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '0.35rem 0.65rem',
          fontWeight: 800,
          fontSize: '0.85rem',
          marginTop: '1rem',
          marginBottom: '0.5rem'
        }}>
          ✍️ SECTION 5: CONTRACTOR STAMP & SITE APPROVAL / ACCOMMODATION
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', border: '1px solid #CBD5E0', marginBottom: '1rem' }}>
          <tbody>
            <tr>
              <td style={{ verticalAlign: 'top', padding: '0.65rem', width: '50%', border: '1px solid #CBD5E0' }}>
                <strong style={{ display: 'block', marginBottom: '0.3rem' }}>CONTRACTOR / SUB-CONTRACTOR CONFIRMATION:</strong>
                We confirm that the worker is deployed by our agency, credentials are verified, and we ensure compliance to site rules.<br /><br />
                Supervisor Name: <strong>{camp.contractorSupervisor || 'Sunil Verma'}</strong><br />
                Mobile: {camp.supervisorMobile || '9822001144'}<br />
                Signature & Stamp: ___________________________
              </td>
              <td style={{ verticalAlign: 'top', padding: '0.65rem', width: '50%', border: '1px solid #CBD5E0', backgroundColor: '#F8FAFC' }}>
                <strong style={{ display: 'block', marginBottom: '0.3rem', color: '#E82329' }}>CAMP ACCOMMODATION ALLOCATION:</strong>
                Camp Name: <strong>{camp.campName || 'Gondwana Phase 3'}</strong><br />
                Block Number: <strong>{camp.blockNumber || 'Block A'}</strong><br />
                Room Number: <strong>{camp.roomNumber || 'A-102'}</strong><br />
                Bed Number: <strong>{camp.bedNumber || 'Bed 1'}</strong><br />
                Gate Pass Status: <strong style={{ color: '#059669' }}>ACTIVE (PERMITTED SITE ENTRY)</strong>
              </td>
            </tr>
          </tbody>
        </table>

        {/* FINAL CONCLUDING SECTION: WORKER DECLARATION & UNDERTAKING */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '0.35rem 0.65rem',
          fontWeight: 800,
          fontSize: '0.85rem',
          marginTop: '1rem',
          marginBottom: '0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <span>📝 WORKER DECLARATION & UNDERTAKING (श्रमिक घोषणा एवं शपथ)</span>
          <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#FCA5A5' }}>LEGAL MANDATE • कानूनी शपथ</span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem', border: '1px solid #CBD5E0' }}>
          <tbody>
            <tr>
              <td style={{ padding: '0.75rem', border: '1px solid #CBD5E0', backgroundColor: '#F8FAFC', lineHeight: 1.6 }}>
                <div>
                  <strong style={{ color: '#0F172A' }}>WORKER DECLARATION & UNDERTAKING (श्रमिक घोषणा):</strong><br />
                  I have received the site safety briefing, understood all site rules including <strong style={{ color: '#E82329' }}>MANDATORY DAILY FACE PUNCHING (NO PUNCH = NO PAYMENT)</strong>, STRICT ALCOHOL/DRUGS PROHIBITION, and mandatory PPE usage. I agree to comply with all safety instructions.<br />
                  <span style={{ color: '#0F172A', display: 'inline-block', marginTop: '0.35rem' }}>
                    मैंने साइट सुरक्षा नियमों को समझ लिया है। मैं दैनिक बायोमेट्रिक फेस पंच (पंच नहीं तो भुगतान नहीं), शराब/नशे पर पूर्ण प्रतिबंध और पीपीई के नियमों का कड़ाई से पालन करूंगा।
                  </span>
                </div>
                <div style={{ marginTop: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px dashed #CBD5E0' }}>
                  <div><strong>Worker Signature / Right Thumb Impression:</strong> ___________________________</div>
                  <div><strong>Date:</strong> {new Date().toLocaleDateString('en-GB')}</div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {/* Document Footer */}
        <div style={{
          marginTop: '1.5rem',
          borderTop: '1px solid #E2E8F0',
          paddingTop: '0.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '0.7rem',
          color: '#64748B'
        }}>
          <span>Form Version: LME-EHS-WIF-2026-V2</span>
          <span>Confidential • Internal Human Resources & Security Operations</span>
          <span>Page 1 of 1</span>
        </div>
      </div>
    </div>
  );
};
