import React from 'react';
import { Printer, ArrowLeft, CheckSquare, Square, CreditCard } from 'lucide-react';
import logoMetals from '../../assets/logo_metals.png';
import logoInfra from '../../assets/logo_infra.png';
import { TRADES, SAFETY_TOPICS, PPE_ITEMS } from '../../types/constants';

export const PrintableInductionDoc = ({ worker, onBack, onGenerateIdCard }) => {
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
            <div><strong>Medical Examiner:</strong> {medical.examinerName || 'Dr. Vivek Deshmukh'}</div>
            <div>Signature & Stamp: ______________________</div>
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
                <strong>Safety Officer Name:</strong> {safety.safetyOfficerName || 'Arun Patil (EHS Lead)'} &nbsp;&nbsp;&nbsp;&nbsp;
                <strong>Signature:</strong> ________________________ &nbsp;&nbsp;&nbsp;&nbsp;
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
                <strong>IT Admin Signature:</strong> {it.itAdminSignature || 'Rajesh Sharma'}
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
