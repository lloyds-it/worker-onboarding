// Reporting and Analytics Service for Administrator and Department Leads
import { STAGES, CAMPS, PPE_ITEMS } from '../types/constants';

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
  workers.forEach(w => {
    const c = w.hr?.contractorName || 'Unknown';
    contractorDistribution[c] = (contractorDistribution[c] || 0) + 1;

    const t = w.hr?.trade || 'Unassigned';
    tradeDistribution[t] = (tradeDistribution[t] || 0) + 1;
  });

  // Medical Breakdown
  const examinedWorkers = workers.filter(w => w.medical?.fitnessStatus);
  const medicalFit = examinedWorkers.filter(w => w.medical?.fitnessStatus === 'FIT').length;
  const medicalUnfit = examinedWorkers.filter(w => w.medical?.fitnessStatus === 'UNFIT').length;
  const alcoholFails = examinedWorkers.filter(w => w.medical?.alcoholTest === 'Fail').length;

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
      tradeDistribution
    },
    medical: {
      totalExamined: examinedWorkers.length,
      medicalFit,
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
