import React, { useState, useEffect, lazy, Suspense } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WorkerProvider, useWorkers } from './context/WorkerContext';
import { LoginPage } from './components/auth/LoginPage';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { PipelineOverview } from './components/dashboard/PipelineOverview';
import { WorkerTable } from './components/dashboard/WorkerTable';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { Toast } from './components/common/Toast';
import { ROLES, ROLE_LABELS, STAGES } from './types/constants';

// Lazily-loaded views for zero-latency initial bundle
const DepartmentDashboards = lazy(() => import('./components/admin/DepartmentDashboards').then(m => ({ default: m.DepartmentDashboards })));
const ReportsCenter = lazy(() => import('./components/admin/ReportsCenter').then(m => ({ default: m.ReportsCenter })));
const AuditLogViewer = lazy(() => import('./components/admin/AuditLogViewer').then(m => ({ default: m.AuditLogViewer })));
const PrintableInductionDoc = lazy(() => import('./components/induction/PrintableInductionDoc').then(m => ({ default: m.PrintableInductionDoc })));
const DedicatedStageProcessPage = lazy(() => import('./components/stages/DedicatedStageProcessPage').then(m => ({ default: m.DedicatedStageProcessPage })));
const DedicatedRegistrationPage = lazy(() => import('./components/stages/DedicatedRegistrationPage').then(m => ({ default: m.DedicatedRegistrationPage })));
const AdminOverrideModal = lazy(() => import('./components/admin/AdminOverrideModal').then(m => ({ default: m.AdminOverrideModal })));
const UserManagement = lazy(() => import('./components/admin/UserManagement').then(m => ({ default: m.UserManagement })));
const TemporaryGatePassIdCard = lazy(() => import('./components/induction/TemporaryGatePassIdCard').then(m => ({ default: m.default || m.TemporaryGatePassIdCard })));

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught view error:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          padding: '2.5rem',
          textAlign: 'center',
          backgroundColor: 'var(--bg-surface, #FFFFFF)',
          borderRadius: '12px',
          border: '1px solid var(--border-medium, #E2E8F0)',
          maxWidth: '620px',
          margin: '2rem auto',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--danger-text, #DC2626)', marginBottom: '0.75rem' }}>
            View Loading Notice
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary, #64748B)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
            {this.state.error?.message || 'An unexpected rendering issue occurred in this section.'}
          </p>
          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
            <button
              className="btn btn-secondary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                window.location.hash = '';
                window.location.reload();
              }}
            >
              Refresh App
            </button>
            <button
              className="btn btn-primary"
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onReset) this.props.onReset();
              }}
            >
              Return to Pipeline Roster
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const ViewSuspenseFallback = () => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '320px',
    gap: '0.85rem',
    color: 'var(--text-muted)'
  }}>
    <div style={{
      width: '32px',
      height: '32px',
      border: '3px solid var(--border-medium)',
      borderTopColor: 'var(--brand-primary, #E82329)',
      borderRadius: '50%',
      animation: 'spin 0.8s linear infinite'
    }} />
    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Loading view...</span>
  </div>
);

const VIEW_TO_HASH = {
  admin_dashboard: 'admin',
  pipeline: 'pipeline',
  register_worker: 'register',
  process_worker: 'process',
  dept_dashboards: 'departments',
  reports: 'reports',
  audit_log: 'audit',
  induction_doc: 'induction',
  id_card: 'idcard',
  user_management: 'users'
};

const HASH_TO_VIEW = {
  admin: 'admin_dashboard',
  pipeline: 'pipeline',
  register: 'register_worker',
  process: 'process_worker',
  departments: 'dept_dashboards',
  reports: 'reports',
  audit: 'audit_log',
  induction: 'induction_doc',
  idcard: 'id_card',
  users: 'user_management'
};

const AppContent = () => {
  const { isAuthenticated, currentRole } = useAuth();
  const { workers, toastMessage, activeWorker, setSelectedStageFilter } = useWorkers();

  // Collapsible sidebar state with local storage persistence
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    try {
      return localStorage.getItem('lloyd_sidebar_collapsed_v1') === 'true';
    } catch {
      return false;
    }
  });

  const handleToggleSidebarCollapse = () => {
    setIsSidebarCollapsed(prev => {
      const next = !prev;
      try {
        localStorage.setItem('lloyd_sidebar_collapsed_v1', String(next));
      } catch (err) {}
      return next;
    });
  };

  // Primary active views
  const [activeView, setActiveView] = useState('admin_dashboard');
  const [selectedDeptTab, setSelectedDeptTab] = useState('hr');
  
  // Workflows state
  const [processingWorker, setProcessingWorker] = useState(null);
  const [overrideWorker, setOverrideWorker] = useState(null);
  const [documentWorker, setDocumentWorker] = useState(null);
  const [idCardWorker, setIdCardWorker] = useState(null);

  // Synchronize URL Hash with activeView and browser history
  useEffect(() => {
    if (!isAuthenticated) return;

    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, '').trim();
      if (!rawHash) {
        const defaultView = currentRole === ROLES.ADMIN ? 'admin_dashboard' : 'pipeline';
        setActiveView(defaultView);
        return;
      }

      const [route, param] = rawHash.split('/');
      const targetView = HASH_TO_VIEW[route];
      if (targetView) {
        setActiveView(targetView);
        if (route === 'process' && workers && workers.length > 0) {
          const match = param 
            ? workers.find(w => w.id === param || w.assignedWorkerId === param) 
            : (processingWorker || activeWorker || workers[0]);
          if (match) setProcessingWorker(match);
        } else if (route === 'induction' && workers && workers.length > 0) {
          const match = param 
            ? workers.find(w => w.id === param || w.assignedWorkerId === param) 
            : (documentWorker || activeWorker || workers[0]);
          if (match) setDocumentWorker(match);
        } else if (route === 'idcard' && workers && workers.length > 0) {
          const match = param 
            ? workers.find(w => w.id === param || w.assignedWorkerId === param) 
            : (idCardWorker || activeWorker || workers[0]);
          if (match) setIdCardWorker(match);
        } else if (route === 'departments' && param) {
          setSelectedDeptTab(param);
        }
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [isAuthenticated, currentRole, workers]);

  // Department-specific default view setting on login
  useEffect(() => {
    if (!isAuthenticated) return;
    
    if (currentRole === ROLES.ADMIN) {
      if (!window.location.hash) setActiveView('admin_dashboard');
      setSelectedStageFilter('ALL');
    } else if (currentRole === ROLES.HR) {
      if (!window.location.hash) setActiveView('pipeline');
      setSelectedStageFilter('ALL');
      setSelectedDeptTab('hr');
    } else if (currentRole === ROLES.MEDICAL) {
      if (!window.location.hash) setActiveView('pipeline');
      setSelectedStageFilter(STAGES.MEDICAL);
      setSelectedDeptTab('medical');
    } else if (currentRole === ROLES.SAFETY) {
      if (!window.location.hash) setActiveView('pipeline');
      setSelectedStageFilter(STAGES.SAFETY);
      setSelectedDeptTab('safety');
    } else if (currentRole === ROLES.IT) {
      if (!window.location.hash) setActiveView('pipeline');
      setSelectedStageFilter(STAGES.IT);
      setSelectedDeptTab('it');
    } else if (currentRole === ROLES.CAMP) {
      if (!window.location.hash) setActiveView('pipeline');
      setSelectedStageFilter(STAGES.CAMP);
      setSelectedDeptTab('camp');
    }
  }, [currentRole, isAuthenticated, setSelectedStageFilter]);

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  // Navigation router helper
  const navigate = (viewName, param = null) => {
    setActiveView(viewName);
    const hash = VIEW_TO_HASH[viewName] || 'pipeline';
    const finalHash = param ? `#${hash}/${param}` : `#${hash}`;
    if (window.location.hash !== finalHash) {
      window.location.hash = finalHash;
    }
  };

  // Full-page workflow handlers
  const handleStartProcessWorker = (worker) => {
    setProcessingWorker(worker);
    navigate('process_worker', worker.id);
  };

  const handleStartRegisterWorker = () => {
    navigate('register_worker');
  };

  const handleOpenInductionDoc = (worker) => {
    setDocumentWorker(worker);
    navigate('induction_doc', worker.id);
  };

  const handleOpenIdCard = (worker) => {
    setIdCardWorker(worker);
    navigate('id_card', worker?.id);
  };

  const handleNavigateToDept = (deptKey) => {
    setSelectedDeptTab(deptKey);
    navigate('dept_dashboards', deptKey);
  };

  const getPageTitle = () => {
    if (currentRole === ROLES.ADMIN) return 'Executive Workforce Pipeline & Control Center';
    if (currentRole === ROLES.HR) return 'HR Candidate Registration & Intake (Step 1)';
    if (currentRole === ROLES.MEDICAL) return 'Medical Screening & Fitness Verification Queue (Step 2)';
    if (currentRole === ROLES.SAFETY) return 'EHS Safety Briefing & PPE Kit Issuance (Step 3)';
    if (currentRole === ROLES.IT) return 'IT Biometrics & Master Enrollment (Step 4)';
    if (currentRole === ROLES.CAMP) return 'Camp Housing & Gate Pass Activation (Step 5)';
    return 'Worker Onboarding Pipeline';
  };

  return (
    <div className="app-container">
      <Sidebar
        activeView={activeView}
        setActiveView={(view) => navigate(view)}
        onOpenNewWorkerModal={handleStartRegisterWorker}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={handleToggleSidebarCollapse}
      />

      <div className="main-content">
        <Header 
          isSidebarCollapsed={isSidebarCollapsed}
          onToggleSidebarCollapse={handleToggleSidebarCollapse}
        />

        <main className="page-body">
          <ErrorBoundary onReset={() => navigate('pipeline')}>
            <Suspense fallback={<ViewSuspenseFallback />}>
              {/* VIEW 1: DEDICATED FULL-PAGE STAGE PROCESSING */}
              {activeView === 'process_worker' && (
                <DedicatedStageProcessPage
                  worker={
                    processingWorker || 
                    (workers && workers.length > 0 ? (
                      workers.find(w => w.id === (window.location.hash.split('/')[1] || '') || w.assignedWorkerId === (window.location.hash.split('/')[1] || '')) ||
                      activeWorker || 
                      workers[0]
                    ) : null)
                  }
                  onSelectWorker={(w) => {
                    setProcessingWorker(w);
                    navigate('process_worker', w.id);
                  }}
                  onBack={() => {
                    setProcessingWorker(null);
                    navigate('pipeline');
                  }}
                />
              )}

              {/* VIEW 2: DEDICATED FULL-PAGE HR INTAKE REGISTRATION */}
              {activeView === 'register_worker' && (
                <DedicatedRegistrationPage
                  onBack={() => navigate('pipeline')}
                />
              )}

              {/* VIEW 3: MAIN WORKER PIPELINE TABLE */}
              {activeView === 'pipeline' && (
                <div>
                  <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                        {getPageTitle()}
                      </h1>
                      <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                        Department workflow: HR Profile → Medical Clearance → EHS Safety → IT Face Biometrics → Camp Housing.
                      </p>
                    </div>
                    {(currentRole === ROLES.HR || currentRole === ROLES.ADMIN) && (
                      <button
                        id="btn-register-header"
                        className="btn btn-primary"
                        onClick={handleStartRegisterWorker}
                      >
                        <span>+ Register New Worker (Step 1)</span>
                      </button>
                    )}
                  </div>

                  {currentRole === ROLES.ADMIN && <PipelineOverview />}

                  <WorkerTable
                    onOpenProcessModal={handleStartProcessWorker}
                    onViewInductionDoc={handleOpenInductionDoc}
                    onGenerateIdCard={handleOpenIdCard}
                    onOpenAdminOverride={(w) => setOverrideWorker(w)}
                  />
                </div>
              )}

              {/* VIEW 4: ADMIN COMMAND CENTER */}
              {activeView === 'admin_dashboard' && currentRole === ROLES.ADMIN && (
                <AdminDashboard
                  onNavigateToDept={handleNavigateToDept}
                  onNavigateToReports={() => navigate('reports')}
                  onNavigateToAudit={() => navigate('audit_log')}
                  onNavigateToUsers={() => navigate('user_management')}
                  onNavigateToIdCard={() => handleOpenIdCard(workers[0])}
                />
              )}

              {/* VIEW 4B: USER & DEPARTMENT ACCESS MANAGEMENT (Admin Only) */}
              {activeView === 'user_management' && currentRole === ROLES.ADMIN && (
                <UserManagement />
              )}

              {/* VIEW 5: MULTI-DEPARTMENT DASHBOARDS */}
              {activeView === 'dept_dashboards' && (
                <div>
                  <div style={{ marginBottom: '1.25rem' }}>
                    <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      {currentRole === ROLES.ADMIN ? 'Department Operational Dashboards' : `${ROLE_LABELS[currentRole]} Dashboard`}
                    </h1>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                      Granular drilldown metrics across HR, Medical, Safety, IT, and Camp Living Quarters.
                    </p>
                  </div>
                  <DepartmentDashboards initialTab={selectedDeptTab} />
                </div>
              )}

              {/* VIEW 6: REPORTS & CSV EXPORT */}
              {activeView === 'reports' && (
                <ReportsCenter />
              )}

              {/* VIEW 7: AUDIT LOG VIEWER */}
              {activeView === 'audit_log' && (
                <AuditLogViewer />
              )}

              {/* VIEW 8: PRINTABLE INDUCTION DOCUMENT */}
              {activeView === 'induction_doc' && (
                <PrintableInductionDoc
                  worker={documentWorker || activeWorker || (workers && workers.length > 0 ? workers[0] : null)}
                  onBack={() => navigate('pipeline')}
                  onGenerateIdCard={handleOpenIdCard}
                />
              )}

              {/* VIEW 9: TEMPORARY GATE PASS ID CARD GENERATOR */}
              {activeView === 'id_card' && (
                <TemporaryGatePassIdCard
                  initialWorker={idCardWorker || activeWorker || (workers && workers.length > 0 ? workers[0] : null)}
                  onBack={() => navigate(currentRole === ROLES.ADMIN ? 'admin_dashboard' : 'pipeline')}
                />
              )}
            </Suspense>
          </ErrorBoundary>
        </main>
      </div>

      {/* ADMIN OVERRIDE MODAL */}
      <Suspense fallback={null}>
        {overrideWorker && currentRole === ROLES.ADMIN && (
          <AdminOverrideModal
            worker={overrideWorker}
            onClose={() => setOverrideWorker(null)}
          />
        )}
      </Suspense>

      <Toast toast={toastMessage} />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <WorkerProvider>
          <AppContent />
        </WorkerProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
