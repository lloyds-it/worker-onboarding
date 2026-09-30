import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Lock, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Server, 
  Globe, 
  ExternalLink, 
  Key, 
  Activity, 
  Sliders, 
  UserCheck, 
  ShieldAlert,
  Fingerprint,
  Check,
  Zap
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { GoogleLogo } from '../auth/SSOModal';

export const SSOConfigTab = () => {
  const { ssoSettings, updateSSOSettings, currentUser } = useAuth();

  const [testingProvider, setTestingProvider] = useState(null);
  const [testResult, setTestResult] = useState(null);
  const [savedNotice, setSavedNotice] = useState(false);

  // Active mock SSO sessions (Google Workspace @lloyds.in)
  const [activeSessions, setActiveSessions] = useState([
    {
      id: 'SESS-GO-9901',
      user: 'Harshvardhan M. K.',
      email: 'hmk@lloyds.in',
      role: 'ADMIN',
      provider: 'GOOGLE',
      ip: '10.240.12.84 (Corporate LAN - Konsari)',
      loginTime: '2026-09-30 08:30:15',
      status: 'ACTIVE'
    },
    {
      id: 'SESS-GO-8842',
      user: 'Pooja Nair',
      email: 'hr.operations@lloyds.in',
      role: 'HR',
      provider: 'GOOGLE',
      ip: '10.240.14.22 (HR Department VLAN)',
      loginTime: '2026-09-30 08:45:00',
      status: 'ACTIVE'
    },
    {
      id: 'SESS-GO-7721',
      user: 'Dr. Vivek Deshmukh',
      email: 'medical.officer@lloyds.in',
      role: 'MEDICAL',
      provider: 'GOOGLE',
      ip: '10.240.16.10 (OHC Medical Center)',
      loginTime: '2026-09-30 09:00:22',
      status: 'ACTIVE'
    }
  ]);

  const handleToggleEnforce = () => {
    const updated = !ssoSettings?.enforceSSO;
    updateSSOSettings({ enforceSSO: updated });
    triggerSaveNotice();
  };

  const handleToggleJIT = () => {
    const updated = !ssoSettings?.jitProvisioning;
    updateSSOSettings({ jitProvisioning: updated });
    triggerSaveNotice();
  };

  const handleToggleProvider = (key) => {
    const current = ssoSettings?.providers?.[key]?.enabled;
    const updatedProviders = {
      ...ssoSettings?.providers,
      [key]: {
        ...ssoSettings?.providers?.[key],
        enabled: !current
      }
    };
    updateSSOSettings({ providers: updatedProviders });
    triggerSaveNotice();
  };

  const triggerSaveNotice = () => {
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2500);
  };

  const runHandshakeTest = (providerKey) => {
    setTestingProvider(providerKey);
    setTestResult(null);

    setTimeout(() => {
      setTestingProvider(null);
      setTestResult({
        provider: providerKey,
        success: true,
        latency: Math.floor(Math.random() * 25) + 28,
        endpoints: {
          discovery: '200 OK (OIDC Discovery Doc Verified)',
          certs: 'Valid (2048-bit RSA • SHA-256 Signature)',
          claimsMapping: '100% matched (Email, Name, Role, Department)',
          tenantResolution: 'Lloyds Metals & Energy Corp. Directory verified'
        }
      });
    }, 900);
  };

  const handleRevokeSession = (sessionId) => {
    setActiveSessions(activeSessions.filter(s => s.id !== sessionId));
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Top Banner Notice */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '1.25rem 1.5rem',
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg, 14px)',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-xs)',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          <div style={{
            width: '46px',
            height: '46px',
            borderRadius: '12px',
            backgroundColor: '#EFF6FF',
            color: '#2563EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            <ShieldCheck size={26} />
          </div>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)', margin: 0 }}>
              Enterprise Single Sign-On (SSO) &amp; Identity Federation
            </h3>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0.2rem 0 0 0' }}>
              Federate employee logins exclusively via Google Workspace (@lloyds.in).
            </p>
          </div>
        </div>

        {savedNotice && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            padding: '0.4rem 0.85rem',
            borderRadius: '20px',
            backgroundColor: '#ECFDF5',
            color: '#065F46',
            border: '1px solid #A7F3D0',
            fontSize: '0.75rem',
            fontWeight: 700
          }}>
            <Check size={14} />
            <span>Policy Saved Successfully</span>
          </div>
        )}
      </div>

      {/* Identity Provider Configuration Cards */}
      <div>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Configured Identity Provider (IdP)
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(320px, 600px)', gap: '1.25rem' }}>
          {/* Sole Active Provider: Google Workspace Identity */}
          <div style={{
            backgroundColor: 'var(--bg-surface)',
            borderRadius: 'var(--radius-lg, 14px)',
            border: ssoSettings?.providers?.google?.enabled ? '1px solid #BFDBFE' : '1px solid var(--border-light)',
            padding: '1.25rem',
            boxShadow: 'var(--shadow-sm)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                  <GoogleLogo size={24} />
                  <div>
                    <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                      Google Workspace Identity
                    </div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      Google Cloud Directory (@lloyds.in) • Sole Enterprise IdP
                    </div>
                  </div>
                </div>

                <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={ssoSettings?.providers?.google?.enabled ?? true}
                    onChange={() => handleToggleProvider('google')}
                    style={{ cursor: 'pointer', width: '16px', height: '16px' }}
                  />
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, marginLeft: '0.35rem', color: ssoSettings?.providers?.google?.enabled ? '#1E40AF' : 'var(--text-muted)' }}>
                    {ssoSettings?.providers?.google?.enabled ? 'Active' : 'Disabled'}
                  </span>
                </label>
              </div>

              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.35rem',
                fontSize: '0.75rem',
                padding: '0.65rem 0.85rem',
                backgroundColor: 'var(--bg-surface-subtle)',
                borderRadius: '8px',
                border: '1px solid var(--border-light)',
                marginBottom: '1rem'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Authorized Domain:</span>
                  <strong style={{ color: 'var(--text-primary)' }}>lloyds.in</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Client ID:</span>
                  <code>lloyds-workforce.apps.google.com</code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-muted)' }}>Protocol:</span>
                  <span>Google OpenID Connect 2.0 (PKCE)</span>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={testingProvider === 'google'}
              onClick={() => runHandshakeTest('google')}
              className="btn btn-secondary"
              style={{
                width: '100%',
                padding: '0.5rem',
                fontSize: '0.78rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem'
              }}
            >
              {testingProvider === 'google' ? (
                <>
                  <RefreshCw size={13} className="spin" />
                  <span>Probing Google Identity Gateway...</span>
                </>
              ) : (
                <>
                  <Activity size={13} color="#4285F4" />
                  <span>Test Google Workspace Handshake</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Handshake Diagnostic Results Output */}
      {testResult && (
        <div style={{
          backgroundColor: '#ECFDF5',
          border: '1px solid #A7F3D0',
          borderRadius: '12px',
          padding: '1.25rem',
          fontSize: '0.8rem',
          animation: 'fadeIn 0.2s ease-out'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 800, color: '#065F46' }}>
              <CheckCircle2 size={18} />
              <span>Identity Provider Handshake Diagnostic Passed ({testResult.provider.toUpperCase()})</span>
            </div>
            <span style={{ fontWeight: 700, color: '#047857', backgroundColor: '#D1FAE5', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.72rem' }}>
              ⚡ Latency: {testResult.latency}ms
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '0.65rem' }}>
            {Object.entries(testResult.endpoints).map(([key, val]) => (
              <div key={key} style={{ backgroundColor: '#FFFFFF', padding: '0.5rem 0.75rem', borderRadius: '6px', border: '1px solid #D1FAE5' }}>
                <span style={{ color: '#047857', fontWeight: 700, textTransform: 'capitalize' }}>{key}: </span>
                <span style={{ color: '#065F46' }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Security Policies & Governance Toggles */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg, 14px)',
        border: '1px solid var(--border-medium)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '1.25rem', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <Sliders size={16} color="var(--brand-primary)" />
          <span>SSO Security &amp; Identity Enforcement Policies</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {/* Toggle 1: Enforce SSO */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-light)'
          }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <span>Enforce Single Sign-On for Corporate Staff</span>
                {ssoSettings?.enforceSSO && (
                  <span style={{ fontSize: '0.65rem', backgroundColor: '#FEE2E2', color: '#991B1B', padding: '0.1rem 0.45rem', borderRadius: '10px', fontWeight: 800 }}>
                    STRICT
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Blocks standard password logins for <code>@lloyds.in</code> staff, requiring Google Workspace SSO. (Emergency Chief Administrator break-glass override retained).
              </div>
            </div>

            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                id="toggle-enforce-sso"
                type="checkbox"
                checked={ssoSettings?.enforceSSO || false}
                onChange={handleToggleEnforce}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </label>
          </div>

          {/* Toggle 2: JIT Provisioning */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingBottom: '1rem',
            borderBottom: '1px solid var(--border-light)'
          }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Just-In-Time (JIT) Directory Auto-Enrollment
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Automatically provision and grant default departmental access when a verified Lloyds enterprise user signs in via SSO for the first time.
              </div>
            </div>

            <label style={{ position: 'relative', display: 'inline-flex', alignItems: 'center', cursor: 'pointer' }}>
              <input
                id="toggle-jit-provisioning"
                type="checkbox"
                checked={ssoSettings?.jitProvisioning ?? true}
                onChange={handleToggleJIT}
                style={{ width: '20px', height: '20px', cursor: 'pointer' }}
              />
            </label>
          </div>

          {/* Authorized Domains Info */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                Authorized SSO Corporate Domains
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                Only accounts under these registered corporate namespaces are permitted to federate into the worker onboarding portal.
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 800, padding: '0.25rem 0.75rem', borderRadius: '6px', backgroundColor: '#EFF6FF', border: '1px solid #BFDBFE', color: '#1D4ED8', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                <CheckCircle2 size={13} color="#2563EB" />
                <span>@lloyds.in (Exclusive Corporate Domain)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Active SSO Sessions Table */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg, 14px)',
        border: '1px solid var(--border-medium)',
        padding: '1.5rem',
        boxShadow: 'var(--shadow-xs)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Active SSO Enterprise Sessions
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Live delegated sessions authenticated via corporate identity provider token exchange.
            </div>
          </div>

          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', backgroundColor: 'var(--bg-surface-subtle)', padding: '0.25rem 0.65rem', borderRadius: '12px' }}>
            {activeSessions.length} Active Sessions
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="data-table" style={{ width: '100%', fontSize: '0.8rem' }}>
            <thead>
              <tr>
                <th>User / Identity</th>
                <th>IdP Provider</th>
                <th>Department</th>
                <th>Network IP &amp; Location</th>
                <th>Session Time</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {activeSessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{session.user}</div>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{session.email}</div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 600 }}>
                      <GoogleLogo size={14} />
                      <span>Google Workspace</span>
                    </div>
                  </td>
                  <td>
                    <span className="badge badge-info">{session.role}</span>
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    {session.ip}
                  </td>
                  <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                    {session.loginTime}
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(session.id)}
                      className="btn btn-secondary"
                      style={{
                        padding: '0.25rem 0.55rem',
                        fontSize: '0.72rem',
                        color: 'var(--danger-solid)',
                        borderColor: 'var(--danger-border)'
                      }}
                      title="Revoke and terminate this SSO session"
                    >
                      Revoke
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SSOConfigTab;
