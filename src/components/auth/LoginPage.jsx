import React, { useState, useEffect } from 'react';
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
  Key,
  Stethoscope,
  HardHat,
  Fingerprint,
  Home,
  Users
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
    badge: 'Admin',
    icon: ShieldCheck,
    name: 'Kolli Hemanth',
    designation: 'Site Administrator & Chief Director',
    email: 'hmk@lloyds.in',
    alias: 'admin',
    department: 'Site Administration & Master Control',
    color: '#6366F1'
  },
  {
    role: 'HR',
    stageName: 'Step 1',
    badge: 'HR Ops',
    icon: Users,
    name: 'Rinku Sharma',
    designation: 'Senior HR Operations Lead',
    email: 'ruv@lloyds.in',
    alias: 'hr',
    department: 'Human Resources',
    color: '#0284C7'
  },
  {
    role: 'MEDICAL',
    stageName: 'Step 2',
    badge: 'Medical',
    icon: Stethoscope,
    name: 'Gopal Ray',
    designation: 'Chief Medical Officer',
    email: 'glr@lloyds.in',
    alias: 'medical',
    department: 'Occupational Health & Medical Services',
    color: '#EA580C'
  },
  {
    role: 'SAFETY',
    stageName: 'Step 3',
    badge: 'Safety',
    icon: HardHat,
    name: 'Jithendra Parida',
    designation: 'Lead EHS Safety Engineer',
    email: 'jdp@lloyds.in',
    alias: 'safety',
    department: 'Environment, Health & Safety',
    color: '#D97706'
  },
  {
    role: 'IT',
    stageName: 'Step 4',
    badge: 'IT Systems',
    icon: Fingerprint,
    name: 'Chitta Ranjan Panda',
    designation: 'Senior IT Biometric Specialist',
    email: 'crp@lloyds.in',
    alias: 'it',
    department: 'Information Technology',
    color: '#2563EB'
  },
  {
    role: 'CAMP',
    stageName: 'Step 5',
    badge: 'Camp Housing',
    icon: Home,
    name: 'Ripan',
    designation: 'Camp Accommodations Supervisor',
    email: 'rin@lloyds.in',
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
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSSOModal, setShowSSOModal] = useState(false);
  const [ssoProvider, setSsoProvider] = useState('GOOGLE');
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  // Single Sign-On (SSO) is disabled for now
  const isSSOEnabled = false;

  // Ensure stale hash (e.g. #departments, #users, #pipeline) is stripped from the URL on login page
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.location.hash) {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } else {
          window.location.hash = '';
        }
      }
    } catch (e) {}
  }, []);

  // Corporate Domain Auto-Detection (active only when SSO is enabled)
  const isCorporateDomain = isSSOEnabled && Boolean(
    username && (
      username.toLowerCase().includes('@lloydsprojects.in') || 
      username.toLowerCase().includes('@lloyds.in') || 
      username.toLowerCase().includes('@lloydsmetals.com')
    )
  );
  const detectedDomain = isCorporateDomain ? (username.split('@')[1] || 'lloydsprojects.in') : '';

  // Quick switch preset: selects the department profile while keeping email ID input blank for user entry
  const handleSelectPreset = (preset) => {
    setSelectedRole(preset.role);
    setUsername('');
    setPassword('');
    setErrorMsg('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Please enter your email ID.');
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
    <div className="login-split-page">
      {/* ==================================================================== */}
      {/* LEFT HERO / BRAND SHOWCASE PANEL (Fills 100vh, Zero Scrolling)      */}
      {/* ==================================================================== */}
      <div className="login-hero-panel">
        {/* Decorative Radial Background Accent */}
        <div style={{
          position: 'absolute',
          top: '-120px',
          right: '-120px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232, 35, 41, 0.15) 0%, transparent 70%)',
          pointerEvents: 'none'
        }} />

        {/* Top: Dual Brand Logos with Glassmorphic Plate */}
        <div style={{ position: 'relative', zIndex: 2 }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '1rem',
            padding: '0.65rem 1.25rem',
            background: 'rgba(255, 255, 255, 0.08)',
            backdropFilter: 'blur(12px)',
            WebkitBackdropFilter: 'blur(12px)',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.16)',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.25)'
          }}>
            <img 
              src={logoInfra} 
              alt="Lloyds Infra" 
              style={{ height: '34px', width: 'auto', objectFit: 'contain' }}
            />
            <div style={{ width: '1px', height: '26px', backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />
            <img 
              src={logoMetals} 
              alt="Lloyds Metals" 
              style={{ height: '28px', width: 'auto', objectFit: 'contain' }}
            />
          </div>
          <div style={{ marginTop: '0.65rem', fontSize: '0.7rem', letterSpacing: '0.05em', color: 'rgba(255, 255, 255, 0.75)', fontWeight: 800, textTransform: 'uppercase', lineHeight: 1.4 }}>
            Lloyds Metals and Energy Limited and Lloyds Infrastructure &amp; Construction Limited
          </div>
        </div>

        {/* Center: System Value Proposition & 5 Pipeline Steps */}
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '560px', margin: 'auto 0' }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.35rem 0.85rem',
            borderRadius: '9999px',
            background: 'rgba(232, 35, 41, 0.18)',
            border: '1px solid rgba(232, 35, 41, 0.45)',
            color: '#FCA5A5',
            fontSize: '0.75rem',
            fontWeight: 800,
            marginBottom: '1rem',
            letterSpacing: '0.04em',
            textTransform: 'uppercase'
          }}>
            <ShieldCheck size={14} color="#EF4444" />
            <span>Enterprise Induction Platform</span>
          </div>

          <h1 style={{
            fontSize: '2.5rem',
            fontWeight: 800,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            marginBottom: '0.85rem',
            color: '#FFFFFF'
          }}>
            Worker Onboarding <span style={{ color: '#E82329' }}>Software</span>
          </h1>

          <p style={{
            fontSize: '0.95rem',
            lineHeight: 1.55,
            color: 'rgba(255, 255, 255, 0.75)',
            marginBottom: '1.75rem'
          }}>
            Comprehensive 5-stage workforce induction, clinical health certification, EHS safety compliance, biometric gate pass issuance, and living quarters management.
          </p>

          {/* 5 Pipeline Stages Visual Chips */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '0.75rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(2, 132, 199, 0.25)', color: '#38BDF8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Users size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>Step 1: HR Induction</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Candidate Dossier &amp; Bio</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(234, 88, 12, 0.25)', color: '#FB923C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Stethoscope size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>Step 2: Medical Health</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Clinical Screening &amp; Vitals</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(217, 119, 6, 0.25)', color: '#FCD34D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <HardHat size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>Step 3: EHS Safety</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Hazard Training &amp; PPE</div>
              </div>
            </div>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(37, 99, 235, 0.25)', color: '#60A5FA', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Fingerprint size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>Step 4: IT Biometrics</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Biometrics and CWMS</div>
              </div>
            </div>

            <div style={{
              gridColumn: 'span 2',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              padding: '0.65rem 0.85rem',
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '10px',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(5, 150, 105, 0.25)', color: '#34D399', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Home size={16} />
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#FFFFFF' }}>Step 5: Camp Housing</div>
                <div style={{ fontSize: '0.68rem', color: 'rgba(255, 255, 255, 0.6)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>Living Quarters &amp; Bed Allocation</div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom: Security Standards & Compliance */}
        <div style={{
          position: 'relative',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.12)',
          fontSize: '0.75rem',
          color: 'rgba(255, 255, 255, 0.7)'
        }}>
          <div style={{ fontWeight: 600 }}>Lloyds Metals and Energy Limited and Lloyds Infrastructure &amp; Construction Limited</div>
          <div style={{ fontWeight: 600 }}>OWASP ASVS 5.0 • JWT &amp; RBAC</div>
        </div>
      </div>

      {/* ==================================================================== */}
      {/* RIGHT AUTHENTICATION TERMINAL (Scroll-Free, Fits 100vh Perfectly)   */}
      {/* ==================================================================== */}
      <div className="login-auth-panel">
        <div style={{ width: '100%', maxWidth: '440px', margin: '0 auto' }}>
          {/* Top Bar: Portal Label + Theme Toggle */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.25rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '8px',
                background: 'linear-gradient(135deg, #DC2626, #991B1B)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                boxShadow: '0 2px 8px rgba(220, 38, 38, 0.35)'
              }}>
                <ShieldCheck size={16} />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                  Authentication Terminal
                </span>
              </div>
            </div>

            <button
              id="btn-login-theme-toggle"
              type="button"
              onClick={toggleTheme}
              className="theme-toggle-btn"
              style={{
                backgroundColor: 'var(--bg-surface-subtle)',
                color: 'var(--text-primary)',
                border: '1px solid var(--border-medium)',
                padding: '0.3rem 0.65rem',
                fontSize: '0.75rem',
                borderRadius: '6px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.35rem',
                cursor: 'pointer'
              }}
              title={isDark ? "Switch to Day Mode" : "Switch to Night Mode"}
              aria-label="Toggle Theme Mode"
            >
              {isDark ? <Sun size={13} color="#F59E0B" /> : <Moon size={13} color="#64748B" />}
              <span>{isDark ? 'Day' : 'Night'}</span>
            </button>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: '1.25rem' }}>
            <h2 style={{
              fontSize: '1.35rem',
              fontWeight: 800,
              color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
              margin: '0 0 0.25rem 0'
            }}>
              Welcome Back
            </h2>
            <p style={{
              fontSize: '0.825rem',
              color: 'var(--text-secondary)',
              margin: 0
            }}>
              Select your department profile or enter corporate credentials
            </p>
          </div>

          {/* Quick Department Profile Chips (Compact 3x2 Grid) */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{
              fontSize: '0.72rem',
              fontWeight: 800,
              color: 'var(--text-muted)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.45rem'
            }}>
              Department Profiles
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '0.45rem'
            }}>
              {DEPARTMENT_PRESETS.map((p) => {
                const isSelected = selectedRole === p.role;
                const PresetIcon = p.icon;
                return (
                  <button
                    key={p.role}
                    type="button"
                    onClick={() => handleSelectPreset(p)}
                    style={{
                      padding: '0.55rem 0.5rem',
                      borderRadius: '8px',
                      border: isSelected ? `1.5px solid ${p.color}` : '1px solid var(--border-medium)',
                      backgroundColor: isSelected ? `${p.color}15` : 'var(--bg-surface-subtle)',
                      color: isSelected ? p.color : 'var(--text-secondary)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.45rem',
                      transition: 'all 0.15s ease',
                      boxShadow: isSelected ? `0 2px 8px ${p.color}20` : 'none',
                      fontSize: '0.78rem',
                      fontWeight: isSelected ? 700 : 600
                    }}
                  >
                    <PresetIcon size={14} style={{ color: isSelected ? p.color : 'var(--text-muted)', flexShrink: 0 }} />
                    <span>{p.badge}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Error Message Alert */}
          {errorMsg && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              color: '#EF4444',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
            {/* Username / Email Field */}
            <div>
              <label 
                htmlFor="login-username"
                style={{
                  display: 'block',
                  fontSize: '0.775rem',
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  marginBottom: '0.35rem'
                }}
              >
                Email ID
              </label>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <User 
                  size={15} 
                  color="var(--text-muted)" 
                  style={{ position: 'absolute', left: '0.85rem', pointerEvents: 'none' }} 
                />
                <input
                  id="login-username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your email ID"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.85rem 0.65rem 2.45rem',
                    fontSize: '0.85rem',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              {/* Corporate Domain Auto-Detect Prompt (Disabled while SSO is inactive) */}
              {isSSOEnabled && isCorporateDomain && (
                <div 
                  onClick={() => {
                    setSsoProvider('GOOGLE');
                    setShowSSOModal(true);
                  }}
                  style={{
                    marginTop: '0.4rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.4rem 0.65rem',
                    borderRadius: '6px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    border: '1px solid rgba(59, 130, 246, 0.25)',
                    color: '#2563EB',
                    fontSize: '0.725rem'
                  }}
                  title="Authenticate via Google Workspace Single Sign-On (@lloyds.in)"
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <GoogleLogo size={13} />
                    <span>Company Account (<strong>@{detectedDomain}</strong>)</span>
                  </div>
                  <span style={{ fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                    <span>Google SSO</span>
                    <ArrowRight size={11} />
                  </span>
                </div>
              )}
            </div>

            {/* Password Field */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
                <label 
                  htmlFor="login-password"
                  style={{
                    fontSize: '0.775rem',
                    fontWeight: 700,
                    color: 'var(--text-primary)'
                  }}
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowChangePasswordModal(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--brand-primary)',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.25rem',
                    padding: 0
                  }}
                >
                  <Key size={12} />
                  <span>Change Password</span>
                </button>
              </div>

              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <Lock 
                  size={15} 
                  color="var(--text-muted)" 
                  style={{ position: 'absolute', left: '0.85rem', pointerEvents: 'none' }} 
                />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter account password"
                  style={{
                    width: '100%',
                    padding: '0.65rem 2.45rem 0.65rem 2.45rem',
                    fontSize: '0.85rem',
                    backgroundColor: 'var(--bg-surface-subtle)',
                    border: '1px solid var(--border-medium)',
                    borderRadius: '8px',
                    color: 'var(--text-primary)',
                    outline: 'none',
                    boxSizing: 'border-box'
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
                    padding: '3px'
                  }}
                  title={showPassword ? "Hide password" : "Show password"}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {/* Primary Sign In Button */}
            <button
              id="btn-login-submit"
              type="submit"
              disabled={isLoading}
              className="btn btn-primary"
              style={{
                marginTop: '0.25rem',
                padding: '0.7rem 1.25rem',
                fontSize: '0.9rem',
                fontWeight: 800,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                width: '100%',
                borderRadius: '8px',
                cursor: isLoading ? 'wait' : 'pointer',
                backgroundColor: 'var(--brand-primary, #E82329)',
                boxShadow: '0 4px 14px rgba(232, 35, 41, 0.35)'
              }}
            >
              <Lock size={15} />
              <span>{isLoading ? 'Authenticating...' : `Sign In to ${activePreset.stageName}`}</span>
              <ArrowRight size={15} />
            </button>
          </form>

          {/* Single Sign-On Option (Disabled for now) */}
          {isSSOEnabled && (
            <>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                margin: '1.15rem 0 0.75rem 0',
                color: 'var(--text-muted)'
              }}>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
                <span style={{ padding: '0 0.65rem', fontSize: '0.68rem', fontWeight: 800, letterSpacing: '0.05em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
                  Or Continue With
                </span>
                <div style={{ flex: 1, height: '1px', backgroundColor: 'var(--border-light)' }} />
              </div>

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
                  padding: '0.65rem 1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.65rem',
                  fontSize: '0.825rem',
                  fontWeight: 700,
                  backgroundColor: 'var(--bg-surface-subtle)',
                  borderColor: 'var(--border-medium)',
                  color: 'var(--text-primary)',
                  borderRadius: '8px'
                }}
              >
                <GoogleLogo size={18} />
                <span>Sign in with Google Workspace (@lloyds.in)</span>
              </button>
            </>
          )}

          {/* Footer Security Badges */}
          <div style={{
            marginTop: '1.25rem',
            paddingTop: '0.85rem',
            borderTop: '1px solid var(--border-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.725rem',
            color: 'var(--text-muted)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <Shield size={13} color="#10B981" />
              <span>TLS 1.3 &amp; 256-Bit Encrypted</span>
            </div>
            <span>Lloyds Metals &amp; Energy • Lloyds Infra &amp; Construction</span>
          </div>
        </div>
      </div>

      {/* SSO Authentication Modal (Rendered only when SSO is enabled) */}
      {isSSOEnabled && (
        <SSOModal
          isOpen={showSSOModal}
          onClose={() => setShowSSOModal(false)}
          initialProvider={ssoProvider}
          autoFillEmail={username}
        />
      )}

      {/* Change Password Modal */}
      {showChangePasswordModal && (
        <ChangePasswordModal
          isOpen={true}
          onClose={() => setShowChangePasswordModal(false)}
          targetUser={
            users?.find(u => (u.alias && u.alias.toLowerCase() === username.toLowerCase()) || u.email.toLowerCase() === username.toLowerCase() || (u.role && u.role.toLowerCase() === username.toLowerCase())) ||
            users?.find(u => u.role === selectedRole) ||
            { id: username, name: username, email: username, role: selectedRole }
          }
          isAdminReset={false}
        />
      )}
    </div>
  );
};
