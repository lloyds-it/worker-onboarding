import React from 'react';
import { 
  Users, 
  ShieldCheck, 
  FileText, 
  Activity, 
  BarChart3, 
  UserPlus, 
  Building2, 
  RefreshCw, 
  Printer, 
  History, 
  HardHat, 
  Stethoscope, 
  Fingerprint, 
  Home, 
  LogOut,
  UserCog,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  CreditCard
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useWorkers } from '../../context/WorkerContext';
import { ROLES, STAGES } from '../../types/constants';
import logoMetals from '../../assets/logo_metals.png';
import logoInfra from '../../assets/logo_infra.png';

export const Sidebar = ({ 
  activeView, 
  setActiveView, 
  onOpenNewWorkerModal, 
  isCollapsed = false, 
  onToggleCollapse 
}) => {
  const { currentRole, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { workers, resetAllData } = useWorkers();

  const activeCount = workers.length;
  const completedCount = workers.filter(w => w.stage === STAGES.COMPLETED).length;
  const inProgressCount = workers.filter(w => w.stage > 0 && w.stage < STAGES.COMPLETED).length;
  const flaggedCount = workers.filter(w => w.stage === STAGES.FLAGGED).length;

  const isAdmin = currentRole === ROLES.ADMIN;
  const isHR = currentRole === ROLES.HR;
  const isMedical = currentRole === ROLES.MEDICAL;
  const isSafety = currentRole === ROLES.SAFETY;
  const isIT = currentRole === ROLES.IT;
  const isCamp = currentRole === ROLES.CAMP;

  return (
    <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Brand Header with strict containment and collapse toggle */}
      <div className="sidebar-brand">
        {isCollapsed ? (
          <button
            id="btn-sidebar-collapse"
            className="sidebar-collapse-btn collapsed-brand-toggle"
            onClick={onToggleCollapse}
            title="Expand Sidebar"
            aria-label="Expand Sidebar"
          >
            <ChevronRight size={18} />
          </button>
        ) : (
          <>
            <div className="sidebar-brand-expanded">
              <div className="sidebar-brand-logos">
                <img 
                  src={logoInfra} 
                  alt="Lloyds Infra" 
                  className="brand-logo-infra"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div className="sidebar-logo-divider" />
                <img 
                  src={logoMetals} 
                  alt="Lloyds Metals & Energy" 
                  className="brand-logo-metals"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
              </div>

              {onToggleCollapse && (
                <button
                  id="btn-sidebar-collapse"
                  className="sidebar-collapse-btn"
                  onClick={onToggleCollapse}
                  title="Collapse Sidebar"
                  aria-label="Collapse Sidebar"
                >
                  <ChevronLeft size={16} />
                </button>
              )}
            </div>

            <div className="sidebar-title-block">
              <h1>LLOYDS METALS & INFRA</h1>
              <span>Worker Induction & Camp System</span>
            </div>
          </>
        )}
      </div>

      <nav className="sidebar-nav">
        {/* ================= ADMIN SPECIFIC NAVIGATION ================= */}
        {isAdmin && (
          <>
            <div className="nav-section-title">Executive Governance</div>
            
            <button
              id="nav-admin-center"
              className={`nav-item ${activeView === 'admin_dashboard' ? 'active' : ''}`}
              onClick={() => setActiveView('admin_dashboard')}
              data-tooltip="Admin Command Center"
              title={isCollapsed ? "Admin Command Center" : undefined}
            >
              <ShieldCheck size={18} />
              <span>Admin Command Center</span>
            </button>

            <button
              id="nav-pipeline"
              className={`nav-item ${activeView === 'pipeline' ? 'active' : ''}`}
              onClick={() => setActiveView('pipeline')}
              data-tooltip="Master Pipeline Roster"
              title={isCollapsed ? "Master Pipeline Roster" : undefined}
            >
              <Users size={18} />
              <span>Master Pipeline Roster</span>
              <span className="nav-counter">{activeCount}</span>
            </button>

            <button
              id="nav-dept-dashboards"
              className={`nav-item ${activeView === 'dept_dashboards' ? 'active' : ''}`}
              onClick={() => setActiveView('dept_dashboards')}
              data-tooltip="All Department Dashboards"
              title={isCollapsed ? "All Department Dashboards" : undefined}
            >
              <Building2 size={18} />
              <span>All Department Dashboards</span>
            </button>

            <div className="nav-section-title">Reports, Security & Staff</div>

            <button
              id="nav-user-mgmt"
              className={`nav-item ${activeView === 'user_management' ? 'active' : ''}`}
              onClick={() => setActiveView('user_management')}
              data-tooltip="Staff, Roles & Enterprise SSO"
              title={isCollapsed ? "Staff, Roles & Enterprise SSO" : undefined}
            >
              <UserCog size={18} />
              <span>Staff, Roles &amp; SSO</span>
            </button>

            <button
              id="nav-reports"
              className={`nav-item ${activeView === 'reports' ? 'active' : ''}`}
              onClick={() => setActiveView('reports')}
              data-tooltip="Executive Reports & CSV"
              title={isCollapsed ? "Executive Reports & CSV" : undefined}
            >
              <BarChart3 size={18} />
              <span>Executive Reports & CSV</span>
            </button>

            <button
              id="nav-admin-id-cards"
              className={`nav-item ${activeView === 'id_card' ? 'active' : ''}`}
              onClick={() => setActiveView('id_card')}
              data-tooltip="Generate Gate Pass ID Cards"
              title={isCollapsed ? "Generate Gate Pass ID Cards" : undefined}
            >
              <CreditCard size={18} />
              <span>Gate Pass ID Cards</span>
            </button>

            <button
              id="nav-audit-trail"
              className={`nav-item ${activeView === 'audit_log' ? 'active' : ''}`}
              onClick={() => setActiveView('audit_log')}
              data-tooltip="System Compliance Audit"
              title={isCollapsed ? "System Compliance Audit" : undefined}
            >
              <History size={18} />
              <span>System Compliance Audit</span>
            </button>
          </>
        )}

        {/* ================= HR SPECIFIC NAVIGATION ================= */}
        {isHR && (
          <>
            <div className="nav-section-title">HR Operations (Step 1)</div>

            <button
              id="nav-pipeline"
              className={`nav-item ${activeView === 'pipeline' ? 'active' : ''}`}
              onClick={() => setActiveView('pipeline')}
              data-tooltip="Worker Pipeline"
              title={isCollapsed ? "Worker Pipeline" : undefined}
            >
              <Users size={18} />
              <span>Worker Pipeline</span>
              <span className="nav-counter">{activeCount}</span>
            </button>

            <button
              id="nav-new-worker"
              className="nav-item"
              style={{ color: '#FCD34D' }}
              onClick={onOpenNewWorkerModal}
              data-tooltip="Register Worker (Step 1)"
              title={isCollapsed ? "Register Worker (Step 1)" : undefined}
            >
              <UserPlus size={18} />
              <span>+ Register Worker (Step 1)</span>
            </button>

            <button
              id="nav-dept-dashboards"
              className={`nav-item ${activeView === 'dept_dashboards' ? 'active' : ''}`}
              onClick={() => setActiveView('dept_dashboards')}
              data-tooltip="HR Department Dashboard"
              title={isCollapsed ? "HR Department Dashboard" : undefined}
            >
              <Building2 size={18} />
              <span>HR Department Dashboard</span>
            </button>

            <button
              id="nav-induction-form"
              className={`nav-item ${activeView === 'induction_doc' ? 'active' : ''}`}
              onClick={() => setActiveView('induction_doc')}
              data-tooltip="Print Induction Form"
              title={isCollapsed ? "Print Induction Form" : undefined}
            >
              <Printer size={18} />
              <span>Print Induction Form</span>
            </button>

            <button
              id="nav-hr-id-cards"
              className={`nav-item ${activeView === 'id_card' ? 'active' : ''}`}
              onClick={() => setActiveView('id_card')}
              data-tooltip="Generate Gate Pass ID Cards"
              title={isCollapsed ? "Generate Gate Pass ID Cards" : undefined}
            >
              <CreditCard size={18} />
              <span>Gate Pass ID Cards</span>
            </button>
          </>
        )}

        {/* ================= MEDICAL SPECIFIC NAVIGATION ================= */}
        {isMedical && (
          <>
            <div className="nav-section-title">Medical Health (Step 2)</div>

            <button
              id="nav-pipeline"
              className={`nav-item ${activeView === 'pipeline' ? 'active' : ''}`}
              onClick={() => setActiveView('pipeline')}
              data-tooltip="Medical Screening Queue"
              title={isCollapsed ? "Medical Screening Queue" : undefined}
            >
              <Stethoscope size={18} />
              <span>Medical Screening Queue</span>
              <span className="nav-counter">
                {workers.filter(w => w.stage === STAGES.MEDICAL).length}
              </span>
            </button>

            <button
              id="nav-dept-dashboards"
              className={`nav-item ${activeView === 'dept_dashboards' ? 'active' : ''}`}
              onClick={() => setActiveView('dept_dashboards')}
              data-tooltip="Medical Vitals Dashboard"
              title={isCollapsed ? "Medical Vitals Dashboard" : undefined}
            >
              <Activity size={18} />
              <span>Medical Vitals Dashboard</span>
            </button>

            <button
              id="nav-induction-form"
              className={`nav-item ${activeView === 'induction_doc' ? 'active' : ''}`}
              onClick={() => setActiveView('induction_doc')}
              data-tooltip="Print Medical Dossier"
              title={isCollapsed ? "Print Medical Dossier" : undefined}
            >
              <Printer size={18} />
              <span>Print Medical Dossier</span>
            </button>
          </>
        )}

        {/* ================= SAFETY SPECIFIC NAVIGATION ================= */}
        {isSafety && (
          <>
            <div className="nav-section-title">EHS Safety Induction (Step 3)</div>

            <button
              id="nav-pipeline"
              className={`nav-item ${activeView === 'pipeline' ? 'active' : ''}`}
              onClick={() => setActiveView('pipeline')}
              data-tooltip="Safety Induction Queue"
              title={isCollapsed ? "Safety Induction Queue" : undefined}
            >
              <HardHat size={18} />
              <span>Safety Induction Queue</span>
              <span className="nav-counter">
                {workers.filter(w => w.stage === STAGES.SAFETY).length}
              </span>
            </button>

            <button
              id="nav-dept-dashboards"
              className={`nav-item ${activeView === 'dept_dashboards' ? 'active' : ''}`}
              onClick={() => setActiveView('dept_dashboards')}
              data-tooltip="PPE Equipment Ledger"
              title={isCollapsed ? "PPE Equipment Ledger" : undefined}
            >
              <ShieldCheck size={18} />
              <span>PPE Equipment Ledger</span>
            </button>

            <button
              id="nav-induction-form"
              className={`nav-item ${activeView === 'induction_doc' ? 'active' : ''}`}
              onClick={() => setActiveView('induction_doc')}
              data-tooltip="Print Safety Sheet"
              title={isCollapsed ? "Print Safety Sheet" : undefined}
            >
              <Printer size={18} />
              <span>Print Safety Sheet</span>
            </button>
          </>
        )}

        {/* ================= IT SPECIFIC NAVIGATION ================= */}
        {isIT && (
          <>
            <div className="nav-section-title">IT Biometrics (Step 4)</div>

            <button
              id="nav-pipeline"
              className={`nav-item ${activeView === 'pipeline' ? 'active' : ''}`}
              onClick={() => setActiveView('pipeline')}
              data-tooltip="IT Enrollment Queue"
              title={isCollapsed ? "IT Enrollment Queue" : undefined}
            >
              <Fingerprint size={18} />
              <span>IT Enrollment Queue</span>
              <span className="nav-counter">
                {workers.filter(w => w.stage === STAGES.IT).length}
              </span>
            </button>

            <button
              id="nav-dept-dashboards"
              className={`nav-item ${activeView === 'dept_dashboards' ? 'active' : ''}`}
              onClick={() => setActiveView('dept_dashboards')}
              data-tooltip="IT Systems & CWMS Sync"
              title={isCollapsed ? "IT Systems & CWMS Sync" : undefined}
            >
              <Activity size={18} />
              <span>IT Systems & CWMS Sync</span>
            </button>

            <button
              id="nav-induction-form"
              className={`nav-item ${activeView === 'induction_doc' ? 'active' : ''}`}
              onClick={() => setActiveView('induction_doc')}
              data-tooltip="Print IT Master Record"
              title={isCollapsed ? "Print IT Master Record" : undefined}
            >
              <Printer size={18} />
              <span>Print IT Master Record</span>
            </button>
          </>
        )}

        {/* ================= CAMP SPECIFIC NAVIGATION ================= */}
        {isCamp && (
          <>
            <div className="nav-section-title">Camp Housing (Step 5)</div>

            <button
              id="nav-pipeline"
              className={`nav-item ${activeView === 'pipeline' ? 'active' : ''}`}
              onClick={() => setActiveView('pipeline')}
              data-tooltip="Accommodation Queue"
              title={isCollapsed ? "Accommodation Queue" : undefined}
            >
              <Home size={18} />
              <span>Accommodation Queue</span>
              <span className="nav-counter">
                {workers.filter(w => w.stage === STAGES.CAMP).length}
              </span>
            </button>

            <button
              id="nav-dept-dashboards"
              className={`nav-item ${activeView === 'dept_dashboards' ? 'active' : ''}`}
              onClick={() => setActiveView('dept_dashboards')}
              data-tooltip="Gondwana Bed Capacity"
              title={isCollapsed ? "Gondwana Bed Capacity" : undefined}
            >
              <Building2 size={18} />
              <span>Gondwana Bed Capacity</span>
            </button>

            <button
              id="nav-induction-form"
              className={`nav-item ${activeView === 'induction_doc' ? 'active' : ''}`}
              onClick={() => setActiveView('induction_doc')}
              data-tooltip="Print Gate Pass Record"
              title={isCollapsed ? "Print Gate Pass Record" : undefined}
            >
              <Printer size={18} />
              <span>Print Gate Pass Record</span>
            </button>
          </>
        )}

        {/* Footer info, Theme Toggle & Session Controls */}
        <div style={{ marginTop: 'auto', paddingTop: '1.25rem' }}>
          {/* Stats Box (Hidden when collapsed) */}
          <div className="sidebar-stat-box" style={{
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderRadius: '8px',
            padding: '0.85rem',
            marginBottom: '0.65rem'
          }}>
            <div style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: 600, marginBottom: '0.4rem' }}>
              SITE GATE STATS
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '0.2rem' }}>
              <span style={{ color: '#CBD5E1' }}>Active Gate Pass:</span>
              <span style={{ color: '#34D399', fontWeight: 700 }}>{completedCount}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem' }}>
              <span style={{ color: '#CBD5E1' }}>Medical Flagged:</span>
              <span style={{ color: '#F87171', fontWeight: 700 }}>{flaggedCount}</span>
            </div>
          </div>

          {/* Theme Mode Toggle (Day / Night) */}
          <button
            id="btn-sidebar-theme-toggle"
            className="sidebar-theme-btn"
            onClick={toggleTheme}
            title={isDark ? "Switch to Day Mode (Light)" : "Switch to Night Mode (Dark)"}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              fontSize: '0.725rem',
              color: isDark ? '#F59E0B' : '#CBD5E1',
              width: '100%',
              padding: '0.5rem',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.12)',
              marginBottom: '0.5rem',
              backgroundColor: isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(255,255,255,0.06)',
              cursor: 'pointer'
            }}
          >
            {isDark ? <Sun size={15} color="#F59E0B" /> : <Moon size={15} color="#CBD5E1" />}
            {!isCollapsed && (
              <span style={{ fontWeight: 600 }}>{isDark ? 'Day Mode (Light)' : 'Night Mode (Dark)'}</span>
            )}
          </button>

          {/* Reset & Logout Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', flexDirection: isCollapsed ? 'column' : 'row' }}>
            <button
              onClick={resetAllData}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontSize: '0.725rem',
                color: '#94A3B8',
                flex: 1,
                padding: '0.45rem',
                borderRadius: '6px',
                border: '1px solid rgba(255,255,255,0.1)'
              }}
              title="Reload initial verified demo workers"
            >
              <RefreshCw size={13} />
              {!isCollapsed && <span>Reset</span>}
            </button>

            <button
              onClick={logout}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
                fontSize: '0.725rem',
                color: '#F87171',
                padding: '0.45rem 0.65rem',
                borderRadius: '6px',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                backgroundColor: 'rgba(239, 68, 68, 0.1)'
              }}
              title="Sign out of current department session"
            >
              <LogOut size={13} />
              {!isCollapsed && <span>Logout</span>}
            </button>
          </div>
        </div>
      </nav>
    </aside>
  );
};
