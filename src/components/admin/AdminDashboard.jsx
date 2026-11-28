import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Activity, 
  Home, 
  AlertOctagon, 
  CheckCircle2, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  HardHat,
  Stethoscope,
  Fingerprint,
  Building2,
  UserCog,
  CreditCard,
  Briefcase,
  Calendar
} from 'lucide-react';
import { useWorkers } from '../../context/WorkerContext';
import { getDepartmentStats, filterWorkersByDateRange } from '../../services/reportService';
import { STAGES } from '../../types/constants';

export const AdminDashboard = ({ onNavigateToDept, onNavigateToReports, onNavigateToAudit, onNavigateToUsers, onNavigateToIdCard, onNavigateToContractors }) => {
  const { workers } = useWorkers();
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const applyDatePreset = (daysBack) => {
    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - daysBack);
    setFromDate(start.toISOString().slice(0, 10));
    setToDate(end.toISOString().slice(0, 10));
  };

  const filteredWorkers = filterWorkersByDateRange(workers, fromDate, toDate);
  const stats = getDepartmentStats(filteredWorkers);

  const completedRate = stats.total > 0 
    ? ((stats.pipeline.completedCount / stats.total) * 100).toFixed(1) 
    : '0';

  const inProgressTotal = stats.pipeline.hrCount + 
    stats.pipeline.medicalCount + 
    stats.pipeline.safetyCount + 
    stats.pipeline.itCount + 
    stats.pipeline.campCount;

  return (
    <div>
      {/* Header Banner */}
      <div style={{
        backgroundColor: 'var(--brand-navy)',
        color: '#FFFFFF',
        borderRadius: 'var(--radius-lg)',
        padding: '1.75rem 2rem',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-md)'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '0.4rem' }}>
            <span className="badge badge-purple" style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF' }}>
              CHIEF ADMINISTRATOR CONTROL CENTER
            </span>
            <span style={{ fontSize: '0.75rem', color: '#94A3B8' }}>
              System Health: Optimal (OWASP ASVS & WCAG Compliant)
            </span>
          </div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
            Worker Induction & Camp Operations Oversight
          </h2>
          <p style={{ color: '#CBD5E1', fontSize: '0.875rem', maxWidth: '650px', marginTop: '0.25rem' }}>
            Unified real-time visibility across HR, Medical, EHS Safety, IT Digital Enrollment, and Gondwana Camp Accommodation.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          {onNavigateToIdCard && (
            <button 
              id="btn-admin-goto-idcards"
              className="btn btn-secondary"
              style={{ backgroundColor: 'rgba(255,255,255,0.2)', color: '#FFF', borderColor: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'center', gap: '0.45rem', fontWeight: 700 }}
              onClick={onNavigateToIdCard}
              title="Generate Official Temporary Gate Pass ID Cards (Front & Back)"
            >
              <CreditCard size={16} />
              <span>Generate ID Cards</span>
            </button>
          )}
          {onNavigateToUsers && (
            <button 
              id="btn-admin-goto-users"
              className="btn btn-secondary"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)', color: '#FFF', borderColor: 'rgba(255,255,255,0.3)', display: 'flex', alignItems: 'center', gap: '0.45rem' }}
              onClick={onNavigateToUsers}
            >
              <UserCog size={16} />
              <span>Staff &amp; Enterprise SSO</span>
            </button>
          )}
          <button 
            className="btn btn-primary"
            onClick={onNavigateToReports}
          >
            Executive Reports & CSV
          </button>
          <button 
            className="btn btn-secondary"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: '#FFF', borderColor: 'rgba(255,255,255,0.2)' }}
            onClick={onNavigateToAudit}
          >
            Audit Trail
          </button>
        </div>
      </div>

      {/* Date Filter Bar for Date-Wise Registration Analytics */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.85rem',
        padding: '0.9rem 1.25rem',
        marginBottom: '1.25rem',
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
          <Calendar size={18} color="var(--brand-primary)" />
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Registration Date Filter
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {fromDate || toDate
                ? `Showing ${filteredWorkers.length} of ${workers.length} workers (${fromDate || '...'} to ${toDate || '...'})`
                : `Showing all ${workers.length} registrations across all dates`}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '0.5rem' }}>
          <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={() => applyDatePreset(0)}>
            Today
          </button>
          <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={() => applyDatePreset(6)}>
            Last 7 Days
          </button>
          <button type="button" className="btn btn-secondary" style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }} onClick={() => applyDatePreset(29)}>
            Last 30 Days
          </button>
          <input
            id="admin-filter-from-date"
            type="date"
            className="form-control"
            style={{ width: 'auto', padding: '0.32rem 0.55rem', fontSize: '0.78rem' }}
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            aria-label="Filter registrations from date"
          />
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>to</span>
          <input
            id="admin-filter-to-date"
            type="date"
            className="form-control"
            style={{ width: 'auto', padding: '0.32rem 0.55rem', fontSize: '0.78rem' }}
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            aria-label="Filter registrations to date"
          />
          {(fromDate || toDate) && (
            <button
              type="button"
              className="btn btn-secondary"
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
              onClick={() => { setFromDate(''); setToDate(''); }}
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Registered</h3>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-sub">
              <span style={{ color: 'var(--info-solid)', fontWeight: 700 }}>
                Avg {stats.timing.full.label}
              </span>
              <span>
                full registration ({stats.timing.full.count} completed)
              </span>
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-solid)' }}>
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Active In Pipeline</h3>
            <div className="stat-value">{inProgressTotal}</div>
            <div className="stat-sub">
              <span style={{ color: 'var(--warning-solid)', fontWeight: 700 }}>{inProgressTotal}</span>
              <span>in stages 1 through 5</span>
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--warning-bg)', color: 'var(--warning-solid)' }}>
            <Clock size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Medical Fitness Rate</h3>
            <div className="stat-value">{stats.medical.fitRate}%</div>
            <div className="stat-sub">
              <span style={{ color: 'var(--success-solid)', fontWeight: 700 }}>{stats.medical.medicalFit} FIT</span>
              <span>vs {stats.medical.medicalUnfit} UNFIT</span>
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-solid)' }}>
            <Activity size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Gate Passes Active</h3>
            <div className="stat-value">{stats.pipeline.completedCount}</div>
            <div className="stat-sub">
              <span style={{ color: 'var(--success-solid)', fontWeight: 700 }}>{completedRate}%</span>
              <span>onboarding velocity</span>
            </div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-solid)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>
      </div>

      {/* Stage-Wise Average Submission Time & Date-Wise Registrations */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* Stage-Wise Average Time Taken to Submit */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Clock size={18} color="var(--brand-primary)" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Stage-Wise Average Submission Time
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              Full Avg: {stats.timing.full.label}
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            {[
              { label: 'Step 2: Medical Exam', stat: stats.timing.stages.medical, color: '#0369A1', bg: '#F0F9FF' },
              { label: 'Step 3: EHS Safety', stat: stats.timing.stages.safety, color: '#B45309', bg: '#FFFBEB' },
              { label: 'Step 4: IT Biometrics', stat: stats.timing.stages.it, color: '#6D28D9', bg: '#F5F3FF' },
              { label: 'Step 5: Camp Allocation', stat: stats.timing.stages.camp, color: '#047857', bg: '#ECFDF5' }
            ].map(item => (
              <div
                key={item.label}
                style={{
                  padding: '0.8rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: item.bg,
                  border: '1px solid var(--border-light)'
                }}
              >
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                  {item.label}
                </div>
                <div style={{ fontSize: '1.2rem', fontWeight: 800, color: item.color }}>
                  {item.stat.label}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  Across {item.stat.count} submission{item.stat.count === 1 ? '' : 's'}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Date-Wise Registrations Breakdown */}
        <div style={{
          backgroundColor: 'var(--bg-surface)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-lg)',
          padding: '1.25rem',
          boxShadow: 'var(--shadow-xs)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="var(--info-solid)" />
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                Date-Wise Registrations
              </h3>
            </div>
            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {stats.hr.dateWiseRegistrations.length} day{stats.hr.dateWiseRegistrations.length === 1 ? '' : 's'}
            </span>
          </div>

          <div style={{ maxHeight: '215px', overflowY: 'auto' }}>
            {stats.hr.dateWiseRegistrations.length === 0 ? (
              <div style={{ padding: '1.5rem', textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                No registrations found in the selected date range.
              </div>
            ) : (
              <table className="data-table" style={{ fontSize: '0.78rem' }}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Registered</th>
                    <th>Completed</th>
                    <th>In Progress</th>
                    <th>Unfit</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.hr.dateWiseRegistrations.map(row => (
                    <tr
                      key={row.date}
                      style={{ cursor: row.date !== 'Unknown' ? 'pointer' : 'default' }}
                      onClick={() => {
                        if (row.date !== 'Unknown') {
                          setFromDate(row.date);
                          setToDate(row.date);
                        }
                      }}
                      title={row.date !== 'Unknown' ? `Click to filter dashboard to ${row.date}` : undefined}
                    >
                      <td style={{ fontWeight: 700, fontFamily: 'var(--font-family-mono)' }}>{row.date}</td>
                      <td style={{ fontWeight: 700 }}>{row.total}</td>
                      <td style={{ color: 'var(--success-solid)', fontWeight: 700 }}>{row.completed}</td>
                      <td style={{ color: 'var(--warning-solid)', fontWeight: 600 }}>{row.inProgress}</td>
                      <td style={{ color: 'var(--danger-solid)', fontWeight: 600 }}>{row.flagged}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>

      {/* Department Cards Quick Jump */}
      <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1rem' }}>
        Department Operational Hubs
      </h3>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2rem'
      }}>
        {/* HR Hub */}
        <div 
          onClick={() => onNavigateToDept('hr')}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: 'var(--shadow-xs)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'var(--info-bg)', color: 'var(--info-solid)' }}>
                <Users size={18} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>HR Operations</h4>
            </div>
            <ArrowUpRight size={18} color="var(--text-muted)" />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Candidate intake, contractor deployment licensing, and trade distribution tracking.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Pending in HR:</span>
            <span style={{ fontWeight: 700 }}>{stats.pipeline.hrCount} Workers</span>
          </div>
        </div>

        {/* Medical Hub */}
        <div 
          onClick={() => onNavigateToDept('medical')}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: 'var(--shadow-xs)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-solid)' }}>
                <Stethoscope size={18} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Medical & Health</h4>
            </div>
            <ArrowUpRight size={18} color="var(--text-muted)" />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Clinical examinations, vitals tracking, alcohol tests, and FIT/UNFIT stage routing.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Flagged Unfit:</span>
            <span style={{ fontWeight: 700, color: 'var(--danger-solid)' }}>{stats.pipeline.flaggedCount} Cases</span>
          </div>
        </div>

        {/* Safety Hub */}
        <div 
          onClick={() => onNavigateToDept('safety')}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: 'var(--shadow-xs)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'var(--purple-bg)', color: 'var(--purple-solid)' }}>
                <HardHat size={18} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>EHS Safety Team</h4>
            </div>
            <ArrowUpRight size={18} color="var(--text-muted)" />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Site hazards briefing, mandatory PPE kit dispatch, and safety officer certifications.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Briefings Certified:</span>
            <span style={{ fontWeight: 700, color: 'var(--purple-solid)' }}>{stats.safety.safetyBriefed} Inducted</span>
          </div>
        </div>

        {/* IT Hub */}
        <div 
          onClick={() => onNavigateToDept('it')}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: 'var(--shadow-xs)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'var(--info-bg)', color: 'var(--info-solid)' }}>
                <Fingerprint size={18} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>IT Biometrics</h4>
            </div>
            <ArrowUpRight size={18} color="var(--text-muted)" />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Face punch attendance setup, CWMS master synchronization, and worker ID generation.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Face Biometrics:</span>
            <span style={{ fontWeight: 700, color: 'var(--info-solid)' }}>{stats.it.biometricsDone} Enrolled</span>
          </div>
        </div>

        {/* Camp Hub */}
        <div 
          onClick={() => onNavigateToDept('camp')}
          style={{
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-light)',
            borderRadius: 'var(--radius-lg)',
            padding: '1.25rem',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
            boxShadow: 'var(--shadow-xs)'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'var(--warning-bg)', color: 'var(--warning-solid)' }}>
                <Home size={18} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Camp Management</h4>
            </div>
            <ArrowUpRight size={18} color="var(--text-muted)" />
          </div>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Gondwana Phase 3 & 4 room and bed allocations, block occupancy, and gate pass release.
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Beds Occupied:</span>
            <span style={{ fontWeight: 700, color: 'var(--success-solid)' }}>
              {stats.camp['Gondwana Phase 3'].occupied + stats.camp['Gondwana Phase 4'].occupied} Beds
            </span>
          </div>
        </div>
        {/* Contractor Master Hub */}
        {onNavigateToContractors && (
          <div
            onClick={onNavigateToContractors}
            style={{
              backgroundColor: 'var(--bg-surface)',
              border: '1px solid var(--border-light)',
              borderRadius: 'var(--radius-lg)',
              padding: '1.25rem',
              cursor: 'pointer',
              transition: 'all var(--transition-fast)',
              boxShadow: 'var(--shadow-xs)'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <div style={{ padding: '0.5rem', borderRadius: '8px', backgroundColor: 'var(--brand-primary)', color: '#FFF' }}>
                  <Briefcase size={18} />
                </div>
                <h4 style={{ fontWeight: 700, fontSize: '0.95rem' }}>Contractor Master</h4>
              </div>
              <ArrowUpRight size={18} color="var(--text-muted)" />
            </div>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
              Manage contractor/agency company details, compliance codes, PF/ESIC, GST, and validity.
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', borderTop: '1px solid var(--border-light)', paddingTop: '0.5rem' }}>
              <span style={{ color: 'var(--text-muted)' }}>Registered:</span>
              <span style={{ fontWeight: 700, color: 'var(--brand-primary)' }}>Manage All Contractors →</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
