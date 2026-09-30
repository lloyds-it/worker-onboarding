import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  LogOut, 
  ShieldCheck, 
  User, 
  Sun, 
  Moon, 
  PanelLeftClose, 
  PanelLeftOpen,
  Key,
  FileSignature,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useWorkers } from '../../context/WorkerContext';
import { ROLE_LABELS, ROLES } from '../../types/constants';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { DigitalSignatureModal } from '../common/DigitalSignatureModal';
import logoMetals from '../../assets/logo_metals.png';
import logoInfra from '../../assets/logo_infra.png';

export const Header = ({ isSidebarCollapsed = false, onToggleSidebarCollapse }) => {
  const { currentRole, currentUser, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const { searchQuery, setSearchQuery } = useWorkers();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDropdownOpen]);

  const getRoleBadgeStyle = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return { bg: 'rgba(232, 35, 41, 0.12)', text: '#DC2626', border: 'rgba(232, 35, 41, 0.25)', icon: '👑' };
      case ROLES.HR:
        return { bg: 'rgba(59, 130, 246, 0.12)', text: '#2563EB', border: 'rgba(59, 130, 246, 0.25)', icon: '📋' };
      case ROLES.MEDICAL:
        return { bg: 'rgba(245, 158, 11, 0.12)', text: '#D97706', border: 'rgba(245, 158, 11, 0.25)', icon: '🩺' };
      case ROLES.SAFETY:
        return { bg: 'rgba(139, 92, 246, 0.12)', text: '#7C3AED', border: 'rgba(139, 92, 246, 0.25)', icon: '🛡️' };
      case ROLES.IT:
        return { bg: 'rgba(14, 165, 233, 0.12)', text: '#0284C7', border: 'rgba(14, 165, 233, 0.25)', icon: '💻' };
      case ROLES.CAMP:
        return { bg: 'rgba(16, 185, 129, 0.12)', text: '#059669', border: 'rgba(16, 185, 129, 0.25)', icon: '🏕️' };
      default:
        return { bg: 'rgba(15, 23, 42, 0.08)', text: '#334155', border: 'rgba(15, 23, 42, 0.2)', icon: '👤' };
    }
  };

  const badgeStyle = getRoleBadgeStyle(currentRole);

  return (
    <>
      <header className="top-header">
        <div className="header-left">
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

          {/* Official Dual Partner Logos (Kept exclusively on page header) */}
          <div className="header-brand-container">
            <img 
              src={logoInfra} 
              alt="Lloyds Infra" 
              className="header-brand-logo-infra"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div className="header-brand-divider" />
            <img 
              src={logoMetals} 
              alt="Lloyds Metals & Energy" 
              className="header-brand-logo-metals"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Global Quick Search */}
          <div className="header-search-box">
            <Search size={16} className="search-icon" />
            <input
              id="worker-quick-search"
              type="text"
              placeholder="Search workers by name, ID, contractor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button 
                className="search-clear-btn" 
                onClick={() => setSearchQuery('')}
                title="Clear search"
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </div>

        <div className="header-right">
          {/* Compact Theme Toggle */}
          <button
            id="btn-header-theme-toggle"
            className="header-icon-btn"
            onClick={toggleTheme}
            title={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
            aria-label="Toggle Theme Mode"
          >
            {isDark ? <Sun size={17} style={{ color: '#F59E0B' }} /> : <Moon size={17} style={{ color: '#6366F1' }} />}
          </button>

          {/* Active Department Role Badge */}
          <div 
            className="header-role-pill" 
            style={{
              backgroundColor: badgeStyle.bg,
              color: badgeStyle.text,
              border: `1px solid ${badgeStyle.border}`
            }}
          >
            <span>{badgeStyle.icon}</span>
            <span>{ROLE_LABELS[currentRole] || currentRole}</span>
          </div>

          {/* User Identity Profile with Dropdown */}
          <div className="header-user-wrapper" ref={dropdownRef} style={{ position: 'relative' }}>
            <div 
              className="header-user-profile"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{ cursor: 'pointer', userSelect: 'none' }}
              title="Click for Account Options (Change Password, Digital Signature)"
            >
              <div className="header-user-avatar">
                {currentUser?.name?.charAt(0) || 'U'}
              </div>
              <div className="header-user-meta">
                <div className="header-user-top">
                  <span className="header-user-name">
                    {currentUser?.name || 'Administrator'}
                  </span>
                  {currentUser?.authMethod === 'SSO' && (
                    <span className="header-sso-badge" title="Authenticated via Google Workspace SSO (@lloyds.in)">
                      Google SSO
                    </span>
                  )}
                  <ChevronDown size={12} style={{ color: 'var(--text-muted)', transition: 'transform 0.2s', transform: isDropdownOpen ? 'rotate(180deg)' : 'none' }} />
                </div>
                <span className="header-user-sub">
                  {currentUser?.department || currentUser?.email || 'Executive Administration'}
                </span>
              </div>
            </div>

            {/* Profile Dropdown Menu */}
            {isDropdownOpen && (
              <div className="header-profile-dropdown" style={{
                position: 'absolute',
                top: 'calc(100% + 8px)',
                right: 0,
                width: '260px',
                backgroundColor: 'var(--bg-surface)',
                border: '1px solid var(--border-medium)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg, 0 10px 25px -5px rgba(0,0,0,0.2))',
                zIndex: 100,
                padding: '0.65rem'
              }}>
                <div style={{
                  padding: '0.5rem 0.65rem 0.75rem 0.65rem',
                  borderBottom: '1px solid var(--border-light)',
                  marginBottom: '0.5rem'
                }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                    {currentUser?.name}
                  </div>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    {currentUser?.email}
                  </div>
                  {/* Digital Signature Status */}
                  <div style={{ marginTop: '0.45rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    {currentUser?.signature ? (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.7rem',
                        color: 'var(--success-solid, #059669)',
                        backgroundColor: 'rgba(16, 185, 129, 0.1)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontWeight: 700
                      }}>
                        <FileSignature size={12} />
                        <span>Signature Active</span>
                      </div>
                    ) : (
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem',
                        fontSize: '0.7rem',
                        color: '#D97706',
                        backgroundColor: 'rgba(245, 158, 11, 0.1)',
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        fontWeight: 700
                      }}>
                        <FileSignature size={12} />
                        <span>No Signature Uploaded</span>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setShowPasswordModal(true);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.55rem 0.65rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  className="dropdown-hover-item"
                >
                  <Key size={15} style={{ color: 'var(--brand-primary)' }} />
                  <span>Change Password</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    setShowSignatureModal(true);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.55rem 0.65rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--text-primary)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  className="dropdown-hover-item"
                >
                  <FileSignature size={15} style={{ color: '#2563EB' }} />
                  <span>Digital Signature</span>
                </button>

                <div style={{ height: '1px', backgroundColor: 'var(--border-light)', margin: '0.4rem 0' }} />

                <button
                  type="button"
                  onClick={() => {
                    setIsDropdownOpen(false);
                    logout();
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.65rem',
                    padding: '0.55rem 0.65rem',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'transparent',
                    color: 'var(--danger-solid, #DC2626)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  className="dropdown-hover-item"
                >
                  <LogOut size={15} />
                  <span>Sign Out</span>
                </button>
              </div>
            )}
          </div>

          {/* Direct Sign Out Button */}
          <button
            id="btn-logout"
            className="header-logout-btn"
            onClick={logout}
            title="Sign out of current session"
          >
            <LogOut size={15} />
            <span>Sign Out</span>
          </button>
        </div>
      </header>

      {/* Change Password Modal */}
      {showPasswordModal && (
        <ChangePasswordModal
          isOpen={true}
          onClose={() => setShowPasswordModal(false)}
          targetUser={currentUser}
          isAdminReset={false}
        />
      )}

      {/* Digital Signature Modal */}
      {showSignatureModal && (
        <DigitalSignatureModal
          isOpen={true}
          onClose={() => setShowSignatureModal(false)}
          targetUser={currentUser}
        />
      )}
    </>
  );
};

