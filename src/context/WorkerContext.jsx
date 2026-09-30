import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { getStoredWorkers, saveWorkers, resetToInitialData } from '../services/storageService';
import { logAuditEvent } from '../services/auditService';
import { ROLES, STAGES } from '../types/constants';
import { useAuth } from './AuthContext';
import { 
  apiGetWorkers, 
  apiRegisterWorker, 
  apiUpdateMedical, 
  apiUpdateSafety, 
  apiUpdateIT, 
  apiUpdateCamp, 
  apiLogAudit,
  checkFabricHealth,
  testFabricDiagnostics,
  startFabricAuth,
  checkAuthStatus
} from '../services/apiService';

const WorkerContext = createContext();

export const WorkerProvider = ({ children }) => {
  const { currentRole, currentUser } = useAuth();
  const [workers, setWorkers] = useState([]);
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

  // Initial load from storage and background Fabric sync
  useEffect(() => {
    // 1. Instant local load for zero-delay UX
    const loaded = getStoredWorkers();
    setWorkers(loaded);
    if (loaded.length > 0) {
      setActiveWorker(loaded[0]);
    }

    // 2. Query Fabric backend health & data asynchronously
    const syncFabricData = async () => {
      setIsSyncing(true);
      try {
        const health = await checkFabricHealth();
        setFabricStatus(health);

        const remoteWorkers = await apiGetWorkers();
        if (remoteWorkers && remoteWorkers.length > 0) {
          setWorkers(remoteWorkers);
          saveWorkers(remoteWorkers);
          if (!activeWorker && remoteWorkers.length > 0) {
            setActiveWorker(remoteWorkers[0]);
          }
        }
      } catch (err) {
        console.warn('[WorkerContext] Fabric sync notice:', err);
      } finally {
        setIsSyncing(false);
      }
    };

    syncFabricData();
  }, []);

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

    const newId = `WRK-2026-${String(workers.length + 1).padStart(3, '0')}`;
    const newWorker = {
      id: newId,
      assignedWorkerId: '',
      stage: STAGES.MEDICAL, // Automatically routes to Medical Team per BRD
      status: 'IN_PROGRESS',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      hr: hrData,
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

    // Sync to Microsoft Fabric in background
    apiRegisterWorker(newWorker).catch(err => console.warn('[Fabric] Registration sync warning:', err));

    const auditEntry = {
      role: currentRole,
      action: 'HR_WORKER_REGISTERED',
      workerId: newId,
      workerName: hrData.fullName,
      details: `Registered profile under contractor ${hrData.contractorName}. Auto-routed to Medical Team.`
    };
    logAuditEvent(auditEntry);
    apiLogAudit(auditEntry);

    showToast(`Worker ${hrData.fullName} registered successfully and routed to Medical Team.`, 'success');
    return newWorker;
  };

  // Step 1: Update Existing Worker HR Profile
  const updateWorkerHR = (workerId, hrData) => {
    if (currentRole !== ROLES.HR && currentRole !== ROLES.ADMIN) {
      showToast('Unauthorized: Only HR Operations can update HR candidate profiles.', 'danger');
      return;
    }

    const updated = workers.map(w => {
      if (w.id !== workerId) return w;
      const nextStage = w.stage === STAGES.HR ? STAGES.MEDICAL : w.stage;
      return {
        ...w,
        stage: nextStage,
        updatedAt: new Date().toISOString(),
        hr: {
          ...w.hr,
          ...hrData
        }
      };
    });

    commitWorkers(updated);
    const updatedTarget = updated.find(w => w.id === workerId);
    setActiveWorker(updatedTarget);

    const auditEntry = {
      role: currentRole,
      action: 'HR_WORKER_UPDATED',
      workerId,
      workerName: hrData.fullName || updatedTarget?.hr?.fullName,
      details: `Updated candidate personal and trade information.`
    };
    logAuditEvent(auditEntry);
    apiLogAudit(auditEntry);

    showToast(`Worker ${hrData.fullName || 'profile'} updated successfully.`, 'success');
  };

  // Step 2: Medical Examination
  const updateWorkerMedical = (workerId, medicalData) => {
    if (currentRole !== ROLES.MEDICAL && currentRole !== ROLES.ADMIN) {
      showToast('Unauthorized: Only Medical Health Officers can record medical examinations.', 'danger');
      return;
    }

    const updated = workers.map(w => {
      if (w.id !== workerId) return w;

      const isFit = medicalData.fitnessStatus === 'FIT';
      const nextStage = isFit ? STAGES.SAFETY : STAGES.FLAGGED;
      const nextStatus = isFit ? 'IN_PROGRESS' : 'FLAGGED';

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
      apiUpdateMedical(workerId, medicalData, updatedTarget).catch(err => console.warn('[Fabric] Medical sync warning:', err));
    }

    const isFit = medicalData.fitnessStatus === 'FIT';
    const auditEntry = {
      role: currentRole,
      action: isFit ? 'MEDICAL_FIT_APPROVED' : 'MEDICAL_UNFIT_FLAGGED',
      workerId,
      workerName: updatedTarget?.hr?.fullName,
      details: isFit 
        ? `Medical examination PASSED. Auto-routed to EHS Safety Team.`
        : `Medical UNFIT: ${medicalData.remarks}. Candidate onboarding halted.`
    };
    logAuditEvent(auditEntry);
    apiLogAudit(auditEntry);

    if (isFit) {
      showToast('Medical fitness certified FIT. Profile routed to EHS Safety Team.', 'success');
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
      apiUpdateSafety(workerId, safetyData, updatedTarget).catch(err => console.warn('[Fabric] Safety sync warning:', err));
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
      apiUpdateIT(workerId, itData, updatedTarget).catch(err => console.warn('[Fabric] IT sync warning:', err));
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

      return {
        ...w,
        stage: STAGES.COMPLETED,
        status: 'COMPLETED',
        updatedAt: new Date().toISOString(),
        camp: {
          ...campData,
          gatePassActive: true,
          allocationDate: campData.allocationDate || new Date().toISOString().slice(0, 10)
        }
      };
    });

    commitWorkers(updated);
    const updatedTarget = updated.find(w => w.id === workerId);
    setActiveWorker(updatedTarget);

    // Sync to Microsoft Fabric in background
    if (updatedTarget) {
      apiUpdateCamp(workerId, campData, updatedTarget).catch(err => console.warn('[Fabric] Camp sync warning:', err));
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
    const updated = workers.map(w => {
      if (w.id !== workerId) return w;
      return {
        ...w,
        stage: newStage,
        status: newStage === STAGES.FLAGGED ? 'FLAGGED' : (newStage === STAGES.COMPLETED ? 'COMPLETED' : 'IN_PROGRESS'),
        updatedAt: new Date().toISOString()
      };
    });

    commitWorkers(updated);
    const updatedTarget = updated.find(w => w.id === workerId);
    setActiveWorker(updatedTarget);

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

    showToast('Worker photograph updated successfully for Gate Pass ID Card.', 'success');
  }, []);

  const value = useMemo(() => ({
    workers,
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
    activeWorker,
    searchQuery,
    selectedStageFilter,
    toastMessage,
    fabricStatus,
    refreshFabricStatus,
    runFabricDiagnostics,
    isSyncing,
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
