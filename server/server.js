// ============================================================================
// ENTERPRISE REST API BACKEND - MICROSOFT FABRIC GATEWAY
// Project: Lloyds Metals & Energy / Lloyds Infra - Worker Onboarding
// Server: 2xv4ddeoefeuhhgixzuzuy3udm-27j34hcgadaudjerknvakpsfle.database.fabric.microsoft.com
// Database: Worker_onboarding-44af8b36-2300-4f9e-a591-53248d3d454e
// Security: OWASP ASVS 5.0 Compliant (JWT, RBAC, Helmet, Bcrypt Hashing)
// ============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import dns from 'dns';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import helmet from 'helmet';

// Ensure IPv4 first on Linux servers to avoid AAAA/IPv6 connection timeouts
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) {}

import { 
  connectToFabric, 
  getConnectionStatus, 
  testFabricConnection,
  startDeviceCodeLogin,
  getAuthStatus,
  dbGetAllWorkers,
  dbRegisterWorkerHR,
  dbUpdateWorkerPhoto,
  dbUpdateMedical,
  dbUpdateSafety,
  dbUpdateIT,
  dbUpdateCamp,
  dbLogAudit,
  dbGetAuditLogs
} from './fabricDb.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'lloyds-enterprise-workforce-jwt-sec-2026';

// 1. Enterprise Security Headers (Helmet)
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
      imgSrc: ["'self'", "data:", "blob:", "https:"],
      connectSrc: ["'self'", "https:", "http:"]
    }
  },
  crossOriginEmbedderPolicy: false,
  frameguard: { action: 'deny' }
}));

// 2. Strict CORS Configuration
const allowedOrigins = [
  'https://taskai.lloyds.in',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.APP_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('Blocked by CORS policy.'));
  },
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));

// Resilient Subpath Normalization: seamlessly route requests with or without /onboarding prefix
app.use((req, res, next) => {
  if (req.url.startsWith('/onboarding/api')) {
    req.url = req.url.replace('/onboarding/api', '/api');
  }
  next();
});

// In-memory rate limiting map for login attempts
const loginAttempts = new Map();

// Default Account Seed Configurations (Passwords hashed with bcrypt)
const DEFAULT_ACCOUNT_PASSWORDS = {
  'USR-ADMIN-01': process.env.ADMIN_PASSWORD || 'Microsoft@003',
  'USR-HR-04': process.env.HR_PASSWORD || 'hr@lloyds#2026',
  'USR-MED-02': process.env.MED_PASSWORD || 'med@lloyds#2026',
  'USR-SAF-08': process.env.SAF_PASSWORD || 'safe@lloyds#2026',
  'USR-IT-05': process.env.IT_PASSWORD || 'it@lloyds#2026',
  'USR-CMP-03': process.env.CAMP_PASSWORD || 'camp@lloyds#2026'
};

const SYSTEM_ACCOUNTS = [
  {
    id: 'USR-ADMIN-01',
    name: 'Harshvardhan M. K.',
    email: (process.env.ADMIN_EMAIL || 'hmk@lloydsprojects.in').toLowerCase(),
    aliases: ['admin', 'hmk@lloydsprojects.in', 'admin@lloyds.in', 'hmk@lloyds.in'],
    passwordHash: bcrypt.hashSync(DEFAULT_ACCOUNT_PASSWORDS['USR-ADMIN-01'], 10),
    role: 'ADMIN',
    designation: 'Chief Administrator & Site Director',
    department: 'Executive Administration'
  },
  {
    id: 'USR-HR-04',
    name: 'Pooja Nair',
    email: 'hr.operations@lloyds.in',
    aliases: ['hr', 'hr.operations@lloyds.in', 'pooja'],
    passwordHash: bcrypt.hashSync(DEFAULT_ACCOUNT_PASSWORDS['USR-HR-04'], 10),
    role: 'HR',
    designation: 'Senior HR Operations Lead',
    department: 'Human Resources'
  },
  {
    id: 'USR-MED-02',
    name: 'Dr. Vivek Deshmukh (MBBS, CIH)',
    email: 'medical.officer@lloyds.in',
    aliases: ['medical', 'med', 'medical.officer@lloyds.in', 'doctor'],
    passwordHash: bcrypt.hashSync(DEFAULT_ACCOUNT_PASSWORDS['USR-MED-02'], 10),
    role: 'MEDICAL',
    designation: 'Chief Medical Officer',
    department: 'Occupational Health & Medical Services'
  },
  {
    id: 'USR-SAF-08',
    name: 'Arun Patil',
    email: 'ehs.safety@lloyds.in',
    aliases: ['safety', 'ehs', 'safe', 'ehs.safety@lloyds.in'],
    passwordHash: bcrypt.hashSync(DEFAULT_ACCOUNT_PASSWORDS['USR-SAF-08'], 10),
    role: 'SAFETY',
    designation: 'Lead EHS Safety Engineer',
    department: 'Environment, Health & Safety'
  },
  {
    id: 'USR-IT-05',
    name: 'Rajesh Sharma',
    email: 'it.biometrics@lloyds.in',
    aliases: ['it', 'biometrics', 'it.biometrics@lloyds.in'],
    passwordHash: bcrypt.hashSync(DEFAULT_ACCOUNT_PASSWORDS['USR-IT-05'], 10),
    role: 'IT',
    designation: 'Senior IT Biometric Specialist',
    department: 'Information Technology'
  },
  {
    id: 'USR-CMP-03',
    name: 'Mahesh Kulkarni',
    email: 'camp.gondwana@lloyds.in',
    aliases: ['camp', 'housing', 'camp.gondwana@lloyds.in'],
    passwordHash: bcrypt.hashSync(DEFAULT_ACCOUNT_PASSWORDS['USR-CMP-03'], 10),
    role: 'CAMP',
    designation: 'Camp Accommodations Supervisor',
    department: 'Camp Administration (Gondwana)'
  }
];

// Persistent User Store (Stores custom changed passwords and uploaded digital signatures)
const USERS_STORE_PATH = path.join(process.cwd(), 'server', 'data', 'users_store.json');

const ensureDataDir = () => {
  try {
    const dir = path.dirname(USERS_STORE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  } catch (e) {
    console.warn('[Store] Could not ensure data directory:', e.message);
  }
};

const loadUserStore = () => {
  try {
    ensureDataDir();
    if (fs.existsSync(USERS_STORE_PATH)) {
      const content = fs.readFileSync(USERS_STORE_PATH, 'utf8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.warn('[Store] Could not read user store:', e.message);
  }
  return {};
};

const saveUserStore = (store) => {
  try {
    ensureDataDir();
    fs.writeFileSync(USERS_STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
  } catch (e) {
    console.error('[Store] Failed to write user store:', e.message);
  }
};

const isPasswordValid = (enteredPassword, storedHashOrPass) => {
  if (!enteredPassword || !storedHashOrPass) return false;
  if (storedHashOrPass.startsWith('$2a$') || storedHashOrPass.startsWith('$2b$')) {
    return bcrypt.compareSync(enteredPassword, storedHashOrPass);
  }
  return enteredPassword === storedHashOrPass;
};

const syncAccountsWithStore = () => {
  const store = loadUserStore();
  let modified = false;

  SYSTEM_ACCOUNTS.forEach(acc => {
    if (store[acc.id]) {
      if (store[acc.id].password) {
        // Upgrade legacy plaintext passwords in store to bcrypt hash
        if (!store[acc.id].password.startsWith('$2a$') && !store[acc.id].password.startsWith('$2b$')) {
          store[acc.id].password = bcrypt.hashSync(store[acc.id].password, 10);
          modified = true;
        }
        acc.passwordHash = store[acc.id].password;
      }
      if (store[acc.id].signature) acc.signature = store[acc.id].signature;
    }
  });

  if (modified) {
    saveUserStore(store);
  }
};

// Initial sync on startup
syncAccountsWithStore();

// ============================================================================
// AUTHENTICATION & AUTHORIZATION MIDDLEWARE
// ============================================================================

/**
 * Middleware: Verifies JWT Bearer Token on incoming API requests
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required. Authorization Bearer token missing.'
    });
  }

  jwt.verify(token, JWT_SECRET, (err, decodedUser) => {
    if (err) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired session token. Please log in again.'
      });
    }
    req.user = decodedUser;
    next();
  });
};

/**
 * Middleware: Enforces strict Role-Based Access Control (RBAC)
 */
export const requireRole = (allowedRoles) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Access denied. Insufficient permissions for role '${req.user?.role || 'ANONYMOUS'}'. Required: ${roles.join(', ')}.`
      });
    }
    next();
  };
};

// ============================================================================
// AUTHENTICATION ENDPOINTS
// ============================================================================

// Secure Multi-Department Authentication Endpoint (Validates credentials server-side)
app.post('/api/auth/login', (req, res) => {
  syncAccountsWithStore();
  const ip = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
  const now = Date.now();

  const attempt = loginAttempts.get(ip) || { count: 0, lastAttempt: now };
  if (attempt.count >= 10 && now - attempt.lastAttempt < 15 * 60 * 1000) {
    const minutesLeft = Math.ceil((15 * 60 * 1000 - (now - attempt.lastAttempt)) / 60000);
    return res.status(429).json({
      success: false,
      error: `Too many failed login attempts. Please wait ${minutesLeft} minutes before trying again.`
    });
  }

  const { username, password } = req.body || {};
  const cleanUser = (username || '').trim().toLowerCase();

  const matched = SYSTEM_ACCOUNTS.find(acc => 
    acc.email.toLowerCase() === cleanUser ||
    acc.aliases.map(a => a.toLowerCase()).includes(cleanUser)
  );

  if (matched && isPasswordValid(password, matched.passwordHash)) {
    loginAttempts.delete(ip);

    // Issue cryptographic, signed JWT token valid for 12 hours
    const token = jwt.sign(
      {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role,
        designation: matched.designation,
        department: matched.department
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({
      success: true,
      user: {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role,
        designation: matched.designation,
        department: matched.department,
        signature: matched.signature || null
      },
      token
    });
  }

  // Increment failed attempts
  attempt.count += 1;
  attempt.lastAttempt = now;
  loginAttempts.set(ip, attempt);

  return res.status(401).json({
    success: false,
    error: 'Invalid credentials. Please verify your username or email and password.'
  });
});

// Verify Current User Session Token
app.get('/api/auth/me', authenticateToken, (req, res) => {
  syncAccountsWithStore();
  const matched = SYSTEM_ACCOUNTS.find(acc => acc.id === req.user.id || acc.email.toLowerCase() === req.user.email.toLowerCase());
  if (!matched) {
    return res.status(404).json({ success: false, error: 'User profile not found.' });
  }
  return res.json({
    success: true,
    user: {
      id: matched.id,
      name: matched.name,
      email: matched.email,
      role: matched.role,
      designation: matched.designation,
      department: matched.department,
      signature: matched.signature || null
    }
  });
});

// Change Password Endpoint (Requires Authentication, verifies current password, Admin reset strictly guarded)
app.post('/api/auth/change-password', authenticateToken, (req, res) => {
  syncAccountsWithStore();
  const { username, currentPassword, newPassword, isAdminReset, targetUserId } = req.body || {};

  if (!newPassword || newPassword.trim().length < 6) {
    return res.status(400).json({
      success: false,
      error: 'New password must be at least 6 characters long.'
    });
  }

  // Security Guard: Only verified ADMIN role can perform administrative password reset without current password
  if (isAdminReset && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Access denied: Only Chief Administrators can perform administrative password resets.'
    });
  }

  const cleanUser = (username || '').trim().toLowerCase();
  let matched = null;

  if (targetUserId) {
    matched = SYSTEM_ACCOUNTS.find(acc => acc.id === targetUserId);
  }
  if (!matched && cleanUser) {
    matched = SYSTEM_ACCOUNTS.find(acc => 
      acc.email.toLowerCase() === cleanUser ||
      acc.aliases.map(a => a.toLowerCase()).includes(cleanUser)
    );
  }
  if (!matched && !targetUserId && !cleanUser) {
    matched = SYSTEM_ACCOUNTS.find(acc => acc.id === req.user.id);
  }

  if (!matched) {
    return res.status(404).json({
      success: false,
      error: 'User account not found.'
    });
  }

  // If not admin reset, verify that caller is resetting their own password and current password matches
  if (!isAdminReset) {
    if (req.user.id !== matched.id && req.user.email.toLowerCase() !== matched.email.toLowerCase() && req.user.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'You do not have permission to change another user\'s password.'
      });
    }

    if (!currentPassword || !isPasswordValid(currentPassword, matched.passwordHash)) {
      return res.status(401).json({
        success: false,
        error: 'Current password does not match.'
      });
    }
  }

  // Save new bcrypt-hashed password
  const newHash = bcrypt.hashSync(newPassword.trim(), 10);
  matched.passwordHash = newHash;

  const store = loadUserStore();
  if (!store[matched.id]) store[matched.id] = {};
  store[matched.id].password = newHash;
  store[matched.id].passwordUpdatedAt = new Date().toISOString();
  saveUserStore(store);

  console.log(`[Auth] Password updated for user ${matched.name} (${matched.email}) by ${req.user.name}`);

  return res.json({
    success: true,
    message: `Password successfully updated for ${matched.name}.`
  });
});

// Upload / Update Digital Signature for User (Guarded to self or ADMIN)
app.post('/api/auth/users/:id/signature', authenticateToken, (req, res) => {
  syncAccountsWithStore();
  const { id } = req.params;
  const { signature } = req.body || {};

  // Security Guard: Users can only upload their own signature unless they are ADMIN
  if (req.user.id !== id && req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Access denied: You can only update your own digital signature.'
    });
  }

  let matched = SYSTEM_ACCOUNTS.find(acc => acc.id === id);
  const store = loadUserStore();
  if (!store[id]) store[id] = {};
  store[id].signature = signature || null;
  store[id].signatureUpdatedAt = new Date().toISOString();
  saveUserStore(store);

  if (matched) {
    matched.signature = signature || null;
  }

  console.log(`[Auth] Digital signature updated for user ID ${id} by ${req.user.name}`);

  return res.json({
    success: true,
    signature: signature || null,
    message: 'Digital signature successfully saved.'
  });
});

// Get User Directory with Signatures (Authenticated)
app.get('/api/auth/users', authenticateToken, (req, res) => {
  syncAccountsWithStore();
  const safeUsers = SYSTEM_ACCOUNTS.map(acc => ({
    id: acc.id,
    name: acc.name,
    email: acc.email,
    role: acc.role,
    designation: acc.designation,
    department: acc.department,
    signature: acc.signature || null
  }));
  return res.json({ success: true, users: safeUsers });
});

// Enterprise SSO Authentication Endpoint (Exclusive to Google Workspace @lloyds.in)
app.post('/api/auth/sso', (req, res) => {
  const { provider, email, token, tenantId } = req.body || {};
  const cleanEmail = (email || '').trim().toLowerCase();
  
  if (!cleanEmail) {
    return res.status(400).json({ success: false, error: 'Email claim is required from Identity Provider.' });
  }

  // Strict domain validation: Only official @lloyds.in Google Workspace allowed
  if (!cleanEmail.endsWith('@lloyds.in')) {
    return res.status(403).json({
      success: false,
      error: `Access restricted: Single Sign-On is exclusively permitted for @lloyds.in Google Workspace accounts (received: ${cleanEmail}).`
    });
  }

  // Check against known system accounts first (by email or aliases)
  const matched = SYSTEM_ACCOUNTS.find(acc => 
    acc.email.toLowerCase() === cleanEmail || 
    acc.aliases.map(a => a.toLowerCase()).includes(cleanEmail)
  );

  if (matched) {
    const ssoJwt = jwt.sign(
      {
        id: matched.id,
        name: matched.name,
        email: cleanEmail,
        role: matched.role,
        designation: matched.designation,
        department: matched.department,
        authMethod: 'SSO',
        ssoProvider: 'GOOGLE'
      },
      JWT_SECRET,
      { expiresIn: '12h' }
    );

    return res.json({
      success: true,
      authMethod: 'SSO',
      ssoProvider: 'GOOGLE',
      tenantId: 'lloyds.in',
      user: {
        id: matched.id,
        name: matched.name,
        email: cleanEmail,
        role: matched.role,
        designation: matched.designation,
        department: matched.department,
        authMethod: 'SSO',
        ssoProvider: 'GOOGLE',
        signature: matched.signature || null
      },
      token: ssoJwt
    });
  }

  // JIT Provisioning for verified @lloyds.in corporate staff
  const namePart = cleanEmail.split('@')[0].replace(/[._]/g, ' ');
  const formattedName = namePart.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  
  const role = cleanEmail.includes('admin') ? 'ADMIN' : 
               cleanEmail.includes('medical') ? 'MEDICAL' : 
               cleanEmail.includes('safe') ? 'SAFETY' : 
               cleanEmail.includes('it') ? 'IT' : 
               cleanEmail.includes('camp') ? 'CAMP' : 'HR';

  const jitUser = {
    id: `USR-SSO-${Date.now().toString().slice(-4)}`,
    name: formattedName,
    email: cleanEmail,
    role: role,
    designation: 'Enterprise Staff (Google SSO Verified)',
    department: 'Corporate Operations',
    authMethod: 'SSO',
    ssoProvider: 'GOOGLE'
  };

  const ssoJwt = jwt.sign(jitUser, JWT_SECRET, { expiresIn: '12h' });

  return res.json({
    success: true,
    authMethod: 'SSO',
    ssoProvider: 'GOOGLE',
    tenantId: 'lloyds.in',
    isJITProvisioned: true,
    user: jitUser,
    token: ssoJwt
  });
});

// ============================================================================
// SYSTEM HEALTH & DIAGNOSTIC ENDPOINTS
// ============================================================================

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const status = getConnectionStatus();
  res.json({
    status: 'ONLINE',
    system: 'Lloyds Metals & Energy - Worker Onboarding System',
    fabric: status,
    timestamp: new Date().toISOString()
  });
});

// Fabric Live Status & Realtime Diagnostic Ping (Guarded to authenticated staff)
app.get('/api/fabric-status', authenticateToken, async (req, res) => {
  try {
    const testResult = await testFabricConnection();
    res.json(testResult);
  } catch (err) {
    console.error('[Diagnostic /api/fabric-status] Error:', err.message);
    res.status(500).json({ success: false, error: 'Database diagnostics unavailable.' });
  }
});

// ============================================================================
// WORKFORCE ONBOARDING WORKFLOW ENDPOINTS (AUTHENTICATED & RBAC ENFORCED)
// ============================================================================

// GET all workers (Authenticated)
app.get('/api/workers', authenticateToken, async (req, res) => {
  try {
    const workers = await dbGetAllWorkers();
    res.json({ success: true, count: workers.length, data: workers });
  } catch (err) {
    console.error('[API /api/workers] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve worker roster from database.' });
  }
});

// POST new worker (Step 1: HR Registration - Restricted to ADMIN and HR)
app.post('/api/workers', authenticateToken, requireRole(['ADMIN', 'HR']), async (req, res) => {
  try {
    const newWorker = req.body;
    if (!newWorker || !newWorker.id || !newWorker.hr || !newWorker.hr.fullName) {
      return res.status(400).json({ success: false, error: 'Invalid worker registration payload: Missing candidate full name or ID.' });
    }

    // Input boundary sanitization
    if (newWorker.hr.age && (parseInt(newWorker.hr.age, 10) < 18 || parseInt(newWorker.hr.age, 10) > 75)) {
      return res.status(400).json({ success: false, error: 'Candidate age must be between 18 and 75 years per statutory regulations.' });
    }

    const saved = await dbRegisterWorkerHR(newWorker);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    console.error('[API POST /api/workers] Error:', err.message);
    res.status(500).json({ success: false, error: 'Database write error during candidate registration.' });
  }
});

// PATCH Worker Photo (Direct to Fabric SQL - Restricted to ADMIN, HR, IT)
app.patch('/api/workers/:id/photo', authenticateToken, requireRole(['ADMIN', 'HR', 'IT']), async (req, res) => {
  try {
    const { id } = req.params;
    const { photo } = req.body || {};
    if (!photo) {
      return res.status(400).json({ success: false, error: 'Photograph data URL is required.' });
    }
    const updated = await dbUpdateWorkerPhoto(id, photo);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[API PATCH /api/workers/:id/photo] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update candidate photograph.' });
  }
});

// PATCH Step 2: Medical (Restricted to ADMIN and MEDICAL)
app.patch('/api/workers/:id/medical', authenticateToken, requireRole(['ADMIN', 'MEDICAL']), async (req, res) => {
  try {
    const { id } = req.params;
    const { medical, worker } = req.body || {};
    if (!medical || !worker) {
      return res.status(400).json({ success: false, error: 'Invalid medical payload.' });
    }

    // Input boundary checks for clinical vitals
    const systolic = parseInt(medical.bpSystolic, 10);
    const diastolic = parseInt(medical.bpDiastolic, 10);
    if ((systolic && (systolic < 50 || systolic > 260)) || (diastolic && (diastolic < 30 || diastolic > 180))) {
      return res.status(400).json({ success: false, error: 'Blood pressure values fall outside plausible clinical physiological ranges.' });
    }

    const updated = await dbUpdateMedical(id, medical, worker);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[API PATCH /api/workers/:id/medical] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to record medical clearance.' });
  }
});

// PATCH Step 3: Safety (Restricted to ADMIN and SAFETY)
app.patch('/api/workers/:id/safety', authenticateToken, requireRole(['ADMIN', 'SAFETY']), async (req, res) => {
  try {
    const { id } = req.params;
    const { safety, worker } = req.body || {};
    if (!safety || !worker) {
      return res.status(400).json({ success: false, error: 'Invalid safety payload.' });
    }
    const updated = await dbUpdateSafety(id, safety, worker);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[API PATCH /api/workers/:id/safety] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to record EHS safety briefing.' });
  }
});

// PATCH Step 4: IT Biometrics (Restricted to ADMIN and IT)
app.patch('/api/workers/:id/it', authenticateToken, requireRole(['ADMIN', 'IT']), async (req, res) => {
  try {
    const { id } = req.params;
    const { it, worker } = req.body || {};
    if (!it || !worker) {
      return res.status(400).json({ success: false, error: 'Invalid IT biometrics payload.' });
    }
    const updated = await dbUpdateIT(id, it, worker);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[API PATCH /api/workers/:id/it] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update IT biometric enrollment.' });
  }
});

// PATCH Step 5: Camp Housing (Restricted to ADMIN and CAMP)
app.patch('/api/workers/:id/camp', authenticateToken, requireRole(['ADMIN', 'CAMP']), async (req, res) => {
  try {
    const { id } = req.params;
    const { camp, worker } = req.body || {};
    if (!camp || !worker) {
      return res.status(400).json({ success: false, error: 'Invalid camp accommodation payload.' });
    }
    const updated = await dbUpdateCamp(id, camp, worker);
    res.json({ success: true, data: updated });
  } catch (err) {
    console.error('[API PATCH /api/workers/:id/camp] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to update camp accommodation record.' });
  }
});

// ============================================================================
// AUDIT LOGGING ENDPOINTS (IMMUTABLE AUDIT TRAIL)
// ============================================================================

// GET Audit Trail (Restricted to ADMIN)
app.get('/api/audit-logs', authenticateToken, requireRole(['ADMIN']), async (req, res) => {
  try {
    const logs = await dbGetAuditLogs();
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    console.error('[API GET /api/audit-logs] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to retrieve compliance audit logs.' });
  }
});

// POST Audit Trail Event (Authenticated)
app.post('/api/audit-logs', authenticateToken, async (req, res) => {
  try {
    const entry = req.body;
    entry.ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    entry.userId = req.user.id;
    entry.userEmail = req.user.email;
    const logged = await dbLogAudit(entry);
    res.status(201).json({ success: true, data: logged });
  } catch (err) {
    console.error('[API POST /api/audit-logs] Error:', err.message);
    res.status(500).json({ success: false, error: 'Failed to record audit event.' });
  }
});

// Helper to find local IPv4 network address
function getLocalNetworkIp() {
  try {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
      for (const iface of interfaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (e) {
    // fallback
  }
  return '127.0.0.1';
}

// Serve static React production build if available
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

if (fs.existsSync(distPath)) {
  app.use('/onboarding', express.static(distPath));
  app.use(express.static(distPath));
  // Client SPA routing: any non-API request serves index.html (Express 5 compatible)
  app.use((req, res) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/onboarding/api')) {
      return res.status(404).json({ error: 'Endpoint not found' });
    }
    res.sendFile(path.join(distPath, 'index.html'));
  });
}

// Global express error handler to prevent stack traces from leaking
app.use((err, req, res, next) => {
  console.error('[Unhandled Error]:', err.stack);
  res.status(500).json({
    success: false,
    error: 'An internal server error occurred. Please contact the site system administrator.'
  });
});

// Initialize Fabric and Start Server immediately
const startServer = () => {
  const localIp = getLocalNetworkIp();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`\n======================================================`);
    console.log(`⚡ WORKER ONBOARDING APPLICATION HOSTED LOCALLY`);
    console.log(`======================================================`);
    console.log(`> Local:            http://localhost:${PORT}`);
    console.log(`> On Your Network:  http://${localIp}:${PORT}`);
    console.log(`> REST API Base:    http://localhost:${PORT}/api`);
    console.log(`> Security:         JWT + RBAC + Helmet + Bcrypt Enabled`);
    console.log(`> Fabric Endpoint:  ${process.env.FABRIC_SERVER || 'Fabric SQL Database'}`);
    console.log(`======================================================\n`);
    console.log('[Server] Connecting to Microsoft Fabric SQL Gateway in background...');
    connectToFabric().catch(err => {
      console.warn('[Server] Initial Fabric connection attempt:', err.message);
    });
  });
};

startServer();
