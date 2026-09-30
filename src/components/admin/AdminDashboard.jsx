import React from 'react';
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
  CreditCard
} from 'lucide-react';
import { useWorkers } from '../../context/WorkerContext';
import { getDepartmentStats } from '../../services/reportService';
import { STAGES } from '../../types/constants';

export const AdminDashboard = ({ onNavigateToDept, onNavigateToReports, onNavigateToAudit, onNavigateToUsers, onNavigateToIdCard }) => {
  const { workers } = useWorkers();

  const stats = getDepartmentStats(workers);

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

      {/* KPI Cards Grid */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Registered</h3>
            <div className="stat-value">{stats.total}</div>
            <div className="stat-sub">
              <span style={{ color: 'var(--info-solid)', fontWeight: 700 }}>100%</span>
              <span>across all contractors</span>
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
      </div>
    </div>
  );
};
