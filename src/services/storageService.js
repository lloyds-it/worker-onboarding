// Storage Service for Workers and Initial Seeding across all 5 Induction Stages & Completed Process
import { STAGES } from '../types/constants.js';

const WORKER_STORAGE_KEY = 'lloyd_workers_master_v1';

// Helper to generate realistic high-definition industrial worker avatars
export const generateAvatarSVG = (skin = '#C2410C', helmet = '#FACC15', vest = '#1E3A8A') => {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" fill="#F8FAFC"/>
      <path d="M40 200 L40 160 Q40 140 70 135 L100 145 L130 135 Q160 140 160 160 L160 200 Z" fill="${vest}"/>
      <path d="M85 142 L100 150 L115 142 L115 180 L85 180 Z" fill="#64748B"/>
      <rect x="55" y="155" width="90" height="8" fill="#FACC15"/>
      <rect x="88" y="115" width="24" height="28" fill="${skin}" rx="4"/>
      <ellipse cx="100" cy="90" rx="35" ry="42" fill="${skin}"/>
      <circle cx="86" cy="88" r="4" fill="#0F172A"/>
      <circle cx="114" cy="88" r="4" fill="#0F172A"/>
      <path d="M78 81 Q86 78 94 81" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M106 81 Q114 78 122 81" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M100 87 L98 98 L103 98" stroke="#9A3412" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M85 108 Q100 104 115 108 Q100 114 85 108 Z" fill="#1E293B"/>
      <path d="M62 68 Q100 32 138 68 Q144 70 140 75 L60 75 Q56 70 62 68 Z" fill="${helmet}"/>
      <rect x="56" y="73" width="88" height="6" fill="#94A3B8" rx="3"/>
    </svg>
  `);
};

export const INITIAL_WORKERS = [
  // ==========================================================================
  // STAGE 6: COMPLETED PROCESS - FULLY ONBOARDED & ACTIVE ONSITE (6 WORKERS)
  // ==========================================================================
  {
    id: 'WRK-2026-001',
    assignedWorkerId: 'LME-2026-1001',
    stage: STAGES.COMPLETED,
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
      photo: generateAvatarSVG('#D97706', '#EAB308', '#1E3A8A'),
      address: 'H.No. 42, Ward 3, At Post Konsari, Tahsil Chamorshi, Dist: Gadchiroli, Maharashtra - 442603',
      idCardAddress: 'LLOYDS METALS AND ENERGY LIMITED HEDRI',
      workingLocation: 'LLOYDS METALS AND ENERGY LIMITED HEDRI',
      activity: 'Welding & Structural Fabrication',
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
        'Work at Height & Double Lanyard Safety Harness Rules',
        'Electrical, Heavy Equipment & Machinery Safety',
        'Emergency Evacuation Sirens & First Aid Protocols'
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
    id: 'WRK-2026-013',
    assignedWorkerId: 'LME-2026-1008',
    stage: STAGES.COMPLETED,
    status: 'COMPLETED',
    createdAt: '2026-09-22T08:00:00Z',
    updatedAt: '2026-09-23T14:30:00Z',
    hr: {
      fullName: 'Kolli Hemanth',
      fatherHusbandName: 'K. Satyanarayana',
      dob: '1998-04-10',
      age: 28,
      gender: 'M',
      mobileNumber: '9848012345',
      idProofType: 'Govt ID / Aadhaar',
      idProofRef: '7823 4410 9921',
      contractorName: 'Tata Projects Engineering',
      contractorLicense: 'LIC-MH-2025-1940',
      trade: 'Mason',
      photo: generateAvatarSVG('#C2410C', '#3B82F6', '#1E293B'),
      address: 'Plot 22, Post Konsari, Tahsil Chamorshi, Dist: Gadchiroli, Maharashtra - 442603',
      idCardAddress: 'LLOYDS METALS AND ENERGY LIMITED HEDRI',
      workingLocation: 'LLOYDS METALS AND ENERGY LIMITED HEDRI',
      activity: 'Refractory & Kiln Masonry Work',
      emergencyPerson: 'K. Satyanarayana',
      emergencyRelationship: 'Father',
      emergencyMobile: '9848012300'
    },
    medical: {
      bloodGroup: 'B+',
      heightCm: 171,
      weightKg: 68,
      bmi: '23.3',
      bmiCategory: 'Normal',
      bpSystolic: 120,
      bpDiastolic: 80,
      spo2: 99,
      pulseRate: 72,
      respirationRate: 15,
      rbs: 98,
      alcoholTest: 'Pass',
      visionTest: 'Normal',
      hearingTest: 'Normal',
      vertigoTest: 'Fit',
      existingIllness: 'No',
      fitnessStatus: 'FIT',
      examinerName: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      remarks: 'Optimal vitals. Medically cleared.'
    },
    safety: {
      briefingDone: true,
      topicsCovered: [
        'General Site Rules & Hazardous Zones',
        'Mandatory Daily Biometric Face Punch (No Punch = No Pay)',
        'Zero-Tolerance Alcohol & Substance Prohibition',
        'PPE Usage, Inspection & Maintenance Standards'
      ],
      ppeIssued: ['helmet', 'jacket', 'shoes', 'gloves', 'goggles'],
      safetyOfficerName: 'Arun Patil (EHS Lead)',
      safetyDate: '2026-09-22'
    },
    it: {
      workerIdGenerated: true,
      faceBiometricRegistered: true,
      cwmsRegistered: true,
      campusMasterUploaded: true,
      undertakingAccepted: true,
      itAdminSignature: 'Rajesh Sharma (Sr. IT Admin)',
      itDate: '2026-09-23'
    },
    camp: {
      campName: 'Gondwana Phase 4',
      blockNumber: 'Block B',
      roomNumber: 'B-204',
      bedNumber: 'Bed 2',
      allocatedBy: 'Mahesh Kulkarni (Camp Supv)',
      allocationDate: '2026-09-23',
      gatePassActive: true
    }
  },

  {
    id: 'WRK-2026-014',
    assignedWorkerId: 'LME-2026-1009',
    stage: STAGES.COMPLETED,
    status: 'COMPLETED',
    createdAt: '2026-09-23T09:15:00Z',
    updatedAt: '2026-09-24T12:00:00Z',
    hr: {
      fullName: 'Pravin Vitthalrao Deshmukh',
      fatherHusbandName: 'Vitthalrao Deshmukh',
      dob: '1990-10-18',
      age: 36,
      gender: 'M',
      mobileNumber: '9975441234',
      idProofType: 'Govt ID / Aadhaar',
      idProofRef: '3391 8820 4455',
      contractorName: 'Shapoorji Pallonji Infra Ltd',
      contractorLicense: 'LIC-MH-2023-4102',
      trade: 'Electrician',
      photo: generateAvatarSVG('#B45309', '#EF4444', '#0F172A'),
      address: 'At Post Ashti, Tahsil Chamorshi, Dist: Gadchiroli, Maharashtra - 442603',
      workingLocation: 'Substation 33kV & Switchyard Complex',
      activity: 'High Voltage Cabling & Transformer Testing',
      emergencyPerson: 'Shilpa Deshmukh',
      emergencyRelationship: 'Wife',
      emergencyMobile: '9975441200'
    },
    medical: {
      bloodGroup: 'O+',
      heightCm: 174,
      weightKg: 72,
      bmi: '23.8',
      bmiCategory: 'Normal',
      bpSystolic: 122,
      bpDiastolic: 82,
      spo2: 98,
      pulseRate: 70,
      respirationRate: 16,
      rbs: 102,
      alcoholTest: 'Pass',
      visionTest: 'Normal',
      hearingTest: 'Normal',
      vertigoTest: 'Fit',
      existingIllness: 'No',
      fitnessStatus: 'FIT',
      examinerName: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      remarks: 'Fit for high-voltage and height operations.'
    },
    safety: {
      briefingDone: true,
      topicsCovered: [
        'Electrical, Heavy Equipment & Machinery Safety',
        'Work at Height & Double Lanyard Safety Harness Rules',
        'PPE Usage, Inspection & Maintenance Standards'
      ],
      ppeIssued: ['helmet', 'jacket', 'shoes', 'gloves', 'goggles', 'harness'],
      safetyOfficerName: 'Arun Patil (EHS Lead)',
      safetyDate: '2026-09-23'
    },
    it: {
      workerIdGenerated: true,
      faceBiometricRegistered: true,
      cwmsRegistered: true,
      campusMasterUploaded: true,
      undertakingAccepted: true,
      itAdminSignature: 'Rajesh Sharma (Sr. IT Admin)',
      itDate: '2026-09-24'
    },
    camp: {
      campName: 'Gondwana Phase 3',
      blockNumber: 'Block A',
      roomNumber: 'A-105',
      bedNumber: 'Bed 1',
      allocatedBy: 'Mahesh Kulkarni (Camp Supv)',
      allocationDate: '2026-09-24',
      gatePassActive: true
    }
  },

  {
    id: 'WRK-2026-015',
    assignedWorkerId: 'LME-2026-1010',
    stage: STAGES.COMPLETED,
    status: 'COMPLETED',
    createdAt: '2026-09-23T11:00:00Z',
    updatedAt: '2026-09-24T16:45:00Z',
    hr: {
      fullName: 'Rajeshwar Narayan Atram',
      fatherHusbandName: 'Narayan Atram',
      dob: '1993-01-25',
      age: 33,
      gender: 'M',
      mobileNumber: '9172338899',
      idProofType: 'Govt ID / Aadhaar',
      idProofRef: '6612 9940 3381',
      contractorName: 'Gondwana Allied Engineering',
      contractorLicense: 'LIC-MH-2026-0044',
      trade: 'Fitter',
      photo: generateAvatarSVG('#9A3412', '#10B981', '#1E3A8A'),
      address: 'Ward 2, Allapalli Road, Aheri, Dist: Gadchiroli, Maharashtra - 442705',
      workingLocation: 'DRI Sponge Iron Plant / Kiln 2',
      activity: 'Rotary Kiln Shell Alignment & Mechanical Drives',
      emergencyPerson: 'Laxmi Atram',
      emergencyRelationship: 'Wife',
      emergencyMobile: '9172338800'
    },
    medical: {
      bloodGroup: 'A+',
      heightCm: 169,
      weightKg: 66,
      bmi: '23.1',
      bmiCategory: 'Normal',
      bpSystolic: 118,
      bpDiastolic: 78,
      spo2: 99,
      pulseRate: 72,
      respirationRate: 15,
      rbs: 95,
      alcoholTest: 'Pass',
      visionTest: 'Normal',
      hearingTest: 'Normal',
      vertigoTest: 'Fit',
      existingIllness: 'No',
      fitnessStatus: 'FIT',
      examinerName: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      remarks: 'Fit for plant equipment maintenance.'
    },
    safety: {
      briefingDone: true,
      topicsCovered: [
        'General Site Rules & Hazardous Zones',
        'PPE Usage, Inspection & Maintenance Standards',
        'Electrical, Heavy Equipment & Machinery Safety'
      ],
      ppeIssued: ['helmet', 'jacket', 'shoes', 'gloves', 'earplugs'],
      safetyOfficerName: 'Arun Patil (EHS Lead)',
      safetyDate: '2026-09-24'
    },
    it: {
      workerIdGenerated: true,
      faceBiometricRegistered: true,
      cwmsRegistered: true,
      campusMasterUploaded: true,
      undertakingAccepted: true,
      itAdminSignature: 'Rajesh Sharma (Sr. IT Admin)',
      itDate: '2026-09-24'
    },
    camp: {
      campName: 'Gondwana Phase 3',
      blockNumber: 'Block C',
      roomNumber: 'C-302',
      bedNumber: 'Bed 3',
      allocatedBy: 'Mahesh Kulkarni (Camp Supv)',
      allocationDate: '2026-09-24',
      gatePassActive: true
    }
  },

  {
    id: 'WRK-2026-016',
    assignedWorkerId: 'LME-2026-1011',
    stage: STAGES.COMPLETED,
    status: 'COMPLETED',
    createdAt: '2026-09-24T08:30:00Z',
    updatedAt: '2026-09-25T11:00:00Z',
    hr: {
      fullName: 'Manoj Harishchandra Patil',
      fatherHusbandName: 'Harishchandra Patil',
      dob: '1984-08-11',
      age: 42,
      gender: 'M',
      mobileNumber: '9821447733',
      idProofType: 'Driving License',
      idProofRef: 'DL-MH33-2019-002144',
      contractorName: 'L&T Construction Heavy Civil',
      contractorLicense: 'LIC-MH-2024-8841',
      trade: 'Crane / Rigging Operator',
      photo: generateAvatarSVG('#C2410C', '#F97316', '#334155'),
      address: 'Shivaji Ward, Desaiganj Wadsa, Dist: Gadchiroli, Maharashtra - 441207',
      workingLocation: 'Heavy Lift Yard / Blast Furnace Area',
      activity: '250-Ton Crawler Crane Operations & Heavy Rigging',
      emergencyPerson: 'Vaishali Patil',
      emergencyRelationship: 'Wife',
      emergencyMobile: '9821447700'
    },
    medical: {
      bloodGroup: 'B+',
      heightCm: 175,
      weightKg: 78,
      bmi: '25.5',
      bmiCategory: 'Normal',
      bpSystolic: 124,
      bpDiastolic: 82,
      spo2: 99,
      pulseRate: 74,
      respirationRate: 16,
      rbs: 108,
      alcoholTest: 'Pass',
      visionTest: 'Normal (6/6)',
      hearingTest: 'Normal',
      vertigoTest: 'Fit',
      existingIllness: 'No',
      fitnessStatus: 'FIT',
      examinerName: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      remarks: 'Color vision and visual acuity optimal for heavy machinery.'
    },
    safety: {
      briefingDone: true,
      topicsCovered: [
        'Heavy Equipment & Crane Safety Operations',
        'Zero-Tolerance Alcohol & Substance Prohibition',
        'Emergency Evacuation Sirens & First Aid Protocols'
      ],
      ppeIssued: ['helmet', 'jacket', 'shoes', 'gloves', 'earplugs'],
      safetyOfficerName: 'Arun Patil (EHS Lead)',
      safetyDate: '2026-09-24'
    },
    it: {
      workerIdGenerated: true,
      faceBiometricRegistered: true,
      cwmsRegistered: true,
      campusMasterUploaded: true,
      undertakingAccepted: true,
      itAdminSignature: 'Rajesh Sharma (Sr. IT Admin)',
      itDate: '2026-09-25'
    },
    camp: {
      campName: 'Gondwana Phase 4',
      blockNumber: 'Block D',
      roomNumber: 'D-101',
      bedNumber: 'Bed 1',
      allocatedBy: 'Mahesh Kulkarni (Camp Supv)',
      allocationDate: '2026-09-25',
      gatePassActive: true
    }
  },

  {
    id: 'WRK-2026-017',
    assignedWorkerId: 'LME-2026-1012',
    stage: STAGES.COMPLETED,
    status: 'COMPLETED',
    createdAt: '2026-09-24T10:00:00Z',
    updatedAt: '2026-09-25T15:20:00Z',
    hr: {
      fullName: 'Savita Devi Maravi',
      fatherHusbandName: 'Ramesh Maravi',
      dob: '1995-03-08',
      age: 31,
      gender: 'F',
      mobileNumber: '9765882211',
      idProofType: 'Govt ID / Aadhaar',
      idProofRef: '1145 9932 7702',
      contractorName: 'Afcons Infrastructure Projects',
      contractorLicense: 'LIC-MH-2024-5519',
      trade: 'Unskilled Helper',
      photo: generateAvatarSVG('#D97706', '#EAB308', '#7C3AED'),
      address: 'Near Old Gram Panchayat, At Post Konsari, Dist: Gadchiroli, Maharashtra - 442603',
      workingLocation: 'Central Canteen & Welfare Facilities',
      activity: 'Welfare Facility Maintenance & Logistics Support',
      emergencyPerson: 'Ramesh Maravi',
      emergencyRelationship: 'Husband',
      emergencyMobile: '9765882200'
    },
    medical: {
      bloodGroup: 'AB+',
      heightCm: 158,
      weightKg: 52,
      bmi: '20.8',
      bmiCategory: 'Normal',
      bpSystolic: 116,
      bpDiastolic: 74,
      spo2: 99,
      pulseRate: 72,
      respirationRate: 16,
      rbs: 94,
      alcoholTest: 'Pass',
      visionTest: 'Normal',
      hearingTest: 'Normal',
      vertigoTest: 'Fit',
      existingIllness: 'No',
      fitnessStatus: 'FIT',
      examinerName: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      remarks: 'All vitals optimal. Cleared.'
    },
    safety: {
      briefingDone: true,
      topicsCovered: [
        'General Site Rules & Hazardous Zones',
        'Mandatory Daily Biometric Face Punch (No Punch = No Pay)',
        'PPE Usage, Inspection & Maintenance Standards'
      ],
      ppeIssued: ['helmet', 'jacket', 'shoes', 'gloves'],
      safetyOfficerName: 'Arun Patil (EHS Lead)',
      safetyDate: '2026-09-24'
    },
    it: {
      workerIdGenerated: true,
      faceBiometricRegistered: true,
      cwmsRegistered: true,
      campusMasterUploaded: true,
      undertakingAccepted: true,
      itAdminSignature: 'Rajesh Sharma (Sr. IT Admin)',
      itDate: '2026-09-25'
    },
    camp: {
      campName: 'Gondwana Phase 4',
      blockNumber: 'Block B',
      roomNumber: 'B-208',
      bedNumber: 'Bed 4',
      allocatedBy: 'Mahesh Kulkarni (Camp Supv)',
      allocationDate: '2026-09-25',
      gatePassActive: true
    }
  },

  // ==========================================================================
  // STAGE 5: CAMP ACCOMMODATION ALLOCATION (2 WORKERS IN PROGRESS)
  // ==========================================================================
  {
    id: 'WRK-2026-002',
    assignedWorkerId: 'LME-2026-1002',
    stage: STAGES.CAMP,
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
      photo: generateAvatarSVG('#C2410C', '#F8FAFC', '#DC2626'),
      address: 'Plot 15, Anand Nagar, Chamorshi Road, Gadchiroli, Maharashtra - 442605',
      workingLocation: 'DRI & Pellet Plant / Complex B',
      activity: 'Heavy Equipment Piping & Alignment',
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
        'PPE Usage, Inspection & Maintenance Standards',
        'Work at Height & Double Lanyard Safety Harness Rules'
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
    id: 'WRK-2026-012',
    assignedWorkerId: 'LME-2026-1007',
    stage: STAGES.CAMP,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-25T08:15:00Z',
    updatedAt: '2026-09-26T10:30:00Z',
    hr: {
      fullName: 'Dinesh Parasram Kolhe',
      fatherHusbandName: 'Parasram Kolhe',
      dob: '1985-01-19',
      age: 41,
      gender: 'M',
      mobileNumber: '9823998844',
      idProofType: 'Govt ID / Aadhaar',
      idProofRef: '2290 4433 1189',
      contractorName: 'Afcons Infrastructure Projects',
      contractorLicense: 'LIC-MH-2024-5519',
      trade: 'Scaffolder',
      photo: generateAvatarSVG('#9A3412', '#FACC15', '#047857'),
      address: 'At Post Navegaon, Tahsil Chamorshi, Dist: Gadchiroli, Maharashtra - 442603',
      workingLocation: 'Heavy Plant Structures / Chimney Area',
      activity: 'Tube & Coupler Scaffolding at Elevated Heights',
      emergencyPerson: 'Geeta Kolhe',
      emergencyRelationship: 'Wife',
      emergencyMobile: '9823998800'
    },
    medical: {
      bloodGroup: 'A+',
      heightCm: 167,
      weightKg: 65,
      bmi: '23.3',
      bmiCategory: 'Normal',
      bpSystolic: 122,
      bpDiastolic: 80,
      spo2: 99,
      pulseRate: 74,
      respirationRate: 16,
      rbs: 99,
      alcoholTest: 'Pass',
      visionTest: 'Normal',
      hearingTest: 'Normal',
      vertigoTest: 'Fit',
      existingIllness: 'No',
      fitnessStatus: 'FIT',
      examinerName: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      remarks: 'Height test cleared. Fit for scaffolding work.'
    },
    safety: {
      briefingDone: true,
      topicsCovered: [
        'Work at Height & Double Lanyard Safety Harness Rules',
        'Mandatory Daily Biometric Face Punch (No Punch = No Pay)',
        'PPE Usage, Inspection & Maintenance Standards'
      ],
      ppeIssued: ['helmet', 'jacket', 'shoes', 'gloves', 'harness'],
      safetyOfficerName: 'Arun Patil (EHS Lead)',
      safetyDate: '2026-09-25'
    },
    it: {
      workerIdGenerated: true,
      faceBiometricRegistered: true,
      cwmsRegistered: true,
      campusMasterUploaded: true,
      undertakingAccepted: true,
      itAdminSignature: 'Rajesh Sharma (Sr. IT Admin)',
      itDate: '2026-09-26'
    },
    camp: {
      campName: '',
      blockNumber: '',
      roomNumber: '',
      bedNumber: '',
      gatePassActive: false
    }
  },

  // ==========================================================================
  // STAGE 4: IT BIOMETRIC MASTER RECORD GENERATION (2 WORKERS IN PROGRESS)
  // ==========================================================================
  {
    id: 'WRK-2026-010',
    assignedWorkerId: '',
    stage: STAGES.IT,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-26T09:00:00Z',
    updatedAt: '2026-09-27T11:20:00Z',
    hr: {
      fullName: 'Sanjay Bhimrao Kamble',
      fatherHusbandName: 'Bhimrao Kamble',
      dob: '1995-07-22',
      age: 31,
      gender: 'M',
      mobileNumber: '9422887711',
      idProofType: 'Govt ID / Aadhaar',
      idProofRef: '9102 3344 7788',
      contractorName: 'Afcons Infrastructure Projects',
      contractorLicense: 'LIC-MH-2024-5519',
      trade: 'Painter',
      photo: generateAvatarSVG('#D97706', '#EAB308', '#2563EB'),
      address: 'Ram Nagar Ward 4, Chamorshi Road, Gadchiroli, Maharashtra - 442605',
      workingLocation: 'Structural Steel Painting Yard',
      activity: 'Industrial Epoxy Spray Painting & Surface Prep',
      emergencyPerson: 'Meena Kamble',
      emergencyRelationship: 'Wife',
      emergencyMobile: '9422887700'
    },
    medical: {
      bloodGroup: 'B+',
      heightCm: 166,
      weightKg: 62,
      bmi: '22.5',
      bmiCategory: 'Normal',
      bpSystolic: 118,
      bpDiastolic: 76,
      spo2: 99,
      pulseRate: 70,
      respirationRate: 15,
      rbs: 91,
      alcoholTest: 'Pass',
      visionTest: 'Normal',
      hearingTest: 'Normal',
      vertigoTest: 'Fit',
      existingIllness: 'No',
      fitnessStatus: 'FIT',
      examinerName: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      remarks: 'Fit for all standard painter duties.'
    },
    safety: {
      briefingDone: true,
      topicsCovered: [
        'PPE Usage, Inspection & Maintenance Standards',
        'Chemical Vapor & Dust Respirator Mask Protocol',
        'General Site Rules & Hazardous Zones'
      ],
      ppeIssued: ['helmet', 'jacket', 'shoes', 'gloves', 'goggles', 'earplugs'],
      safetyOfficerName: 'Arun Patil (EHS Lead)',
      safetyDate: '2026-09-26'
    },
    it: {
      workerIdGenerated: false,
      faceBiometricRegistered: true,
      cwmsRegistered: false,
      campusMasterUploaded: false,
      undertakingAccepted: true,
      itAdminSignature: '',
      itDate: ''
    },
    camp: null
  },

  {
    id: 'WRK-2026-011',
    assignedWorkerId: '',
    stage: STAGES.IT,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-26T10:30:00Z',
    updatedAt: '2026-09-27T13:45:00Z',
    hr: {
      fullName: 'Ajay Devidas Warkhade',
      fatherHusbandName: 'Devidas Warkhade',
      dob: '1999-11-05',
      age: 27,
      gender: 'M',
      mobileNumber: '9860443322',
      idProofType: 'Govt ID / Aadhaar',
      idProofRef: '4412 8876 2234',
      contractorName: 'Gondwana Allied Engineering',
      contractorLicense: 'LIC-MH-2026-0044',
      trade: 'Plumber',
      photo: generateAvatarSVG('#C2410C', '#3B82F6', '#D97706'),
      address: 'At Post Konsari, Near Primary Health Center, Dist: Gadchiroli, Maharashtra - 442603',
      workingLocation: 'Industrial Water Treatment & Pipeline Zone',
      activity: 'High-Pressure Water Piping & Valve Fitting',
      emergencyPerson: 'Devidas Warkhade',
      emergencyRelationship: 'Father',
      emergencyMobile: '9860443300'
    },
    medical: {
      bloodGroup: 'AB+',
      heightCm: 173,
      weightKg: 69,
      bmi: '23.1',
      bmiCategory: 'Normal',
      bpSystolic: 124,
      bpDiastolic: 80,
      spo2: 98,
      pulseRate: 74,
      respirationRate: 16,
      rbs: 105,
      alcoholTest: 'Pass',
      visionTest: 'Normal',
      hearingTest: 'Normal',
      vertigoTest: 'Fit',
      existingIllness: 'No',
      fitnessStatus: 'FIT',
      examinerName: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      remarks: 'Fit for pipe laying and trench operations.'
    },
    safety: {
      briefingDone: true,
      topicsCovered: [
        'Trench & Excavation Safety Protocols',
        'PPE Usage, Inspection & Maintenance Standards',
        'General Site Rules & Hazardous Zones'
      ],
      ppeIssued: ['helmet', 'jacket', 'shoes', 'gloves', 'goggles'],
      safetyOfficerName: 'Arun Patil (EHS Lead)',
      safetyDate: '2026-09-26'
    },
    it: {
      workerIdGenerated: false,
      faceBiometricRegistered: false,
      cwmsRegistered: false,
      campusMasterUploaded: false,
      undertakingAccepted: false,
      itAdminSignature: '',
      itDate: ''
    },
    camp: null
  },

  // ==========================================================================
  // STAGE 3: EHS SAFETY BRIEFING & PPE ISSUE (2 WORKERS IN PROGRESS)
  // ==========================================================================
  {
    id: 'WRK-2026-004',
    assignedWorkerId: '',
    stage: STAGES.SAFETY,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-27T08:00:00Z',
    updatedAt: '2026-09-27T08:45:00Z',
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
      photo: generateAvatarSVG('#B45309', '#EF4444', '#1E293B'),
      address: 'Plot 8, Shastri Nagar, Armori Road, Gadchiroli, Maharashtra - 442605',
      workingLocation: 'Captive Power Plant Electrical Room',
      activity: 'Conduit Laying & Panel Wiring',
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
      ppeIssued: ['helmet', 'jacket'],
      safetyOfficerName: '',
      safetyDate: ''
    },
    it: null,
    camp: null
  },

  {
    id: 'WRK-2026-009',
    assignedWorkerId: '',
    stage: STAGES.SAFETY,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-27T09:30:00Z',
    updatedAt: '2026-09-27T10:15:00Z',
    hr: {
      fullName: 'Ganesh Tukaram Madavi',
      fatherHusbandName: 'Tukaram Madavi',
      dob: '1988-09-14',
      age: 38,
      gender: 'M',
      mobileNumber: '9763214589',
      idProofType: 'Govt ID / Aadhaar',
      idProofRef: '7123 4456 9901',
      contractorName: 'Tata Projects Engineering',
      contractorLicense: 'LIC-MH-2025-1940',
      trade: 'Carpenter',
      photo: generateAvatarSVG('#D97706', '#F59E0B', '#1E3A8A'),
      address: 'At Post Markanda Deo, Tahsil Chamorshi, Dist: Gadchiroli, Maharashtra - 442603',
      workingLocation: 'Formwork Fabrication Yard',
      activity: 'Shuttering, Formwork & Timber Support',
      emergencyPerson: 'Parvati Madavi',
      emergencyRelationship: 'Wife',
      emergencyMobile: '9763214500'
    },
    medical: {
      bloodGroup: 'O+',
      heightCm: 169,
      weightKg: 67,
      bmi: '23.5',
      bmiCategory: 'Normal',
      bpSystolic: 120,
      bpDiastolic: 82,
      spo2: 99,
      pulseRate: 72,
      respirationRate: 15,
      rbs: 96,
      alcoholTest: 'Pass',
      visionTest: 'Normal',
      hearingTest: 'Normal',
      vertigoTest: 'Fit',
      existingIllness: 'No',
      fitnessStatus: 'FIT',
      examinerName: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      remarks: 'Fit for carpentry and general civil construction work.'
    },
    safety: {
      briefingDone: false,
      topicsCovered: [],
      ppeIssued: ['helmet', 'shoes'],
      safetyOfficerName: '',
      safetyDate: ''
    },
    it: null,
    camp: null
  },

  // ==========================================================================
  // STAGE 2: MEDICAL SCREENING & FITNESS EVALUATION (2 WORKERS IN PROGRESS)
  // ==========================================================================
  {
    id: 'WRK-2026-005',
    assignedWorkerId: '',
    stage: STAGES.MEDICAL,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-28T08:30:00Z',
    updatedAt: '2026-09-28T08:30:00Z',
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
      photo: generateAvatarSVG('#C2410C', '#EAB308', '#0F172A'),
      address: 'Main Road, Chamorshi, Dist: Gadchiroli, Maharashtra - 442603',
      workingLocation: 'Storage Yard 2 / Steel Ingot Stock',
      activity: 'Overhead Gantry Crane Driving & Sling Inspection',
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
  },

  {
    id: 'WRK-2026-008',
    assignedWorkerId: '',
    stage: STAGES.MEDICAL,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-28T09:15:00Z',
    updatedAt: '2026-09-28T10:00:00Z',
    hr: {
      fullName: 'Santosh Baban Gaikwad',
      fatherHusbandName: 'Baban Gaikwad',
      dob: '1991-03-24',
      age: 35,
      gender: 'M',
      mobileNumber: '9890123456',
      idProofType: 'Govt ID / Aadhaar',
      idProofRef: '5541 2290 8812',
      contractorName: 'L&T Construction Heavy Civil',
      contractorLicense: 'LIC-MH-2024-8841',
      trade: 'Barbender',
      photo: generateAvatarSVG('#9A3412', '#EF4444', '#1E3A8A'),
      address: 'Indira Nagar, Near Bus Stand, Chamorshi, Dist: Gadchiroli, Maharashtra - 442603',
      workingLocation: 'Pellet Plant Civil Works / Phase 2',
      activity: 'Rebar Bending & Reinforcement Cage Assembly',
      emergencyPerson: 'Sunanda Gaikwad',
      emergencyRelationship: 'Wife',
      emergencyMobile: '9890123400'
    },
    medical: {
      bloodGroup: 'A+',
      heightCm: 171,
      weightKg: 68,
      bmi: '23.3',
      bmiCategory: 'Normal',
      bpSystolic: 122,
      bpDiastolic: 80,
      spo2: 99,
      pulseRate: 76,
      respirationRate: 16,
      rbs: 104,
      alcoholTest: 'Pass',
      visionTest: 'Normal',
      hearingTest: 'Normal',
      vertigoTest: 'Fit',
      existingIllness: 'No',
      fitnessStatus: '',
      examinerName: 'Dr. Vivek Deshmukh (MBBS, CIH)',
      remarks: 'Vitals taken. Pending final fitness certificate sign-off.'
    },
    safety: null,
    it: null,
    camp: null
  },

  // ==========================================================================
  // STAGE 1: HR REGISTRATION & INDUCTION (2 WORKERS IN PROGRESS)
  // ==========================================================================
  {
    id: 'WRK-2026-006',
    assignedWorkerId: '',
    stage: STAGES.HR,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-29T08:00:00Z',
    updatedAt: '2026-09-29T08:15:00Z',
    hr: {
      fullName: 'Vikram Suresh Rathod',
      fatherHusbandName: 'Suresh Rathod',
      dob: '1994-06-15',
      age: 32,
      gender: 'M',
      mobileNumber: '9822114477',
      idProofType: 'Govt ID / Aadhaar',
      idProofRef: '6645 8821 9043',
      contractorName: 'Shapoorji Pallonji Infra Ltd',
      contractorLicense: 'LIC-MH-2023-4102',
      trade: 'Mason',
      photo: generateAvatarSVG('#C2410C', '#F59E0B', '#334155'),
      address: 'Ward No. 5, Post Konsari, Tahsil Chamorshi, Dist: Gadchiroli, Maharashtra - 442603',
      workingLocation: 'Blast Furnace Foundation Site / Area 4',
      activity: 'Refractory Brick Laying & Structural Masonry',
      emergencyPerson: 'Rekha Rathod',
      emergencyRelationship: 'Wife',
      emergencyMobile: '9822114400'
    },
    medical: null,
    safety: null,
    it: null,
    camp: null
  },

  {
    id: 'WRK-2026-007',
    assignedWorkerId: '',
    stage: STAGES.HR,
    status: 'IN_PROGRESS',
    createdAt: '2026-09-29T09:30:00Z',
    updatedAt: '2026-09-29T09:45:00Z',
    hr: {
      fullName: 'Anita Bai Tekam',
      fatherHusbandName: 'Ramesh Tekam',
      dob: '1997-04-12',
      age: 29,
      gender: 'F',
      mobileNumber: '9766554433',
      idProofType: 'Govt ID / Aadhaar',
      idProofRef: '3312 9904 5518',
      contractorName: 'Gondwana Allied Engineering',
      contractorLicense: 'LIC-MH-2026-0044',
      trade: 'Unskilled Helper',
      photo: generateAvatarSVG('#D97706', '#EAB308', '#0284C7'),
      address: 'At Post Konsari, Near Gram Panchayat, Dist: Gadchiroli, Maharashtra - 442603',
      workingLocation: 'Material Yard / Camp Logistics Depot',
      activity: 'Site Housekeeping & Logistics Material Handling',
      emergencyPerson: 'Ramesh Tekam',
      emergencyRelationship: 'Husband',
      emergencyMobile: '9766554400'
    },
    medical: null,
    safety: null,
    it: null,
    camp: null
  },

  // ==========================================================================
  // FLAGGED / HALTED PROCESS (1 WORKER - MEDICAL UNFIT)
  // ==========================================================================
  {
    id: 'WRK-2026-003',
    assignedWorkerId: '',
    stage: STAGES.FLAGGED,
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
      photo: generateAvatarSVG('#9A3412', '#EF4444', '#475569'),
      address: 'Ward 1, Chandrapur Road, Chamorshi, Dist: Gadchiroli, Maharashtra - 442603',
      workingLocation: 'Heavy Plant Scaffolding Area',
      activity: 'High-Altitude Pipe Scaffolding',
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
      remarks: 'UNFIT: Stage 2 Hypertension (178/110 mmHg) and acute vertigo. High hazard risk for scaffolding/height work. Re-evaluation required after 14 days of physician treatment.'
    },
    safety: null,
    it: null,
    camp: null
  }
];

export const getStoredWorkers = () => {
  try {
    const raw = localStorage.getItem(WORKER_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify(INITIAL_WORKERS));
      return INITIAL_WORKERS;
    }
    const parsed = JSON.parse(raw);
    
    // Automatically synchronize any missing dummy workers from INITIAL_WORKERS
    let modified = false;
    const existingIds = new Set(parsed.map(w => w.id));
    const missingWorkers = INITIAL_WORKERS.filter(iw => !existingIds.has(iw.id));
    
    let currentList = parsed;
    if (missingWorkers.length > 0) {
      currentList = [...parsed, ...missingWorkers];
      modified = true;
    }

    // Ensure photo, address, and ID card address data is properly populated
    const enriched = currentList.map(w => {
      let changed = false;
      const hrUpdate = { ...w.hr };

      // Ensure ID card address defaults to LLOYDS METALS AND ENERGY LIMITED HEDRI
      if (!hrUpdate.idCardAddress || hrUpdate.idCardAddress !== 'LLOYDS METALS AND ENERGY LIMITED HEDRI') {
        hrUpdate.idCardAddress = 'LLOYDS METALS AND ENERGY LIMITED HEDRI';
        changed = true;
      }

      // Default working location to Hedri if previously default Konsari
      if (!hrUpdate.workingLocation || hrUpdate.workingLocation === 'Konsari Plant Site / Phase 3') {
        hrUpdate.workingLocation = 'LLOYDS METALS AND ENERGY LIMITED HEDRI';
        changed = true;
      }

      const initMatch = INITIAL_WORKERS.find(i => i.id === w.id);
      if (initMatch) {
        if (!w.hr?.photo && initMatch.hr?.photo) {
          hrUpdate.photo = initMatch.hr.photo;
          changed = true;
        }
        if (!w.hr?.address && initMatch.hr?.address) {
          hrUpdate.address = initMatch.hr.address;
          changed = true;
        }
        if (!w.hr?.activity && initMatch.hr?.activity) {
          hrUpdate.activity = initMatch.hr.activity;
          changed = true;
        }
      }

      if (changed) {
        modified = true;
        return { ...w, hr: hrUpdate };
      }
      return w;
    });

    if (modified) {
      localStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify(enriched));
      return enriched;
    }
    return enriched;
  } catch (err) {
    console.error('Failed to parse workers from localStorage:', err);
    return INITIAL_WORKERS;
  }
};

export const saveWorkers = (workers) => {
  try {
    localStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify(workers));
  } catch (err) {
    console.error('Failed to save workers:', err);
  }
};

export const resetToInitialData = () => {
  localStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify(INITIAL_WORKERS));
  return INITIAL_WORKERS;
};
