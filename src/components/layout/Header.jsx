import React from 'react';
import { 
  Search, 
  LogOut, 
  ShieldCheck, 
  User, 
  Sun, 
  Moon, 
  PanelLeftClose, 
  PanelLeftOpen
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useWorkers } from '../../context/WorkerContext';
import { ROLE_LABELS, ROLES } from '../../types/constants';
import logoMetals from '../../assets/logo_metals.png';
import logoInfra from '../../assets/logo_infra.png';

export const Header = ({ isSidebarCollapsed = false, onToggleSidebarCollapse }) => {
  const { currentRole, currentUser, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { searchQuery, setSearchQuery } = useWorkers();

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return { bg: 'var(--brand-primary)', text: '#FFF', icon: '👑' };
      case ROLES.HR:
        return { bg: 'var(--info-solid)', text: '#FFF', icon: '📋' };
      case ROLES.MEDICAL:
        return { bg: 'var(--warning-solid)', text: '#FFF', icon: '🩺' };
      case ROLES.SAFETY:
        return { bg: 'var(--purple-solid)', text: '#FFF', icon: '🛡️' };
      case ROLES.IT:
        return { bg: 'var(--info-solid)', text: '#FFF', icon: '💻' };
      case ROLES.CAMP:
        return { bg: 'var(--success-solid)', text: '#FFF', icon: '🏕️' };
      default:
        return { bg: 'var(--brand-navy)', text: '#FFF', icon: '👤' };
    }
  };

  const badgeStyle = getRoleBadgeStyle(currentRole);

  return (
    <header className="top-header">
      <div className="header-left" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Sidebar Collapse / Expand Toggle Button */}
        {onToggleSidebarCollapse && (
          <button
            id="btn-header-collapse"
            className="header-collapse-btn"
            onClick={onToggleSidebarCollapse}
            title={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            aria-label={isSidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          >
            {isSidebarCollapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
        )}

        {/* Dual Brand Logos on all pages */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <img 
            src={logoInfra} 
            alt="Lloyds Infra" 
            style={{ height: '28px', maxWidth: '80px', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
          <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--border-medium)' }} />
          <img 
            src={logoMetals} 
            alt="Lloyds Metals" 
            style={{ height: '22px', maxWidth: '105px', objectFit: 'contain' }}
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        </div>

        <div className="search-box">
          <Search size={18} />
          <input
            id="worker-quick-search"
            type="text"
            placeholder="Search workers by name, ID, contractor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="header-right" style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>

        {/* Day / Night Mode Toggle */}
        <button
          id="btn-header-theme-toggle"
          className="theme-toggle-btn"
          onClick={toggleTheme}
          title={isDark ? "Switch to Day Mode (Light)" : "Switch to Night Mode (Dark)"}
          aria-label="Toggle Theme Mode"
        >
          {isDark ? (
            <>
              <Sun size={15} color="#F59E0B" />
              <span className="theme-toggle-label">Day Mode</span>
            </>
          ) : (
            <>
              <Moon size={15} color="#6366F1" />
              <span className="theme-toggle-label">Night Mode</span>
            </>
          )}
        </button>

        {/* Active Department Portal Badge (NO DROPDOWN) */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.45rem',
          backgroundColor: badgeStyle.bg,
          color: badgeStyle.text,
          padding: '0.35rem 0.75rem',
          borderRadius: 'var(--radius-full)',
          fontSize: '0.75rem',
          fontWeight: 800,
          letterSpacing: '0.03em',
          boxShadow: 'var(--shadow-xs)'
        }}>
          <span>{badgeStyle.icon}</span>
          <span>{ROLE_LABELS[currentRole] || currentRole}</span>
        </div>

        {/* User Identity Details */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          paddingLeft: '0.5rem',
          borderLeft: '1px solid var(--border-light)'
        }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '50%',
            backgroundColor: 'var(--brand-navy)',
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 700,
            fontSize: '0.8rem'
          }}>
            {currentUser?.name?.charAt(0) || 'U'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-primary)', lineHeight: 1.1 }}>
                {currentUser?.name}
              </span>
              {currentUser?.authMethod === 'SSO' && (
                <span 
                  style={{
                    fontSize: '0.625rem',
                    fontWeight: 800,
                    padding: '0.1rem 0.4rem',
                    borderRadius: '10px',
                    backgroundColor: '#EFF6FF',
                    color: '#1D4ED8',
                    border: '1px solid #BFDBFE',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.2rem'
                  }}
                  title="Authenticated via Google Workspace SSO (@lloyds.in)"
                >
                  🔐 Google SSO (@lloyds.in)
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
              {currentUser?.department || currentUser?.email}
            </span>
          </div>
        </div>

        {/* Explicit Logout Button */}
        <button
          id="btn-logout"
          className="btn btn-secondary"
          style={{
            padding: '0.4rem 0.75rem',
            fontSize: '0.775rem',
            color: 'var(--danger-solid)',
            borderColor: 'var(--danger-border)',
            backgroundColor: 'var(--danger-bg)'
          }}
          onClick={logout}
          title="Sign out of current department session"
        >
          <LogOut size={14} />
          <span>Sign Out</span>
        </button>
      </div>
    </header>
  );
};
