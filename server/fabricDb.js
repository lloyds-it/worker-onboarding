// ============================================================================
// MICROSOFT FABRIC SQL CONNECTOR & DATA ACCESS LAYER
// Server: 2xv4ddeoefeuhhgixzuzuy3udm-27j34hcgadaudjerknvakpsfle.database.fabric.microsoft.com
// Database: Worker_onboarding-44af8b36-2300-4f9e-a591-53248d3d454e
// ============================================================================

import sql from 'mssql';
import dotenv from 'dotenv';
import { DeviceCodeCredential, ClientSecretCredential } from '@azure/identity';
import { execFile, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import https from 'https';
import querystring from 'querystring';
import dns from 'dns';

// Force IPv4 DNS resolution first on Linux to avoid AAAA IPv6 timeouts / network_error
try {
  dns.setDefaultResultOrder('ipv4first');
} catch (e) { }

dotenv.config();

export const runPyBridge = (action, payload = null) => {
  return new Promise((resolve) => {
    const bridgePath = path.join(process.cwd(), 'server', 'fabric_bridge.py');
    const child = spawn('python', [bridgePath, action], { timeout: 25000 });
    let stdout = '';
    let stderr = '';

    child.stdout.on('data', data => { stdout += data; });
    child.stderr.on('data', data => { stderr += data; });

    child.on('close', code => {
      if (code !== 0 && !stdout) {
        return resolve({ success: false, error: stderr || `Process exited with code ${code}` });
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e) {
        resolve({ success: false, error: stdout || stderr || 'Failed to parse bridge output' });
      }
    });

    child.on('error', err => {
      resolve({ success: false, error: err.message });
    });

    if (payload) {
      try {
        child.stdin.write(JSON.stringify(payload));
      } catch (err) { }
    }
    child.stdin.end();
  });
};

export const syncToPyBridge = (action, payload) => {
  if (connectionStatus.mode !== 'FABRIC_ONLINE') {
    return;
  }
  runPyBridge(action, payload)
    .then(res => {
      if (res && res.success) {
        console.log(`[Fabric SQL] Live Sync Success for ${action}`);
      } else {
        console.warn(`[Fabric SQL] Notice for ${action}:`, res?.error || 'Non-blocking sync');
      }
    })
    .catch(err => {
      console.warn(`[Fabric SQL] Bridge notice for ${action}:`, err.message);
    });
};

const FABRIC_SERVER = process.env.FABRIC_SERVER || '2xv4ddeoefeuhhgixzuzuy3udm-s2pfycav32ku5anvzm7d4vfmqi.database.fabric.microsoft.com';
const FABRIC_DATABASE = process.env.FABRIC_DATABASE || 'Worker_onboarding-ef0fbf2a-a528-4ed3-ae76-4fcc1f9e531a';
const FABRIC_PORT = parseInt(process.env.FABRIC_PORT || '1433', 10);

let pool = null;
let liveAccessToken = null;
let tokenExpiresAt = 0;
let lastFabricFailureAt = 0;
const FABRIC_RETRY_COOLDOWN_MS = 60000;

const WORKERS_STORE_PATH = path.join(process.cwd(), 'server', 'data', 'workers_store.json');
const AUDIT_STORE_PATH = path.join(process.cwd(), 'server', 'data', 'audit_store.json');
const CONTRACTORS_STORE_PATH = path.join(process.cwd(), 'server', 'data', 'contractors_store.json');
const LOCATIONS_STORE_PATH = path.join(process.cwd(), 'server', 'data', 'locations_store.json');

const DEFAULT_LOCATIONS = [
  { id: 'LOC-15', locationCode: '15', locationName: 'Hedri Project Site (LMEL)', status: 'ACTIVE', createdAt: '2026-11-28T05:00:00.000Z' },
  { id: 'LOC-11', locationCode: '11', locationName: 'Konsari Integrated Steel Plant', status: 'ACTIVE', createdAt: '2026-11-28T05:00:00.000Z' },
  { id: 'LOC-12', locationCode: '12', locationName: 'Ghugus DRI & Power Plant', status: 'ACTIVE', createdAt: '2026-11-28T05:00:00.000Z' }
];

const loadJsonStore = (filePath, fallbackValue) => {
  try {
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn(`[Local Store] Notice reading ${path.basename(filePath)}:`, e.message);
  }
  return fallbackValue;
};

const saveJsonStore = (filePath, data) => {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.warn(`[Local Store] Notice writing ${path.basename(filePath)}:`, e.message);
  }
};
let activeAuthSession = {
  status: 'IDLE', // IDLE | PENDING | AUTHENTICATED | FAILED
  userCode: null,
  verificationUri: null,
  message: null,
  error: null
};

let connectionStatus = {
  isConnected: false,
  server: FABRIC_SERVER,
  database: FABRIC_DATABASE,
  lastChecked: null,
  error: null,
  mode: 'FALLBACK_MODE'
};

// Clean initial fallback dataset (zero pre-seeded records)
let fallbackWorkersCache = [];

let fallbackAuditLogs = loadJsonStore(AUDIT_STORE_PATH, []);

// Hydrate local worker, contractor, and location stores from disk if available
fallbackWorkersCache = loadJsonStore(WORKERS_STORE_PATH, fallbackWorkersCache);
let fallbackContractorsCache = loadJsonStore(CONTRACTORS_STORE_PATH, []);
let fallbackLocationsCache = loadJsonStore(LOCATIONS_STORE_PATH, DEFAULT_LOCATIONS);

const upsertFallbackWorker = (workerId, updatedWorker, isPendingSync = false) => {
  const cleanRecord = { ...updatedWorker };
  if (isPendingSync) {
    cleanRecord._fabricPendingSync = true;
  } else {
    delete cleanRecord._fabricPendingSync;
  }
  const exists = fallbackWorkersCache.some(w => w.id === workerId);
  if (exists) {
    fallbackWorkersCache = fallbackWorkersCache.map(w => w.id === workerId ? { ...w, ...cleanRecord } : w);
  } else {
    fallbackWorkersCache = [cleanRecord, ...fallbackWorkersCache];
  }
  saveJsonStore(WORKERS_STORE_PATH, fallbackWorkersCache);
};

const clipStr = (val, maxLen) => {
  if (val === null || val === undefined) return '';
  const str = String(val);
  return maxLen && str.length > maxLen ? str.slice(0, maxLen) : str;
};

const SCHEMA_STATEMENTS = [
  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkersMaster' AND COLUMN_NAME = 'completedAt') BEGIN ALTER TABLE dbo.WorkersMaster ADD completedAt VARCHAR(50) NULL; END;`,
  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkerHRData' AND COLUMN_NAME = 'photo') BEGIN ALTER TABLE dbo.WorkerHRData ADD photo VARCHAR(MAX) NULL; END;`,
  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkerHRData' AND COLUMN_NAME = 'contractorCode') BEGIN ALTER TABLE dbo.WorkerHRData ADD contractorCode VARCHAR(50) NULL; END;`,
  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkerHRData' AND COLUMN_NAME = 'locationCode') BEGIN ALTER TABLE dbo.WorkerHRData ADD locationCode VARCHAR(20) NULL; END;`,
  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkerHRData' AND COLUMN_NAME = 'locationName') BEGIN ALTER TABLE dbo.WorkerHRData ADD locationName VARCHAR(200) NULL; END;`,
  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkerHRData' AND COLUMN_NAME = 'address') BEGIN ALTER TABLE dbo.WorkerHRData ADD address VARCHAR(500) NULL; END;`,
  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkerHRData' AND COLUMN_NAME = 'workingLocation') BEGIN ALTER TABLE dbo.WorkerHRData ADD workingLocation VARCHAR(250) NULL; END;`,
  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkerHRData' AND COLUMN_NAME = 'activity') BEGIN ALTER TABLE dbo.WorkerHRData ADD activity VARCHAR(200) NULL; END;`,
  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkerCampAllocation' AND COLUMN_NAME = 'contractorSupervisor') BEGIN ALTER TABLE dbo.WorkerCampAllocation ADD contractorSupervisor VARCHAR(200) NULL; END;`,
  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'WorkerCampAllocation' AND COLUMN_NAME = 'supervisorMobile') BEGIN ALTER TABLE dbo.WorkerCampAllocation ADD supervisorMobile VARCHAR(30) NULL; END;`,
  `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'ContractorsMaster' AND schema_id = SCHEMA_ID('dbo')) BEGIN CREATE TABLE dbo.ContractorsMaster (id VARCHAR(50) NOT NULL, contractorCode VARCHAR(50) NULL, locationCode VARCHAR(20) NULL, locationName VARCHAR(200) NULL, companyName VARCHAR(200) NOT NULL, licenseNo VARCHAR(100) NULL, department VARCHAR(100) NULL, contactPerson VARCHAR(200) NULL, contactMobile VARCHAR(30) NULL, email VARCHAR(200) NULL, address VARCHAR(500) NULL, registrationNo VARCHAR(100) NULL, labourLicenseNo VARCHAR(100) NULL, pfCode VARCHAR(100) NULL, esicCode VARCHAR(100) NULL, gstNo VARCHAR(50) NULL, panNo VARCHAR(50) NULL, validFrom VARCHAR(50) NULL, validUpto VARCHAR(50) NULL, status VARCHAR(30) NOT NULL, createdAt VARCHAR(50) NULL); ALTER TABLE dbo.ContractorsMaster ADD CONSTRAINT PK_ContractorsMaster PRIMARY KEY NONCLUSTERED (id) NOT ENFORCED; END;`,
  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ContractorsMaster' AND COLUMN_NAME = 'contractorCode') BEGIN ALTER TABLE dbo.ContractorsMaster ADD contractorCode VARCHAR(50) NULL; END;`,
  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ContractorsMaster' AND COLUMN_NAME = 'locationCode') BEGIN ALTER TABLE dbo.ContractorsMaster ADD locationCode VARCHAR(20) NULL; END;`,
  `IF NOT EXISTS (SELECT 1 FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = 'ContractorsMaster' AND COLUMN_NAME = 'locationName') BEGIN ALTER TABLE dbo.ContractorsMaster ADD locationName VARCHAR(200) NULL; END;`,
  `IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'LocationsMaster' AND schema_id = SCHEMA_ID('dbo')) BEGIN CREATE TABLE dbo.LocationsMaster (id VARCHAR(50) NOT NULL, locationCode VARCHAR(20) NOT NULL, locationName VARCHAR(200) NOT NULL, status VARCHAR(30) NOT NULL, createdAt VARCHAR(50) NULL); ALTER TABLE dbo.LocationsMaster ADD CONSTRAINT PK_LocationsMaster PRIMARY KEY NONCLUSTERED (id) NOT ENFORCED; END;`
];

const ensureFabricSchema = async (targetPool) => {
  if (!targetPool || !targetPool.connected) return;
  for (const stmt of SCHEMA_STATEMENTS) {
    try {
      await targetPool.request().query(stmt);
    } catch (err) {
      console.warn('[Microsoft Fabric] Schema sync notice:', err.message);
    }
  }
};

const runFabricWriteWithRetry = async (label, writeFn) => {
  await connectToFabric();
  if (!pool || !pool.connected) return false;
  try {
    await writeFn(pool);
    return true;
  } catch (err) {
    console.error(`[Microsoft Fabric] ${label} error:`, err.message);
    if (String(err.message || '').includes('Invalid column') || String(err.message || '').includes('Invalid object')) {
      try {
        await ensureFabricSchema(pool);
        await writeFn(pool);
        return true;
      } catch (retryErr) {
        console.error(`[Microsoft Fabric] ${label} retry error:`, retryErr.message);
      }
    }
    return false;
  }
};

/**
 * Configure SQL connection options for Microsoft Fabric
 */
const getSqlConfig = (token = null) => {
  const config = {
    server: FABRIC_SERVER,
    port: FABRIC_PORT,
    database: FABRIC_DATABASE,
    options: {
      encrypt: true,
      trustServerCertificate: false,
      enableArithAbort: true,
      connectTimeout: 8000,
      requestTimeout: 10000
    },
    pool: {
      max: 10,
      min: 0,
      idleTimeoutMillis: 30000
    }
  };

  if (token) {
    config.authentication = {
      type: 'azure-active-directory-access-token',
      options: { token }
    };
  } else if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET) {
    config.authentication = {
      type: 'azure-active-directory-service-principal-secret',
      options: {
        clientId: process.env.AZURE_CLIENT_ID,
        clientSecret: process.env.AZURE_CLIENT_SECRET,
        tenantId: process.env.AZURE_TENANT_ID || 'common'
      }
    };
  } else {
    config.authentication = {
      type: 'azure-active-directory-password',
      options: {
        userName: process.env.FABRIC_USER || 'hmk@lloydsprojects.in',
        password: process.env.FABRIC_PASSWORD || '',
        clientId: process.env.AZURE_CLIENT_ID || '04b07795-8ddb-461a-bbee-02f9e1bf7b46',
        tenantId: process.env.AZURE_TENANT_ID || 'common'
      }
    };
  }

  return config;
};

/**
 * Acquire Microsoft Entra ID Token directly via OAuth2 client_credentials grant.
 * Uses IPv4 and HTTPS to guarantee zero network_error / AAAA DNS timeouts on Linux servers.
 */
export const acquireDirectToken = async (tenantId, clientId, clientSecret) => {
  const postData = querystring.stringify({
    client_id: clientId,
    client_secret: clientSecret,
    scope: 'https://database.windows.net/.default',
    grant_type: 'client_credentials'
  });

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'login.microsoftonline.com',
      port: 443,
      path: `/${tenantId}/oauth2/v2.0/token`,
      method: 'POST',
      family: 4, // Force IPv4 to prevent Linux network_error
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'LloydsWorkerOnboarding/1.0'
      },
      timeout: 15000
    };

    const req = https.request(options, (res) => {
      let raw = '';
      res.on('data', chunk => { raw += chunk; });
      res.on('end', () => {
        try {
          const data = JSON.parse(raw);
          if (data.access_token) {
            resolve({
              token: data.access_token,
              expiresIn: data.expires_in || 3600
            });
          } else {
            reject(new Error(data.error_description || data.error || `HTTP ${res.statusCode}`));
          }
        } catch (e) {
          reject(new Error(`Failed to parse OAuth2 token response: ${raw.slice(0, 100)}`));
        }
      });
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Microsoft Entra ID token request timed out after 15s'));
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.write(postData);
    req.end();
  });
};

/**
 * Connect with an acquired access token
 */
export const connectWithToken = async (token) => {
  try {
    if (pool) {
      try { await pool.close(); } catch (e) { }
      pool = null;
    }
    const config = getSqlConfig(token);
    pool = new sql.ConnectionPool(config);
    pool.on('error', err => {
      console.warn('[Microsoft Fabric] Connection pool warning:', err.message);
      pool = null;
    });
    await pool.connect();

    // Auto-verify columns and master tables independently
    await ensureFabricSchema(pool);

    connectionStatus = {
      isConnected: true,
      server: FABRIC_SERVER,
      database: FABRIC_DATABASE,
      lastChecked: new Date().toISOString(),
      error: null,
      mode: 'FABRIC_ONLINE_SPN'
    };
    console.log('[Microsoft Fabric] Connected successfully to live database via Entra ID Token!');
    return pool;
  } catch (err) {
    console.error('[Microsoft Fabric] Token connection error:', err.message);
    connectionStatus.error = err.message;
    connectionStatus.isConnected = false;
    connectionStatus.lastChecked = new Date().toISOString();
    connectionStatus.mode = 'FALLBACK_MODE';
    pool = null;
    return null;
  }
};

/**
 * Initiate Microsoft Device Code Authentication
 */
export const startDeviceCodeLogin = () => {
  return new Promise((resolve) => {
    activeAuthSession = {
      status: 'PENDING',
      userCode: null,
      verificationUri: 'https://microsoft.com/devicelogin',
      message: 'Requesting authentication code from Microsoft...',
      error: null
    };

    const credential = new DeviceCodeCredential({
      clientId: '04b07795-8ddb-461a-bbee-02f9e1bf7b46', // Well-known Microsoft Azure CLI Client ID
      userPromptCallback: (info) => {
        console.log('[Fabric Auth Prompt]:', info.message);
        activeAuthSession = {
          status: 'PENDING_USER_APPROVAL',
          userCode: info.userCode,
          verificationUri: info.verificationUri || 'https://microsoft.com/devicelogin',
          message: info.message,
          error: null
        };
        resolve(activeAuthSession);
      }
    });

    // Request token in background
    credential.getToken('https://database.windows.net/.default')
      .then(async (tokenResp) => {
        liveAccessToken = tokenResp.token;
        activeAuthSession = {
          status: 'AUTHENTICATED',
          message: 'Entra ID Token acquired! Connecting to Microsoft Fabric...',
          error: null
        };
        await connectWithToken(tokenResp.token);
      })
      .catch((err) => {
        console.error('[Fabric Auth] Authentication failed:', err.message);
        activeAuthSession = {
          status: 'FAILED',
          message: 'Authentication cancelled or failed',
          error: err.message
        };
      });

    // Fallback resolve if userPromptCallback takes time
    setTimeout(() => {
      if (activeAuthSession.userCode) {
        resolve(activeAuthSession);
      } else {
        resolve(activeAuthSession);
      }
    }, 4000);
  });
};

export const getAuthStatus = () => activeAuthSession;

/**
 * Connect to Fabric using current config
 */
export const connectToFabric = async (force = false) => {
  if (!force && lastFabricFailureAt && Date.now() - lastFabricFailureAt < FABRIC_RETRY_COOLDOWN_MS) {
    return null;
  }

  // Reuse valid cached token (with 5 min safety buffer)
  if (liveAccessToken && Date.now() < tokenExpiresAt - 300000) {
    if (pool && pool.connected) {
      return pool;
    }
    const reconnected = await connectWithToken(liveAccessToken);
    if (!reconnected) lastFabricFailureAt = Date.now();
    return reconnected;
  }

  // 1. Primary: Acquire Azure Entra ID token directly via HTTPS (IPv4 forced)
  if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET && process.env.AZURE_TENANT_ID) {
    try {
      console.log('[Microsoft Fabric] Authenticating via Service Principal Client ID:', process.env.AZURE_CLIENT_ID);
      const tokenResult = await acquireDirectToken(
        process.env.AZURE_TENANT_ID,
        process.env.AZURE_CLIENT_ID,
        process.env.AZURE_CLIENT_SECRET
      );
      if (tokenResult && tokenResult.token) {
        liveAccessToken = tokenResult.token;
        tokenExpiresAt = Date.now() + (tokenResult.expiresIn * 1000);
        console.log('[Microsoft Fabric] Acquired Entra ID Token via Direct OAuth2 (IPv4)!');
        const connectedPool = await connectWithToken(tokenResult.token);
        if (!connectedPool) {
          lastFabricFailureAt = Date.now();
        } else {
          lastFabricFailureAt = 0;
        }
        return connectedPool;
      }
    } catch (directErr) {
      console.warn('[Microsoft Fabric] Direct OAuth2 token notice:', directErr.message);

      // Fallback to @azure/identity ClientSecretCredential if direct HTTPS had unexpected issue
      try {
        const credential = new ClientSecretCredential(
          process.env.AZURE_TENANT_ID,
          process.env.AZURE_CLIENT_ID,
          process.env.AZURE_CLIENT_SECRET
        );
        const tokenResp = await credential.getToken('https://database.windows.net/.default');
        if (tokenResp && tokenResp.token) {
          liveAccessToken = tokenResp.token;
          tokenExpiresAt = tokenResp.expiresOnTimestamp || (Date.now() + 3600000);
          console.log('[Microsoft Fabric] Acquired Entra ID Token via ClientSecretCredential!');
          return await connectWithToken(tokenResp.token);
        }
      } catch (spErr) {
        console.warn('[Microsoft Fabric] Service Principal fallback notice:', spErr.message);
      }
    }
  }

  // 2. Secondary: Connect using bridge if available
  try {
    const pyResult = await runPyBridge('test');
    if (pyResult && pyResult.connected) {
      connectionStatus = {
        isConnected: true,
        server: FABRIC_SERVER,
        database: FABRIC_DATABASE,
        lastChecked: new Date().toISOString(),
        error: null,
        mode: 'FABRIC_ONLINE'
      };
      console.log(`[Microsoft Fabric] Connected successfully to live database via Python bridge!`);
      return { connected: true };
    }
  } catch (pyErr) {
    // continue to direct SQL
  }

  try {
    const config = getSqlConfig();
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    await ensureFabricSchema(pool);

    connectionStatus = {
      isConnected: true,
      server: FABRIC_SERVER,
      database: FABRIC_DATABASE,
      lastChecked: new Date().toISOString(),
      error: null,
      mode: 'FABRIC_ONLINE'
    };
    console.log(`[Microsoft Fabric] Connected successfully to ${FABRIC_SERVER} / ${FABRIC_DATABASE}`);
    return pool;
  } catch (err) {
    lastFabricFailureAt = Date.now();
    connectionStatus = {
      isConnected: false,
      server: FABRIC_SERVER,
      database: FABRIC_DATABASE,
      lastChecked: new Date().toISOString(),
      error: err.message,
      mode: 'FALLBACK_MODE'
    };
    console.warn(`[Microsoft Fabric] Notice: Could not connect to Fabric live database (${err.message}). Activating Hybrid Local Fallback mode.`);
    return null;
  }
};

export const getConnectionStatus = () => connectionStatus;

export const testFabricConnection = async () => {
  const startTime = Date.now();

  // 1. Primary: Direct Node TDS Pool Check (fastest and native)
  try {
    if (!pool || !pool.connected) {
      await connectToFabric(true);
    }
    if (pool && pool.connected) {
      const result = await pool.request().query('SELECT 1 AS isAlive, DB_NAME() AS currentDb, GETUTCDATE() AS serverTime');
      const latencyMs = Date.now() - startTime;
      const currentDb = result.recordset[0]?.currentDb || FABRIC_DATABASE;
      connectionStatus = {
        isConnected: true,
        server: FABRIC_SERVER,
        database: currentDb,
        lastChecked: new Date().toISOString(),
        error: null,
        mode: 'FABRIC_ONLINE_SPN'
      };
      return {
        success: true,
        latencyMs,
        server: FABRIC_SERVER,
        database: currentDb,
        serverTime: result.recordset[0]?.serverTime,
        mode: 'FABRIC_ONLINE_SPN',
        authMethod: 'Service Principal Entra ID Token',
        servicePrincipal: process.env.AZURE_CLIENT_ID,
        message: 'Connected to Microsoft Fabric live SQL Database via Service Principal!'
      };
    }
  } catch (tdsErr) {
    console.warn('[Microsoft Fabric] TDS direct query notice:', tdsErr.message);
  }

  // 2. Secondary: Python bridge fallback if available
  try {
    const pyResult = await runPyBridge('test');
    if (pyResult && pyResult.connected) {
      const isSP = pyResult.mode === 'FABRIC_LIVE_SERVICE_PRINCIPAL';
      connectionStatus = {
        isConnected: true,
        server: FABRIC_SERVER,
        database: pyResult.currentDb || FABRIC_DATABASE,
        lastChecked: new Date().toISOString(),
        error: null,
        mode: isSP ? 'FABRIC_ONLINE_SPN' : 'FABRIC_ONLINE'
      };
      return {
        success: true,
        latencyMs: Date.now() - startTime,
        server: FABRIC_SERVER,
        database: pyResult.currentDb || FABRIC_DATABASE,
        serverTime: pyResult.serverTime,
        mode: isSP ? 'FABRIC_ONLINE_SPN' : 'FABRIC_ONLINE',
        authMethod: pyResult.authMethod,
        appId: pyResult.appId,
        servicePrincipal: pyResult.servicePrincipal,
        message: isSP
          ? 'Connected to Microsoft Fabric using Workspace Service Principal!'
          : 'Connected to Microsoft Fabric live SQL Database (AD Fallback while SP permissions propagate).'
      };
    }

    if (pyResult && pyResult.needPermissionGrant) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        server: FABRIC_SERVER,
        database: FABRIC_DATABASE,
        error: "Service Principal credentials are valid, but Fabric workspace permissions must be granted.",
        details: "Go to Fabric Workspace > 'Manage access' > Add 'ab0981e7-bc93-4d13-81b2-4f7d08871064' as Contributor.",
        mode: 'FALLBACK_MODE',
        needPermissionGrant: true
      };
    }
  } catch (pyErr) {
    console.warn('[Bridge] pyodbc check notice:', pyErr.message);
  }

  return {
    success: false,
    latencyMs: Date.now() - startTime,
    server: FABRIC_SERVER,
    database: FABRIC_DATABASE,
    error: connectionStatus.error || 'Connection not established.',
    mode: 'FALLBACK_MODE'
  };
};

/**
 * Retrieve all workers (Live Fabric or Fallback)
 */
export const dbGetAllWorkers = async () => {
  // 1. Trigger non-blocking background reconnect if disconnected so API responses never stall
  if (!pool || !pool.connected) {
    connectToFabric().catch(() => {});
  }

  if (pool && pool.connected) {
    try {
      const query = `
        SELECT 
          w.id, w.assignedWorkerId, w.stage, w.status, w.fullName, w.contractorName, w.trade, w.mobileNumber, w.createdAt, w.updatedAt, w.completedAt,
          hr.fatherHusbandName, hr.dob, hr.age, hr.gender, hr.idProofType, hr.idProofRef, hr.contractorCode, hr.locationCode, hr.locationName, hr.contractorLicense, hr.address, hr.workingLocation, hr.activity, hr.emergencyPerson, hr.emergencyRelationship, hr.emergencyMobile, hr.photo,
          m.bloodGroup, m.heightCm, m.weightKg, m.bmi, m.bmiCategory, m.bpSystolic, m.bpDiastolic, m.spo2, m.pulseRate, m.respirationRate, m.rbs, m.alcoholTest, m.visionTest, m.hearingTest, m.vertigoTest, m.existingIllness, m.fitnessStatus, m.examinerName, m.remarks AS medicalRemarks,
          s.briefingDone, s.topicsCovered, s.ppeIssued, s.safetyOfficerName, s.safetyDate,
          it.faceBiometricRegistered, it.cwmsRegistered, it.campusMasterUploaded, it.undertakingAccepted, it.itAdminSignature, it.itDate,
          c.campName, c.blockNo, c.roomNo, c.bedNo, c.gatePassActive, c.allocatedBy, c.allocationDate, c.allocatedAt, c.contractorSupervisor, c.supervisorMobile
        FROM dbo.WorkersMaster w
        LEFT JOIN dbo.WorkerHRData hr ON w.id = hr.workerId
        LEFT JOIN dbo.WorkerMedicalVitals m ON w.id = m.workerId
        LEFT JOIN dbo.WorkerSafetyInduction s ON w.id = s.workerId
        LEFT JOIN dbo.WorkerITBiometrics it ON w.id = it.workerId
        LEFT JOIN dbo.WorkerCampAllocation c ON w.id = c.workerId
        ORDER BY w.createdAt DESC
      `;
      const result = await pool.request().query(query);

      const records = result.recordset.map(row => ({
        id: row.id,
        assignedWorkerId: row.assignedWorkerId || '',
        stage: row.stage,
        status: row.status,
        createdAt: row.createdAt,
        updatedAt: row.updatedAt,
        completedAt: row.completedAt || (row.stage === 6 ? (row.allocatedAt || row.updatedAt || null) : null),
        hr: {
          fullName: row.fullName,
          fatherHusbandName: row.fatherHusbandName || '',
          dob: row.dob || '',
          age: row.age,
          gender: row.gender || '',
          mobileNumber: row.mobileNumber || '',
          idProofType: row.idProofType || '',
          idProofRef: row.idProofRef || '',
          contractorName: row.contractorName || '',
          contractorCode: row.contractorCode || '',
          locationCode: row.locationCode || '15',
          locationName: row.locationName || '',
          contractorLicense: row.contractorLicense || '',
          trade: row.trade || '',
          address: row.address || '',
          workingLocation: row.workingLocation || '',
          activity: row.activity || '',
          emergencyPerson: row.emergencyPerson || '',
          emergencyRelationship: row.emergencyRelationship || '',
          emergencyMobile: row.emergencyMobile || '',
          photo: row.photo || ''
        },
        medical: (row.bloodGroup || row.fitnessStatus || row.examinerName) ? {
          bloodGroup: row.bloodGroup,
          heightCm: row.heightCm,
          weightKg: row.weightKg,
          bmi: row.bmi,
          bmiCategory: row.bmiCategory,
          bpSystolic: row.bpSystolic,
          bpDiastolic: row.bpDiastolic,
          spo2: row.spo2,
          pulseRate: row.pulseRate,
          respirationRate: row.respirationRate,
          rbs: row.rbs,
          alcoholTest: row.alcoholTest,
          visionTest: row.visionTest,
          hearingTest: row.hearingTest,
          vertigoTest: row.vertigoTest,
          existingIllness: row.existingIllness,
          fitnessStatus: row.fitnessStatus,
          examinerName: row.examinerName,
          remarks: row.medicalRemarks
        } : null,
        safety: (row.briefingDone !== null || row.safetyOfficerName) ? {
          briefingDone: !!row.briefingDone,
          topicsCovered: row.topicsCovered ? row.topicsCovered.split(' | ') : [],
          ppeIssued: row.ppeIssued ? row.ppeIssued.split(' | ') : [],
          safetyOfficerName: row.safetyOfficerName || '',
          safetyDate: row.safetyDate || ''
        } : null,
        it: (row.faceBiometricRegistered !== null || row.itAdminSignature) ? {
          faceBiometricRegistered: !!row.faceBiometricRegistered,
          cwmsRegistered: !!row.cwmsRegistered,
          campusMasterUploaded: !!row.campusMasterUploaded,
          undertakingAccepted: !!row.undertakingAccepted,
          assignedWorkerId: row.assignedWorkerId,
          itAdminSignature: row.itAdminSignature || '',
          itDate: row.itDate || ''
        } : null,
        camp: (row.campName || row.roomNo) ? {
          campName: row.campName,
          blockNumber: row.blockNo,
          roomNumber: row.roomNo,
          bedNumber: row.bedNo,
          gatePassActive: !!row.gatePassActive,
          allocatedBy: row.allocatedBy || '',
          allocationDate: row.allocationDate || '',
          contractorSupervisor: row.contractorSupervisor || '',
          supervisorMobile: row.supervisorMobile || ''
        } : null
      }));

      // Preserve any locally-saved pending-sync records so Fabric reads never wipe unsynced worker submissions
      const pendingLocal = (fallbackWorkersCache || []).filter(w => w && w._fabricPendingSync);
      const mergedById = new Map(records.map(r => [r.id, r]));
      pendingLocal.forEach(p => {
        const existing = mergedById.get(p.id);
        if (!existing || new Date(p.updatedAt || 0).getTime() >= new Date(existing.updatedAt || 0).getTime()) {
          mergedById.set(p.id, p);
        }
      });
      const finalRecords = Array.from(mergedById.values()).sort(
        (a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()
      );

      fallbackWorkersCache = finalRecords;
      saveJsonStore(WORKERS_STORE_PATH, finalRecords);
      return finalRecords;
    } catch (err) {
      console.error('[Microsoft Fabric] Query error in dbGetAllWorkers, using fallback:', err.message);
    }
  }

  return fallbackWorkersCache;
};

/**
 * Register a new worker (Step 1: HR)
 */
export const dbRegisterWorkerHR = async (newWorker) => {
  const now = new Date().toISOString();
  const fabricSaved = await runFabricWriteWithRetry(`Register HR ${newWorker.id}`, async (targetPool) => {
    const request = new sql.Request(targetPool);
    await request
      .input('id', sql.VarChar(50), clipStr(newWorker.id, 50))
      .input('assignedWorkerId', sql.VarChar(50), clipStr(newWorker.assignedWorkerId, 50))
      .input('stage', sql.Int, Number(newWorker.stage) || 2)
      .input('status', sql.VarChar(50), clipStr(newWorker.status || 'IN_PROGRESS', 50))
      .input('fullName', sql.VarChar(200), clipStr(newWorker.hr.fullName, 200))
      .input('contractorName', sql.VarChar(200), clipStr(newWorker.hr.contractorName, 200))
      .input('trade', sql.VarChar(100), clipStr(newWorker.hr.trade, 100))
      .input('mobileNumber', sql.VarChar(20), clipStr(newWorker.hr.mobileNumber, 20))
      .input('createdAt', sql.VarChar(50), clipStr(newWorker.createdAt || now, 50))
      .input('updatedAt', sql.VarChar(50), clipStr(newWorker.updatedAt || now, 50))
      .input('fatherHusbandName', sql.VarChar(200), clipStr(newWorker.hr.fatherHusbandName, 200))
      .input('dob', sql.VarChar(50), clipStr(newWorker.hr.dob, 50))
      .input('age', sql.Int, parseInt(newWorker.hr.age, 10) || null)
      .input('gender', sql.VarChar(10), clipStr(newWorker.hr.gender, 10))
      .input('idProofType', sql.VarChar(100), clipStr(newWorker.hr.idProofType, 100))
      .input('idProofRef', sql.VarChar(100), clipStr(newWorker.hr.idProofRef, 100))
      .input('contractorCode', sql.VarChar(50), clipStr(newWorker.hr.contractorCode, 50))
      .input('locationCode', sql.VarChar(20), clipStr(newWorker.hr.locationCode || '15', 20))
      .input('locationName', sql.VarChar(200), clipStr(newWorker.hr.locationName, 200))
      .input('contractorLicense', sql.VarChar(100), clipStr(newWorker.hr.contractorLicense, 100))
      .input('address', sql.VarChar(500), clipStr(newWorker.hr.address, 500))
      .input('workingLocation', sql.VarChar(250), clipStr(newWorker.hr.workingLocation, 250))
      .input('activity', sql.VarChar(200), clipStr(newWorker.hr.activity, 200))
      .input('emergencyPerson', sql.VarChar(200), clipStr(newWorker.hr.emergencyPerson, 200))
      .input('emergencyRelationship', sql.VarChar(100), clipStr(newWorker.hr.emergencyRelationship, 100))
      .input('emergencyMobile', sql.VarChar(20), clipStr(newWorker.hr.emergencyMobile, 20))
      .input('photo', sql.VarChar(sql.MAX), newWorker.hr.photo || '')
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.WorkersMaster WHERE id = @id)
        BEGIN
          INSERT INTO dbo.WorkersMaster (id, assignedWorkerId, stage, status, fullName, contractorName, trade, mobileNumber, createdAt, updatedAt)
          VALUES (@id, @assignedWorkerId, @stage, @status, @fullName, @contractorName, @trade, @mobileNumber, @createdAt, @updatedAt);
        END
        ELSE
        BEGIN
          UPDATE dbo.WorkersMaster 
          SET assignedWorkerId = @assignedWorkerId, stage = @stage, status = @status, fullName = @fullName, contractorName = @contractorName, trade = @trade, mobileNumber = @mobileNumber, updatedAt = @updatedAt
          WHERE id = @id;
        END;

        IF NOT EXISTS (SELECT 1 FROM dbo.WorkerHRData WHERE workerId = @id)
        BEGIN
          INSERT INTO dbo.WorkerHRData (workerId, fullName, fatherHusbandName, dob, age, gender, mobileNumber, idProofType, idProofRef, contractorName, contractorCode, locationCode, locationName, contractorLicense, address, workingLocation, activity, emergencyPerson, emergencyRelationship, emergencyMobile, photo, registeredAt)
          VALUES (@id, @fullName, @fatherHusbandName, @dob, @age, @gender, @mobileNumber, @idProofType, @idProofRef, @contractorName, @contractorCode, @locationCode, @locationName, @contractorLicense, @address, @workingLocation, @activity, @emergencyPerson, @emergencyRelationship, @emergencyMobile, @photo, @createdAt);
        END
        ELSE
        BEGIN
          UPDATE dbo.WorkerHRData
          SET fullName = @fullName, fatherHusbandName = @fatherHusbandName, dob = @dob, age = @age, gender = @gender, mobileNumber = @mobileNumber, idProofType = @idProofType, idProofRef = @idProofRef, contractorName = @contractorName, contractorCode = @contractorCode, locationCode = @locationCode, locationName = @locationName, contractorLicense = @contractorLicense, address = @address, workingLocation = @workingLocation, activity = @activity, emergencyPerson = @emergencyPerson, emergencyRelationship = @emergencyRelationship, emergencyMobile = @emergencyMobile, photo = COALESCE(NULLIF(@photo, ''), photo)
          WHERE workerId = @id;
        END;
      `);
    console.log(`[Microsoft Fabric] Live Insert: Worker ${newWorker.id} saved in Fabric SQL database.`);
  });

  // Keep fallback cache synced and preserve _fabricPendingSync if Fabric write failed
  upsertFallbackWorker(newWorker.id, newWorker, !fabricSaved);
  syncToPyBridge('register', newWorker);
  return newWorker;
};

/**
 * Update Worker Photograph (Direct live update to Fabric SQL)
 */
export const dbUpdateWorkerPhoto = async (workerId, photoUrl) => {
  if (pool && pool.connected) {
    try {
      const request = new sql.Request(pool);
      await request
        .input('workerId', sql.VarChar(50), workerId)
        .input('photo', sql.VarChar(sql.MAX), photoUrl || '')
        .query(`
          UPDATE dbo.WorkerHRData
          SET photo = @photo
          WHERE workerId = @workerId;
        `);
      console.log(`[Microsoft Fabric] Worker ${workerId} photo updated in live Fabric database.`);
    } catch (err) {
      console.error('[Microsoft Fabric] Photo update failed:', err.message);
    }
  }

  fallbackWorkersCache = fallbackWorkersCache.map(w => {
    if (w.id === workerId) {
      return {
        ...w,
        hr: { ...w.hr, photo: photoUrl }
      };
    }
    return w;
  });
  saveJsonStore(WORKERS_STORE_PATH, fallbackWorkersCache);

  return { success: true, workerId, photo: photoUrl };
};

/**
 * Update Medical Vitals (Step 2)
 */
export const dbUpdateMedical = async (workerId, medicalData, updatedWorker) => {
  const now = new Date().toISOString();
  const fabricSaved = await runFabricWriteWithRetry(`Update Medical ${workerId}`, async (targetPool) => {
    const request = new sql.Request(targetPool);
    await request
      .input('workerId', sql.VarChar(50), clipStr(workerId, 50))
      .input('bloodGroup', sql.VarChar(10), clipStr(medicalData.bloodGroup, 10))
      .input('heightCm', sql.Int, Math.round(Number(medicalData.heightCm)) || null)
      .input('weightKg', sql.Int, Math.round(Number(medicalData.weightKg)) || null)
      .input('bmi', sql.VarChar(20), clipStr(medicalData.bmi, 20))
      .input('bmiCategory', sql.VarChar(50), clipStr(medicalData.bmiCategory, 50))
      .input('bpSystolic', sql.Int, parseInt(medicalData.bpSystolic, 10) || null)
      .input('bpDiastolic', sql.Int, parseInt(medicalData.bpDiastolic, 10) || null)
      .input('spo2', sql.Int, parseInt(medicalData.spo2, 10) || null)
      .input('pulseRate', sql.Int, parseInt(medicalData.pulseRate, 10) || null)
      .input('respirationRate', sql.Int, parseInt(medicalData.respirationRate, 10) || null)
      .input('rbs', sql.Int, parseInt(medicalData.rbs, 10) || null)
      .input('alcoholTest', sql.VarChar(20), clipStr(medicalData.alcoholTest, 20))
      .input('visionTest', sql.VarChar(50), clipStr(medicalData.visionTest, 50))
      .input('hearingTest', sql.VarChar(50), clipStr(medicalData.hearingTest, 50))
      .input('vertigoTest', sql.VarChar(50), clipStr(medicalData.vertigoTest, 50))
      .input('existingIllness', sql.VarChar(500), clipStr(medicalData.existingIllness, 500))
      .input('fitnessStatus', sql.VarChar(50), clipStr(medicalData.fitnessStatus, 50))
      .input('examinerName', sql.VarChar(200), clipStr(medicalData.examinerName, 200))
      .input('remarks', sql.VarChar(1000), clipStr(medicalData.remarks, 1000))
      .input('stage', sql.Int, updatedWorker.stage)
      .input('status', sql.VarChar(50), clipStr(updatedWorker.status, 50))
      .input('updatedAt', sql.VarChar(50), now)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.WorkerMedicalVitals WHERE workerId = @workerId)
        BEGIN
          INSERT INTO dbo.WorkerMedicalVitals (workerId, bloodGroup, heightCm, weightKg, bmi, bmiCategory, bpSystolic, bpDiastolic, spo2, pulseRate, respirationRate, rbs, alcoholTest, visionTest, hearingTest, vertigoTest, existingIllness, fitnessStatus, examinerName, remarks, examinedAt)
          VALUES (@workerId, @bloodGroup, @heightCm, @weightKg, @bmi, @bmiCategory, @bpSystolic, @bpDiastolic, @spo2, @pulseRate, @respirationRate, @rbs, @alcoholTest, @visionTest, @hearingTest, @vertigoTest, @existingIllness, @fitnessStatus, @examinerName, @remarks, @updatedAt);
        END
        ELSE
        BEGIN
          UPDATE dbo.WorkerMedicalVitals
          SET bloodGroup = @bloodGroup, heightCm = @heightCm, weightKg = @weightKg, bmi = @bmi, bmiCategory = @bmiCategory, bpSystolic = @bpSystolic, bpDiastolic = @bpDiastolic, spo2 = @spo2, pulseRate = @pulseRate, respirationRate = @respirationRate, rbs = @rbs, alcoholTest = @alcoholTest, visionTest = @visionTest, hearingTest = @hearingTest, vertigoTest = @vertigoTest, existingIllness = @existingIllness, fitnessStatus = @fitnessStatus, examinerName = @examinerName, remarks = @remarks, examinedAt = @updatedAt
          WHERE workerId = @workerId;
        END;

        UPDATE dbo.WorkersMaster SET stage = @stage, status = @status, updatedAt = @updatedAt WHERE id = @workerId;
      `);
    console.log(`[Microsoft Fabric] Medical update saved for ${workerId}`);
  });

  upsertFallbackWorker(workerId, { ...updatedWorker, updatedAt: now }, !fabricSaved);
  syncToPyBridge('update_medical', { workerId, medical: medicalData, worker: updatedWorker });
  return updatedWorker;
};

/**
 * Update Safety Induction (Step 3)
 */
export const dbUpdateSafety = async (workerId, safetyData, updatedWorker) => {
  const now = new Date().toISOString();
  const fabricSaved = await runFabricWriteWithRetry(`Update Safety ${workerId}`, async (targetPool) => {
    const topicsStr = (safetyData.topicsCovered || []).join(' | ');
    const ppeStr = (safetyData.ppeIssued || []).join(' | ');

    const request = new sql.Request(targetPool);
    await request
      .input('workerId', sql.VarChar(50), clipStr(workerId, 50))
      .input('briefingDone', sql.Bit, safetyData.briefingDone ? 1 : 0)
      .input('topicsCovered', sql.VarChar(2000), clipStr(topicsStr, 2000))
      .input('ppeIssued', sql.VarChar(2000), clipStr(ppeStr, 2000))
      .input('safetyOfficerName', sql.VarChar(200), clipStr(safetyData.safetyOfficerName, 200))
      .input('safetyDate', sql.VarChar(50), clipStr(safetyData.safetyDate || now.slice(0, 10), 50))
      .input('stage', sql.Int, updatedWorker.stage)
      .input('updatedAt', sql.VarChar(50), now)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.WorkerSafetyInduction WHERE workerId = @workerId)
        BEGIN
          INSERT INTO dbo.WorkerSafetyInduction (workerId, briefingDone, topicsCovered, ppeIssued, safetyOfficerName, safetyDate, inductedAt)
          VALUES (@workerId, @briefingDone, @topicsCovered, @ppeIssued, @safetyOfficerName, @safetyDate, @updatedAt);
        END
        ELSE
        BEGIN
          UPDATE dbo.WorkerSafetyInduction
          SET briefingDone = @briefingDone, topicsCovered = @topicsCovered, ppeIssued = @ppeIssued, safetyOfficerName = @safetyOfficerName, safetyDate = @safetyDate, inductedAt = @updatedAt
          WHERE workerId = @workerId;
        END;

        UPDATE dbo.WorkersMaster SET stage = @stage, updatedAt = @updatedAt WHERE id = @workerId;
      `);
    console.log(`[Microsoft Fabric] Safety induction saved for ${workerId}`);
  });

  upsertFallbackWorker(workerId, { ...updatedWorker, updatedAt: now }, !fabricSaved);
  syncToPyBridge('update_safety', { workerId, safety: safetyData, worker: updatedWorker });
  return updatedWorker;
};

/**
 * Update IT Biometrics (Step 4)
 */
export const dbUpdateIT = async (workerId, itData, updatedWorker) => {
  const now = new Date().toISOString();
  const fabricSaved = await runFabricWriteWithRetry(`Update IT ${workerId}`, async (targetPool) => {
    const request = new sql.Request(targetPool);
    await request
      .input('workerId', sql.VarChar(50), clipStr(workerId, 50))
      .input('assignedWorkerId', sql.VarChar(50), clipStr(updatedWorker.assignedWorkerId, 50))
      .input('faceBiometricRegistered', sql.Bit, itData.faceBiometricRegistered ? 1 : 0)
      .input('cwmsRegistered', sql.Bit, itData.cwmsRegistered ? 1 : 0)
      .input('campusMasterUploaded', sql.Bit, itData.campusMasterUploaded ? 1 : 0)
      .input('undertakingAccepted', sql.Bit, itData.undertakingAccepted ? 1 : 0)
      .input('itAdminSignature', sql.VarChar(200), clipStr(itData.itAdminSignature, 200))
      .input('itDate', sql.VarChar(50), clipStr(itData.itDate || now.slice(0, 10), 50))
      .input('stage', sql.Int, updatedWorker.stage)
      .input('updatedAt', sql.VarChar(50), now)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.WorkerITBiometrics WHERE workerId = @workerId)
        BEGIN
          INSERT INTO dbo.WorkerITBiometrics (workerId, assignedWorkerId, faceBiometricRegistered, cwmsRegistered, campusMasterUploaded, undertakingAccepted, itAdminSignature, itDate, enrolledAt)
          VALUES (@workerId, @assignedWorkerId, @faceBiometricRegistered, @cwmsRegistered, @campusMasterUploaded, @undertakingAccepted, @itAdminSignature, @itDate, @updatedAt);
        END
        ELSE
        BEGIN
          UPDATE dbo.WorkerITBiometrics
          SET assignedWorkerId = @assignedWorkerId, faceBiometricRegistered = @faceBiometricRegistered, cwmsRegistered = @cwmsRegistered, campusMasterUploaded = @campusMasterUploaded, undertakingAccepted = @undertakingAccepted, itAdminSignature = @itAdminSignature, itDate = @itDate, enrolledAt = @updatedAt
          WHERE workerId = @workerId;
        END;

        UPDATE dbo.WorkersMaster SET assignedWorkerId = @assignedWorkerId, stage = @stage, updatedAt = @updatedAt WHERE id = @workerId;
      `);
    console.log(`[Microsoft Fabric] IT Biometrics saved for ${workerId}`);
  });

  upsertFallbackWorker(workerId, { ...updatedWorker, updatedAt: now }, !fabricSaved);
  syncToPyBridge('update_it', { workerId, it: itData, worker: updatedWorker });
  return updatedWorker;
};

/**
 * Update Camp Housing (Step 5)
 */
export const dbUpdateCamp = async (workerId, campData, updatedWorker) => {
  const now = new Date().toISOString();
  const completedAt = updatedWorker.completedAt || now;
  const persistedWorker = { ...updatedWorker, updatedAt: now, completedAt };
  const fabricSaved = await runFabricWriteWithRetry(`Update Camp ${workerId}`, async (targetPool) => {
    const request = new sql.Request(targetPool);
    await request
      .input('workerId', sql.VarChar(50), clipStr(workerId, 50))
      .input('campName', sql.VarChar(100), clipStr(campData.campName, 100))
      .input('blockNo', sql.VarChar(50), clipStr(campData.blockNumber, 50))
      .input('roomNo', sql.VarChar(50), clipStr(campData.roomNumber, 50))
      .input('bedNo', sql.VarChar(50), clipStr(campData.bedNumber, 50))
      .input('gatePassActive', sql.Bit, campData.gatePassActive ? 1 : 0)
      .input('allocatedBy', sql.VarChar(200), clipStr(campData.allocatedBy, 200))
      .input('allocationDate', sql.VarChar(50), clipStr(campData.allocationDate || now.slice(0, 10), 50))
      .input('contractorSupervisor', sql.VarChar(200), clipStr(campData.contractorSupervisor, 200))
      .input('supervisorMobile', sql.VarChar(30), clipStr(campData.supervisorMobile, 30))
      .input('stage', sql.Int, persistedWorker.stage)
      .input('status', sql.VarChar(50), clipStr(persistedWorker.status, 50))
      .input('updatedAt', sql.VarChar(50), now)
      .input('completedAt', sql.VarChar(50), completedAt)
      .query(`
        IF NOT EXISTS (SELECT 1 FROM dbo.WorkerCampAllocation WHERE workerId = @workerId)
        BEGIN
          INSERT INTO dbo.WorkerCampAllocation (workerId, campName, blockNo, roomNo, bedNo, gatePassActive, allocatedBy, allocationDate, contractorSupervisor, supervisorMobile, allocatedAt)
          VALUES (@workerId, @campName, @blockNo, @roomNo, @bedNo, @gatePassActive, @allocatedBy, @allocationDate, @contractorSupervisor, @supervisorMobile, @updatedAt);
        END
        ELSE
        BEGIN
          UPDATE dbo.WorkerCampAllocation
          SET campName = @campName, blockNo = @blockNo, roomNo = @roomNo, bedNo = @bedNo, gatePassActive = @gatePassActive, allocatedBy = @allocatedBy, allocationDate = @allocationDate, contractorSupervisor = @contractorSupervisor, supervisorMobile = @supervisorMobile, allocatedAt = @updatedAt
          WHERE workerId = @workerId;
        END;

        UPDATE dbo.WorkersMaster SET stage = @stage, status = @status, updatedAt = @updatedAt, completedAt = @completedAt WHERE id = @workerId;
      `);
    console.log(`[Microsoft Fabric] Camp allocation saved for ${workerId}`);
  });

  upsertFallbackWorker(workerId, persistedWorker, !fabricSaved);
  syncToPyBridge('update_camp', { workerId, camp: campData, worker: persistedWorker });
  return persistedWorker;
};

/**
 * Admin Stage Override
 */
export const dbOverrideWorkerStage = async (workerId, newStage, newStatus = null) => {
  const now = new Date().toISOString();
  const resolvedStatus = newStatus || (newStage === -1 ? 'FLAGGED' : (newStage === 6 ? 'COMPLETED' : 'IN_PROGRESS'));
  const completedAt = newStage === 6 ? now : null;

  if (pool && pool.connected) {
    try {
      const request = new sql.Request(pool);
      await request
        .input('workerId', sql.VarChar(50), workerId)
        .input('stage', sql.Int, newStage)
        .input('status', sql.VarChar(50), resolvedStatus)
        .input('updatedAt', sql.VarChar(50), now)
        .input('completedAt', sql.VarChar(50), completedAt)
        .query(`
          UPDATE dbo.WorkersMaster
          SET stage = @stage, status = @status, updatedAt = @updatedAt, completedAt = @completedAt
          WHERE id = @workerId;
        `);
      console.log(`[Microsoft Fabric] Admin stage override saved for ${workerId} -> Stage ${newStage}`);
    } catch (err) {
      console.error('[Microsoft Fabric] Stage override error:', err.message);
    }
  }

  let updatedRecord = null;
  fallbackWorkersCache = fallbackWorkersCache.map(w => {
    if (w.id === workerId) {
      updatedRecord = { ...w, stage: newStage, status: resolvedStatus, updatedAt: now, completedAt };
      return updatedRecord;
    }
    return w;
  });
  saveJsonStore(WORKERS_STORE_PATH, fallbackWorkersCache);

  return updatedRecord || { id: workerId, stage: newStage, status: resolvedStatus, updatedAt: now, completedAt };
};

/**
 * Log Audit Trail Event
 */
export const dbLogAudit = async (entry) => {
  const now = new Date().toISOString();
  const logId = `AUD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
  if (pool && pool.connected) {
    try {
      const request = new sql.Request(pool);
      await request
        .input('logId', sql.VarChar(50), logId)
        .input('role', sql.VarChar(50), entry.role || 'SYSTEM')
        .input('action', sql.VarChar(100), entry.action || 'UNKNOWN')
        .input('workerId', sql.VarChar(50), entry.workerId || '')
        .input('workerName', sql.VarChar(200), entry.workerName || '')
        .input('details', sql.VarChar(2000), entry.details || '')
        .input('timestamp', sql.VarChar(50), entry.timestamp || now)
        .query(`
          INSERT INTO dbo.AuditTrailLogs (logId, role, action, workerId, workerName, details, timestamp)
          VALUES (@logId, @role, @action, @workerId, @workerName, @details, @timestamp);
        `);
    } catch (err) {
      console.error('[Microsoft Fabric] Audit log error:', err.message);
    }
  }

  fallbackAuditLogs.unshift({ ...entry, id: logId, timestamp: entry.timestamp || now });
  if (fallbackAuditLogs.length > 500) fallbackAuditLogs = fallbackAuditLogs.slice(0, 500);
  saveJsonStore(AUDIT_STORE_PATH, fallbackAuditLogs);
  return entry;
};

export const dbGetAuditLogs = async () => {
  if (pool && pool.connected) {
    try {
      const result = await pool.request().query('SELECT TOP 100 * FROM dbo.AuditTrailLogs ORDER BY timestamp DESC');
      return result.recordset;
    } catch (err) {
      // fallback
    }
  }
  return fallbackAuditLogs;
};

// ============================================================================
// CONTRACTOR MASTER REGISTER PERSISTENCE
// ============================================================================

/**
 * Fetch all contractors from dbo.ContractorsMaster (or local JSON store)
 */
export const dbGetAllContractors = async () => {
  await connectToFabric();
  if (pool && pool.connected) {
    try {
      const result = await pool.request().query('SELECT * FROM dbo.ContractorsMaster ORDER BY createdAt DESC');
      const rows = Array.isArray(result.recordset) ? result.recordset : [];
      fallbackContractorsCache = rows;
      saveJsonStore(CONTRACTORS_STORE_PATH, rows);
      return rows;
    } catch (err) {
      console.error('[Microsoft Fabric] Query error in dbGetAllContractors, using local store:', err.message);
    }
  }
  return fallbackContractorsCache;
};

/**
 * Create or update a contractor in dbo.ContractorsMaster (and local JSON store)
 */
export const dbSaveContractor = async (contractor) => {
  const now = new Date().toISOString();
  const normalized = {
    id: contractor.id || `CTR-${Date.now().toString().slice(-6)}`,
    contractorCode: String(contractor.contractorCode || '').trim().toUpperCase(),
    locationCode: String(contractor.locationCode || '15').trim().toUpperCase() || '15',
    locationName: contractor.locationName || '',
    companyName: String(contractor.companyName || '').trim(),
    licenseNo: contractor.licenseNo || '',
    department: contractor.department || 'Civil',
    contactPerson: contractor.contactPerson || '',
    contactMobile: contractor.contactMobile || '',
    email: contractor.email || '',
    address: contractor.address || '',
    registrationNo: contractor.registrationNo || '',
    labourLicenseNo: contractor.labourLicenseNo || '',
    pfCode: contractor.pfCode || '',
    esicCode: contractor.esicCode || '',
    gstNo: contractor.gstNo || '',
    panNo: contractor.panNo || '',
    validFrom: contractor.validFrom || '',
    validUpto: contractor.validUpto || '',
    status: contractor.status || 'ACTIVE',
    createdAt: contractor.createdAt || now
  };

  await connectToFabric();
  if (pool && pool.connected) {
    try {
      const request = new sql.Request(pool);
      await request
        .input('id', sql.VarChar(50), normalized.id)
        .input('contractorCode', sql.VarChar(50), normalized.contractorCode)
        .input('locationCode', sql.VarChar(20), normalized.locationCode)
        .input('locationName', sql.VarChar(200), normalized.locationName)
        .input('companyName', sql.VarChar(200), normalized.companyName)
        .input('licenseNo', sql.VarChar(100), normalized.licenseNo)
        .input('department', sql.VarChar(100), normalized.department)
        .input('contactPerson', sql.VarChar(200), normalized.contactPerson)
        .input('contactMobile', sql.VarChar(30), normalized.contactMobile)
        .input('email', sql.VarChar(200), normalized.email)
        .input('address', sql.VarChar(500), normalized.address)
        .input('registrationNo', sql.VarChar(100), normalized.registrationNo)
        .input('labourLicenseNo', sql.VarChar(100), normalized.labourLicenseNo)
        .input('pfCode', sql.VarChar(100), normalized.pfCode)
        .input('esicCode', sql.VarChar(100), normalized.esicCode)
        .input('gstNo', sql.VarChar(50), normalized.gstNo)
        .input('panNo', sql.VarChar(50), normalized.panNo)
        .input('validFrom', sql.VarChar(50), normalized.validFrom)
        .input('validUpto', sql.VarChar(50), normalized.validUpto)
        .input('status', sql.VarChar(30), normalized.status)
        .input('createdAt', sql.VarChar(50), normalized.createdAt)
        .query(`
          IF EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = @id)
          BEGIN
            UPDATE dbo.ContractorsMaster SET
              contractorCode = @contractorCode,
              locationCode = @locationCode,
              locationName = @locationName,
              companyName = @companyName,
              licenseNo = @licenseNo,
              department = @department,
              contactPerson = @contactPerson,
              contactMobile = @contactMobile,
              email = @email,
              address = @address,
              registrationNo = @registrationNo,
              labourLicenseNo = @labourLicenseNo,
              pfCode = @pfCode,
              esicCode = @esicCode,
              gstNo = @gstNo,
              panNo = @panNo,
              validFrom = @validFrom,
              validUpto = @validUpto,
              status = @status
            WHERE id = @id;
          END
          ELSE
          BEGIN
            INSERT INTO dbo.ContractorsMaster (
              id, contractorCode, locationCode, locationName, companyName, licenseNo, department, contactPerson, contactMobile,
              email, address, registrationNo, labourLicenseNo, pfCode, esicCode,
              gstNo, panNo, validFrom, validUpto, status, createdAt
            ) VALUES (
              @id, @contractorCode, @locationCode, @locationName, @companyName, @licenseNo, @department, @contactPerson, @contactMobile,
              @email, @address, @registrationNo, @labourLicenseNo, @pfCode, @esicCode,
              @gstNo, @panNo, @validFrom, @validUpto, @status, @createdAt
            );
          END
        `);
      console.log(`[Microsoft Fabric] Saved contractor ${normalized.companyName} (${normalized.id})`);
    } catch (err) {
      console.error('[Microsoft Fabric] Contractor save error:', err.message);
    }
  }

  const existingIndex = fallbackContractorsCache.findIndex(c => c.id === normalized.id);
  if (existingIndex >= 0) {
    fallbackContractorsCache = fallbackContractorsCache.map(c =>
      c.id === normalized.id ? { ...c, ...normalized, createdAt: c.createdAt || normalized.createdAt } : c
    );
  } else {
    fallbackContractorsCache = [normalized, ...fallbackContractorsCache];
  }
  saveJsonStore(CONTRACTORS_STORE_PATH, fallbackContractorsCache);
  return fallbackContractorsCache.find(c => c.id === normalized.id) || normalized;
};

/**
 * Permanently remove a contractor from dbo.ContractorsMaster (and local JSON store)
 */
export const dbDeleteContractor = async (id) => {
  await connectToFabric();
  if (pool && pool.connected) {
    try {
      const request = new sql.Request(pool);
      await request
        .input('id', sql.VarChar(50), id)
        .query('DELETE FROM dbo.ContractorsMaster WHERE id = @id;');
      console.log(`[Microsoft Fabric] Deleted contractor ${id}`);
    } catch (err) {
      console.error('[Microsoft Fabric] Contractor delete error:', err.message);
    }
  }

  fallbackContractorsCache = fallbackContractorsCache.filter(c => c.id !== id);
  saveJsonStore(CONTRACTORS_STORE_PATH, fallbackContractorsCache);
  return { deleted: true, id };
};

// ============================================================================
// PLANT / SITE LOCATION MASTER PERSISTENCE
// ============================================================================

export const dbGetAllLocations = async () => {
  await connectToFabric();
  if (pool && pool.connected) {
    try {
      const result = await pool.request().query('SELECT * FROM dbo.LocationsMaster ORDER BY locationCode ASC');
      const rows = Array.isArray(result.recordset) ? result.recordset : [];
      if (rows.length > 0) {
        fallbackLocationsCache = rows;
        saveJsonStore(LOCATIONS_STORE_PATH, rows);
        return rows;
      }
    } catch (err) {
      console.error('[Microsoft Fabric] Query error in dbGetAllLocations, using local store:', err.message);
    }
  }
  return Array.isArray(fallbackLocationsCache) && fallbackLocationsCache.length > 0
    ? fallbackLocationsCache
    : DEFAULT_LOCATIONS;
};

export const dbSaveLocation = async (loc) => {
  const now = new Date().toISOString();
  const cleanCode = String(loc.locationCode || '').trim().toUpperCase();
  const normalized = {
    id: loc.id || `LOC-${cleanCode || Date.now().toString().slice(-6)}`,
    locationCode: cleanCode,
    locationName: String(loc.locationName || '').trim(),
    status: loc.status || 'ACTIVE',
    createdAt: loc.createdAt || now
  };

  await connectToFabric();
  if (pool && pool.connected) {
    try {
      const request = new sql.Request(pool);
      await request
        .input('id', sql.VarChar(50), normalized.id)
        .input('locationCode', sql.VarChar(20), normalized.locationCode)
        .input('locationName', sql.VarChar(200), normalized.locationName)
        .input('status', sql.VarChar(30), normalized.status)
        .input('createdAt', sql.VarChar(50), normalized.createdAt)
        .query(`
          IF EXISTS (SELECT 1 FROM dbo.LocationsMaster WHERE id = @id)
          BEGIN
            UPDATE dbo.LocationsMaster SET
              locationCode = @locationCode,
              locationName = @locationName,
              status = @status
            WHERE id = @id;
          END
          ELSE
          BEGIN
            INSERT INTO dbo.LocationsMaster (id, locationCode, locationName, status, createdAt)
            VALUES (@id, @locationCode, @locationName, @status, @createdAt);
          END
        `);
    } catch (err) {
      console.error('[Microsoft Fabric] Location save error:', err.message);
    }
  }

  const idx = fallbackLocationsCache.findIndex(l => l.id === normalized.id || l.locationCode === normalized.locationCode);
  if (idx >= 0) {
    fallbackLocationsCache = fallbackLocationsCache.map((l, i) =>
      i === idx ? { ...l, ...normalized, id: l.id || normalized.id, createdAt: l.createdAt || normalized.createdAt } : l
    );
  } else {
    fallbackLocationsCache = [...fallbackLocationsCache, normalized];
  }
  saveJsonStore(LOCATIONS_STORE_PATH, fallbackLocationsCache);
  return fallbackLocationsCache.find(l => l.id === normalized.id || l.locationCode === normalized.locationCode) || normalized;
};

export const dbDeleteLocation = async (id) => {
  await connectToFabric();
  if (pool && pool.connected) {
    try {
      const request = new sql.Request(pool);
      await request.input('id', sql.VarChar(50), id).query('DELETE FROM dbo.LocationsMaster WHERE id = @id;');
    } catch (err) {
      console.error('[Microsoft Fabric] Location delete error:', err.message);
    }
  }

  fallbackLocationsCache = fallbackLocationsCache.filter(l => l.id !== id);
  saveJsonStore(LOCATIONS_STORE_PATH, fallbackLocationsCache);
  return { deleted: true, id };
};
