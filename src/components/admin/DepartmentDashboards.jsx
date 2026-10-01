import React, { useState } from 'react';
import { 
  Users, 
  Stethoscope, 
  HardHat, 
  Fingerprint, 
  Home, 
  Activity, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  Layers,
  BedDouble,
  FileSpreadsheet
} from 'lucide-react';
import { useWorkers } from '../../context/WorkerContext';
import { getDepartmentStats } from '../../services/reportService';
import { TRADES, PPE_ITEMS, CAMPS, BLOCKS } from '../../types/constants';

export const DepartmentDashboards = ({ initialTab = 'hr' }) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const { workers } = useWorkers();
  const stats = getDepartmentStats(workers);

  return (
    <div>
      {/* Department Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        backgroundColor: 'var(--bg-surface)',
        padding: '0.5rem',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-light)',
        marginBottom: '1.75rem',
        overflowX: 'auto'
      }}>
        <button
          className={`btn ${activeTab === 'hr' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('hr')}
        >
          <Users size={16} />
          <span>HR Operations</span>
        </button>

        <button
          className={`btn ${activeTab === 'medical' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('medical')}
        >
          <Stethoscope size={16} />
          <span>Medical Screening</span>
        </button>

        <button
          className={`btn ${activeTab === 'safety' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('safety')}
        >
          <HardHat size={16} />
          <span>EHS Safety Induction</span>
        </button>

        <button
          className={`btn ${activeTab === 'it' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('it')}
        >
          <Fingerprint size={16} />
          <span>IT Biometrics</span>
        </button>

        <button
          className={`btn ${activeTab === 'camp' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('camp')}
        >
          <Home size={16} />
          <span>Camp Accommodation</span>
        </button>
      </div>

      {/* TAB 1: HR DASHBOARD */}
      {activeTab === 'hr' && (
        <div>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-info">
                <h3>Total Registrations</h3>
                <div className="stat-value">{stats.total}</div>
                <div className="stat-sub">Across 5 site contractors</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-solid)' }}>
                <Users size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Contractor Agencies</h3>
                <div className="stat-value">{Object.keys(stats.hr.contractorDistribution).length}</div>
                <div className="stat-sub">Active site vendors</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--purple-bg)', color: 'var(--purple-solid)' }}>
                <Layers size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Skill Categories</h3>
                <div className="stat-value">{Object.keys(stats.hr.tradeDistribution).length}</div>
                <div className="stat-sub">Specialized trades deployed</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-solid)' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '1.5rem' }}>
            {/* Contractor Deployment Table */}
            <div className="table-card">
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Contractor Agency Workforce Share</h4>
              </div>
              <div className="data-table-wrapper">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Contractor / Vendor Agency</th>
                      <th style={{ textAlign: 'right' }}>Workers Deployed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(stats.hr.contractorDistribution).map(([name, count]) => (
                      <tr key={name}>
                        <td style={{ fontWeight: 600 }}>{name}</td>
                        <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--brand-primary)' }}>
                          {count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Trade Distribution */}
            <div className="table-card">
              <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Skill Trade Classifications</h4>
              </div>
              <div style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  {Object.entries(stats.hr.tradeDistribution).map(([trade, count]) => {
                    const pct = Math.round((count / stats.total) * 100);
                    return (
                      <div key={trade}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', marginBottom: '0.3rem' }}>
                          <span style={{ fontWeight: 600 }}>{trade}</span>
                          <span style={{ color: 'var(--text-muted)' }}>{count} workers ({pct}%)</span>
                        </div>
                        <div style={{ height: '8px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', backgroundColor: 'var(--brand-primary)', borderRadius: '4px' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MEDICAL DASHBOARD */}
      {activeTab === 'medical' && (
        <div>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-info">
                <h3>Total Examined</h3>
                <div className="stat-value">{stats.medical.totalExamined}</div>
                <div className="stat-sub">Medical screenings completed</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-solid)' }}>
                <Stethoscope size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Certified Fit</h3>
                <div className="stat-value" style={{ color: 'var(--success-solid)' }}>{stats.medical.medicalFit}</div>
                <div className="stat-sub">Cleared for industrial duty</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-solid)' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Flagged Unfit</h3>
                <div className="stat-value" style={{ color: 'var(--danger-solid)' }}>{stats.medical.medicalUnfit}</div>
                <div className="stat-sub">Halted for contraindications</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--danger-bg)', color: 'var(--danger-solid)' }}>
                <XCircle size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Alcohol Screening</h3>
                <div className="stat-value">{stats.medical.alcoholFails === 0 ? '0' : stats.medical.alcoholFails}</div>
                <div className="stat-sub">Breathalyzer fail incidents</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-solid)' }}>
                <AlertTriangle size={22} />
              </div>
            </div>
          </div>

          {/* Medical Caselist */}
          <div className="table-card">
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Medical Examination Roster & Clinical Status</h4>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Worker</th>
                    <th>Blood Group</th>
                    <th>Vitals (Height/Weight/BMI)</th>
                    <th>BP (mmHg)</th>
                    <th>SpO2</th>
                    <th>RBS</th>
                    <th>Fitness Verdict</th>
                    <th>Clinical Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.filter(w => w.medical?.fitnessStatus).map(w => (
                    <tr key={w.id}>
                      <td>
                        <div style={{ fontWeight: 700 }}>{w.hr?.fullName}</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>{w.assignedWorkerId || w.id}</div>
                      </td>
                      <td><span className="badge badge-info">{w.medical?.bloodGroup}</span></td>
                      <td>
                        <div style={{ fontSize: '0.8rem' }}>{w.medical?.heightCm}cm / {w.medical?.weightKg}kg</div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>BMI: {w.medical?.bmi} ({w.medical?.bmiCategory})</div>
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: (w.medical?.bpSystolic > 140 || w.medical?.bpDiastolic > 90) ? 'var(--danger-solid)' : 'inherit' }}>
                          {w.medical?.bpSystolic}/{w.medical?.bpDiastolic}
                        </span>
                      </td>
                      <td>{w.medical?.spo2}%</td>
                      <td>{w.medical?.rbs} mg/dL</td>
                      <td>
                        <span className={`badge badge-${w.medical?.fitnessStatus === 'FIT' ? 'success' : 'danger'}`}>
                          {w.medical?.fitnessStatus}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.775rem', maxWidth: '280px', color: 'var(--text-secondary)' }}>
                        {w.medical?.remarks || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: SAFETY DASHBOARD */}
      {activeTab === 'safety' && (
        <div>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-info">
                <h3>Induction Briefings</h3>
                <div className="stat-value">{stats.safety.safetyBriefed}</div>
                <div className="stat-sub">Workers completed EHS training</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--purple-bg)', color: 'var(--purple-solid)' }}>
                <HardHat size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Safety Officers</h3>
                <div className="stat-value">1 Active</div>
                <div className="stat-sub">Jithendra Parida (EHS Lead)</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-solid)' }}>
                <Users size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>PPE Kits Dispatched</h3>
                <div className="stat-value">
                  {Object.values(stats.safety.ppeTotals).reduce((a, b) => a + b, 0)}
                </div>
                <div className="stat-sub">Total safety gear items issued</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-solid)' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>
          </div>

          {/* PPE Consumption Ledger */}
          <div className="table-card">
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Mandatory PPE Equipment Issuance Ledger</h4>
            </div>
            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
                {PPE_ITEMS.map(item => {
                  const issuedCount = stats.safety.ppeTotals[item.id] || 0;
                  return (
                    <div
                      key={item.id}
                      style={{
                        padding: '1rem',
                        borderRadius: 'var(--radius-md)',
                        backgroundColor: 'var(--bg-surface-subtle)',
                        border: '1px solid var(--border-light)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--text-primary)' }}>
                          {item.label}
                        </div>
                        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                          Verified upon gate entry
                        </div>
                      </div>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: 800,
                        color: 'var(--purple-solid)',
                        padding: '0.2rem 0.65rem',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'var(--purple-bg)'
                      }}>
                        {issuedCount}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: IT DASHBOARD */}
      {activeTab === 'it' && (
        <div>
          <div className="dashboard-grid">
            <div className="stat-card">
              <div className="stat-info">
                <h3>Biometrics Enrolled</h3>
                <div className="stat-value">{stats.it.biometricsDone}</div>
                <div className="stat-sub">Face punch attendance registered</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-solid)' }}>
                <Fingerprint size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>Worker IDs Issued</h3>
                <div className="stat-value">{stats.it.idsGenerated}</div>
                <div className="stat-sub">Official LME-2026 codes</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-solid)' }}>
                <CheckCircle2 size={22} />
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-info">
                <h3>CWMS Sync Status</h3>
                <div className="stat-value" style={{ color: 'var(--success-solid)' }}>100%</div>
                <div className="stat-sub">Turnstile access master connected</div>
              </div>
              <div className="stat-icon" style={{ backgroundColor: 'var(--purple-bg)', color: 'var(--purple-solid)' }}>
                <Activity size={22} />
              </div>
            </div>
          </div>

          <div className="table-card">
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Digital Biometrics & Identity Master Roster</h4>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Worker Name</th>
                    <th>Official Worker ID</th>
                    <th>Face Biometric Status</th>
                    <th>CWMS Sync</th>
                    <th>Campus Master Upload</th>
                    <th>IT Admin Signature</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.filter(w => w.it).map(w => (
                    <tr key={w.id}>
                      <td style={{ fontWeight: 700 }}>{w.hr?.fullName}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 700, color: 'var(--brand-primary)' }}>
                          {w.assignedWorkerId || 'PENDING'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge badge-${w.it?.faceBiometricRegistered ? 'success' : 'danger'}`}>
                          {w.it?.faceBiometricRegistered ? 'ENROLLED (YES)' : 'MISSING (NO)'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-info">
                          {w.it?.cwmsRegistered ? 'SYNCHRONIZED' : 'PENDING'}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-success">
                          {w.it?.campusMasterUploaded ? 'UPLOADED' : 'PENDING'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {w.it?.itAdminSignature || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CAMP DASHBOARD */}
      {activeTab === 'camp' && (
        <div>
          <div className="dashboard-grid">
            {CAMPS.map(campName => {
              const campData = stats.camp[campName] || { capacity: 100, occupied: 0 };
              const vacant = campData.capacity - campData.occupied;
              const occRate = ((campData.occupied / campData.capacity) * 100).toFixed(1);

              return (
                <div key={campName} className="stat-card" style={{ flexDirection: 'column', gap: '0.75rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <div>
                      <h3 style={{ fontSize: '0.9rem', color: 'var(--text-primary)', fontWeight: 800 }}>{campName}</h3>
                      <div className="stat-value">{campData.occupied} <span style={{ fontSize: '1rem', color: 'var(--text-muted)' }}>/ {campData.capacity} Beds</span></div>
                    </div>
                    <div className="stat-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-solid)' }}>
                      <Home size={22} />
                    </div>
                  </div>

                  <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.25rem' }}>
                      <span>Occupancy Rate</span>
                      <span style={{ fontWeight: 700 }}>{occRate}% ({vacant} Vacant)</span>
                    </div>
                    <div style={{ height: '8px', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${occRate}%`, height: '100%', backgroundColor: 'var(--warning-solid)', borderRadius: '4px' }}></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bed Allocation Roster */}
          <div className="table-card">
            <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)' }}>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Camp Housing & Living Quarters Allocation Map</h4>
            </div>
            <div className="data-table-wrapper">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Worker Name</th>
                    <th>Worker ID</th>
                    <th>Camp Facility</th>
                    <th>Block / Wing</th>
                    <th>Room No.</th>
                    <th>Bed Assigned</th>
                    <th>Gate Pass Status</th>
                    <th>Allocated Date</th>
                  </tr>
                </thead>
                <tbody>
                  {workers.filter(w => w.camp?.campName).map(w => (
                    <tr key={w.id}>
                      <td style={{ fontWeight: 700 }}>{w.hr?.fullName}</td>
                      <td style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 700 }}>{w.assignedWorkerId}</td>
                      <td><strong>{w.camp.campName}</strong></td>
                      <td>{w.camp.blockNumber}</td>
                      <td>{w.camp.roomNumber}</td>
                      <td><span className="badge badge-purple">{w.camp.bedNumber}</span></td>
                      <td>
                        <span className="badge badge-success">ACTIVE GATE PASS</span>
                      </td>
                      <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {w.camp.allocationDate || '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
