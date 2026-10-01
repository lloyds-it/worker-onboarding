import React, { createContext, useContext, useState, useEffect } from 'react';
import { ROLES, ROLE_LABELS } from '../types/constants';
import { logAuditEvent } from '../services/auditService';
import { 
  apiLogin, 
  apiSSOLogin, 
  apiChangePassword, 
  apiUploadUserSignature, 
  apiGetUsers, 
  apiVerifySession,
  apiCreateUser,
  apiDeleteUser,
  apiToggleUserStatus
} from '../services/apiService';

const AuthContext = createContext();

const AUTH_SESSION_KEY = 'lloyd_auth_session_v3';
const USERS_STORAGE_KEY = 'lloyd_system_users_v3';
const SSO_SETTINGS_KEY = 'lloyd_sso_settings_v1';

export const DEFAULT_SSO_SETTINGS = {
  enabled: false,
  enforceSSO: false,
  allowPasswordFallback: true,
  jitProvisioning: true,
  defaultTenant: 'lloyds.in',
  allowedDomains: ['lloyds.in'],
  providers: {
    google: { 
      enabled: false, 
      name: 'Google Workspace Identity (Disabled)', 
      domain: 'lloyds.in', 
      clientId: 'lloyds-workforce.apps.googleusercontent.com',
      status: 'INACTIVE',
      protocol: 'Google Workspace OIDC 2.0'
    },
    microsoft: { 
      enabled: false, 
      name: 'Microsoft 365 (Disabled)', 
      tenantId: 'lloyds.in', 
      status: 'INACTIVE',
      protocol: 'OIDC'
    },
    saml: { 
      enabled: false, 
      name: 'Corporate SAML 2.0 (Disabled)', 
      status: 'INACTIVE',
      protocol: 'SAML 2.0'
    }
  }
};

export const HARDCODED_ADMIN = {
  id: 'USR-ADMIN-01',
  name: 'Kolli Hemanth',
  designation: 'Site Administrator & Chief Director',
  email: 'hmk@lloyds.in',
  alias: 'admin',
  aliases: ['admin', 'hmk@lloyds.in', 'hmk', 'kolli', 'kolli.hemanth', 'admin@lloyds.in'],
  password: 'Lloyds@2026#',
  role: ROLES.ADMIN,
  department: 'Site Administration & Master Control',
  status: 'ACTIVE',
  createdAt: '2026-09-01T08:00:00Z'
};

export const INITIAL_SYSTEM_USERS = [
  HARDCODED_ADMIN,
  {
    id: 'USR-HR-04',
    name: 'Rinku Sharma',
    designation: 'Senior HR Operations Lead',
    email: 'ruv@lloyds.in',
    alias: 'hr',
    aliases: ['hr', 'ruv@lloyds.in', 'rinku', 'ruv', 'rinku.sharma'],
    password: 'Lloyds@2026#',
    role: ROLES.HR,
    department: 'Human Resources',
    status: 'ACTIVE',
    createdAt: '2026-09-02T09:00:00Z'
  },
  {
    id: 'USR-MED-02',
    name: 'Gopal Ray',
    designation: 'Chief Medical Officer',
    email: 'glr@lloyds.in',
    alias: 'medical',
    aliases: ['medical', 'glr@lloyds.in', 'gopal', 'glr', 'gopal.ray', 'doctor', 'med'],
    password: 'Lloyds@2026#',
    role: ROLES.MEDICAL,
    department: 'Occupational Health & Medical Services',
    status: 'ACTIVE',
    createdAt: '2026-09-02T09:30:00Z'
  },
  {
    id: 'USR-SAF-08',
    name: 'Jithendra Parida',
    designation: 'Lead EHS Safety Engineer',
    email: 'jdp@lloyds.in',
    alias: 'safety',
    aliases: ['safety', 'jdp@lloyds.in', 'jithendra', 'jdp', 'jithendra.parida', 'ehs', 'safe'],
    password: 'Lloyds@2026#',
    role: ROLES.SAFETY,
    department: 'Environment, Health & Safety',
    status: 'ACTIVE',
    createdAt: '2026-09-03T10:00:00Z'
  },
  {
    id: 'USR-IT-05',
    name: 'Chitta Ranjan Panda',
    designation: 'Senior IT Biometric Specialist',
    email: 'crp@lloyds.in',
    alias: 'it',
    aliases: ['it', 'crp@lloyds.in', 'chitta', 'crp', 'chitta.panda', 'biometrics'],
    password: 'Lloyds@2026#',
    role: ROLES.IT,
    department: 'Information Technology',
    status: 'ACTIVE',
    createdAt: '2026-09-03T10:30:00Z'
  },
  {
    id: 'USR-CMP-03',
    name: 'Ripan',
    designation: 'Camp Accommodations Supervisor',
    email: 'rin@lloyds.in',
    alias: 'camp',
    aliases: ['camp', 'rin@lloyds.in', 'ripan', 'rin', 'housing'],
    password: 'Lloyds@2026#',
    role: ROLES.CAMP,
    department: 'Camp Administration (Gondwana)',
    status: 'ACTIVE',
    createdAt: '2026-09-04T11:00:00Z'
  }
];

export const AuthProvider = ({ children }) => {
  // Load users from storage or seed defaults, guaranteeing hardcoded admin credentials
  const [users, setUsers] = useState(() => {
    try {
      const raw = localStorage.getItem(USERS_STORAGE_KEY);
      let loadedUsers = raw ? JSON.parse(raw) : INITIAL_SYSTEM_USERS;
      // Ensure default accounts exist while preserving customized passwords and signatures
      const adminIdx = loadedUsers.findIndex(u => 
        u.id === 'USR-ADMIN-01' || 
        u.role === ROLES.ADMIN || 
        u.email === 'admin@lloyds.in' || 
        u.email === 'hmk@lloyds.in' ||
        u.email === 'hmk@lloydsprojects.in'
      );
      if (adminIdx >= 0) {
        loadedUsers[adminIdx] = {
          ...HARDCODED_ADMIN,
          ...loadedUsers[adminIdx]
        };
      } else {
        loadedUsers.unshift(HARDCODED_ADMIN);
      }
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(loadedUsers));
      return loadedUsers;
    } catch {
      return INITIAL_SYSTEM_USERS;
    }
  });

  const [ssoSettings, setSsoSettings] = useState(() => {
    try {
      const saved = localStorage.getItem(SSO_SETTINGS_KEY);
      return saved ? { ...DEFAULT_SSO_SETTINGS, ...JSON.parse(saved), enforceSSO: false, enabled: false } : DEFAULT_SSO_SETTINGS;
    } catch {
      return DEFAULT_SSO_SETTINGS;
    }
  });

  const [currentRole, setCurrentRole] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_SESSION_KEY);
      return saved ? JSON.parse(saved).role : null;
    } catch {
      return null;
    }
  });

  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        let baseUser = null;
        if (parsed.email === 'admin@lloyds.in' || parsed.email === 'hmk@lloydsprojects.in' || parsed.role === ROLES.ADMIN) {
          baseUser = HARDCODED_ADMIN;
        } else {
          baseUser = users?.find(u => u.email === parsed.email) || INITIAL_SYSTEM_USERS.find(u => u.email === parsed.email);
        }
        if (baseUser) {
          return {
            ...baseUser,
            authMethod: parsed.authMethod || 'PASSWORD',
            ssoProvider: parsed.ssoProvider || null,
            ssoTenant: parsed.ssoTenant || null
          };
        }
        return HARDCODED_ADMIN;
      }
      return null;
    } catch {
      return null;
    }
  });

  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    try {
      const saved = localStorage.getItem(AUTH_SESSION_KEY);
      return Boolean(saved);
    } catch {
      return false;
    }
  });

  // Cryptographic session verification with backend on startup
  useEffect(() => {
    const verifySession = async () => {
      const raw = localStorage.getItem(AUTH_SESSION_KEY);
      if (!raw) return;
      try {
        const res = await apiVerifySession();
        if (res && res.success && res.user) {
          setCurrentUser(prev => ({ ...prev, ...res.user }));
          if (res.user.role) setCurrentRole(res.user.role);
        } else if (res && res.error && (res.error.includes('expired') || res.error.includes('invalid') || res.error.includes('missing') || res.error.includes('Session expired'))) {
          console.warn('[Auth] Remote session token expired or invalid, clearing local session.');
          setIsAuthenticated(false);
          setCurrentRole(null);
          setCurrentUser(null);
          localStorage.removeItem(AUTH_SESSION_KEY);
        }
      } catch (e) {
        // network issue, retain offline session
      }
    };
    verifySession();
  }, []);

  // Helper to persist users
  const commitUsers = (updatedUsers) => {
    setUsers(updatedUsers);
    try {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(updatedUsers));
    } catch (err) {
      console.error('Failed to save users:', err);
    }
  };

  // Login with remote gateway verification and local fallback
  const login = async (roleOrEmail, password) => {
    const input = (roleOrEmail || '').toString().trim();
    
    // 1. Attempt backend API authentication first
    try {
      const apiRes = await apiLogin(input, password);
      if (apiRes && apiRes.success && apiRes.user) {
        setCurrentRole(apiRes.user.role || ROLES.ADMIN);
        setCurrentUser(apiRes.user);
        setIsAuthenticated(true);
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
          role: apiRes.user.role || ROLES.ADMIN,
          email: apiRes.user.email,
          token: apiRes.token
        }));

        logAuditEvent({
          role: apiRes.user.role || ROLES.ADMIN,
          action: 'USER_LOGIN',
          workerId: 'N/A',
          workerName: apiRes.user.name,
          details: `${apiRes.user.name} (${apiRes.user.designation || ROLE_LABELS[apiRes.user.role]}) authenticated into system.`
        });
        return { success: true, user: apiRes.user };
      } else if (apiRes && apiRes.error) {
        return { success: false, error: apiRes.error };
      }
    } catch (apiErr) {
      console.warn('[Auth] Remote gateway authentication error, evaluating fallback:', apiErr);
    }

    // 2. Resilient local fallback if backend connection drops
    const lowerInput = input.toLowerCase();
    const candidate = (users || []).find(u => 
      u.email.toLowerCase() === lowerInput ||
      u.role.toLowerCase() === lowerInput ||
      (u.alias && u.alias.toLowerCase() === lowerInput) ||
      (Array.isArray(u.aliases) && u.aliases.map(a => a.toLowerCase()).includes(lowerInput)) ||
      (lowerInput === 'admin' && u.role === ROLES.ADMIN)
    ) || INITIAL_SYSTEM_USERS.find(u => 
      u.email.toLowerCase() === lowerInput ||
      u.role.toLowerCase() === lowerInput ||
      (u.alias && u.alias.toLowerCase() === lowerInput) ||
      (Array.isArray(u.aliases) && u.aliases.map(a => a.toLowerCase()).includes(lowerInput)) ||
      (lowerInput === 'admin' && u.role === ROLES.ADMIN)
    );

    if (candidate) {
      if (ssoSettings?.enabled && ssoSettings?.enforceSSO && candidate.role !== ROLES.ADMIN && (candidate.email.endsWith('@lloydsprojects.in') || candidate.email.endsWith('@lloyds.in'))) {
        return { 
          success: false, 
          error: 'Corporate Security Enforcement: Single Sign-On (SSO) is mandatory for corporate accounts. Please click "Sign in with SSO" below.' 
        };
      }

      if (candidate.password && password && password !== candidate.password) {
        return { success: false, error: 'Invalid password. Please check your credentials.' };
      }

      setCurrentRole(candidate.role);
      setCurrentUser(candidate);
      setIsAuthenticated(true);
      localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({ role: candidate.role, email: candidate.email, authMethod: 'PASSWORD' }));

      logAuditEvent({
        role: candidate.role,
        action: 'USER_LOGIN',
        workerId: 'N/A',
        workerName: candidate.name,
        details: `${candidate.name} (${candidate.designation}) authenticated.`
      });
      return { success: true, user: candidate };
    }

    return { success: false, error: 'Invalid credentials. Please check your username and password.' };
  };

  // Single Sign-On (SSO) Enterprise Federation Authentication (Google Workspace @lloyds.in)
  const loginWithSSO = async ({ provider = 'GOOGLE', email, name, role, designation, department, tenantId = 'lloyds.in' }) => {
    const cleanEmail = (email || '').trim().toLowerCase();
    
    // Strict Domain Validation: Only @lloyds.in permitted
    if (!cleanEmail.endsWith('@lloyds.in')) {
      return {
        success: false,
        error: `Access Restricted: Only official @lloyds.in Google Workspace accounts are permitted for Single Sign-On (received: ${cleanEmail || 'blank'}).`
      };
    }

    // 1. Attempt API verification first
    try {
      const apiRes = await apiSSOLogin('GOOGLE', cleanEmail, `token_${Date.now()}`, tenantId);
      if (apiRes && apiRes.success && apiRes.user) {
        const authedUser = {
          ...apiRes.user,
          authMethod: 'SSO',
          ssoProvider: 'GOOGLE',
          ssoTenant: 'lloyds.in'
        };
        setCurrentRole(authedUser.role || ROLES.ADMIN);
        setCurrentUser(authedUser);
        setIsAuthenticated(true);
        localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
          role: authedUser.role || ROLES.ADMIN,
          email: authedUser.email,
          authMethod: 'SSO',
          ssoProvider: 'GOOGLE',
          ssoTenant: 'lloyds.in',
          token: apiRes.token
        }));

        logAuditEvent({
          role: authedUser.role || ROLES.ADMIN,
          action: 'SSO_LOGIN',
          workerId: 'N/A',
          workerName: authedUser.name,
          details: `${authedUser.name} authenticated via Google Workspace Single Sign-On (@lloyds.in).`
        });
        return { success: true, user: authedUser };
      }
    } catch (apiErr) {
      console.warn('[Auth] Remote SSO gateway check fallback:', apiErr);
    }

    // 2. Local resilient federation & directory claims matching
    let targetUser = (users || []).find(u => u.email.toLowerCase() === cleanEmail) || 
                     INITIAL_SYSTEM_USERS.find(u => u.email.toLowerCase() === cleanEmail);

    // If user not yet in local users list, auto-provision via JIT for @lloyds.in
    if (!targetUser) {
      const inferredName = name || cleanEmail.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const inferredRole = role || (
        cleanEmail.includes('admin') ? ROLES.ADMIN :
        cleanEmail.includes('medical') ? ROLES.MEDICAL :
        cleanEmail.includes('safe') ? ROLES.SAFETY :
        cleanEmail.includes('it') ? ROLES.IT :
        cleanEmail.includes('camp') ? ROLES.CAMP : ROLES.HR
      );

      targetUser = {
        id: `USR-SSO-${Date.now().toString().slice(-4)}`,
        name: inferredName,
        email: cleanEmail,
        role: inferredRole,
        designation: designation || (ROLE_LABELS[inferredRole] ? `${ROLE_LABELS[inferredRole]} (SSO)` : 'Enterprise Staff'),
        department: department || 'Operations',
        status: 'ACTIVE',
        authMethod: 'SSO',
        ssoProvider: 'GOOGLE',
        ssoTenant: 'lloyds.in',
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...(users || []), targetUser];
      commitUsers(updatedUsers);
    }

    const authedUser = {
      ...targetUser,
      authMethod: 'SSO',
      ssoProvider: 'GOOGLE',
      ssoTenant: 'lloyds.in'
    };

    setCurrentRole(authedUser.role);
    setCurrentUser(authedUser);
    setIsAuthenticated(true);
    localStorage.setItem(AUTH_SESSION_KEY, JSON.stringify({
      role: authedUser.role,
      email: authedUser.email,
      authMethod: 'SSO',
      ssoProvider: 'GOOGLE',
      ssoTenant: 'lloyds.in'
    }));

    logAuditEvent({
      role: authedUser.role,
      action: 'SSO_LOGIN',
      workerId: 'N/A',
      workerName: authedUser.name,
      details: `${authedUser.name} authenticated via Google Workspace Single Sign-On (@lloyds.in).`
    });

    return { success: true, user: authedUser };
  };

  // Update SSO configuration
  const updateSSOSettings = (newSettings) => {
    const updated = { ...ssoSettings, ...newSettings };
    setSsoSettings(updated);
    try {
      localStorage.setItem(SSO_SETTINGS_KEY, JSON.stringify(updated));
      logAuditEvent({
        role: currentRole || ROLES.ADMIN,
        action: 'ADMIN_SSO_SETTINGS_UPDATED',
        workerId: 'N/A',
        workerName: currentUser?.name || 'Administrator',
        details: `Updated enterprise Single Sign-On (SSO) configuration & security enforcement policies.`
      });
    } catch (e) {
      console.error('Failed to save SSO settings:', e);
    }
  };

  const logout = () => {
    if (currentUser) {
      logAuditEvent({
        role: currentRole || ROLES.ADMIN,
        action: 'USER_LOGOUT',
        workerId: 'N/A',
        workerName: currentUser.name,
        details: `Logged out from ${ROLE_LABELS[currentRole] || 'Administrator'} portal.${currentUser.authMethod === 'SSO' ? ` (Revoked ${currentUser.ssoProvider || 'SSO'} token)` : ''}`
      });
    }

    setIsAuthenticated(false);
    setCurrentRole(null);
    setCurrentUser(null);
    localStorage.removeItem(AUTH_SESSION_KEY);

    // Strip stale URL hash (e.g. #departments, #users, #pipeline) upon logout
    try {
      if (typeof window !== 'undefined') {
        if (window.history && window.history.replaceState) {
          window.history.replaceState(null, '', window.location.pathname + window.location.search);
        } else {
          window.location.hash = '';
        }
      }
    } catch (e) {}
  };

  // Admin creates new user (Synchronized with backend REST API and local state)
  const createUser = async ({ name, email, role, designation, password }) => {
    if (currentRole !== ROLES.ADMIN) {
      alert('Unauthorized: Only Chief Administrators can create new user accounts.');
      return false;
    }

    const cleanEmail = (email || '').trim().toLowerCase();
    const cleanName = (name || '').trim();

    // Check duplicate email
    if (users.some(u => u.email.toLowerCase() === cleanEmail)) {
      alert('A user with this email address already exists.');
      return false;
    }

    const deptMap = {
      [ROLES.ADMIN]: 'Site Administration & Master Control',
      [ROLES.HR]: 'Human Resources',
      [ROLES.MEDICAL]: 'Occupational Health & Medical Services',
      [ROLES.SAFETY]: 'Environment, Health & Safety',
      [ROLES.IT]: 'Information Technology',
      [ROLES.CAMP]: 'Camp Administration (Gondwana)'
    };

    const desigMap = {
      [ROLES.ADMIN]: 'Site Administrator / Director',
      [ROLES.HR]: 'HR Induction Officer',
      [ROLES.MEDICAL]: 'Medical Officer (CIH)',
      [ROLES.SAFETY]: 'EHS Safety Inspector',
      [ROLES.IT]: 'IT Biometric Systems Lead',
      [ROLES.CAMP]: 'Camp Housing Coordinator'
    };

    const rawPassword = (password || '').trim() || 'Lloyds@2026#';
    const dept = deptMap[role] || 'Operations';
    const cleanDesignation = (designation || '').trim() || desigMap[role] || 'Department Specialist';
    const aliasList = [cleanEmail, cleanEmail.split('@')[0], cleanName.toLowerCase().replace(/\s+/g, '.')];

    let createdId = `USR-${role}-${Date.now().toString().slice(-4)}`;

    // Call backend API
    try {
      const res = await apiCreateUser({
        name: cleanName,
        email: cleanEmail,
        role,
        designation: cleanDesignation,
        department: dept,
        password: rawPassword
      });
      if (res && res.success && res.user && res.user.id) {
        createdId = res.user.id;
      }
    } catch (e) {
      console.warn('[Auth] Remote user creation fallback:', e);
    }

    const newUser = {
      id: createdId,
      name: cleanName,
      email: cleanEmail,
      alias: cleanEmail.split('@')[0],
      aliases: aliasList,
      password: rawPassword,
      role,
      designation: cleanDesignation,
      department: dept,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };

    const updated = [...users, newUser];
    commitUsers(updated);

    logAuditEvent({
      role: ROLES.ADMIN,
      action: 'ADMIN_USER_CREATED',
      workerId: 'N/A',
      workerName: newUser.name,
      details: `Created new user account for ${newUser.name} assigned to ${ROLE_LABELS[role]} (${newUser.email}).`
    });

    return newUser;
  };

  // Admin toggles user status (Active / Inactive)
  const toggleUserStatus = async (userId) => {
    if (currentRole !== ROLES.ADMIN) return;

    const user = users.find(u => u.id === userId);
    if (!user) return;
    if (userId === 'USR-ADMIN-01') {
      alert('The primary Chief Administrator account cannot be deactivated.');
      return;
    }

    const newStatus = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';

    try {
      await apiToggleUserStatus(userId, newStatus);
    } catch (e) {
      console.warn('[Auth] Remote user status update error:', e);
    }

    const updated = users.map(u => {
      if (u.id !== userId) return u;
      return { ...u, status: newStatus };
    });

    commitUsers(updated);

    logAuditEvent({
      role: ROLES.ADMIN,
      action: 'ADMIN_USER_STATUS_CHANGED',
      workerId: 'N/A',
      workerName: user.name,
      details: `Changed account status of ${user.name} to ${newStatus}.`
    });
  };

  // Admin deletes user
  const deleteUser = async (userId) => {
    if (currentRole !== ROLES.ADMIN) return;
    if (userId === 'USR-ADMIN-01') {
      alert('The primary Chief Administrator account cannot be deleted.');
      return;
    }

    try {
      await apiDeleteUser(userId);
    } catch (e) {
      console.warn('[Auth] Remote user delete error:', e);
    }

    const target = users.find(u => u.id === userId);
    const updated = users.filter(u => u.id !== userId);
    commitUsers(updated);

    if (target) {
      logAuditEvent({
        role: ROLES.ADMIN,
        action: 'ADMIN_USER_DELETED',
        workerId: 'N/A',
        workerName: target.name,
        details: `Removed user account ${target.name} (${target.email}).`
      });
    }
  };

  // Sync remote signatures and users on mount
  useEffect(() => {
    const syncBackendUsers = async () => {
      try {
        const res = await apiGetUsers();
        if (res && res.success && Array.isArray(res.users)) {
          setUsers(prevUsers => {
            const merged = [...prevUsers];
            res.users.forEach(ru => {
              const idx = merged.findIndex(u => u.id === ru.id || u.email.toLowerCase() === ru.email.toLowerCase());
              if (idx !== -1) {
                merged[idx] = {
                  ...merged[idx],
                  status: ru.status || merged[idx].status,
                  designation: ru.designation || merged[idx].designation,
                  department: ru.department || merged[idx].department,
                  signature: ru.signature || merged[idx].signature
                };
              } else {
                merged.push({
                  id: ru.id,
                  name: ru.name,
                  email: ru.email,
                  alias: ru.email.split('@')[0],
                  aliases: [ru.email.toLowerCase(), ru.email.split('@')[0].toLowerCase()],
                  password: 'Lloyds@2026#',
                  role: ru.role,
                  designation: ru.designation,
                  department: ru.department,
                  status: ru.status || 'ACTIVE',
                  signature: ru.signature || null,
                  createdAt: ru.createdAt || new Date().toISOString()
                });
              }
            });
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
            return merged;
          });
        }
      } catch (e) {}
    };
    syncBackendUsers();
  }, []);

  // Change password for any account or self
  const changePassword = async ({ username, currentPassword, newPassword, isAdminReset = false, targetUserId = null }) => {
    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, error: 'New password must contain at least 6 characters.' };
    }

    const cleanUser = (username || currentUser?.email || '').trim().toLowerCase();

    // 1. Attempt backend API first
    let remoteSuccess = false;
    let remoteMsg = '';
    try {
      const res = await apiChangePassword({
        username: cleanUser,
        currentPassword,
        newPassword: newPassword.trim(),
        isAdminReset,
        targetUserId
      });
      if (res && res.success) {
        remoteSuccess = true;
        remoteMsg = res.message;
      } else if (res && res.error) {
        if (!res.error.includes('Unable to connect') && !res.error.includes('not found') && !res.error.includes('Invalid or expired session')) {
          return { success: false, error: res.error };
        }
      }
    } catch (e) {
      console.warn('[Auth] Remote change-password call fallback:', e);
    }

    // 2. Local resilient update
    const targetIdx = users.findIndex(u => 
      (targetUserId && u.id === targetUserId) ||
      u.email.toLowerCase() === cleanUser ||
      (u.role && u.role.toLowerCase() === cleanUser)
    );

    if (targetIdx === -1 && !remoteSuccess) {
      return { success: false, error: 'User account not found.' };
    }

    if (targetIdx !== -1) {
      const targetUser = users[targetIdx];

      // If not admin reset and not verified remotely, check local current password
      if (!isAdminReset && !remoteSuccess && targetUser.password && currentPassword !== targetUser.password) {
        return { success: false, error: 'Current password does not match.' };
      }

      const updatedUser = {
        ...targetUser,
        password: newPassword.trim(),
        passwordUpdatedAt: new Date().toISOString()
      };

      const updatedUsers = [...users];
      updatedUsers[targetIdx] = updatedUser;
      commitUsers(updatedUsers);

      // If changing own password, update currentUser
      if (currentUser && (currentUser.id === targetUser.id || currentUser.email === targetUser.email)) {
        setCurrentUser(updatedUser);
      }

      logAuditEvent({
        role: currentRole || ROLES.ADMIN,
        action: isAdminReset ? 'ADMIN_PASSWORD_RESET' : 'USER_PASSWORD_CHANGED',
        workerId: 'N/A',
        workerName: targetUser.name,
        details: `${isAdminReset ? 'Administrator reset password' : 'Password changed'} for ${targetUser.name} (${targetUser.email}).`
      });

      return {
        success: true,
        message: remoteMsg || `Password successfully updated for ${targetUser.name}.`
      };
    }

    return {
      success: true,
      message: remoteMsg || 'Password successfully updated.'
    };
  };

  // Upload and attach digital signature for user
  const uploadUserSignature = async (userId, signatureDataUrl) => {
    // 1. Call backend API
    try {
      await apiUploadUserSignature(userId, signatureDataUrl);
    } catch (e) {
      console.warn('[Auth] Remote signature upload fallback:', e);
    }

    // 2. Update local state
    const targetIdx = users.findIndex(u => u.id === userId);
    if (targetIdx !== -1) {
      const updatedUser = {
        ...users[targetIdx],
        signature: signatureDataUrl,
        signatureUpdatedAt: new Date().toISOString()
      };
      const updatedUsers = [...users];
      updatedUsers[targetIdx] = updatedUser;
      commitUsers(updatedUsers);

      if (currentUser && currentUser.id === userId) {
        setCurrentUser(updatedUser);
      }

      logAuditEvent({
        role: currentRole || ROLES.ADMIN,
        action: signatureDataUrl ? 'USER_SIGNATURE_UPLOADED' : 'USER_SIGNATURE_REMOVED',
        workerId: 'N/A',
        workerName: updatedUser.name,
        details: `${signatureDataUrl ? 'Digital signature uploaded' : 'Digital signature removed'} for ${updatedUser.name} (${updatedUser.designation}).`
      });

      return { success: true, user: updatedUser };
    }

    return { success: false, error: 'User not found.' };
  };

  const removeUserSignature = async (userId) => {
    return await uploadUserSignature(userId, null);
  };

  const canEditStage = (stageNum) => {
    if (currentRole === ROLES.ADMIN) return true;
    if (currentRole === ROLES.HR && stageNum === 1) return true;
    if (currentRole === ROLES.MEDICAL && stageNum === 2) return true;
    if (currentRole === ROLES.SAFETY && stageNum === 3) return true;
    if (currentRole === ROLES.IT && stageNum === 4) return true;
    if (currentRole === ROLES.CAMP && stageNum === 5) return true;
    return false;
  };

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      currentRole,
      currentUser,
      users,
      ssoSettings,
      login,
      loginWithSSO,
      logout,
      updateSSOSettings,
      createUser,
      toggleUserStatus,
      deleteUser,
      changePassword,
      uploadUserSignature,
      removeUserSignature,
      canEditStage
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
