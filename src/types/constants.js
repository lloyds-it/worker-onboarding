// Enums and Constants for Worker Onboarding System

export const ROLES = {
  ADMIN: 'ADMIN',
  HR: 'HR',
  MEDICAL: 'MEDICAL',
  SAFETY: 'SAFETY',
  IT: 'IT',
  CAMP: 'CAMP'
};

export const ROLE_LABELS = {
  [ROLES.ADMIN]: 'Chief Administrator',
  [ROLES.HR]: 'HR Operations Team',
  [ROLES.MEDICAL]: 'Medical & Health Officer',
  [ROLES.SAFETY]: 'EHS Safety Officer',
  [ROLES.IT]: 'IT Systems Specialist',
  [ROLES.CAMP]: 'Camp Accommodation Lead'
};

export const STAGES = {
  HR: 1,
  MEDICAL: 2,
  SAFETY: 3,
  IT: 4,
  CAMP: 5,
  COMPLETED: 6,
  FLAGGED: -1
};

export const STAGE_META = {
  [STAGES.HR]: { label: 'HR Registration', dept: ROLES.HR, color: 'info' },
  [STAGES.MEDICAL]: { label: 'Medical Fitness', dept: ROLES.MEDICAL, color: 'warning' },
  [STAGES.SAFETY]: { label: 'EHS Safety Briefing', dept: ROLES.SAFETY, color: 'purple' },
  [STAGES.IT]: { label: 'IT Biometric Master', dept: ROLES.IT, color: 'info' },
  [STAGES.CAMP]: { label: 'Camp Accommodation', dept: ROLES.CAMP, color: 'warning' },
  [STAGES.COMPLETED]: { label: 'Onboarded & Active', dept: 'SYSTEM', color: 'success' },
  [STAGES.FLAGGED]: { label: 'Medical Unfit (Halted)', dept: ROLES.MEDICAL, color: 'danger' }
};

export const TRADES = [
  'Mason',
  'Barbender',
  'Carpenter',
  'Welder',
  'Fitter',
  'Electrician',
  'Plumber',
  'Painter',
  'Scaffolder',
  'Crane / Rigging Operator',
  'Unskilled Helper',
  'Supervisor / Site Engineer',
  'Other'
];

export const ID_TYPES = [
  'Govt ID / Aadhaar',
  'Voter ID',
  'Driving License',
  'Passport'
];

export const CAMPS = [
  'Gondwana Phase 3',
  'Gondwana Phase 4'
];

export const BLOCKS = ['Block A', 'Block B', 'Block C', 'Block D'];

export const SAFETY_TOPICS = [
  'General Site Rules & Hazardous Zones',
  'Mandatory Daily Biometric Face Punch (No Punch = No Pay)',
  'Zero-Tolerance Alcohol & Substance Prohibition',
  'PPE Usage, Inspection & Maintenance Standards',
  'Work at Height & Double Lanyard Safety Harness Rules',
  'Electrical, Heavy Equipment & Machinery Safety',
  'Emergency Evacuation Sirens & First Aid Protocols'
];

export const PPE_ITEMS = [
  { id: 'helmet', label: 'Safety Helmet (with chin strap secured)' },
  { id: 'jacket', label: 'High-Visibility Reflective Jacket' },
  { id: 'shoes', label: 'Safety Shoes (Steel toe protection)' },
  { id: 'gloves', label: 'Safety Gloves (Task-specific rubber/leather)' },
  { id: 'goggles', label: 'Safety Goggles / Face Shield' },
  { id: 'harness', label: 'Full-Body Safety Harness (Double lanyard)' },
  { id: 'earplugs', label: 'Ear Plugs / N95 Dust Mask' },
  { id: 'other_site', label: 'Site-Specific Specialized PPE' }
];

export const CONTRACTORS = [
  { name: 'L&T Construction Heavy Civil', license: 'LIC-MH-2024-8841' },
  { name: 'Shapoorji Pallonji Infra Ltd', license: 'LIC-MH-2023-4102' },
  { name: 'Tata Projects Engineering', license: 'LIC-MH-2025-1940' },
  { name: 'Afcons Infrastructure Projects', license: 'LIC-MH-2024-5519' },
  { name: 'Gondwana Allied Engineering', license: 'LIC-MH-2026-0044' }
];

export const DEFAULT_DROPDOWN_MASTERS = {
  trades: TRADES,
  idTypes: ID_TYPES,
  genders: [
    { value: 'M', label: 'Male (M)' },
    { value: 'F', label: 'Female (F)' },
    { value: 'O', label: 'Other (O)' }
  ],
  bloodGroups: ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-', 'Not Done'],
  visionTests: [
    { value: 'Normal', label: 'Normal (6/6 or with corrective lenses)' },
    { value: 'Impaired', label: 'Impaired (Deficient visual acuity)' }
  ],
  hearingTests: [
    { value: 'Normal', label: 'Normal Bilateral Hearing' },
    { value: 'Impaired', label: 'Impaired / Partial Deafness' }
  ],
  vertigoTests: [
    { value: 'Fit', label: 'Fit (No Acrophobia/Dizziness)' },
    { value: 'Unfit', label: 'Unfit (Vertigo Symptoms Present)' },
    { value: 'N/A', label: 'Not Applicable (Ground Trade Only)' }
  ],
  safetyTopics: SAFETY_TOPICS,
  ppeItems: PPE_ITEMS,
  camps: CAMPS,
  blocks: BLOCKS,
  beds: [
    { value: 'Bed 1', label: 'Bed 1 (Lower Bunk)' },
    { value: 'Bed 2', label: 'Bed 2 (Upper Bunk)' },
    { value: 'Bed 3', label: 'Bed 3 (Lower Bunk)' },
    { value: 'Bed 4', label: 'Bed 4 (Upper Bunk)' }
  ],
  contractorDepartments: ['Civil', 'Mechanical', 'Electrical', 'Other']
};

export const mergeDropdownMasters = (raw) => {
  const incoming = raw && typeof raw === 'object' ? raw : {};
  const result = {};
  Object.keys(DEFAULT_DROPDOWN_MASTERS).forEach((key) => {
    const val = incoming[key];
    result[key] = Array.isArray(val) && val.length > 0 ? val : DEFAULT_DROPDOWN_MASTERS[key];
  });
  return result;
};
