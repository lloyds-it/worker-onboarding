import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getStoredWorkers, saveWorkers, resetToInitialData, clearStoredWorkers } from '../services/storageService';
import { logAuditEvent } from '../services/auditService';
import { ROLES, STAGES } from '../types/constants';
import { generateEmployeeId } from '../services/validationService';
import { useAuth } from './AuthContext';
import {
  apiGetWorkers,
  apiRegisterWorker,
  apiUpdateWorkerPhoto,
  apiUpdateMedical,
  apiUpdateSafety,
  apiUpdateIT,
  apiUpdateCamp,
  apiOverrideWorker,
  apiLogAudit,
  apiGetContractors,
  apiSaveContractor,
  apiDeleteContractor,
  checkFabricHealth,
  testFabricDiagnostics,
  startFabricAuth,
  checkAuthStatus
} from '../services/apiService';

const CONTRACTORS_STORAGE_KEY = 'lloyds_contractors_master_v2';
const LEGACY_CONTRACTORS_STORAGE_KEY = 'lloyds_contractors_master_v1';

const getStoredContractors = () => {
  try {
    localStorage.removeItem(LEGACY_CONTRACTORS_STORAGE_KEY);
    const raw = localStorage.getItem(CONTRACTORS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
  } catch (e) { }
  return [];
};

const saveStoredContractors = (list) => {
  try {
    localStorage.removeItem(LEGACY_CONTRACTORS_STORAGE_KEY);
    localStorage.setItem(CONTRACTORS_STORAGE_KEY, JSON.stringify(list));
  } catch (e) { }
};

const WorkerContext = createContext();

export const WorkerProvider = ({ children }) => {
  const { currentRole, currentUser, isAuthenticated } = useAuth();
  const [workers, setWorkers] = useState([]);
  const [contractors, setContractors] = useState([]);
  const [activeWorker, setActiveWorker] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStageFilter, setSelectedStageFilter] = useState('ALL');
  const [toastMessage, setToastMessage] = useState(null);
  const [fabricStatus, setFabricStatus] = useState({
    isAvailable: false,
    mode: 'INITIALIZING',
    fabric: {
      isConnected: false,
      mode: 'INITIALIZING',
      server: '2xv4ddeoefeuhhgixzuzuy3udm-27j34hcgadaudjerknvakpsfle.database.fabric.microsoft.com',
      database: 'Worker_onboarding-44af8b36-2300-4f9e-a591-53248d3d454e'
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);

  // Background sync worker data with backend
  const syncFabricData = useCallback(async (silent = false) => {
    if (!isAuthenticated) {
      setWorkers([]);
      setContractors([]);
      setActiveWorker(null);
      return;
    }

    setIsSyncing(true);
    try {
      const health = await checkFabricHealth();
      setFabricStatus(health);

      const remoteWorkers = await apiGetWorkers();
      if (Array.isArray(remoteWorkers)) {
        setWorkers(remoteWorkers);
        saveWorkers(remoteWorkers);
        setActiveWorker(prev => {
          if (!prev) return remoteWorkers[0] || null;
          const match = remoteWorkers.find(w => w.id === prev.id);
          return match || remoteWorkers[0] || null;
        });
      }

      try {
        const remoteContractors = await apiGetContractors();
        if (Array.isArray(remoteContractors)) {
          setContractors(remoteContractors);
          saveStoredContractors(remoteContractors);
        }
      } catch (cErr) {
        console.warn('[WorkerContext] Contractors sync notice:', cErr.message);
      }
    } catch (err) {
      console.warn('[WorkerContext] Fabric sync notice:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isAuthenticated]);

  // Initial load from storage and live backend sync on login or session restore
  useEffect(() => {
    if (isAuthenticated) {
      // 1. Instant local load for zero-delay initial rendering
      const loaded = getStoredWorkers();
      if (loaded.length > 0) {
        setWorkers(loaded);
        setActiveWorker(loaded[0]);
      }

      const loadedContractors = getStoredContractors();
      if (loadedContractors.length > 0) {
        setContractors(loadedContractors);
      }

      // 2. Fetch fresh live data from database/Fabric
      syncFabricData();
    } else {
      // Clear in-memory worker & contractor rosters when logged out
      setWorkers([]);
      setContractors([]);
      setActiveWorker(null);
    }
  }, [isAuthenticated, syncFabricData]);

  const refreshFabricStatus = useCallback(async () => {
    try {
      const health = await checkFabricHealth();
      setFabricStatus(health);
      return health;
    } catch (e) {
      return null;
    }
  }, []);

  const runFabricDiagnostics = useCallback(async () => {
    const result = await testFabricDiagnostics();
    await refreshFabricStatus();
    return result;
  }, [refreshFabricStatus]);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type, id: Date.now() });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleEmailFeedback = (emailNotification) => {
    if (!emailNotification) return;
    const roleLabel = (emailNotification.nextRoles || []).join(', ');
    if (emailNotification.status === 'SENT') {
      showToast(`Notification email sent to ${roleLabel}: ${emailNotification.recipients.join(', ')}`, 'info');
    } else if (emailNotification.status === 'QUEUED_NO_SMTP') {
      showToast(`Email queued for ${roleLabel} (${emailNotification.recipients.join(', ')}) — configure SMTP in .env to deliver.`, 'info');
    } else if (emailNotification.status === 'NO_ACTIVE_RECIPIENTS') {
      showToast(`No active ${roleLabel} user account found to email.`, 'warning');
    }
  };

  // Helper to persist worker mutations
  const commitWorkers = (updatedList) => {
    setWorkers(updatedList);
    saveWorkers(updatedList);
  };

  // Step 1: HR Registration
  const registerWorkerHR = (hrData) => {
    if (currentRole !== ROLES.HR && currentRole !== ROLES.ADMIN) {
      showToast('Unauthorized: Only HR Operations can register new candidates.', 'danger');
      return null;
    }

    const { assignedWorkerId: inputEmployeeId, ...cleanHrData } = hrData || {};
    const employeeId = (inputEmployeeId || '').trim().toUpperCase() || generateEmployeeId(workers, cleanHrData.contractorCode, cleanHrData.locationCode);
    const year = new Date().getFullYear();
    let maxRef = 0;
    workers.forEach(w => {
      const m = String(w.id || '').match(/-(\d+)$/);
      if (m) {
        const n = parseInt(m[1], 10);
        if (n > maxRef) maxRef = n;
      }
    });
    const newId = `WRK-${year}-${String(maxRef + 1).padStart(3, '0')}`;
    const newWorker = {
      id: newId,
      assignedWorkerId: employeeId,
      stage: STAGES.MEDICAL, // Automatically routes to Medical Team per BRD
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      completedAt: null,
      hr: cleanHrData,
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
    };

    const updated = [newWorker, ...workers];
    commitWorkers(updated);
    setActiveWorker(newWorker);

    // Sync to Microsoft Fabric & trigger Medical notification email in background
    apiRegisterWorker(newWorker)
      .then(res => handleEmailFeedback(res?._emailNotification))
      .catch(err => console.warn('[Fabric] Registration sync warning:', err));

    const auditEntry = {
      role: currentRole,
      action: 'HR_WORKER_REGISTERED',
      workerId: newId,
      workerName: cleanHrData.fullName,
      details: `Registered profile (${employeeId}) under contractor ${cleanHrData.contractorName}. Auto-routed to Medical Team.`
    };
    logAuditEvent(auditEntry);
    apiLogAudit(auditEntry);

    showToast(`Worker ${cleanHrData.fullName} (${employeeId}) registered and routed to Medical Team.`, 'success');
    return newWorker;
  };

  // Step 1: Update Existing Worker HR Profile
  const updateWorkerHR = (workerId, hrData) => {
    if (currentRole !== ROLES.HR && currentRole !== ROLES.ADMIN) {
      showToast('Unauthorized: Only HR Operations can update HR candidate profiles.', 'danger');
      return;
    }

    const { assignedWorkerId: inputEmployeeId, ...cleanHrData } = hrData || {};

    const updated = workers.map(w => {
      if (w.id !== workerId) return w;
      const nextStage = w.stage === STAGES.HR ? STAGES.MEDICAL : w.stage;
      return {
        ...w,
        assignedWorkerId: (inputEmployeeId || '').trim().toUpperCase() || w.assignedWorkerId,
        stage: nextStage,
        updatedAt: new Date().toISOString(),
        hr: {
          ...w.hr,
          ...cleanHrData
        }
      };
    });

    commitWorkers(updated);
    const updatedTarget = updated.find(w => w.id === workerId);
    setActiveWorker(updatedTarget);

    if (updatedTarget) {
      apiRegisterWorker({ ...updatedTarget, _isUpdate: true })
        .catch(err => console.warn('[Fabric] HR update sync warning:', err));
    }

    const auditEntry = {
      role: currentRole,
      action: 'HR_WORKER_UPDATED',
      workerId,
      workerName: cleanHrData.fullName || updatedTarget?.hr?.fullName,
      details: `Updated candidate personal and trade information.`
    };
    logAuditEvent(auditEntry);
    apiLogAudit(auditEntry);

    showToast(`Worker ${cleanHrData.fullName || 'profile'} updated successfully.`, 'success');
  };

  // Step 2: Medical Examination
  const updateWorkerMedical = (workerId, medicalData) => {
    if (currentRole !== ROLES.MEDICAL && currentRole !== ROLES.ADMIN) {
      showToast('Unauthorized: Only Medical Health Officers can record medical examinations.', 'danger');
      return;
    }

    const isFit = medicalData.fitnessStatus === 'FIT' || medicalData.fitnessStatus === 'FIT_WITH_PRECAUTIONS';
    const isHold = medicalData.fitnessStatus === 'HOLD';

    const updated = workers.map(w => {
      if (w.id !== workerId) return w;

      const nextStage = isFit ? STAGES.SAFETY : (isHold ? STAGES.MEDICAL : STAGES.FLAGGED);
      const nextStatus = isFit ? 'IN_PROGRESS' : (isHold ? 'HOLD' : 'FLAGGED');

      return {
        ...w,
        stage: nextStage,
        status: nextStatus,
        updatedAt: new Date().toISOString(),
        medical: {
          ...medicalData
        },
        safety: isFit ? (w.safety || {
          briefingDone: false,
          topicsCovered: [],
          ppeIssued: [],
          safetyOfficerName: '',
          safetyDate: ''
        }) : null
      };
    });

    commitWorkers(updated);
    const updatedTarget = updated.find(w => w.id === workerId);
    setActiveWorker(updatedTarget);

    // Sync to Microsoft Fabric in background
    if (updatedTarget) {
      apiUpdateMedical(workerId, medicalData, updatedTarget)
        .then(res => handleEmailFeedback(res?._emailNotification))
        .catch(err => console.warn('[Fabric] Medical sync warning:', err));
    }

    const auditEntry = {
      role: currentRole,
      action: isFit
        ? (medicalData.fitnessStatus === 'FIT_WITH_PRECAUTIONS' ? 'MEDICAL_FIT_WITH_PRECAUTIONS' : 'MEDICAL_FIT_APPROVED')
        : (isHold ? 'MEDICAL_ON_HOLD' : 'MEDICAL_UNFIT_FLAGGED'),
      workerId,
      workerName: updatedTarget?.hr?.fullName,
      details: isFit
        ? `Medical examination PASSED (${medicalData.fitnessStatus}). Auto-routed to EHS Safety Team.${medicalData.remarks ? ` Remarks: ${medicalData.remarks}` : ''}`
        : isHold
          ? `Medical HOLD: ${medicalData.remarks || 'Pending follow-up'}. Held at Medical stage.`
          : `Medical UNFIT: ${medicalData.remarks}. Candidate onboarding halted.`
    };
    logAuditEvent(auditEntry);
    apiLogAudit(auditEntry);

    if (medicalData.fitnessStatus === 'FIT_WITH_PRECAUTIONS') {
      showToast('Medical fitness certified FIT WITH PRECAUTIONS. Routed to EHS Safety Team.', 'info');
    } else if (isFit) {
      showToast('Medical fitness certified FIT. Profile routed to EHS Safety Team.', 'success');
    } else if (isHold) {
      showToast('Worker placed on MEDICAL HOLD at Step 2 for follow-up clearance.', 'warning');
    } else {
      showToast('Worker marked UNFIT. Profile halted and flagged with medical remark.', 'danger');
    }
  };

  // Step 3: Safety Briefing & PPE
  const updateWorkerSafety = (workerId, safetyData) => {
    if (currentRole !== ROLES.SAFETY && currentRole !== ROLES.ADMIN) {
      showToast('Unauthorized: Only EHS Safety Officers can record safety inductions.', 'danger');
      return;
    }

    const updated = workers.map(w => {
      if (w.id !== workerId) return w;

      return {
        ...w,
        stage: STAGES.IT, // Automatically routes to IT Team
        updatedAt: new Date().toISOString(),
        safety: {
          ...safetyData,
          briefingDone: true,
          safetyDate: safetyData.safetyDate || new Date().toISOString().slice(0, 10)
        },
        it: w.it || {
          workerIdGenerated: false,
          faceBiometricRegistered: false,
          cwmsRegistered: false,
          campusMasterUploaded: false,
          undertakingAccepted: false,
          itAdminSignature: '',
          itDate: ''
        }
      };
    });

    commitWorkers(updated);
    const updatedTarget = updated.find(w => w.id === workerId);
    setActiveWorker(updatedTarget);

    // Sync to Microsoft Fabric in background
    if (updatedTarget) {
      apiUpdateSafety(workerId, safetyData, updatedTarget)
        .then(res => handleEmailFeedback(res?._emailNotification))
        .catch(err => console.warn('[Fabric] Safety sync warning:', err));
    }

    const auditEntry = {
      role: currentRole,
      action: 'SAFETY_INDUCTION_COMPLETED',
      workerId,
      workerName: updatedTarget?.hr?.fullName,
      details: `EHS briefing completed (${safetyData.topicsCovered.length} topics) & PPE issued (${safetyData.ppeIssued.length} items). Routed to IT.`
    };
    logAuditEvent(auditEntry);
    apiLogAudit(auditEntry);

    showToast('Safety briefing & PPE issuance logged. Worker routed to IT Enrollment.', 'success');
  };

  // Step 4: IT Biometrics & Undertaking
  const updateWorkerIT = (workerId, itData) => {
    if (currentRole !== ROLES.IT && currentRole !== ROLES.ADMIN) {
      showToast('Unauthorized: Only IT Specialists can record biometric registrations.', 'danger');
      return;
    }

    const updated = workers.map(w => {
      if (w.id !== workerId) return w;

      const generatedId = w.assignedWorkerId || `LME-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      return {
        ...w,
        assignedWorkerId: generatedId,
        stage: STAGES.CAMP, // Automatically routes to Camp Management
        updatedAt: new Date().toISOString(),
        it: {
          ...itData,
          workerIdGenerated: true,
          itDate: itData.itDate || new Date().toISOString().slice(0, 10)
        },
        camp: w.camp || {
          campName: '',
          blockNumber: '',
          roomNumber: '',
          bedNumber: '',
          gatePassActive: false
        }
      };
    });

    commitWorkers(updated);
    const updatedTarget = updated.find(w => w.id === workerId);
    setActiveWorker(updatedTarget);

    // Sync to Microsoft Fabric in background
    if (updatedTarget) {
      apiUpdateIT(workerId, itData, updatedTarget)
        .then(res => handleEmailFeedback(res?._emailNotification))
        .catch(err => console.warn('[Fabric] IT sync warning:', err));
    }

    const auditEntry = {
      role: currentRole,
      action: 'IT_BIOMETRICS_REGISTERED',
      workerId,
      workerName: updatedTarget?.hr?.fullName,
      details: `Face biometric enrolled, CWMS registered, and Worker ID ${updatedTarget.assignedWorkerId} issued. Routed to Camp Team.`
    };
    logAuditEvent(auditEntry);
    apiLogAudit(auditEntry);

    showToast(`IT Enrollment complete. Worker ID ${updatedTarget.assignedWorkerId} assigned. Routed to Camp Team.`, 'success');
  };

  // Step 5: Camp Housing & Final Onboarding
  const updateWorkerCamp = (workerId, campData) => {
    if (currentRole !== ROLES.CAMP && currentRole !== ROLES.ADMIN) {
      showToast('Unauthorized: Only Camp Management can record housing allocations.', 'danger');
      return;
    }

    const updated = workers.map(w => {
      if (w.id !== workerId) return w;

      const completedAt = new Date().toISOString();
      return {
        ...w,
        stage: STAGES.COMPLETED,
        status: 'COMPLETED',
        updatedAt: completedAt,
        completedAt,
        camp: {
          ...campData,
          gatePassActive: true,
          allocationDate: campData.allocationDate || completedAt.slice(0, 10)
        }
      };
    });

    commitWorkers(updated);
    const updatedTarget = updated.find(w => w.id === workerId);
    setActiveWorker(updatedTarget);

    // Sync to Microsoft Fabric in background
    if (updatedTarget) {
      apiUpdateCamp(workerId, campData, updatedTarget)
        .then(res => handleEmailFeedback(res?._emailNotification))
        .catch(err => console.warn('[Fabric] Camp sync warning:', err));
    }

    const auditEntry = {
      role: currentRole,
      action: 'CAMP_BED_ALLOCATED_COMPLETED',
      workerId,
      workerName: updatedTarget?.hr?.fullName,
      details: `Accommodation allocated: ${campData.campName}, ${campData.blockNumber}, Room ${campData.roomNumber}, Bed ${campData.bedNumber}. Gate Pass ACTIVATED.`
    };
    logAuditEvent(auditEntry);
    apiLogAudit(auditEntry);

    showToast('Housing allocated! Worker onboarding complete and Gate Pass is ACTIVE.', 'success');
  };

  // Admin Override
  const adminOverrideWorker = (workerId, newStage, reason) => {
    const now = new Date().toISOString();
    const updated = workers.map(w => {
      if (w.id !== workerId) return w;
      return {
        ...w,
        stage: newStage,
        status: newStage === STAGES.FLAGGED ? 'FLAGGED' : (newStage === STAGES.COMPLETED ? 'COMPLETED' : 'IN_PROGRESS'),
        updatedAt: now,
        completedAt: newStage === STAGES.COMPLETED ? (w.completedAt || now) : null
      };
    });

    commitWorkers(updated);
    const updatedTarget = updated.find(w => w.id === workerId);
    setActiveWorker(updatedTarget);

    const resolvedStatus = newStage === STAGES.FLAGGED ? 'FLAGGED' : (newStage === STAGES.COMPLETED ? 'COMPLETED' : 'IN_PROGRESS');
    apiOverrideWorker(workerId, newStage, resolvedStatus).catch(err => console.warn('[Fabric] Override sync warning:', err));

    const auditEntry = {
      role: 'ADMIN_OVERRIDE',
      action: 'STAGE_OVERRIDE_APPLIED',
      workerId,
      workerName: updatedTarget?.hr?.fullName,
      details: `Admin force shifted worker stage to ${newStage}. Reason: ${reason}`
    };
    logAuditEvent(auditEntry);
    apiLogAudit(auditEntry);

    showToast(`Admin override applied: Worker transitioned to stage ${newStage}.`, 'info');
  };

  const resetAllData = () => {
    const initial = resetToInitialData();
    setWorkers(initial);
    setActiveWorker(initial[0]);
    const auditEntry = {
      role: currentRole,
      action: 'SYSTEM_DATABASE_RESET',
      workerId: 'ALL',
      workerName: 'System',
      details: 'Restored initial production demo dataset.'
    };
    logAuditEvent(auditEntry);
    apiLogAudit(auditEntry);
    showToast('System database reset to initial verified records.', 'info');
  };

  // Quick Photo Update (for HR / Admin from anywhere)
  const updateWorkerPhoto = useCallback((workerId, photoUrl) => {
    setWorkers(prevWorkers => {
      const updated = prevWorkers.map(w => {
        if (w.id === workerId) {
          return {
            ...w,
            updatedAt: new Date().toISOString(),
            hr: {
              ...w.hr,
              photo: photoUrl
            }
          };
        }
        return w;
      });
      saveWorkers(updated);
      return updated;
    });

    setActiveWorker(prev => {
      if (prev?.id === workerId) {
        return {
          ...prev,
          hr: { ...prev.hr, photo: photoUrl }
        };
      }
      return prev;
    });

    // Persist live to Microsoft Fabric SQL Database
    apiUpdateWorkerPhoto(workerId, photoUrl).catch(console.warn);

    showToast('Worker photograph saved to Microsoft Fabric SQL database.', 'success');
  }, []);

  // Save or update a contractor in Master Register (Fabric SQL + Local Store)
  const saveContractor = useCallback(async (formData, editId = null) => {
    const isEdit = Boolean(editId);
    const payload = {
      ...formData,
      id: editId || formData.id || `CTR-${Date.now().toString().slice(-6)}`,
      createdAt: formData.createdAt || new Date().toISOString()
    };
    const saved = await apiSaveContractor(payload, isEdit);
    setContractors(prev => {
      const next = isEdit
        ? prev.map(c => (c.id === editId ? saved : c))
        : [saved, ...prev.filter(c => c.id !== saved.id)];
      saveStoredContractors(next);
      return next;
    });
    return saved;
  }, []);

  // Delete a contractor from Master Register
  const deleteContractor = useCallback(async (contractorId) => {
    await apiDeleteContractor(contractorId);
    setContractors(prev => {
      const next = prev.filter(c => c.id !== contractorId);
      saveStoredContractors(next);
      return next;
    });
  }, []);

  // Clear local browser cache and force live resync from database
  const clearLocalCache = useCallback(async () => {
    clearStoredWorkers();
    try {
      localStorage.removeItem(CONTRACTORS_STORAGE_KEY);
      localStorage.removeItem(LEGACY_CONTRACTORS_STORAGE_KEY);
    } catch (e) { }
    showToast('Clearing local browser cache and refreshing from database...', 'info');
    await syncFabricData();
    showToast('Browser cache cleared & live database synced.', 'success');
  }, [syncFabricData]);

  const value = useMemo(() => ({
    workers,
    contractors,
    activeWorker,
    setActiveWorker,
    searchQuery,
    setSearchQuery,
    selectedStageFilter,
    setSelectedStageFilter,
    toastMessage,
    showToast,
    fabricStatus,
    refreshFabricStatus,
    runFabricDiagnostics,
    startFabricAuth,
    checkAuthStatus,
    isSyncing,
    refreshWorkers: syncFabricData,
    refreshContractors: syncFabricData,
    saveContractor,
    deleteContractor,
    clearLocalCache,
    registerWorkerHR,
    updateWorkerHR,
    updateWorkerMedical,
    updateWorkerSafety,
    updateWorkerIT,
    updateWorkerCamp,
    adminOverrideWorker,
    updateWorkerPhoto,
    resetAllData
  }), [
    workers,
    contractors,
    activeWorker,
    searchQuery,
    selectedStageFilter,
    toastMessage,
    fabricStatus,
    refreshFabricStatus,
    runFabricDiagnostics,
    isSyncing,
    syncFabricData,
    saveContractor,
    deleteContractor,
    clearLocalCache,
    updateWorkerPhoto,
    currentRole
  ]);

  return (
    <WorkerContext.Provider value={value}>
      {children}
    </WorkerContext.Provider>
  );
};

export const useWorkers = () => useContext(WorkerContext);
