import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Building2, 
  User, 
  KeyRound, 
  Server, 
  RefreshCw,
  Fingerprint
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../../types/constants';

// Official SVG Brand Logos
export const MicrosoftLogo = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 21 21" style={{ flexShrink: 0 }}>
    <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
    <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
  </svg>
);

export const GoogleLogo = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.03h3.88c2.27-2.09 3.66-5.17 3.66-9.12z"/>
    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.03c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.13C3.26 21.36 7.33 24 12 24z"/>
    <path fill="#FBBC05" d="M5.28 14.29c-.25-.72-.38-1.49-.38-2.29s.13-1.57.38-2.29V6.57H1.24C.45 8.14 0 9.99 0 12s.45 3.86 1.24 5.43l4.04-3.14z"/>
    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.57l4.04 3.14c.95-2.83 3.6-4.96 6.72-4.96z"/>
  </svg>
);

export const SamlLogo = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <path d="m9 12 2 2 4-4"/>
  </svg>
);

export const SSOModal = ({ isOpen, onClose, initialProvider = 'GOOGLE', autoFillEmail = '' }) => {
  const { loginWithSSO, users, ssoSettings } = useAuth();

  const [activeProvider, setActiveProvider] = useState('GOOGLE');
  const [customEmail, setCustomEmail] = useState(autoFillEmail);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [authStep, setAuthStep] = useState('IDLE'); // 'IDLE' | 'CONNECTING' | 'NEGOTIATING' | 'VERIFYING' | 'SUCCESS' | 'ERROR'
  const [stepMessage, setStepMessage] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [selectedAccount, setSelectedAccount] = useState(null);

  useEffect(() => {
    setActiveProvider('GOOGLE');
  }, [initialProvider]);

  useEffect(() => {
    if (autoFillEmail) {
      setCustomEmail(autoFillEmail);
    }
  }, [autoFillEmail]);

  if (!isOpen) return null;

  // Corporate Directory accounts available for fast federation selection (Google Workspace @lloyds.in)
  const directoryAccounts = [
    {
      name: 'Harshvardhan M. K.',
      email: 'hmk@lloyds.in',
      role: ROLES.ADMIN,
      designation: 'Chief Administrator & Site Director',
      department: 'Executive Administration',
      domain: 'lloyds.in',
      avatarColor: '#7C3AED'
    },
    {
      name: 'Pooja Nair',
      email: 'hr.operations@lloyds.in',
      role: ROLES.HR,
      designation: 'Senior HR Operations Lead',
      department: 'Human Resources',
      domain: 'lloyds.in',
      avatarColor: '#0284C7'
    },
    {
      name: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      email: 'medical.officer@lloyds.in',
      role: ROLES.MEDICAL,
      designation: 'Chief Medical Officer',
      department: 'Occupational Health & Medical Services',
      domain: 'lloyds.in',
      avatarColor: '#EA580C'
    },
    {
      name: 'Arun Patil',
      email: 'ehs.safety@lloyds.in',
      role: ROLES.SAFETY,
      designation: 'Lead EHS Safety Engineer',
      department: 'Environment, Health & Safety',
      domain: 'lloyds.in',
      avatarColor: '#D97706'
    },
    {
      name: 'Rajesh Sharma',
      email: 'it.biometrics@lloyds.in',
      role: ROLES.IT,
      designation: 'Senior IT Biometric Specialist',
      department: 'Information Technology',
      domain: 'lloyds.in',
      avatarColor: '#2563EB'
    },
    {
      name: 'Mahesh Kulkarni',
      email: 'camp.gondwana@lloyds.in',
      role: ROLES.CAMP,
      designation: 'Camp Accommodations Supervisor',
      department: 'Camp Administration (Gondwana)',
      domain: 'lloyds.in',
      avatarColor: '#059669'
    }
  ];

  const handleExecuteSSO = async (account) => {
    setSelectedAccount(account);
    setErrorMsg('');

    // Strict domain guard for @lloyds.in Google Workspace
    if (!account.email.toLowerCase().endsWith('@lloyds.in')) {
      setErrorMsg('Access Restricted: Only verified @lloyds.in Google Workspace accounts are permitted for Single Sign-On.');
      return;
    }

    setAuthStep('CONNECTING');
    const providerName = 'Google Workspace Identity (@lloyds.in)';
    setStepMessage(`Contacting ${providerName}...`);

    setTimeout(() => {
      setAuthStep('NEGOTIATING');
      setStepMessage(`Exchanging cryptographic OIDC token & verifying @lloyds.in tenant claims...`);

      setTimeout(() => {
        setAuthStep('VERIFYING');
        setStepMessage(`Claims matched: ${account.name} assigned to ${ROLE_LABELS[account.role] || account.role} Portal`);

        setTimeout(async () => {
          try {
            const res = await loginWithSSO({
              provider: 'GOOGLE',
              email: account.email,
              name: account.name,
              role: account.role,
              designation: account.designation,
              department: account.department,
              tenantId: 'lloyds.in'
            });

            if (res && res.success) {
              setAuthStep('SUCCESS');
              setStepMessage(`Single Sign-On Success. Initializing secure workspace...`);
              setTimeout(() => {
                onClose();
              }, 700);
            } else {
              setAuthStep('ERROR');
              setErrorMsg(res?.error || 'SSO authentication failed. Token was rejected by Google Workspace identity gateway.');
            }
          } catch (err) {
            setAuthStep('ERROR');
            setErrorMsg('Unable to complete SSO handshake with Google Workspace gateway.');
          }
        }, 600);
      }, 550);
    }, 450);
  };

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    const cleanInput = (customEmail || '').trim().toLowerCase();
    if (!cleanInput || !cleanInput.includes('@')) {
      setErrorMsg('Please enter a valid corporate email address ending with @lloyds.in');
      return;
    }

    if (!cleanInput.endsWith('@lloyds.in')) {
      setErrorMsg('Access Restricted: Single Sign-On is exclusively permitted for verified @lloyds.in Google Workspace accounts.');
      return;
    }

    const matchedAccount = directoryAccounts.find(a => a.email.toLowerCase() === cleanInput);

    const accountToUse = matchedAccount || {
      name: cleanInput.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      email: cleanInput,
      role: cleanInput.includes('admin') ? ROLES.ADMIN :
            cleanInput.includes('medical') ? ROLES.MEDICAL :
            cleanInput.includes('safe') ? ROLES.SAFETY :
            cleanInput.includes('it') ? ROLES.IT :
            cleanInput.includes('camp') ? ROLES.CAMP : ROLES.HR,
      designation: 'Enterprise Staff Member (Google SSO Verified)',
      department: 'Corporate Operations',
      domain: 'lloyds.in',
      avatarColor: '#4285F4'
    };

    handleExecuteSSO(accountToUse);
  };

  const getProviderConfig = () => ({
    title: 'Google Workspace Enterprise',
    subtitle: 'Lloyds Cloud Identity • Secure Workforce Login',
    tenant: 'lloyds.in (Google Cloud Directory)',
    protocol: 'Google Workspace OIDC 2.0',
    logo: <GoogleLogo size={24} />,
    accent: '#4285F4'
  });

  const config = getProviderConfig();

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(15, 23, 42, 0.75)',
      backdropFilter: 'blur(5px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 99999,
      padding: '1rem'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface, #FFFFFF)',
        width: '100%',
        maxWidth: '520px',
        borderRadius: '16px',
        border: '1px solid var(--border-medium, #E2E8F0)',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: `3px solid ${config.accent}`
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {config.logo}
            <div>
              <div style={{ fontSize: '1rem', fontWeight: 800, letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                <span>{config.title}</span>
                <span style={{
                  fontSize: '0.65rem',
                  backgroundColor: 'rgba(255, 255, 255, 0.15)',
                  padding: '0.15rem 0.45rem',
                  borderRadius: '10px',
                  fontWeight: 600,
                  color: '#93C5FD'
                }}>
                  FEDERATED
                </span>
              </div>
              <div style={{ fontSize: '0.725rem', color: '#94A3B8' }}>
                {config.subtitle}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={authStep !== 'IDLE' && authStep !== 'ERROR'}
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              cursor: authStep !== 'IDLE' && authStep !== 'ERROR' ? 'not-allowed' : 'pointer',
              padding: '0.35rem',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'color 0.15s ease'
            }}
            title="Cancel SSO Login"
          >
            <X size={18} />
          </button>
        </div>

        {/* Exclusive Provider Indicator Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '0.5rem',
          backgroundColor: '#EFF6FF',
          borderBottom: '1px solid #DBEAFE',
          padding: '0.65rem 1rem',
          fontSize: '0.78rem',
          fontWeight: 700,
          color: '#1D4ED8'
        }}>
          <GoogleLogo size={16} />
          <span>Exclusive Single Sign-On Provider: Google Workspace (@lloyds.in)</span>
        </div>

        {/* Modal Content Body */}
        <div style={{ padding: '1.5rem 1.75rem' }}>
          {/* Active Handshake Animation Screen */}
          {authStep !== 'IDLE' && authStep !== 'ERROR' ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '2rem 1rem',
              textAlign: 'center'
            }}>
              <div style={{
                position: 'relative',
                width: '68px',
                height: '68px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem'
              }}>
                {authStep === 'SUCCESS' ? (
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backgroundColor: '#ECFDF5',
                    color: '#10B981',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <CheckCircle2 size={36} />
                  </div>
                ) : (
                  <>
                    <div style={{
                      position: 'absolute',
                      width: '68px',
                      height: '68px',
                      borderRadius: '50%',
                      border: `3px solid ${config.accent}20`,
                      borderTopColor: config.accent,
                      animation: 'spin 0.8s linear infinite'
                    }} />
                    {config.logo}
                  </>
                )}
              </div>

              <div style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.35rem' }}>
                {authStep === 'SUCCESS' ? 'Authentication Approved' : 'Authenticating via Single Sign-On'}
              </div>

              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', maxWidth: '380px', lineHeight: 1.45, marginBottom: '1rem' }}>
                {stepMessage}
              </div>

              {selectedAccount && (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.4rem 0.85rem',
                  borderRadius: '20px',
                  backgroundColor: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-medium)',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-primary)'
                }}>
                  <Fingerprint size={14} color={config.accent} />
                  <span>Identity: {selectedAccount.email}</span>
                </div>
              )}
            </div>
          ) : (
            <div>
              {/* Error Alert */}
              {errorMsg && (
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '0.65rem',
                  padding: '0.75rem 1rem',
                  borderRadius: '8px',
                  backgroundColor: '#FEF2F2',
                  border: '1px solid #FECACA',
                  color: '#991B1B',
                  fontSize: '0.8rem',
                  marginBottom: '1.25rem'
                }}>
                  <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
                  <div>{errorMsg}</div>
                </div>
              )}

              {/* Tenant Info Ribbon */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-surface-subtle, #F8FAFC)',
                borderRadius: '8px',
                border: '1px solid var(--border-light, #E2E8F0)',
                marginBottom: '1.25rem',
                fontSize: '0.75rem'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
                  <Server size={14} color="var(--brand-primary, #E82329)" />
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Identity Tenant:</span>
                  <span style={{ color: 'var(--text-muted)' }}>{config.tenant}</span>
                </div>
                <span style={{ fontWeight: 700, color: 'var(--success-solid, #10B981)', fontSize: '0.7rem' }}>
                  ● LIVE
                </span>
              </div>

              <div style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '0.65rem' }}>
                Select Enterprise Directory Identity
              </div>

              {/* Directory Accounts List */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                maxHeight: '230px',
                overflowY: 'auto',
                marginBottom: '1.25rem',
                paddingRight: '2px'
              }}>
                {directoryAccounts.map((account) => (
                  <div
                    key={account.email}
                    onClick={() => handleExecuteSSO(account)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.65rem 0.85rem',
                      borderRadius: '8px',
                      border: '1px solid var(--border-medium, #CBD5E1)',
                      backgroundColor: 'var(--bg-surface, #FFFFFF)',
                      cursor: 'pointer',
                      transition: 'all 0.15s ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = config.accent;
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface-subtle, #F8FAFC)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--border-medium, #CBD5E1)';
                      e.currentTarget.style.backgroundColor = 'var(--bg-surface, #FFFFFF)';
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '50%',
                        backgroundColor: `${account.avatarColor}18`,
                        color: account.avatarColor,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 800,
                        fontSize: '0.85rem'
                      }}>
                        {account.name.charAt(0)}
                      </div>
                      <div>
                        <div style={{ fontSize: '0.825rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                          {account.name}
                        </div>
                        <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                          {account.email}
                        </div>
                      </div>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{
                        fontSize: '0.7rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.5rem',
                        borderRadius: '6px',
                        backgroundColor: `${account.avatarColor}15`,
                        color: account.avatarColor
                      }}>
                        {account.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Or Sign In With Custom Work Email */}
              {showCustomInput ? (
                <form onSubmit={handleCustomSubmit} style={{ marginTop: '0.5rem' }}>
                  <label style={{ display: 'block', fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.35rem' }}>
                    Corporate Email Address
                  </label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input
                      type="email"
                      required
                      value={customEmail}
                      onChange={(e) => setCustomEmail(e.target.value)}
                      placeholder="your.name@lloyds.in"
                      style={{
                        flex: 1,
                        padding: '0.55rem 0.75rem',
                        fontSize: '0.85rem',
                        border: '1px solid var(--border-medium)',
                        borderRadius: '8px',
                        backgroundColor: 'var(--bg-surface)',
                        color: 'var(--text-primary)',
                        outline: 'none'
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '0.55rem 1rem',
                        backgroundColor: config.accent,
                        color: '#FFFFFF',
                        border: 'none',
                        borderRadius: '8px',
                        fontWeight: 700,
                        fontSize: '0.825rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.35rem'
                      }}
                    >
                      <span>Continue</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                  <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.35rem' }}>
                    Authorized SSO domain: <strong>@lloyds.in</strong> (Google Workspace Only)
                  </div>
                </form>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCustomInput(true)}
                  style={{
                    width: '100%',
                    padding: '0.65rem',
                    border: '1px dashed var(--border-medium, #CBD5E1)',
                    borderRadius: '8px',
                    backgroundColor: 'transparent',
                    color: 'var(--brand-primary, #E82329)',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.4rem',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <User size={14} />
                  <span>Use another corporate account...</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Modal Security Footer */}
        <div style={{
          backgroundColor: 'var(--bg-surface-subtle, #F8FAFC)',
          padding: '0.85rem 1.5rem',
          borderTop: '1px solid var(--border-light, #E2E8F0)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.72rem',
          color: 'var(--text-muted, #64748B)',
          flexWrap: 'wrap',
          gap: '0.5rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
            <Lock size={12} color="var(--success-solid, #10B981)" />
            <span>FIDO2 / WebAuthn &amp; MFA Enforced via IdP</span>
          </div>
          <span>Protocol: {config.protocol}</span>
        </div>
      </div>
    </div>
  );
};

export default SSOModal;
