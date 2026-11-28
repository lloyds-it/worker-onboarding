// Validation Service conforming to OWASP ASVS 5.0 Input Validation

export const DEFAULT_LOCATION_CODE = '15';

export const generateEmployeeId = (
  existingWorkers = [],
  contractorCode = '',
  locationCode = DEFAULT_LOCATION_CODE
) => {
  const cleanContractor = String(contractorCode || '').trim().toUpperCase().replace(/\s+/g, '');
  const cleanLocation = String(locationCode || DEFAULT_LOCATION_CODE).trim().toUpperCase().replace(/\s+/g, '') || DEFAULT_LOCATION_CODE;

  if (cleanContractor) {
    const prefix = `${cleanContractor}${cleanLocation}`;
    let maxSeq = 0;
    if (Array.isArray(existingWorkers)) {
      existingWorkers.forEach(w => {
        const candidate = String(w?.assignedWorkerId || '').trim().toUpperCase();
        if (candidate.startsWith(prefix)) {
          const tail = candidate.slice(prefix.length);
          if (/^\d+$/.test(tail)) {
            const num = parseInt(tail, 10);
            if (!Number.isNaN(num) && num > maxSeq) maxSeq = num;
          }
        }
      });
    }
    return `${prefix}${String(maxSeq + 1).padStart(4, '0')}`;
  }

  const year = new Date().getFullYear();
  let maxSeq = 1000;
  if (Array.isArray(existingWorkers)) {
    existingWorkers.forEach(w => {
      const candidate = String(w?.assignedWorkerId || '');
      const match = candidate.match(/-(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!Number.isNaN(num) && num > maxSeq) maxSeq = num;
      }
    });
  }
  return `LME-${year}-${maxSeq + 1}`;
};

export const formatTimestamp = (isoString) => {
  if (!isoString) return '—';
  const d = new Date(isoString);
  if (Number.isNaN(d.getTime())) return String(isoString);
  return d.toLocaleString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });
};

export const formatDuration = (startIso, endIso) => {
  if (!startIso || !endIso) return null;
  const start = new Date(startIso).getTime();
  const end = new Date(endIso).getTime();
  if (Number.isNaN(start) || Number.isNaN(end) || end < start) return null;
  const totalSec = Math.floor((end - start) / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

export const validateHRStep = (data) => {
  const errors = {};

  if (!data?.fullName?.trim() && !data?.assignedWorkerId?.trim()) {
    errors.fullName = 'Enter at least Worker Full Name (or Employee ID) to register.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const FITNESS_STATUS_META = {
  FIT: {
    label: 'FIT FOR GENERAL WORK',
    shortLabel: 'FIT',
    badge: 'success',
    routesToSafety: true
  },
  FIT_WITH_PRECAUTIONS: {
    label: 'FIT WITH PRECAUTIONS',
    shortLabel: 'FIT WITH PRECAUTIONS',
    badge: 'info',
    routesToSafety: true
  },
  HOLD: {
    label: 'HOLD (Pending Doctor Review)',
    shortLabel: 'HOLD',
    badge: 'warning',
    routesToSafety: false
  },
  UNFIT: {
    label: 'UNFIT',
    shortLabel: 'UNFIT',
    badge: 'danger',
    routesToSafety: false
  }
};

export const getMedicalFitnessMeta = (status) => {
  return FITNESS_STATUS_META[status] || {
    label: status || 'Pending',
    shortLabel: status || 'Pending',
    badge: 'warning',
    routesToSafety: false
  };
};

export const isMedicalFitForNextStage = (status) => (
  status === 'FIT' || status === 'FIT_WITH_PRECAUTIONS'
);

export const validateMedicalStep = (data) => {
  const errors = {};

  if (!data?.fitnessStatus) {
    errors.fitnessStatus = 'Final fitness decision (FIT, FIT WITH PRECAUTIONS, HOLD, or UNFIT) must be selected.';
  }

  if (data?.fitnessStatus === 'UNFIT' && !data?.remarks?.trim()) {
    errors.remarks = 'Medical reason/remarks required when flagging worker as UNFIT.';
  }

  if (data?.fitnessStatus === 'HOLD' && !data?.remarks?.trim()) {
    errors.remarks = 'Hold reason / required follow-up tests must be entered when placing a worker on HOLD.';
  }

  if (data?.fitnessStatus === 'FIT_WITH_PRECAUTIONS' && !data?.remarks?.trim()) {
    errors.remarks = 'Specify required work precautions when certifying FIT WITH PRECAUTIONS.';
  }

  if (!data?.examinerName?.trim()) {
    errors.examinerName = 'Examining Medical Officer name is required.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const calculateAge = (dobString) => {
  if (!dobString) return 0;
  const dob = new Date(dobString);
  const diff = Date.now() - dob.getTime();
  const ageDate = new Date(diff);
  return Math.abs(ageDate.getUTCFullYear() - 1970);
};

export const calculateBMI = (heightCm, weightKg) => {
  if (!heightCm || !weightKg) return { bmi: '', category: '' };
  const hMeters = Number(heightCm) / 100;
  const wKg = Number(weightKg);
  if (hMeters <= 0 || wKg <= 0) return { bmi: '', category: '' };
  const bmiVal = (wKg / (hMeters * hMeters)).toFixed(1);
  let category = 'Normal';
  if (bmiVal < 18.5) category = 'Underweight';
  else if (bmiVal >= 25 && bmiVal < 30) category = 'Overweight';
  else if (bmiVal >= 30) category = 'Obese';
  return { bmi: bmiVal, category };
};

/**
 * Evaluates completeness of a candidate across all 5 mandatory onboarding steps.
 * Used for status badges and informational progress reporting.
 */
export const getWorkerMissingDetails = (worker) => {
  if (!worker) {
    return {
      isComplete: false,
      missingSteps: [{ step: 0, title: 'No Candidate Selected', dept: 'System', items: ['No worker selected'] }],
      completedSteps: [],
      totalMissing: 1
    };
  }

  const missingSteps = [];
  const completedSteps = [];

  // Step 1: HR Profile
  const hrMissing = [];
  if (!worker.hr?.fullName?.trim()) hrMissing.push('Full candidate name');
  if (!worker.hr?.mobileNumber?.trim()) hrMissing.push('Contact mobile number');
  if (!worker.hr?.contractorName?.trim()) hrMissing.push('Contractor agency name');
  if (!worker.hr?.trade) hrMissing.push('Trade category');

  if (hrMissing.length > 0) {
    missingSteps.push({
      step: 1,
      title: 'Step 1: HR Profile Registration',
      dept: 'Human Resources',
      items: hrMissing
    });
  } else {
    completedSteps.push({
      step: 1,
      title: 'Step 1: HR Profile Registration',
      dept: 'Human Resources',
      completedBy: worker.hr?.registeredBy || 'HR Operations'
    });
  }

  // Step 2: Medical Exam
  const medMissing = [];
  const fitDecision = worker.medical?.fitnessStatus || worker.medical?.fitStatus;
  if (!fitDecision) {
    medMissing.push('Examining Doctor fitness certificate (FIT / UNFIT)');
  }
  if (!worker.medical?.examinerName?.trim() && !worker.medical?.doctorName?.trim()) {
    medMissing.push('Examining Medical Officer signoff');
  }

  if (medMissing.length > 0) {
    missingSteps.push({
      step: 2,
      title: 'Step 2: Occupational Medical Examination',
      dept: 'Medical Services',
      items: medMissing
    });
  } else {
    completedSteps.push({
      step: 2,
      title: 'Step 2: Occupational Medical Examination',
      dept: 'Medical Services',
      completedBy: worker.medical?.examinerName || worker.medical?.doctorName || 'Medical Officer'
    });
  }

  // Step 3: EHS Safety
  const safetyMissing = [];
  if (!worker.safety?.briefingDone && (!worker.safety?.topicsCovered || worker.safety.topicsCovered.length === 0)) {
    safetyMissing.push('Safety briefing induction confirmation');
  }

  if (safetyMissing.length > 0) {
    missingSteps.push({
      step: 3,
      title: 'Step 3: EHS Safety Induction & PPE Issuance',
      dept: 'Environment, Health & Safety',
      items: safetyMissing
    });
  } else {
    completedSteps.push({
      step: 3,
      title: 'Step 3: EHS Safety Induction & PPE Issuance',
      dept: 'Environment, Health & Safety',
      completedBy: worker.safety?.safetyOfficerName || worker.safety?.safetyOfficer || 'Safety Engineer'
    });
  }

  // Step 4: IT Biometrics
  const itMissing = [];
  if (!worker.assignedWorkerId && !worker.it?.workerIdGenerated && !worker.it?.faceBiometricRegistered) {
    itMissing.push('IT biometric registration and ID issuance');
  }

  if (itMissing.length > 0) {
    missingSteps.push({
      step: 4,
      title: 'Step 4: IT Biometric Master Enrollment',
      dept: 'Information Technology',
      items: itMissing
    });
  } else {
    completedSteps.push({
      step: 4,
      title: 'Step 4: IT Biometric Master Enrollment',
      dept: 'Information Technology',
      completedBy: worker.it?.itAdminSignature || worker.it?.itOfficer || 'IT Specialist'
    });
  }

  // Step 5: Camp Housing
  const campMissing = [];
  if (!worker.camp?.campName?.trim() && !worker.camp?.roomNumber?.trim()) {
    campMissing.push('Camp accommodation allocation');
  }

  if (campMissing.length > 0) {
    missingSteps.push({
      step: 5,
      title: 'Step 5: Camp Living Quarters & Gate Pass Activation',
      dept: 'Camp Administration',
      items: campMissing
    });
  } else {
    completedSteps.push({
      step: 5,
      title: 'Step 5: Camp Living Quarters & Gate Pass Activation',
      dept: 'Camp Administration',
      completedBy: worker.camp?.allocatedBy || worker.camp?.contractorSupervisor || 'Camp Supervisor'
    });
  }

  const isComplete = missingSteps.length === 0;
  const totalMissing = missingSteps.reduce((acc, s) => acc + s.items.length, 0);

  return {
    isComplete,
    missingSteps,
    completedSteps,
    totalMissing
  };
};
