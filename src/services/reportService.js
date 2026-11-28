// Reporting and Analytics Service for Administrator and Department Leads
import { STAGES, CAMPS, PPE_ITEMS } from '../types/constants';
import { formatTimestamp, formatDuration, isMedicalFitForNextStage } from './validationService';

const formatDurationMs = (ms) => {
  if (!Number.isFinite(ms) || ms < 0) return '—';
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;
  if (days > 0) return `${days}d ${hours}h ${mins}m`;
  if (hours > 0) return `${hours}h ${mins}m`;
  if (mins > 0) return `${mins}m ${secs}s`;
  return `${secs}s`;
};

const avgDurationStats = (durationsMs) => {
  if (!durationsMs.length) return { avgMs: null, label: '—', count: 0 };
  const sum = durationsMs.reduce((a, b) => a + b, 0);
  const avg = sum / durationsMs.length;
  return { avgMs: avg, label: formatDurationMs(avg), count: durationsMs.length };
};

export const filterWorkersByDateRange = (workers = [], fromDate = '', toDate = '') => {
  if (!fromDate && !toDate) return workers;
  const fromMs = fromDate ? new Date(`${fromDate}T00:00:00`).getTime() : null;
  const toMs = toDate ? new Date(`${toDate}T23:59:59.999`).getTime() : null;
  return workers.filter(w => {
    const t = new Date(w?.createdAt || 0).getTime();
    if (Number.isNaN(t)) return false;
    if (fromMs !== null && t < fromMs) return false;
    if (toMs !== null && t > toMs) return false;
    return true;
  });
};

export const getDepartmentStats = (workers) => {
  const total = workers.length;
  
  // Pipeline Counts
  const hrCount = workers.filter(w => w.stage === STAGES.HR).length;
  const medicalCount = workers.filter(w => w.stage === STAGES.MEDICAL).length;
  const safetyCount = workers.filter(w => w.stage === STAGES.SAFETY).length;
  const itCount = workers.filter(w => w.stage === STAGES.IT).length;
  const campCount = workers.filter(w => w.stage === STAGES.CAMP).length;
  const completedCount = workers.filter(w => w.stage === STAGES.COMPLETED).length;
  const flaggedCount = workers.filter(w => w.stage === STAGES.FLAGGED).length;

  // HR Breakdown
  const contractorDistribution = {};
  const tradeDistribution = {};
  const dateBuckets = {};
  workers.forEach(w => {
    const c = w.hr?.contractorName || 'Unknown';
    contractorDistribution[c] = (contractorDistribution[c] || 0) + 1;

    const t = w.hr?.trade || 'Unassigned';
    tradeDistribution[t] = (tradeDistribution[t] || 0) + 1;

    const regDate = w.createdAt ? String(w.createdAt).slice(0, 10) : 'Unknown';
    if (!dateBuckets[regDate]) {
      dateBuckets[regDate] = { date: regDate, total: 0, completed: 0, inProgress: 0, flagged: 0 };
    }
    dateBuckets[regDate].total += 1;
    if (w.stage === STAGES.COMPLETED) dateBuckets[regDate].completed += 1;
    else if (w.stage === STAGES.FLAGGED) dateBuckets[regDate].flagged += 1;
    else dateBuckets[regDate].inProgress += 1;
  });

  const dateWiseRegistrations = Object.values(dateBuckets).sort((a, b) => b.date.localeCompare(a.date));

  // Medical Breakdown
  const examinedWorkers = workers.filter(w => w.medical?.fitnessStatus);
  const medicalFit = examinedWorkers.filter(w => isMedicalFitForNextStage(w.medical?.fitnessStatus)).length;
  const medicalFitPrecautions = examinedWorkers.filter(w => w.medical?.fitnessStatus === 'FIT_WITH_PRECAUTIONS').length;
  const medicalFitFollowUp = examinedWorkers.filter(w => w.medical?.fitnessStatus === 'FIT_WITH_FOLLOW_UP').length;
  const medicalHold = examinedWorkers.filter(w => w.medical?.fitnessStatus === 'HOLD').length;
  const medicalUnfit = examinedWorkers.filter(w => w.medical?.fitnessStatus === 'UNFIT').length;
  const alcoholFails = examinedWorkers.filter(w => w.medical?.alcoholTest === 'Fail').length;

  // Timing Analytics: full onboarding average + stage-wise average time to submit
  const fullDurations = [];
  const stageDurations = { medical: [], safety: [], it: [], camp: [] };

  const toMs = (iso) => {
    if (!iso) return null;
    const ms = new Date(iso).getTime();
    return Number.isNaN(ms) ? null : ms;
  };

  workers.forEach(w => {
    const startMs = toMs(w.stageTimestamps?.hrAt || w.createdAt);
    const medMs = toMs(w.stageTimestamps?.medicalAt || w.medical?.examinedAt);
    const safetyMs = toMs(w.stageTimestamps?.safetyAt || w.safety?.inductedAt);
    const itMs = toMs(w.stageTimestamps?.itAt || w.it?.enrolledAt);
    const campMs = toMs(w.stageTimestamps?.campAt || w.camp?.allocatedAt || w.completedAt);
    const endMs = toMs(w.completedAt);

    if (startMs !== null && endMs !== null && endMs >= startMs) {
      fullDurations.push(endMs - startMs);
    }
    if (startMs !== null && medMs !== null && medMs >= startMs) {
      stageDurations.medical.push(medMs - startMs);
    }
    if (medMs !== null && safetyMs !== null && safetyMs >= medMs) {
      stageDurations.safety.push(safetyMs - medMs);
    } else if (startMs !== null && safetyMs !== null && medMs === null && safetyMs >= startMs) {
      stageDurations.safety.push(safetyMs - startMs);
    }
    if (safetyMs !== null && itMs !== null && itMs >= safetyMs) {
      stageDurations.it.push(itMs - safetyMs);
    }
    if (itMs !== null && campMs !== null && campMs >= itMs) {
      stageDurations.camp.push(campMs - itMs);
    }
  });

  const timing = {
    full: avgDurationStats(fullDurations),
    stages: {
      medical: avgDurationStats(stageDurations.medical),
      safety: avgDurationStats(stageDurations.safety),
      it: avgDurationStats(stageDurations.it),
      camp: avgDurationStats(stageDurations.camp)
    }
  };

  // Safety Breakdown
  const safetyBriefed = workers.filter(w => w.safety?.briefingDone).length;
  const ppeTotals = {};
  PPE_ITEMS.forEach(item => { ppeTotals[item.id] = 0; });
  workers.forEach(w => {
    if (w.safety?.ppeIssued) {
      w.safety.ppeIssued.forEach(itemId => {
        if (ppeTotals[itemId] !== undefined) ppeTotals[itemId]++;
      });
    }
  });

  // IT Breakdown
  const biometricsDone = workers.filter(w => w.it?.faceBiometricRegistered).length;
  const idsGenerated = workers.filter(w => w.assignedWorkerId).length;

  // Camp Capacity & Allocation (Simulated 100 total bed capacity per camp)
  const campOccupancy = {
    'Gondwana Phase 3': { capacity: 120, occupied: 0 },
    'Gondwana Phase 4': { capacity: 150, occupied: 0 }
  };

  workers.forEach(w => {
    if (w.camp?.campName && campOccupancy[w.camp.campName]) {
      campOccupancy[w.camp.campName].occupied++;
    }
  });

  return {
    total,
    pipeline: {
      hrCount,
      medicalCount,
      safetyCount,
      itCount,
      campCount,
      completedCount,
      flaggedCount
    },
    hr: {
      contractorDistribution,
      tradeDistribution,
      dateWiseRegistrations
    },
    timing,
    medical: {
      totalExamined: examinedWorkers.length,
      medicalFit,
      medicalFitPrecautions,
      medicalFitFollowUp,
      medicalHold,
      medicalUnfit,
      fitRate: examinedWorkers.length ? ((medicalFit / examinedWorkers.length) * 100).toFixed(1) : '0.0',
      alcoholFails
    },
    safety: {
      safetyBriefed,
      ppeTotals
    },
    it: {
      biometricsDone,
      idsGenerated
    },
    camp: campOccupancy
  };
};

export const exportWorkersToCSV = (workers) => {
  const headers = [
    'System ID',
    'Assigned Worker ID',
    'Worker Full Name',
    'Father/Husband Name',
    'Age',
    'Gender',
    'Mobile',
    'Trade',
    'Contractor Agency',
    'Contractor Code',
    'Contractor License',
    'Current Stage',
    'Overall Status',
    'Blood Group',
    'Medical Fitness',
    'BP (Systolic/Diastolic)',
    'SpO2 (%)',
    'RBS (mg/dL)',
    'Safety Briefing Done',
    'Biometric Enrolled',
    'Camp Name',
    'Block',
    'Room',
    'Bed',
    'Gate Pass Active',
    'Process Started At',
    'Process Ended At',
    'Onboarding Duration',
    'Created At'
  ];

  const rows = workers.map(w => [
    w.id,
    w.assignedWorkerId || 'PENDING',
    `"${w.hr?.fullName || ''}"`,
    `"${w.hr?.fatherHusbandName || ''}"`,
    w.hr?.age || '',
    w.hr?.gender || '',
    w.hr?.mobileNumber || '',
    `"${w.hr?.trade || ''}"`,
    `"${w.hr?.contractorName || ''}"`,
    `"${w.hr?.contractorCode || ''}"`,
    `"${w.hr?.contractorLicense || ''}"`,
    w.stage,
    w.status,
    w.medical?.bloodGroup || 'N/A',
    w.medical?.fitnessStatus || 'PENDING',
    w.medical?.bpSystolic ? `${w.medical.bpSystolic}/${w.medical.bpDiastolic}` : 'N/A',
    w.medical?.spo2 || 'N/A',
    w.medical?.rbs || 'N/A',
    w.safety?.briefingDone ? 'YES' : 'NO',
    w.it?.faceBiometricRegistered ? 'YES' : 'NO',
    `"${w.camp?.campName || 'N/A'}"`,
    w.camp?.blockNumber || 'N/A',
    w.camp?.roomNumber || 'N/A',
    w.camp?.bedNumber || 'N/A',
    w.camp?.gatePassActive ? 'ACTIVE' : 'INACTIVE',
    `"${formatTimestamp(w.createdAt)}"`,
    `"${w.completedAt ? formatTimestamp(w.completedAt) : 'In Progress'}"`,
    `"${w.completedAt ? (formatDuration(w.createdAt, w.completedAt) || '—') : 'In Progress'}"`,
    w.createdAt
  ]);

  const csvContent = 'data:text/csv;charset=utf-8,' + 
    [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Lloyd_Worker_Onboarding_Report_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
