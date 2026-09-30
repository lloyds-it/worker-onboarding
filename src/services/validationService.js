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
