// Validation Service conforming to OWASP ASVS 5.0 Input Validation

export const validateHRStep = (data) => {
  const errors = {};

  if (!data.fullName?.trim()) {
    errors.fullName = 'Worker full name is required.';
  } else if (data.fullName.trim().length < 3) {
    errors.fullName = 'Full name must be at least 3 characters.';
  }

  if (!data.fatherHusbandName?.trim()) {
    errors.fatherHusbandName = "Father's or Husband's name is required.";
  }

  if (!data.dob) {
    errors.dob = 'Date of birth is required.';
  } else {
    const age = calculateAge(data.dob);
    if (age < 18) {
      errors.dob = 'Worker must be at least 18 years old (child labor prohibited).';
    } else if (age > 65) {
      errors.dob = 'Worker age exceeds maximum allowable working age (65 years).';
    }
  }

  if (!data.gender) {
    errors.gender = 'Gender selection is required.';
  }

  if (!data.mobileNumber?.trim()) {
    errors.mobileNumber = 'Mobile number is required.';
  } else if (!/^[6-9]\d{9}$/.test(data.mobileNumber.trim())) {
    errors.mobileNumber = 'Enter a valid 10-digit Indian mobile number starting with 6-9.';
  }

  if (!data.idProofType) {
    errors.idProofType = 'Please select an ID proof type.';
  }

  if (!data.idProofRef?.trim()) {
    errors.idProofRef = 'ID proof reference number is required.';
  } else if (data.idProofRef.trim().length < 4) {
    errors.idProofRef = 'ID reference number is too short.';
  }

  if (!data.contractorName?.trim()) {
    errors.contractorName = 'Contractor agency name is required.';
  }

  if (!data.trade) {
    errors.trade = 'Skill trade category must be selected.';
  }

  if (!data.emergencyPerson?.trim()) {
    errors.emergencyPerson = 'Emergency contact person is required.';
  }

  if (!data.emergencyRelationship?.trim()) {
    errors.emergencyRelationship = 'Relationship to worker is required.';
  }

  if (!data.emergencyMobile?.trim()) {
    errors.emergencyMobile = 'Emergency mobile number is required.';
  } else if (!/^[6-9]\d{9}$/.test(data.emergencyMobile.trim())) {
    errors.emergencyMobile = 'Enter a valid 10-digit mobile number.';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

export const validateMedicalStep = (data) => {
  const errors = {};

  if (!data.bloodGroup) {
    errors.bloodGroup = 'Blood group is required.';
  }

  const height = Number(data.heightCm);
  if (!data.heightCm || isNaN(height) || height < 120 || height > 230) {
    errors.heightCm = 'Height must be between 120 and 230 cm.';
  }

  const weight = Number(data.weightKg);
  if (!data.weightKg || isNaN(weight) || weight < 35 || weight > 160) {
    errors.weightKg = 'Weight must be between 35 and 160 kg.';
  }

  const sys = Number(data.bpSystolic);
  const dia = Number(data.bpDiastolic);
  if (!data.bpSystolic || isNaN(sys) || sys < 70 || sys > 230) {
    errors.bpSystolic = 'Systolic BP must be between 70 and 230 mmHg.';
  }
  if (!data.bpDiastolic || isNaN(dia) || dia < 40 || dia > 140) {
    errors.bpDiastolic = 'Diastolic BP must be between 40 and 140 mmHg.';
  }

  const spo2 = Number(data.spo2);
  if (!data.spo2 || isNaN(spo2) || spo2 < 70 || spo2 > 100) {
    errors.spo2 = 'SpO2 must be between 70% and 100%.';
  }

  const pulse = Number(data.pulseRate);
  if (!data.pulseRate || isNaN(pulse) || pulse < 40 || pulse > 160) {
    errors.pulseRate = 'Pulse must be between 40 and 160 bpm.';
  }

  const rbs = Number(data.rbs);
  if (!data.rbs || isNaN(rbs) || rbs < 40 || rbs > 500) {
    errors.rbs = 'Blood Sugar (RBS) must be between 40 and 500 mg/dL.';
  }

  if (!data.alcoholTest) {
    errors.alcoholTest = 'Alcohol screening test result (Pass/Fail) is required.';
  }

  if (!data.fitnessStatus) {
    errors.fitnessStatus = 'Final fitness decision (FIT or UNFIT) must be marked.';
  }

  if (data.fitnessStatus === 'UNFIT' && !data.remarks?.trim()) {
    errors.remarks = 'Mandatory medical reason/remarks required when flagging worker as UNFIT.';
  }

  if (!data.examinerName?.trim()) {
    errors.examinerName = 'Examining medical officer name is required.';
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
 * Used to guard official document printing and ID card generation.
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
  if (!worker.hr?.fatherHusbandName?.trim()) hrMissing.push("Father's or Husband's name");
  if (!worker.hr?.mobileNumber?.trim()) hrMissing.push('Contact mobile number');
  if (!worker.hr?.dob && !worker.hr?.age) hrMissing.push('Date of birth / Age');
  if (!worker.hr?.trade) hrMissing.push('Designated trade category');
  if (!worker.hr?.contractorName?.trim()) hrMissing.push('Contractor agency name');
  if (!worker.hr?.emergencyPerson?.trim() || !worker.hr?.emergencyMobile?.trim()) hrMissing.push('Emergency contact details');
  if (!worker.hr?.photo) hrMissing.push('Official portrait photograph');

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
  const fitDecision = worker.medical?.fitStatus || worker.medical?.fitnessStatus;
  if (!fitDecision) {
    medMissing.push('Examining Doctor fitness certificate (FIT / UNFIT)');
  } else if (fitDecision === 'UNFIT') {
    medMissing.push(`Candidate flagged medically UNFIT (${worker.medical?.fitStatusReason || worker.medical?.remarks || 'Failed medical parameters'})`);
  }
  if (!worker.medical?.doctorName?.trim() && !worker.medical?.examinerName?.trim()) {
    medMissing.push('Examining Medical Officer name & signature');
  }
  if (!worker.medical?.bloodPressure && !worker.medical?.bpSystolic) {
    medMissing.push('Blood pressure vitals (BP)');
  }
  if (!worker.medical?.identificationMark1?.trim()) {
    medMissing.push('Physical identification mark #1');
  }
  const isMedStageDone = (worker.stage && worker.stage > 2) || worker.stage === 6;
  if (medMissing.length > 0 || !isMedStageDone) {
    if (medMissing.length === 0 && !isMedStageDone) {
      medMissing.push('Doctor medical clearance and stage confirmation pending');
    }
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
      completedBy: worker.medical?.doctorName || worker.medical?.examinerName || 'Medical Officer'
    });
  }

  // Step 3: EHS Safety
  const safetyMissing = [];
  if (!worker.safety?.safetyOfficer?.trim()) {
    safetyMissing.push('EHS Safety Officer verification');
  }
  if (!worker.safety?.briefingDate) {
    safetyMissing.push('Safety induction briefing date');
  }
  const ppeCount = worker.safety?.ppeIssued ? Object.values(worker.safety.ppeIssued).filter(Boolean).length : 0;
  if (ppeCount === 0) {
    safetyMissing.push('Mandatory PPE kit issuance verification');
  }
  const isSafetyStageDone = (worker.stage && worker.stage > 3) || worker.stage === 6;
  if (safetyMissing.length > 0 || !isSafetyStageDone) {
    if (safetyMissing.length === 0 && !isSafetyStageDone) {
      safetyMissing.push('Safety briefing and PPE issuance confirmation pending');
    }
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
      completedBy: worker.safety?.safetyOfficer || 'Safety Engineer'
    });
  }

  // Step 4: IT Biometrics
  const itMissing = [];
  if (!worker.it?.rfidCardNumber?.trim()) {
    itMissing.push('Smart Card RFID / UID card assignment');
  }
  if (!worker.it?.cwmsId?.trim()) {
    itMissing.push('Central CWMS Master registration ID');
  }
  if (!worker.it?.itOfficer?.trim()) {
    itMissing.push('IT Biometrics Specialist signoff');
  }
  const isItStageDone = (worker.stage && worker.stage > 4) || worker.stage === 6;
  if (itMissing.length > 0 || !isItStageDone) {
    if (itMissing.length === 0 && !isItStageDone) {
      itMissing.push('IT Biometric registration and UID enrollment pending');
    }
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
      completedBy: worker.it?.itOfficer || 'IT Specialist'
    });
  }

  // Step 5: Camp Housing
  const campMissing = [];
  if (!worker.camp?.campName?.trim()) {
    campMissing.push('Camp colony allocation (e.g. Gondwana Camp)');
  }
  if (!worker.camp?.roomNumber?.trim()) {
    campMissing.push('Allocated room number');
  }
  if (!worker.camp?.bedNumber?.trim()) {
    campMissing.push('Allocated bed number');
  }
  if (!worker.camp?.supervisorName?.trim()) {
    campMissing.push('Camp Accommodations Supervisor signoff');
  }
  const isCampStageDone = worker.stage === 6;
  if (campMissing.length > 0 || !isCampStageDone) {
    if (campMissing.length === 0 && !isCampStageDone) {
      campMissing.push('Camp room allocation and final gate pass activation pending');
    }
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
      completedBy: worker.camp?.supervisorName || 'Camp Supervisor'
    });
  }

  const isComplete = missingSteps.length === 0 && worker.stage === 6;
  const totalMissing = missingSteps.reduce((acc, s) => acc + s.items.length, 0);

  return {
    isComplete,
    missingSteps,
    completedSteps,
    totalMissing
  };
};
