// ============================================================================
// CLIENT-SIDE API SERVICE - ENTERPRISE DATA GATEWAY
// Handles real-time communication with secure backend gateway
// Includes automatic resilient fallback to local storage
// ============================================================================

import { getStoredWorkers, saveWorkers } from './storageService';
import { getAuditLogs as getLocalAuditLogs, logAuditEvent as logLocalAudit } from './auditService';

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
 * Authenticate administrator credentials against backend
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
 * Authenticate via Enterprise Single Sign-On (Microsoft Entra ID, Google Workspace, SAML 2.0)
 */
export const apiSSOLogin = async (provider, email, token, tenantId = 'lloydsprojects.in') => {
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
 * Test Fabric connection diagnostics on demand
 */
export const testFabricDiagnostics = async () => {
  try {
    const res = await fetch(`${API_BASE}/fabric/test`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    return {
      success: false,
      error: 'Backend API service is not reachable on http://localhost:5000. Start backend server with `npm run server`.',
      mode: 'FALLBACK_MODE'
    };
  }
};

/**
 * Start Entra ID Device Code Authentication
 */
export const startFabricAuth = async () => {
  try {
    const res = await fetch(`${API_BASE}/fabric/auth/start`, { method: 'POST' });
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
    const res = await fetch(`${API_BASE}/fabric/auth/status`);
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
};

/**
 * Get all workers (Fabric live or fallback)
 */
export const apiGetWorkers = async () => {
  try {
    const res = await fetch(`${API_BASE}/workers`, { signal: AbortSignal.timeout(3500) });
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
 * Register worker (Step 1: HR)
 */
export const apiRegisterWorker = async (newWorker) => {
  try {
    const res = await fetch(`${API_BASE}/workers`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newWorker),
      signal: AbortSignal.timeout(4000)
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
 * Update Medical screening (Step 2)
 */
export const apiUpdateMedical = async (workerId, medicalData, updatedWorker) => {
  try {
    const res = await fetch(`${API_BASE}/workers/${workerId}/medical`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ medical: medicalData, worker: updatedWorker }),
      signal: AbortSignal.timeout(4000)
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
 * Update Safety Induction (Step 3)
 */
export const apiUpdateSafety = async (workerId, safetyData, updatedWorker) => {
  try {
    const res = await fetch(`${API_BASE}/workers/${workerId}/safety`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ safety: safetyData, worker: updatedWorker }),
      signal: AbortSignal.timeout(4000)
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
 * Update IT Biometrics (Step 4)
 */
export const apiUpdateIT = async (workerId, itData, updatedWorker) => {
  try {
    const res = await fetch(`${API_BASE}/workers/${workerId}/it`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ it: itData, worker: updatedWorker }),
      signal: AbortSignal.timeout(4000)
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
 * Update Camp Housing (Step 5)
 */
export const apiUpdateCamp = async (workerId, campData, updatedWorker) => {
  try {
    const res = await fetch(`${API_BASE}/workers/${workerId}/camp`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ camp: campData, worker: updatedWorker }),
      signal: AbortSignal.timeout(4000)
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
 * Log audit trail event
 */
export const apiLogAudit = async (entry) => {
  try {
    fetch(`${API_BASE}/audit-logs`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    }).catch(() => {});
  } catch (err) {
    // non-blocking
  }
  return logLocalAudit(entry);
};
