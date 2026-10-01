import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  Shield, 
  Sun, 
  Moon, 
  User, 
  Eye, 
  EyeOff,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Key
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import logoMetals from '../../assets/logo_metals.png';
import logoInfra from '../../assets/logo_infra.png';
import SSOModal, { GoogleLogo } from './SSOModal';

export const DEPARTMENT_PRESETS = [
  {
    role: 'ADMIN',
    stageName: 'Executive',
    badge: '👑 Chief Admin',
    name: 'Harshvardhan M. K.',
    designation: 'Chief Administrator & Site Director',
    email: 'hmk@lloydsprojects.in',
    alias: 'admin',
    department: 'Site Administration & Master Control',
    color: '#7C3AED'
  },
  {
    role: 'HR',
    stageName: 'Stage 1',
    badge: '📋 HR Induction',
    name: 'Pooja Nair',
    designation: 'Senior HR Operations Lead',
    email: 'hr.operations@lloyds.in',
    alias: 'hr',
    department: 'Human Resources',
    color: '#0284C7'
  },
  {
    role: 'MEDICAL',
    stageName: 'Stage 2',
    badge: '🩺 Medical Screening',
    name: 'Dr. Vivek Deshmukh (MBBS, CIH)',
    designation: 'Chief Medical Officer',
    email: 'medical.officer@lloyds.in',
    alias: 'medical',
    department: 'Occupational Health & Medical Services',
    color: '#EA580C'
  },
  {
    role: 'SAFETY',
    stageName: 'Stage 3',
    badge: '🛡️ EHS Safety',
    name: 'Arun Patil',
    designation: 'Lead EHS Safety Engineer',
    email: 'ehs.safety@lloyds.in',
    alias: 'safety',
    department: 'Environment, Health & Safety',
    color: '#D97706'
  },
  {
    role: 'IT',
    stageName: 'Stage 4',
    badge: '💻 IT Biometrics',
    name: 'Rajesh Sharma',
    designation: 'Senior IT Biometric Specialist',
    email: 'it.biometrics@lloyds.in',
    alias: 'it',
    department: 'Information Technology',
    color: '#2563EB'
  },
  {
    role: 'CAMP',
    stageName: 'Stage 5',
    badge: '🏕️ Camp Housing',
    name: 'Mahesh Kulkarni',
    designation: 'Camp Accommodations Supervisor',
    email: 'camp.gondwana@lloyds.in',
    alias: 'camp',
    department: 'Camp Administration (Gondwana)',
    color: '#059669'
  }
];

export const LoginPage = () => {
  const { login, users } = useAuth();
  const { toggleTheme, isDark } = useTheme();

  // Active form state (default to Admin)
  const [selectedRole, setSelectedRole] = useState('ADMIN');
  const [username, setUsername] = useState('hmk@lloydsprojects.in');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSSOModal, setShowSSOModal] = useState(false);
  const [ssoProvider, setSsoProvider] = useState('GOOGLE');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);
  const [showDirectory, setShowDirectory] = useState(false);

  // Corporate Domain Auto-Detection
  const isCorporateDomain = Boolean(
    username && (
      username.toLowerCase().includes('@lloydsprojects.in') || 
      username.toLowerCase().includes('@lloyds.in') || 
      username.toLowerCase().includes('@lloydsmetals.com')
    )
  );
  const detectedDomain = isCorporateDomain ? (username.split('@')[1] || 'lloydsprojects.in') : '';

  // Quick switch preset
  const handleSelectPreset = (preset) => {
    setSelectedRole(preset.role);
    setUsername(preset.email);
    setPassword('');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter your username or email address.');
      return;
    }

    if (!password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await login(username.trim(), password);
      if (res && res.error) {
        setErrorMsg(res.error);
        setIsLoading(false);
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred during authentication.');
      setIsLoading(false);
    }
  };

  const activePreset = DEPARTMENT_PRESETS.find(p => p.role === selectedRole) || DEPARTMENT_PRESETS[0];

  return (
    <div className="login-page-wrapper" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      backgroundColor: 'var(--bg-app)',
      position: 'relative'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '560px',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-xl, 16px)',
        border: '1px solid var(--border-light)',
        boxShadow: 'var(--shadow-lg, 0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1))',
        overflow: 'hidden'
      }}>
        {/* Top Header Banner with dual branding */}
        <div style={{
          backgroundColor: 'var(--brand-navy, #0F172A)',
          padding: '1.25rem 1.75rem',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '3px solid var(--brand-primary, #E82329)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
            <img 
              src={logoInfra} 
              alt="Lloyds Infra" 
              style={{ height: '36px', maxWidth: '110px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <div style={{ height: '28px', width: '1px', backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />
            <img 
              src={logoMetals} 
              alt="Lloyds Metals" 
              style={{ height: '30px', maxWidth: '130px', objectFit: 'contain' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>

          {/* Theme Mode Toggle Button */}
          <button
            id="btn-login-theme-toggle"
            type="button"
            onClick={toggleTheme}
            className="theme-toggle-btn"
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: '#FFFFFF',
              borderColor: 'rgba(255, 255, 255, 0.25)',
              padding: '0.35rem 0.65rem',
              fontSize: '0.75rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '0.35rem',
              cursor: 'pointer'
            }}
            title={isDark ? "Switch to Day Mode (Light)" : "Switch to Night Mode (Dark)"}
            aria-label="Toggle Theme Mode"
          >
            {isDark ? <Sun size={14} color="#F59E0B" /> : <Moon size={14} color="#CBD5E1" />}
            <span>{isDark ? 'Day' : 'Night'}</span>
          </button>
        </div>

        {/* Login Form Body */}
        <div style={{ padding: '2rem 2.25rem' }}>
          {/* Executive Header */}
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: `${activePreset.color}18`,
              color: activePreset.color,
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '0.75rem'
            }}>
              <ShieldCheck size={28} />
            </div>

            <h1 style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              marginBottom: '0.25rem'
            }}>
              Department Login Portal
            </h1>
            <p style={{
              fontSize: '0.85rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.4,
              margin: 0
            }}>
              Lloyds Metals & Energy Limited • Worker Induction & Camp Management System
            </p>
          </div>

          {/* Quick Department Switcher Tabs */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '0.5rem'
            }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Select Department Profile
              </span>
              <button
                type="button"
                onClick={() => setShowDirectory(!showDirectory)}
                style={{
                  background: 'none',
                  border: 'none',
                  padding: 0,
                  fontSize: '0.75rem',
                  color: 'var(--brand-primary, #E82329)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <KeyRound size={12} />
                <span>{showDirectory ? 'Hide Directory' : 'Department Directory'}</span>
                {showDirectory ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
              </button>
            </div>

            {/* Department Preset Buttons */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.5rem'
            }}>
              {DEPARTMENT_PRESETS.map((p) => {
                const isSelected = selectedRole === p.role;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    style={{
                      padding: '0.6rem 0.5rem',
                      borderRadius: '8px',
                      border: isSelected ? `2px solid ${p.color}` : '1px solid var(--border-medium)',
                      backgroundColor: isSelected ? `${p.color}15` : 'var(--bg-card)',
                      color: isSelected ? p.color : 'var(--text-primary)',
                      cursor: 'pointer',
                      textAlign: 'center',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '0.2rem',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>{p.badge}</span>
                    <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>{p.stageName}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Collapsible Department Directory */}
          {showDirectory && (
            <div style={{
              marginBottom: '1.5rem',
              padding: '1rem',
              borderRadius: '8px',
              backgroundColor: 'var(--bg-surface-subtle, #F8FAFC)',
              border: '1px solid var(--border-medium, #E2E8F0)',
              fontSize: '0.775rem'
            }}>
              <div style={{ fontWeight: 700, marginBottom: '0.6rem', color: 'var(--text-primary)' }}>
                System Access Directory
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {DEPARTMENT_PRESETS.map(p => (
                  <div 
                    key={p.role}
                    onClick={() => handleSelectPreset(p)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.4rem 0.6rem',
                      borderRadius: '6px',
                      backgroundColor: selectedRole === p.role ? 'var(--bg-surface, #FFFFFF)' : 'transparent',
                      border: selectedRole === p.role ? `1px solid ${p.color}40` : '1px solid transparent',
                      cursor: 'pointer'
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600, color: p.color }}>{p.badge} - {p.name}</div>
                      <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>{p.email}</div>
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: p.color, backgroundColor: `${p.color}15`, padding: '0.15rem 0.5rem', borderRadius: '4px' }}>
                      {p.stageName}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Active Profile Info Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.65rem',
            padding: '0.65rem 0.85rem',
            backgroundColor: `${activePreset.color}10`,
            borderRadius: '8px',
            border: `1px solid ${activePreset.color}30`,
            marginBottom: '1.25rem'
          }}>
            <CheckCircle2 size={16} color={activePreset.color} style={{ flexShrink: 0 }} />
            <div style={{ fontSize: '0.775rem', lineHeight: 1.35 }}>
              <span style={{ fontWeight: 700, color: activePreset.color }}>{activePreset.name}</span>
              <span style={{ color: 'var(--text-secondary)' }}> • {activePreset.designation}</span>
            </div>
          </div>

          {/* Error Alert Message */}
          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.75rem 1rem',
              marginBottom: '1.25rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              color: '#EF4444',
              fontSize: '0.825rem',
              fontWeight: 600
            }}>
              <AlertCircle size={17} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Username / Email Field */}
            <div>
              <label 
                htmlFor="login-username"
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.4rem'
                }}
              >
                Username or Work Email
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User 
                  size={17} 
                  color="var(--text-muted)" 
                  style={{ position: 'absolute', left: '0.9rem', pointerEvents: 'none' }} 
                />
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter email or username alias (e.g. hr, medical, admin)"
                  style={{
                    width: '100%',
                    padding: '0.75rem 1rem 0.75rem 2.65rem',
                    fontSize: '0.9rem',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md, 8px)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                />
              </div>

              {/* Corporate Domain Auto-Detect Prompt */}
              {isCorporateDomain && (
                <div 
                  onClick={() => {
                    setSsoProvider('GOOGLE');
                    setShowSSOModal(true);
                  }}
                  style={{
                    marginTop: '0.45rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.45rem 0.75rem',
                    borderRadius: '6px',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#1E40AF',
                    fontSize: '0.75rem',
                    transition: 'all 0.15s ease'
                  }}
                  title="Authenticate via Google Workspace Single Sign-On (@lloyds.in)"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                    <GoogleLogo size={14} />
                    <span>
                      Corporate account (<strong>@{detectedDomain}</strong>)
                    </span>
                  </div>
                  <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem', color: '#2563EB' }}>
                    <span>Sign In with Google SSO</span>
                    <ArrowRight size={12} />
                  </span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label 
                htmlFor="login-password"
                style={{
                  display: 'block',
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.4rem'
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock 
                  size={17} 
                  color="var(--text-muted)" 
                  style={{ position: 'absolute', left: '0.9rem', pointerEvents: 'none' }} 
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.75rem 0.75rem 2.65rem',
                    fontSize: '0.9rem',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: 'var(--radius-md, 8px)',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    transition: 'all var(--transition-fast)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '0.75rem',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '4px'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Change Password Link */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '0.65rem', marginTop: '-0.25rem' }}>
              <button
                type="button"
                onClick={() => setShowChangePasswordModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-primary)',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.35rem',
                  padding: '0.2rem 0'
                }}
              >
                <Key size={13} />
                <span>Change Password</span>
              </button>
            </div>

            {/* Submit Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                marginTop: '0.5rem',
                padding: '0.8rem 1.5rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                borderRadius: 'var(--radius-md, 8px)',
                cursor: isLoading ? 'wait' : 'pointer'
              }}
            >
              <Lock size={16} />
              <span>{isLoading ? 'Authenticating...' : `Sign In to ${activePreset.stageName} (${activePreset.role})`}</span>
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Enterprise Single Sign-On (SSO) Section */}
          <div style={{ marginTop: '1.25rem' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              marginBottom: '0.85rem',
              color: 'var(--text-muted)'
            }}>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
              <span style={{ padding: '0 0.75rem', fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                Or Sign In With Enterprise SSO
              </span>
              <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              {/* Google Workspace SSO (@lloyds.in) */}
              <button
                id="btn-sso-google"
                type="button"
                onClick={() => {
                  setSsoProvider('GOOGLE');
                  setShowSSOModal(true);
                }}
                className="btn btn-secondary"
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.75rem',
                  fontSize: '0.875rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--bg-card)',
                  borderColor: 'var(--border-medium)',
                  color: 'var(--text-primary)',
                  boxShadow: 'var(--shadow-xs)'
                }}
              >
                <GoogleLogo size={20} />
                <span>Sign in with Google Workspace (@lloyds.in)</span>
              </button>
            </div>
          </div>

          {/* Security & Access Info Footer */}
          <div style={{
            marginTop: '1.75rem',
            paddingTop: '1.25rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.75rem',
            color: 'var(--text-muted)',
            flexWrap: 'wrap',
            gap: '0.5rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Shield size={14} color="var(--success-solid)" />
              <span>OWASP ASVS 5.0 Secured</span>
            </div>
            <span>Lloyds Metals & Energy Portal</span>
          </div>
        </div>
      </div>

      {/* SSO Authentication Modal */}
      <SSOModal
        isOpen={showSSOModal}
        onClose={() => setShowSSOModal(false)}
        initialProvider={ssoProvider}
        autoFillEmail={username}
      />

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          isOpen={true}
          onClose={() => setShowChangePasswordModal(false)}
          targetUser={
            users?.find(u => u.email.toLowerCase() === username.toLowerCase() || (u.role && u.role.toLowerCase() === username.toLowerCase())) ||
            users?.find(u => u.role === selectedRole) ||
            { id: username, name: username, email: username, role: selectedRole }
          }
          isAdminReset={false}
        />
      )}
    </div>
  );
};
