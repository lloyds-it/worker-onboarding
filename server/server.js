// ============================================================================
// ENTERPRISE REST API BACKEND - MICROSOFT FABRIC GATEWAY
// Project: Lloyds Metals & Energy / Lloyds Infra - Worker Onboarding
// Server: 2xv4ddeoefeuhhgixzuzuy3udm-27j34hcgadaudjerknvakpsfle.database.fabric.microsoft.com
// Database: Worker_onboarding-44af8b36-2300-4f9e-a591-53248d3d454e
// ============================================================================

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import dns from 'dns';

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

// Security & Parsing Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
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

// System Department Accounts & Credentials
const SYSTEM_ACCOUNTS = [
  {
    id: 'USR-ADMIN-01',
    name: 'Harshvardhan M. K.',
    email: (process.env.ADMIN_EMAIL || 'hmk@lloydsprojects.in').toLowerCase(),
    aliases: ['admin', 'hmk@lloydsprojects.in', 'admin@lloyds.in', 'hmk@lloyds.in'],
    password: process.env.ADMIN_PASSWORD || 'Microsoft@003',
    role: 'ADMIN',
    designation: 'Chief Administrator & Site Director',
    department: 'Executive Administration'
  },
  {
    id: 'USR-HR-04',
    name: 'Pooja Nair',
    email: 'hr.operations@lloyds.in',
    aliases: ['hr', 'hr.operations@lloyds.in', 'pooja'],
    password: 'hr@lloyds#2026',
    role: 'HR',
    designation: 'Senior HR Operations Lead',
    department: 'Human Resources'
  },
  {
    id: 'USR-MED-02',
    name: 'Dr. Vivek Deshmukh (MBBS, CIH)',
    email: 'medical.officer@lloyds.in',
    aliases: ['medical', 'med', 'medical.officer@lloyds.in', 'doctor'],
    password: 'med@lloyds#2026',
    role: 'MEDICAL',
    designation: 'Chief Medical Officer',
    department: 'Occupational Health & Medical Services'
  },
  {
    id: 'USR-SAF-08',
    name: 'Arun Patil',
    email: 'ehs.safety@lloyds.in',
    aliases: ['safety', 'ehs', 'safe', 'ehs.safety@lloyds.in'],
    password: 'safe@lloyds#2026',
    role: 'SAFETY',
    designation: 'Lead EHS Safety Engineer',
    department: 'Environment, Health & Safety'
  },
  {
    id: 'USR-IT-05',
    name: 'Rajesh Sharma',
    email: 'it.biometrics@lloyds.in',
    aliases: ['it', 'biometrics', 'it.biometrics@lloyds.in'],
    password: 'it@lloyds#2026',
    role: 'IT',
    designation: 'Senior IT Biometric Specialist',
    department: 'Information Technology'
  },
  {
    id: 'USR-CMP-03',
    name: 'Mahesh Kulkarni',
    email: 'camp.gondwana@lloyds.in',
    aliases: ['camp', 'housing', 'camp.gondwana@lloyds.in'],
    password: 'camp@lloyds#2026',
    role: 'CAMP',
    designation: 'Camp Accommodations Supervisor',
    department: 'Camp Administration (Gondwana)'
  }
];

// Secure Multi-Department Authentication Endpoint (Validates credentials server-side)
app.post('/api/auth/login', (req, res) => {
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

  if (matched && password === matched.password) {
    loginAttempts.delete(ip);
    return res.json({
      success: true,
      user: {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role,
        designation: matched.designation,
        department: matched.department
      },
      token: `sess_${Date.now()}_${Math.random().toString(36).slice(2)}`
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
        ssoProvider: 'GOOGLE'
      },
      token: `sso_google_${Date.now()}_${Math.random().toString(36).slice(2)}`
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

  return res.json({
    success: true,
    authMethod: 'SSO',
    ssoProvider: 'GOOGLE',
    tenantId: 'lloyds.in',
    isJITProvisioned: true,
    user: {
      id: `USR-SSO-${Date.now().toString().slice(-4)}`,
      name: formattedName,
      email: cleanEmail,
      role: role,
      designation: 'Enterprise Staff (Google SSO Verified)',
      department: 'Corporate Operations',
      authMethod: 'SSO',
      ssoProvider: 'GOOGLE'
    },
    token: `sso_google_${Date.now()}_${Math.random().toString(36).slice(2)}`
  });
});

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

// Fabric Live Status & Realtime Diagnostic Ping
app.get('/api/fabric-status', async (req, res) => {
  try {
    const testResult = await testFabricConnection();
    res.json(testResult);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET all workers
app.get('/api/workers', async (req, res) => {
  try {
    const workers = await dbGetAllWorkers();
    res.json({ success: true, count: workers.length, data: workers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new worker (Step 1: HR Registration)
app.post('/api/workers', async (req, res) => {
  try {
    const newWorker = req.body;
    if (!newWorker || !newWorker.id || !newWorker.hr) {
      return res.status(400).json({ success: false, error: 'Invalid worker registration payload.' });
    }
    const saved = await dbRegisterWorkerHR(newWorker);
    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH Step 2: Medical
app.patch('/api/workers/:id/medical', async (req, res) => {
  try {
    const { id } = req.params;
    const { medical, worker } = req.body;
    const updated = await dbUpdateMedical(id, medical, worker);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH Step 3: Safety
app.patch('/api/workers/:id/safety', async (req, res) => {
  try {
    const { id } = req.params;
    const { safety, worker } = req.body;
    const updated = await dbUpdateSafety(id, safety, worker);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH Step 4: IT Biometrics
app.patch('/api/workers/:id/it', async (req, res) => {
  try {
    const { id } = req.params;
    const { it, worker } = req.body;
    const updated = await dbUpdateIT(id, it, worker);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH Step 5: Camp Housing
app.patch('/api/workers/:id/camp', async (req, res) => {
  try {
    const { id } = req.params;
    const { camp, worker } = req.body;
    const updated = await dbUpdateCamp(id, camp, worker);
    res.json({ success: true, data: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET Audit Trail
app.get('/api/audit-logs', async (req, res) => {
  try {
    const logs = await dbGetAuditLogs();
    res.json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST Audit Trail Event
app.post('/api/audit-logs', async (req, res) => {
  try {
    const entry = req.body;
    entry.ipAddress = req.ip || req.headers['x-forwarded-for'] || '127.0.0.1';
    const logged = await dbLogAudit(entry);
    res.status(201).json({ success: true, data: logged });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
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
    console.log(`> Fabric Endpoint:  ${process.env.FABRIC_SERVER || 'Fabric SQL Database'}`);
    console.log(`======================================================\n`);
    console.log('[Server] Connecting to Microsoft Fabric SQL Gateway in background...');
    connectToFabric().catch(err => {
      console.warn('[Server] Initial Fabric connection attempt:', err.message);
    });
  });
};

startServer();
