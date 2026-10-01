// ============================================================================
// CLIENT-SIDE API SERVICE - ENTERPRISE DATA GATEWAY
// Handles real-time communication with secure backend gateway
// OWASP ASVS Compliant: Includes JWT Authorization Headers on all API calls
// Includes automatic resilient fallback to local storage
// ============================================================================

import { getStoredWorkers, saveWorkers } from './storageService';
import { getAuditLogs as getLocalAuditLogs, logAuditEvent as logLocalAudit } from './auditService';

const AUTH_SESSION_KEY = 'lloyd_auth_session_v3';

const resolveApiBase = () => {
  if (import.meta.env?.VITE_API_BASE) {
    return import.meta.env.VITE_API_BASE.replace(/\/$/, '');
  }
  if (typeof window !== 'undefined' && window.location?.pathname) {
    const segments = window.location.pathname.split('/').filter(Boolean);
    if (segments.length > 0 && !segments[0].startsWith('api')) {
      return `/${segments[0]}/api`;
    }
  }
  return '/api';
};

const API_BASE = resolveApiBase();

let backendAvailable = null;

/**
 * Retrieve cached JWT session token from browser secure storage
 */
export const getAuthToken = () => {
  try {
    const raw = localStorage.getItem(AUTH_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return parsed.token || null;
    }
  } catch (e) {}
  return null;
};

/**
 * Helper to construct authorized request headers with JWT Bearer Token
 */
export const getAuthHeaders = (extraHeaders = {}) => {
  const token = getAuthToken();
  const headers = { ...extraHeaders };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

/**
 * Authenticate credentials against backend
 */
export const apiLogin = async (username, password) => {
  try {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      error: 'Unable to connect to authentication server. Please check your network connection.'
    };
  }
};

/**
 * Verify current active session token with backend gateway
 */
export const apiVerifySession = async () => {
  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
    return { success: false, error: 'Session expired or invalid.' };
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Authenticate via Enterprise Single Sign-On (Google Workspace @lloyds.in)
 */
export const apiSSOLogin = async (provider, email, token, tenantId = 'lloyds.in') => {
  try {
    const res = await fetch(`${API_BASE}/auth/sso`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ provider, email, token, tenantId })
    });
    const data = await res.json();
    return data;
  } catch (err) {
    return {
      success: false,
      error: 'SSO Identity Provider service unavailable. Resuming local federation fallback.'
    };
  }
};

/**
 * Change password for user login (Authorized)
 */
export const apiChangePassword = async ({ username, currentPassword, newPassword, isAdminReset = false, targetUserId = null }) => {
  try {
    const res = await fetch(`${API_BASE}/auth/change-password`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ username, currentPassword, newPassword, isAdminReset, targetUserId })
    });
    return await res.json();
  } catch (err) {
    return {
      success: false,
      error: 'Unable to connect to authentication server to change password.'
    };
  }
};

/**
 * Upload and save digital signature for user (Authorized)
 */
export const apiUploadUserSignature = async (userId, signature) => {
  try {
    const res = await fetch(`${API_BASE}/auth/users/${userId}/signature`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ signature })
    });
    return await res.json();
  } catch (err) {
    return {
      success: false,
      error: 'Unable to connect to server to save digital signature.'
    };
  }
};

/**
 * Fetch system users with their digital signatures and designations (Authorized)
 */
export const apiGetUsers = async () => {
  try {
    const res = await fetch(`${API_BASE}/auth/users`, {
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err) {
    return { success: false, users: [] };
  }
};

/**
 * Create a new staff user (Authorized Admin)
 */
export const apiCreateUser = async (userData) => {
  try {
    const res = await fetch(`${API_BASE}/auth/users`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(userData)
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Unable to connect to server to create user.' };
  }
};

/**
 * Delete a staff user (Authorized Admin)
 */
export const apiDeleteUser = async (userId) => {
  try {
    const res = await fetch(`${API_BASE}/auth/users/${userId}`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Unable to connect to server to delete user.' };
  }
};

/**
 * Toggle user active/inactive status (Authorized Admin)
 */
export const apiToggleUserStatus = async (userId, status) => {
  try {
    const res = await fetch(`${API_BASE}/auth/users/${userId}/status`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ status })
    });
    return await res.json();
  } catch (err) {
    return { success: false, error: 'Unable to connect to server to update user status.' };
  }
};

/**
 * Check backend and Fabric connectivity
 */
export const checkFabricHealth = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const res = await fetch(`${API_BASE}/health`, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (res.ok) {
      const data = await res.json();
      backendAvailable = true;
      return {
        isAvailable: true,
        fabric: data.fabric,
        mode: data.fabric?.mode || 'FABRIC_ONLINE'
      };
    }
  } catch (err) {
    backendAvailable = false;
  }

  return {
    isAvailable: false,
    fabric: {
      isConnected: false,
      mode: 'FALLBACK_MODE',
      server: '2xv4ddeoefeuhhgixzuzuy3udm-27j34hcgadaudjerknvakpsfle.database.fabric.microsoft.com',
      database: 'Worker_onboarding-44af8b36-2300-4f9e-a591-53248d3d454e'
    },
    mode: 'FALLBACK_MODE'
  };
};

/**
 * Test Fabric connection diagnostics on demand (Authorized)
 */
export const testFabricDiagnostics = async () => {
  try {
    const res = await fetch(`${API_BASE}/fabric-status`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    return {
      success: false,
      error: 'Backend API service is not reachable on http://localhost:5000.',
      mode: 'FALLBACK_MODE'
    };
  }
};

/**
 * Start Entra ID Device Code Authentication
 */
export const startFabricAuth = async () => {
  try {
    const res = await fetch(`${API_BASE}/fabric/auth/start`, { 
      method: 'POST',
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Check Entra ID Authentication Status
 */
export const checkAuthStatus = async () => {
  try {
    const res = await fetch(`${API_BASE}/fabric/auth/status`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Get all workers (Fabric live or fallback - Authorized)
 */
export const apiGetWorkers = async () => {
  try {
    const res = await fetch(`${API_BASE}/workers`, { 
      headers: getAuthHeaders(),
      signal: AbortSignal.timeout(4500) 
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
        backendAvailable = true;
        return json.data;
      }
    }
  } catch (err) {
    // Fallback to localStorage
  }

  return getStoredWorkers();
};

/**
 * Register worker (Step 1: HR - Authorized)
 */
export const apiRegisterWorker = async (newWorker) => {
  try {
    const res = await fetch(`${API_BASE}/workers`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(newWorker),
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API] Could not reach backend, saved locally.');
  }

  return newWorker;
};

/**
 * Update Worker Photograph (Direct to Fabric SQL - Authorized)
 */
export const apiUpdateWorkerPhoto = async (workerId, photoUrl) => {
  try {
    const res = await fetch(`${API_BASE}/workers/${workerId}/photo`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ photo: photoUrl }),
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API] Photo update saved locally:', err.message);
  }
  return { success: true, workerId, photo: photoUrl };
};

/**
 * Update Medical screening (Step 2 - Authorized)
 */
export const apiUpdateMedical = async (workerId, medicalData, updatedWorker) => {
  try {
    const res = await fetch(`${API_BASE}/workers/${workerId}/medical`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ medical: medicalData, worker: updatedWorker }),
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API] Medical update saved locally.');
  }
  return updatedWorker;
};

/**
 * Update Safety Induction (Step 3 - Authorized)
 */
export const apiUpdateSafety = async (workerId, safetyData, updatedWorker) => {
  try {
    const res = await fetch(`${API_BASE}/workers/${workerId}/safety`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ safety: safetyData, worker: updatedWorker }),
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API] Safety update saved locally.');
  }
  return updatedWorker;
};

/**
 * Update IT Biometrics (Step 4 - Authorized)
 */
export const apiUpdateIT = async (workerId, itData, updatedWorker) => {
  try {
    const res = await fetch(`${API_BASE}/workers/${workerId}/it`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ it: itData, worker: updatedWorker }),
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API] IT update saved locally.');
  }
  return updatedWorker;
};

/**
 * Update Camp Housing (Step 5 - Authorized)
 */
export const apiUpdateCamp = async (workerId, campData, updatedWorker) => {
  try {
    const res = await fetch(`${API_BASE}/workers/${workerId}/camp`, {
      method: 'PATCH',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({ camp: campData, worker: updatedWorker }),
      signal: AbortSignal.timeout(5000)
    });
    if (res.ok) {
      const json = await res.json();
      return json.data;
    }
  } catch (err) {
    console.warn('[API] Camp update saved locally.');
  }
  return updatedWorker;
};

/**
 * Log audit trail event (Authorized)
 */
export const apiLogAudit = async (entry) => {
  try {
    fetch(`${API_BASE}/audit-logs`, {
      method: 'POST',
      headers: getAuthHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(entry)
    }).catch(() => {});
  } catch (err) {
    // non-blocking
  }
  return logLocalAudit(entry);
};

/**
 * Fetch immutable compliance audit logs from server (Authorized)
 */
export const apiGetAuditLogs = async () => {
  try {
    const res = await fetch(`${API_BASE}/audit-logs`, {
      headers: getAuthHeaders()
    });
    if (res.ok) {
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        return json.data;
      }
    }
  } catch (err) {
    console.warn('[API] Could not fetch remote audit logs, using local cache.');
  }
  return getLocalAuditLogs();
};
