// ============================================================================
// MICROSOFT FABRIC SQL CONNECTOR & DATA ACCESS LAYER
// Server: 2xv4ddeoefeuhhgixzuzuy3udm-27j34hcgadaudjerknvakpsfle.database.fabric.microsoft.com
// Database: Worker_onboarding-44af8b36-2300-4f9e-a591-53248d3d454e
// ============================================================================

import sql from 'mssql';
import dotenv from 'dotenv';
import { DeviceCodeCredential } from '@azure/identity';
import { execFile } from 'child_process';
import path from 'path';
dotenv.config();

export const runPyBridge = (action, payload = null) => {
  return new Promise((resolve) => {
    const bridgePath = path.join(process.cwd(), 'server', 'fabric_bridge.py');
    const args = [bridgePath, action];
    if (payload) args.push(JSON.stringify(payload));
    
    execFile('python', args, { timeout: 25000 }, (error, stdout, stderr) => {
      if (error) {
        return resolve({ success: false, error: stderr || error.message });
      }
      try {
        const parsed = JSON.parse(stdout.trim());
        resolve(parsed);
      } catch (e) {
        resolve({ success: false, error: stdout || 'Failed to parse bridge output' });
      }
    });
  });
};

export const syncToPyBridge = (action, payload) => {
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

// Initial verified fallback dataset
let fallbackWorkersCache = [
  {
    id: 'WRK-2026-001',
    assignedWorkerId: 'LME-2026-1001',
    stage: 6,
    status: 'COMPLETED',
    createdAt: '2026-09-20T08:30:00Z',
    updatedAt: '2026-09-21T11:15:00Z',
    hr: {
      fullName: 'Rameshwar Kumar Gond',
      fatherHusbandName: 'Sohan Lal Gond',
      dob: '1992-05-14',
      age: 34,
      gender: 'M',
      mobileNumber: '9823456712',
      idProofType: 'Govt ID / Aadhaar',
      idProofRef: '8821 4452 9012',
      contractorName: 'L&T Construction Heavy Civil',
      contractorLicense: 'LIC-MH-2024-8841',
      trade: 'Welder',
      emergencyPerson: 'Sunita Gond',
      emergencyRelationship: 'Wife',
      emergencyMobile: '9765432109'
    },
    medical: {
      bloodGroup: 'B+',
      heightCm: 168,
      weightKg: 64,
      bmi: '22.7',
      bmiCategory: 'Normal',
      bpSystolic: 120,
      bpDiastolic: 80,
      spo2: 98,
      pulseRate: 74,
      respirationRate: 16,
      rbs: 110,
      alcoholTest: 'Pass',
      visionTest: 'Normal',
      hearingTest: 'Normal',
      vertigoTest: 'Fit',
      existingIllness: 'No',
      fitnessStatus: 'FIT',
      examinerName: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      remarks: 'Fit for heavy industrial plant work.'
    },
    safety: {
      briefingDone: true,
      topicsCovered: [
        'General Site Rules & Hazardous Zones',
        'Mandatory Daily Biometric Face Punch (No Punch = No Pay)',
        'Zero-Tolerance Alcohol & Substance Prohibition',
        'PPE Usage, Inspection & Maintenance Standards',
        'Work at Height & Double Lanyard Safety Harness Rules'
      ],
      ppeIssued: ['helmet', 'jacket', 'shoes', 'gloves', 'goggles', 'harness', 'earplugs'],
      safetyOfficerName: 'Arun Patil (EHS Lead)',
      safetyDate: '2026-09-20'
    },
    it: {
      workerIdGenerated: true,
      faceBiometricRegistered: true,
      cwmsRegistered: true,
      campusMasterUploaded: true,
      undertakingAccepted: true,
      itAdminSignature: 'Rajesh Sharma (Sr. IT Admin)',
      itDate: '2026-09-21'
    },
    camp: {
      campName: 'Gondwana Phase 3',
      blockNumber: 'Block A',
      roomNumber: 'A-102',
      bedNumber: 'Bed 1',
      allocatedBy: 'Mahesh Kulkarni (Camp Supv)',
      allocationDate: '2026-09-21',
      gatePassActive: true
    }
  },
  {
    id: 'WRK-2026-002',
    assignedWorkerId: 'LME-2026-1002',
    stage: 5,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-21T09:00:00Z',
    updatedAt: '2026-09-22T08:10:00Z',
    hr: {
      fullName: 'Sunil Arjun Shinde',
      fatherHusbandName: 'Arjun Shinde',
      dob: '1988-11-03',
      age: 37,
      gender: 'M',
      mobileNumber: '9145678901',
      idProofType: 'Govt ID / Aadhaar',
      idProofRef: '4512 8891 0023',
      contractorName: 'Tata Projects Engineering',
      contractorLicense: 'LIC-MH-2025-1940',
      trade: 'Fitter',
      emergencyPerson: 'Kavita Shinde',
      emergencyRelationship: 'Wife',
      emergencyMobile: '9145678999'
    },
    medical: {
      bloodGroup: 'O+',
      heightCm: 172,
      weightKg: 70,
      bmi: '23.7',
      bmiCategory: 'Normal',
      bpSystolic: 124,
      bpDiastolic: 82,
      spo2: 99,
      pulseRate: 72,
      respirationRate: 15,
      rbs: 104,
      alcoholTest: 'Pass',
      visionTest: 'Normal',
      hearingTest: 'Normal',
      vertigoTest: 'Fit',
      existingIllness: 'No',
      fitnessStatus: 'FIT',
      examinerName: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      remarks: 'All vitals optimal.'
    },
    safety: {
      briefingDone: true,
      topicsCovered: [
        'General Site Rules & Hazardous Zones',
        'Mandatory Daily Biometric Face Punch (No Punch = No Pay)',
        'Zero-Tolerance Alcohol & Substance Prohibition',
        'PPE Usage, Inspection & Maintenance Standards'
      ],
      ppeIssued: ['helmet', 'jacket', 'shoes', 'gloves', 'earplugs'],
      safetyOfficerName: 'Arun Patil (EHS Lead)',
      safetyDate: '2026-09-21'
    },
    it: {
      workerIdGenerated: true,
      faceBiometricRegistered: true,
      cwmsRegistered: true,
      campusMasterUploaded: true,
      undertakingAccepted: true,
      itAdminSignature: 'Rajesh Sharma (Sr. IT Admin)',
      itDate: '2026-09-22'
    },
    camp: {
      campName: '',
      blockNumber: '',
      roomNumber: '',
      bedNumber: '',
      gatePassActive: false
    }
  },
  {
    id: 'WRK-2026-003',
    assignedWorkerId: '',
    stage: -1,
    status: 'FLAGGED',
    createdAt: '2026-09-21T10:45:00Z',
    updatedAt: '2026-09-21T12:00:00Z',
    hr: {
      fullName: 'Pradip Mohan Yadav',
      fatherHusbandName: 'Mohan Yadav',
      dob: '1981-08-20',
      age: 45,
      gender: 'M',
      mobileNumber: '9922334455',
      idProofType: 'Voter ID',
      idProofRef: 'MH/24/104/899120',
      contractorName: 'Afcons Infrastructure Projects',
      contractorLicense: 'LIC-MH-2024-5519',
      trade: 'Scaffolder',
      emergencyPerson: 'Radha Yadav',
      emergencyRelationship: 'Sister',
      emergencyMobile: '9922334466'
    },
    medical: {
      bloodGroup: 'AB+',
      heightCm: 165,
      weightKg: 84,
      bmi: '30.9',
      bmiCategory: 'Obese',
      bpSystolic: 178,
      bpDiastolic: 110,
      spo2: 92,
      pulseRate: 105,
      respirationRate: 24,
      rbs: 260,
      alcoholTest: 'Pass',
      visionTest: 'Impaired',
      hearingTest: 'Normal',
      vertigoTest: 'Unfit',
      existingIllness: 'Severe uncontrolled hypertension & severe vertigo attack during height test.',
      fitnessStatus: 'UNFIT',
      examinerName: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      remarks: 'UNFIT: Stage 2 Hypertension (178/110 mmHg) and acute vertigo.'
    },
    safety: null,
    it: null,
    camp: null
  },
  {
    id: 'WRK-2026-004',
    assignedWorkerId: '',
    stage: 3,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-22T08:00:00Z',
    updatedAt: '2026-09-22T08:45:00Z',
    hr: {
      fullName: 'Deepak Ramdas Meshram',
      fatherHusbandName: 'Ramdas Meshram',
      dob: '1998-02-18',
      age: 28,
      gender: 'M',
      mobileNumber: '9654123890',
      idProofType: 'Govt ID / Aadhaar',
      idProofRef: '7721 9901 3412',
      contractorName: 'Shapoorji Pallonji Infra Ltd',
      contractorLicense: 'LIC-MH-2023-4102',
      trade: 'Electrician',
      emergencyPerson: 'Ramdas Meshram',
      emergencyRelationship: 'Father',
      emergencyMobile: '9654123800'
    },
    medical: {
      bloodGroup: 'A+',
      heightCm: 170,
      weightKg: 62,
      bmi: '21.5',
      bmiCategory: 'Normal',
      bpSystolic: 118,
      bpDiastolic: 78,
      spo2: 99,
      pulseRate: 68,
      respirationRate: 16,
      rbs: 92,
      alcoholTest: 'Pass',
      visionTest: 'Normal',
      hearingTest: 'Normal',
      vertigoTest: 'Fit',
      existingIllness: 'No',
      fitnessStatus: 'FIT',
      examinerName: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      remarks: 'Fit for all standard general site duties.'
    },
    safety: {
      briefingDone: false,
      topicsCovered: [],
      ppeIssued: [],
      safetyOfficerName: '',
      safetyDate: ''
    },
    it: null,
    camp: null
  },
  {
    id: 'WRK-2026-005',
    assignedWorkerId: '',
    stage: 2,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-22T08:30:00Z',
    updatedAt: '2026-09-22T08:30:00Z',
    hr: {
      fullName: 'Mohammad Shahid Ansari',
      fatherHusbandName: 'Abdul Ansari',
      dob: '1995-12-10',
      age: 30,
      gender: 'M',
      mobileNumber: '9876543201',
      idProofType: 'Driving License',
      idProofRef: 'DL-142022009812',
      contractorName: 'Gondwana Allied Engineering',
      contractorLicense: 'LIC-MH-2026-0044',
      trade: 'Crane / Rigging Operator',
      emergencyPerson: 'Abdul Ansari',
      emergencyRelationship: 'Father',
      emergencyMobile: '9876543200'
    },
    medical: {
      bloodGroup: '',
      heightCm: '',
      weightKg: '',
      bmi: '',
      bmiCategory: '',
      bpSystolic: '',
      bpDiastolic: '',
      spo2: '',
      pulseRate: '',
      respirationRate: '',
      rbs: '',
      alcoholTest: '',
      visionTest: 'Normal',
      hearingTest: 'Normal',
      vertigoTest: 'Fit',
      existingIllness: 'No',
      fitnessStatus: '',
      examinerName: '',
      remarks: ''
    },
    safety: null,
    it: null,
    camp: null
  }
];

let fallbackAuditLogs = [];

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
      connectTimeout: 25000,
      requestTimeout: 25000
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
  } else {
    config.authentication = {
      type: 'azure-active-directory-password',
      options: {
        userName: process.env.FABRIC_USER || '',
        password: process.env.FABRIC_PASSWORD || ''
      }
    };
  }

  return config;
};

/**
 * Connect with an acquired access token
 */
export const connectWithToken = async (token) => {
  try {
    if (pool) {
      try { await pool.close(); } catch (e) {}
    }
    const config = getSqlConfig(token);
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    
    connectionStatus = {
      isConnected: true,
      server: FABRIC_SERVER,
      database: FABRIC_DATABASE,
      lastChecked: new Date().toISOString(),
      error: null,
      mode: 'FABRIC_ONLINE'
    };
    console.log('[Microsoft Fabric] Connected successfully to live database via Entra ID Token!');
    return pool;
  } catch (err) {
    console.error('[Microsoft Fabric] Token connection error:', err.message);
    connectionStatus.error = err.message;
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
export const connectToFabric = async () => {
  if (liveAccessToken) {
    return connectWithToken(liveAccessToken);
  }

  // First connect using hardcoded Active Directory credentials
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
      console.log(`[Microsoft Fabric] Connected successfully to live database via Active Directory (hmk@lloydsprojects.in)!`);
      return { connected: true };
    }
  } catch (pyErr) {
    console.warn('[Microsoft Fabric] Python bridge init notice:', pyErr.message);
  }

  try {
    const config = getSqlConfig();
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    
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

  // 1. Try Service Principal connection via pyodbc bridge
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

  // 2. Fallback to existing TDS pool check
  try {
    if (!pool || !pool.connected) {
      await connectToFabric();
    }
    if (pool && pool.connected) {
      const result = await pool.request().query('SELECT 1 AS isAlive, DB_NAME() AS currentDb, GETUTCDATE() AS serverTime');
      const latencyMs = Date.now() - startTime;
      return {
        success: true,
        latencyMs,
        server: FABRIC_SERVER,
        database: result.recordset[0]?.currentDb || FABRIC_DATABASE,
        serverTime: result.recordset[0]?.serverTime,
        mode: 'FABRIC_ONLINE'
      };
    } else {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        server: FABRIC_SERVER,
        database: FABRIC_DATABASE,
        error: connectionStatus.error || 'Connection not established.',
        mode: 'FALLBACK_MODE'
      };
    }
  } catch (err) {
    return {
      success: false,
      latencyMs: Date.now() - startTime,
      server: FABRIC_SERVER,
      database: FABRIC_DATABASE,
      error: err.message,
      mode: 'FALLBACK_MODE'
    };
  }
};

/**
 * Retrieve all workers (Live Fabric or Fallback)
 */
export const dbGetAllWorkers = async () => {
  // 1. Try Service Principal bridge directly
  try {
    const pyRes = await runPyBridge('get_workers');
    if (pyRes && pyRes.success && Array.isArray(pyRes.data) && pyRes.data.length > 0) {
      fallbackWorkersCache = pyRes.data;
      return pyRes.data;
    }
  } catch (e) {}

  if (pool && pool.connected) {
    try {
      const query = `
        SELECT 
          w.id, w.assignedWorkerId, w.stage, w.status, w.fullName, w.contractorName, w.trade, w.mobileNumber, w.createdAt, w.updatedAt,
          hr.fatherHusbandName, hr.dob, hr.age, hr.gender, hr.idProofType, hr.idProofRef, hr.contractorLicense, hr.emergencyPerson, hr.emergencyRelationship, hr.emergencyMobile,
          m.bloodGroup, m.heightCm, m.weightKg, m.bmi, m.bmiCategory, m.bpSystolic, m.bpDiastolic, m.spo2, m.pulseRate, m.respirationRate, m.rbs, m.alcoholTest, m.visionTest, m.hearingTest, m.vertigoTest, m.existingIllness, m.fitnessStatus, m.examinerName, m.remarks AS medicalRemarks,
          s.briefingDone, s.topicsCovered, s.ppeIssued, s.safetyOfficerName, s.safetyDate,
          it.faceBiometricRegistered, it.cwmsRegistered, it.campusMasterUploaded, it.undertakingAccepted, it.itAdminSignature, it.itDate,
          c.campName, c.blockNo, c.roomNo, c.bedNo, c.gatePassActive, c.allocatedBy, c.allocationDate
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
          contractorLicense: row.contractorLicense || '',
          trade: row.trade || '',
          emergencyPerson: row.emergencyPerson || '',
          emergencyRelationship: row.emergencyRelationship || '',
          emergencyMobile: row.emergencyMobile || ''
        },
        medical: row.bloodGroup ? {
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
        safety: row.briefingDone !== null ? {
          briefingDone: !!row.briefingDone,
          topicsCovered: row.topicsCovered ? row.topicsCovered.split(' | ') : [],
          ppeIssued: row.ppeIssued ? row.ppeIssued.split(' | ') : [],
          safetyOfficerName: row.safetyOfficerName || '',
          safetyDate: row.safetyDate || ''
        } : null,
        it: row.faceBiometricRegistered !== null ? {
          faceBiometricRegistered: !!row.faceBiometricRegistered,
          cwmsRegistered: !!row.cwmsRegistered,
          campusMasterUploaded: !!row.campusMasterUploaded,
          undertakingAccepted: !!row.undertakingAccepted,
          assignedWorkerId: row.assignedWorkerId,
          itAdminSignature: row.itAdminSignature || '',
          itDate: row.itDate || ''
        } : null,
        camp: row.campName ? {
          campName: row.campName,
          blockNumber: row.blockNo,
          roomNumber: row.roomNo,
          bedNumber: row.bedNo,
          gatePassActive: !!row.gatePassActive,
          allocatedBy: row.allocatedBy || '',
          allocationDate: row.allocationDate || ''
        } : null
      }));

      if (records.length > 0) {
        fallbackWorkersCache = records;
        return records;
      }
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
  if (pool && pool.connected) {
    try {
      const request = new sql.Request(pool);
      await request
        .input('id', sql.VarChar(50), newWorker.id)
        .input('assignedWorkerId', sql.VarChar(50), newWorker.assignedWorkerId || '')
        .input('stage', sql.Int, newWorker.stage)
        .input('status', sql.VarChar(50), newWorker.status)
        .input('fullName', sql.VarChar(200), newWorker.hr.fullName)
        .input('contractorName', sql.VarChar(200), newWorker.hr.contractorName || '')
        .input('trade', sql.VarChar(100), newWorker.hr.trade || '')
        .input('mobileNumber', sql.VarChar(20), newWorker.hr.mobileNumber || '')
        .input('createdAt', sql.VarChar(50), newWorker.createdAt || now)
        .input('updatedAt', sql.VarChar(50), newWorker.updatedAt || now)
        .input('fatherHusbandName', sql.VarChar(200), newWorker.hr.fatherHusbandName || '')
        .input('dob', sql.VarChar(50), newWorker.hr.dob || '')
        .input('age', sql.Int, parseInt(newWorker.hr.age, 10) || null)
        .input('gender', sql.VarChar(10), newWorker.hr.gender || '')
        .input('idProofType', sql.VarChar(100), newWorker.hr.idProofType || '')
        .input('idProofRef', sql.VarChar(100), newWorker.hr.idProofRef || '')
        .input('contractorLicense', sql.VarChar(100), newWorker.hr.contractorLicense || '')
        .input('emergencyPerson', sql.VarChar(200), newWorker.hr.emergencyPerson || '')
        .input('emergencyRelationship', sql.VarChar(100), newWorker.hr.emergencyRelationship || '')
        .input('emergencyMobile', sql.VarChar(20), newWorker.hr.emergencyMobile || '')
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
            INSERT INTO dbo.WorkerHRData (workerId, fullName, fatherHusbandName, dob, age, gender, mobileNumber, idProofType, idProofRef, contractorName, contractorLicense, trade, emergencyPerson, emergencyRelationship, emergencyMobile, registeredAt)
            VALUES (@id, @fullName, @fatherHusbandName, @dob, @age, @gender, @mobileNumber, @idProofType, @idProofRef, @contractorName, @contractorLicense, @trade, @emergencyPerson, @emergencyRelationship, @emergencyMobile, @createdAt);
          END
          ELSE
          BEGIN
            UPDATE dbo.WorkerHRData
            SET fullName = @fullName, fatherHusbandName = @fatherHusbandName, dob = @dob, age = @age, gender = @gender, mobileNumber = @mobileNumber, idProofType = @idProofType, idProofRef = @idProofRef, contractorName = @contractorName, contractorLicense = @contractorLicense, trade = @trade, emergencyPerson = @emergencyPerson, emergencyRelationship = @emergencyRelationship, emergencyMobile = @emergencyMobile
            WHERE workerId = @id;
          END;
        `);
      console.log(`[Microsoft Fabric] Live Insert: Worker ${newWorker.id} saved in Fabric SQL database.`);
    } catch (err) {
      console.error('[Microsoft Fabric] Insert failed:', err.message);
    }
  }

  // Keep fallback cache synced and dispatch live Fabric background sync
  fallbackWorkersCache = [newWorker, ...fallbackWorkersCache.filter(w => w.id !== newWorker.id)];
  syncToPyBridge('register', newWorker);
  return newWorker;
};

/**
 * Update Medical Vitals (Step 2)
 */
export const dbUpdateMedical = async (workerId, medicalData, updatedWorker) => {
  const now = new Date().toISOString();
  if (pool && pool.connected) {
    try {
      const request = new sql.Request(pool);
      await request
        .input('workerId', sql.VarChar(50), workerId)
        .input('bloodGroup', sql.VarChar(10), medicalData.bloodGroup || '')
        .input('heightCm', sql.Int, parseInt(medicalData.heightCm, 10) || null)
        .input('weightKg', sql.Int, parseInt(medicalData.weightKg, 10) || null)
        .input('bmi', sql.VarChar(20), String(medicalData.bmi || ''))
        .input('bmiCategory', sql.VarChar(50), medicalData.bmiCategory || '')
        .input('bpSystolic', sql.Int, parseInt(medicalData.bpSystolic, 10) || null)
        .input('bpDiastolic', sql.Int, parseInt(medicalData.bpDiastolic, 10) || null)
        .input('spo2', sql.Int, parseInt(medicalData.spo2, 10) || null)
        .input('pulseRate', sql.Int, parseInt(medicalData.pulseRate, 10) || null)
        .input('respirationRate', sql.Int, parseInt(medicalData.respirationRate, 10) || null)
        .input('rbs', sql.Int, parseInt(medicalData.rbs, 10) || null)
        .input('alcoholTest', sql.VarChar(20), medicalData.alcoholTest || '')
        .input('visionTest', sql.VarChar(50), medicalData.visionTest || '')
        .input('hearingTest', sql.VarChar(50), medicalData.hearingTest || '')
        .input('vertigoTest', sql.VarChar(50), medicalData.vertigoTest || '')
        .input('existingIllness', sql.VarChar(500), medicalData.existingIllness || '')
        .input('fitnessStatus', sql.VarChar(50), medicalData.fitnessStatus || '')
        .input('examinerName', sql.VarChar(200), medicalData.examinerName || '')
        .input('remarks', sql.VarChar(1000), medicalData.remarks || '')
        .input('stage', sql.Int, updatedWorker.stage)
        .input('status', sql.VarChar(50), updatedWorker.status)
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
    } catch (err) {
      console.error('[Microsoft Fabric] Medical update error:', err.message);
    }
  }

  fallbackWorkersCache = fallbackWorkersCache.map(w => w.id === workerId ? updatedWorker : w);
  syncToPyBridge('update_medical', { workerId, medical: medicalData, worker: updatedWorker });
  return updatedWorker;
};

/**
 * Update Safety Induction (Step 3)
 */
export const dbUpdateSafety = async (workerId, safetyData, updatedWorker) => {
  const now = new Date().toISOString();
  if (pool && pool.connected) {
    try {
      const topicsStr = (safetyData.topicsCovered || []).join(' | ');
      const ppeStr = (safetyData.ppeIssued || []).join(' | ');

      const request = new sql.Request(pool);
      await request
        .input('workerId', sql.VarChar(50), workerId)
        .input('briefingDone', sql.Bit, safetyData.briefingDone ? 1 : 0)
        .input('topicsCovered', sql.VarChar(2000), topicsStr)
        .input('ppeIssued', sql.VarChar(2000), ppeStr)
        .input('safetyOfficerName', sql.VarChar(200), safetyData.safetyOfficerName || '')
        .input('safetyDate', sql.VarChar(50), safetyData.safetyDate || now.slice(0, 10))
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
    } catch (err) {
      console.error('[Microsoft Fabric] Safety update error:', err.message);
    }
  }

  fallbackWorkersCache = fallbackWorkersCache.map(w => w.id === workerId ? updatedWorker : w);
  syncToPyBridge('update_safety', { workerId, safety: safetyData, worker: updatedWorker });
  return updatedWorker;
};

/**
 * Update IT Biometrics (Step 4)
 */
export const dbUpdateIT = async (workerId, itData, updatedWorker) => {
  const now = new Date().toISOString();
  if (pool && pool.connected) {
    try {
      const request = new sql.Request(pool);
      await request
        .input('workerId', sql.VarChar(50), workerId)
        .input('assignedWorkerId', sql.VarChar(50), updatedWorker.assignedWorkerId || '')
        .input('faceBiometricRegistered', sql.Bit, itData.faceBiometricRegistered ? 1 : 0)
        .input('cwmsRegistered', sql.Bit, itData.cwmsRegistered ? 1 : 0)
        .input('campusMasterUploaded', sql.Bit, itData.campusMasterUploaded ? 1 : 0)
        .input('undertakingAccepted', sql.Bit, itData.undertakingAccepted ? 1 : 0)
        .input('itAdminSignature', sql.VarChar(200), itData.itAdminSignature || '')
        .input('itDate', sql.VarChar(50), itData.itDate || now.slice(0, 10))
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
    } catch (err) {
      console.error('[Microsoft Fabric] IT update error:', err.message);
    }
  }

  fallbackWorkersCache = fallbackWorkersCache.map(w => w.id === workerId ? updatedWorker : w);
  syncToPyBridge('update_it', { workerId, it: itData, worker: updatedWorker });
  return updatedWorker;
};

/**
 * Update Camp Housing (Step 5)
 */
export const dbUpdateCamp = async (workerId, campData, updatedWorker) => {
  const now = new Date().toISOString();
  if (pool && pool.connected) {
    try {
      const request = new sql.Request(pool);
      await request
        .input('workerId', sql.VarChar(50), workerId)
        .input('campName', sql.VarChar(100), campData.campName || '')
        .input('blockNo', sql.VarChar(50), campData.blockNumber || '')
        .input('roomNo', sql.VarChar(50), campData.roomNumber || '')
        .input('bedNo', sql.VarChar(50), campData.bedNumber || '')
        .input('gatePassActive', sql.Bit, campData.gatePassActive ? 1 : 0)
        .input('allocatedBy', sql.VarChar(200), campData.allocatedBy || '')
        .input('allocationDate', sql.VarChar(50), campData.allocationDate || now.slice(0, 10))
        .input('stage', sql.Int, updatedWorker.stage)
        .input('status', sql.VarChar(50), updatedWorker.status)
        .input('updatedAt', sql.VarChar(50), now)
        .query(`
          IF NOT EXISTS (SELECT 1 FROM dbo.WorkerCampAllocation WHERE workerId = @workerId)
          BEGIN
            INSERT INTO dbo.WorkerCampAllocation (workerId, campName, blockNo, roomNo, bedNo, gatePassActive, allocatedBy, allocationDate, allocatedAt)
            VALUES (@workerId, @campName, @blockNo, @roomNo, @bedNo, @gatePassActive, @allocatedBy, @allocationDate, @updatedAt);
          END
          ELSE
          BEGIN
            UPDATE dbo.WorkerCampAllocation
            SET campName = @campName, blockNo = @blockNo, roomNo = @roomNo, bedNo = @bedNo, gatePassActive = @gatePassActive, allocatedBy = @allocatedBy, allocationDate = @allocationDate, allocatedAt = @updatedAt
            WHERE workerId = @workerId;
          END;

          UPDATE dbo.WorkersMaster SET stage = @stage, status = @status, updatedAt = @updatedAt WHERE id = @workerId;
        `);
      console.log(`[Microsoft Fabric] Camp allocation saved for ${workerId}`);
    } catch (err) {
      console.error('[Microsoft Fabric] Camp update error:', err.message);
    }
  }

  fallbackWorkersCache = fallbackWorkersCache.map(w => w.id === workerId ? updatedWorker : w);
  syncToPyBridge('update_camp', { workerId, camp: campData, worker: updatedWorker });
  return updatedWorker;
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
