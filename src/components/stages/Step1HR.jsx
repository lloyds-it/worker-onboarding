import React, { useState, useRef, useMemo, useEffect } from 'react';
import { User, Briefcase, Phone, AlertCircle, CheckCircle2, MapPin, Building2, Wrench, RefreshCw, BadgeCheck } from 'lucide-react';
import { TRADES, ID_TYPES } from '../../types/constants';
import { validateHRStep, calculateAge, generateEmployeeId, DEFAULT_LOCATION_CODE } from '../../services/validationService';
import { useWorkers } from '../../context/WorkerContext';
import { WorkerPhotoUpload } from '../common/WorkerPhotoUpload';
import { SearchableSelect } from '../common/SearchableSelect';

export const Step1HR = ({ initialData, onSave, isReadOnly }) => {
  const { workers = [], contractors = [], locations = [], dropdownMasters = {} } = useWorkers();

  const idTypeOptions = useMemo(() => {
    const base = Array.isArray(dropdownMasters?.idTypes) && dropdownMasters.idTypes.length > 0 ? dropdownMasters.idTypes : ID_TYPES;
    return initialData?.idProofType && !base.includes(initialData.idProofType) ? [...base, initialData.idProofType] : base;
  }, [dropdownMasters, initialData]);

  const tradeOptions = useMemo(() => {
    const base = Array.isArray(dropdownMasters?.trades) && dropdownMasters.trades.length > 0 ? dropdownMasters.trades : TRADES;
    return initialData?.trade && !base.includes(initialData.trade) ? [...base, initialData.trade] : base;
  }, [dropdownMasters, initialData]);

  const genderOptions = useMemo(() => {
    const base = Array.isArray(dropdownMasters?.genders) && dropdownMasters.genders.length > 0
      ? dropdownMasters.genders
      : [{ value: 'M', label: 'Male (M)' }, { value: 'F', label: 'Female (F)' }, { value: 'O', label: 'Other (O)' }];
    return initialData?.gender && !base.some(g => g.value === initialData.gender)
      ? [...base, { value: initialData.gender, label: initialData.gender }]
      : base;
  }, [dropdownMasters, initialData]);

  const availableLocations = useMemo(() => {
    const activeLocs = (locations || []).filter(l => l && l.locationCode && l.status !== 'INACTIVE');
    const code = initialData?.locationCode;
    if (code && !activeLocs.some(l => l.locationCode === code)) {
      return [
        ...activeLocs,
        {
          id: `LOC-LEGACY-${code}`,
          locationCode: code,
          locationName: initialData?.locationName || `Location ${code}`,
          status: 'ACTIVE'
        }
      ];
    }
    return activeLocs;
  }, [locations, initialData]);

  const resolveLocationName = (locCode, fallbackName = '') => {
    const matched = availableLocations.find(l => l.locationCode === locCode);
    return matched?.locationName || fallbackName || '';
  };

  const availableContractors = useMemo(() => {
    const active = contractors.filter(c => c && c.companyName && c.status === 'ACTIVE');
    if (
      initialData?.contractorName &&
      !active.some(c => c.companyName === initialData.contractorName)
    ) {
      return [
        ...active,
        {
          id: 'LEGACY',
          companyName: initialData.contractorName,
          contractorCode: initialData.contractorCode || '',
          locationCode: initialData.locationCode || DEFAULT_LOCATION_CODE,
          locationName: initialData.locationName || '',
          licenseNo: initialData.contractorLicense || ''
        }
      ];
    }
    return active;
  }, [contractors, initialData]);

  const initialContractor = availableContractors[0];
  const initialContractorCode = initialData?.contractorCode || initialContractor?.contractorCode || '';
  const initialLocationCode = initialData?.locationCode || initialContractor?.locationCode || availableLocations[0]?.locationCode || DEFAULT_LOCATION_CODE;

  const [isIdManuallyEdited, setIsIdManuallyEdited] = useState(Boolean(initialData?.assignedWorkerId));
  const [isEmergencySynced, setIsEmergencySynced] = useState(() => {
    if (!initialData) return true;
    const mob = (initialData.mobileNumber || '').trim();
    const em = (initialData.emergencyMobile || '').trim();
    return !em || em === mob;
  });

  const buildInitialForm = (data) => {
    const code = data?.contractorCode || initialContractor?.contractorCode || '';
    const loc = data?.locationCode || initialContractor?.locationCode || availableLocations[0]?.locationCode || DEFAULT_LOCATION_CODE;
    const locName = data?.locationName || resolveLocationName(loc, initialContractor?.locationName || '');
    const mob = data?.mobileNumber || '';
    return {
      assignedWorkerId: data?.assignedWorkerId || generateEmployeeId(workers, code, loc),
      fullName: data?.fullName || '',
      fatherHusbandName: data?.fatherHusbandName || '',
      dob: data?.dob || '',
      age: data?.age || (data?.dob ? calculateAge(data.dob) : ''),
      gender: data?.gender || genderOptions[0]?.value || 'M',
      mobileNumber: mob,
      idProofType: data?.idProofType || idTypeOptions[0] || ID_TYPES[0],
      idProofRef: data?.idProofRef || '',
      contractorName: data?.contractorName || initialContractor?.companyName || '',
      contractorCode: code,
      locationCode: loc,
      locationName: locName,
      contractorLicense: data?.contractorLicense || initialContractor?.licenseNo || '',
      trade: data?.trade || tradeOptions[0] || TRADES[0],
      photo: data?.photo || '',
      address: data?.address || '',
      workingLocation: data?.workingLocation || locName || 'LLOYDS METALS AND ENERGY LIMITED HEDRI',
      activity: data?.activity || (data?.trade ? `${data.trade} & Structural Work` : 'Welding & Structural Fabrication'),
      emergencyPerson: data?.emergencyPerson || '',
      emergencyRelationship: data?.emergencyRelationship || '',
      emergencyMobile: data?.emergencyMobile || mob
    };
  };

  const [formData, setFormData] = useState(() => buildInitialForm(initialData));

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDirtyRef = useRef(false);
  const lastInitialJsonRef = useRef(JSON.stringify(initialData || null));

  useEffect(() => {
    const serialized = JSON.stringify(initialData || null);
    if (serialized === lastInitialJsonRef.current) return;
    lastInitialJsonRef.current = serialized;
    if (isDirtyRef.current) return;
    if (initialData) {
      setIsIdManuallyEdited(Boolean(initialData?.assignedWorkerId));
      const mob = (initialData.mobileNumber || '').trim();
      const em = (initialData.emergencyMobile || '').trim();
      setIsEmergencySynced(!em || em === mob);
      setFormData(buildInitialForm(initialData));
      setErrors({});
    }
  }, [initialData]);

  // Keep selected contractor & auto-generated Employee Code synced with live Contractor & Location Masters
  useEffect(() => {
    if (initialData) return;
    setFormData(prev => {
      if (isDirtyRef.current && prev.contractorName) return prev;
      const matched = (prev.contractorName && availableContractors.find(c => c.companyName === prev.contractorName)) || availableContractors[0];
      if (!matched) return prev;

      const nextName = matched.companyName || '';
      const nextCode = matched.contractorCode || '';
      const nextLicense = matched.licenseNo || '';
      const nextLocation = prev.contractorName === nextName && prev.locationCode
        ? prev.locationCode
        : (matched.locationCode || availableLocations[0]?.locationCode || DEFAULT_LOCATION_CODE);
      const nextLocationName = resolveLocationName(nextLocation, matched.locationName || '');
      const nextEmployeeId = !isIdManuallyEdited
        ? generateEmployeeId(workers, nextCode, nextLocation)
        : prev.assignedWorkerId;

      if (
        prev.contractorName === nextName &&
        prev.contractorCode === nextCode &&
        prev.contractorLicense === nextLicense &&
        prev.locationCode === nextLocation &&
        prev.locationName === nextLocationName &&
        prev.assignedWorkerId === nextEmployeeId
      ) {
        return prev;
      }

      return {
        ...prev,
        contractorName: nextName,
        contractorCode: nextCode,
        contractorLicense: nextLicense,
        locationCode: nextLocation,
        locationName: nextLocationName,
        assignedWorkerId: nextEmployeeId
      };
    });
  }, [availableContractors, availableLocations, initialData, isIdManuallyEdited, workers]);

  const handleChange = (field, value) => {
    if (isReadOnly) return;
    isDirtyRef.current = true;
    const normalizedValue = (field === 'assignedWorkerId' || field === 'locationCode')
      ? value.toUpperCase()
      : value;

    setFormData(prev => {
      const next = { ...prev, [field]: normalizedValue };
      if (field === 'dob') {
        next.age = calculateAge(value);
      }
      if (field === 'assignedWorkerId') {
        setIsIdManuallyEdited(true);
      }
      if (field === 'mobileNumber' && isEmergencySynced) {
        next.emergencyMobile = normalizedValue;
      }
      if (field === 'emergencyMobile') {
        if (!normalizedValue) {
          setIsEmergencySynced(true);
          next.emergencyMobile = prev.mobileNumber;
        } else {
          setIsEmergencySynced(normalizedValue === prev.mobileNumber);
        }
      }
      if (field === 'contractorName') {
        const match = availableContractors.find(c => c.companyName === value);
        next.contractorCode = match ? (match.contractorCode || '') : '';
        next.contractorLicense = match ? (match.licenseNo || '') : '';
        next.locationCode = match ? (match.locationCode || availableLocations[0]?.locationCode || DEFAULT_LOCATION_CODE) : DEFAULT_LOCATION_CODE;
        next.locationName = resolveLocationName(next.locationCode, match?.locationName || '');
        if (!initialData && !isIdManuallyEdited) {
          next.assignedWorkerId = generateEmployeeId(workers, next.contractorCode, next.locationCode);
        }
      }
      if (field === 'locationCode') {
        next.locationName = resolveLocationName(normalizedValue, '');
        if (next.locationName && (!prev.workingLocation || prev.workingLocation === prev.locationName)) {
          next.workingLocation = next.locationName;
        }
        if (!initialData && !isIdManuallyEdited) {
          next.assignedWorkerId = generateEmployeeId(workers, next.contractorCode, normalizedValue);
        }
      }
      if (field === 'trade' && !prev.activity) {
        next.activity = `${value} & Plant Operations`;
      }
      return next;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly || isSubmitting) return;

    const validation = validateHRStep(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      const firstErrorEl = document.querySelector('.form-input.error');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }
    setIsSubmitting(true);
    isDirtyRef.current = false;
    try {
      await onSave(formData);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="form-card" style={{ marginBottom: 0 }}>
      <div className="form-section-header">
        <h3>
          <User size={20} color="var(--brand-primary)" />
          <span>Step 1: HR & Worker Personal Registration</span>
        </h3>
        {isReadOnly && (
          <span className="badge badge-info">Read-Only Mode (Completed by HR)</span>
        )}
      </div>

      {Object.keys(errors).length > 0 && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.08)',
          border: '1px solid var(--danger-solid, #EF4444)',
          borderRadius: '8px',
          padding: '0.85rem 1rem',
          marginBottom: '1.25rem',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem'
        }}>
          <AlertCircle size={20} color="var(--danger-solid, #EF4444)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--danger-solid, #EF4444)', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
              Please correct the following {Object.keys(errors).length} required field(s):
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {Object.entries(errors).map(([field, msg]) => (
                <li key={field} style={{ marginBottom: '2px' }}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Worker Image Upload Section (Required for ID Card / Gate Pass) */}
      <WorkerPhotoUpload
        photo={formData.photo}
        onChange={(photoDataUrl) => handleChange('photo', photoDataUrl)}
        isReadOnly={isReadOnly}
        label="Worker Portrait Photograph (Official Gate Pass ID Card)"
      />

      <div className="form-grid">
        {/* Employee ID (Created at HR Start Page) */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="worker-employee-id" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <BadgeCheck size={15} color="var(--brand-primary)" />
            <span>Employee ID (Assigned at HR Intake) <span className="required">*</span></span>
          </label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="worker-employee-id"
              type="text"
              className={`form-input ${errors.assignedWorkerId ? 'error' : ''}`}
              placeholder="e.g. GRY1001150001"
              value={formData.assignedWorkerId}
              onChange={(e) => handleChange('assignedWorkerId', e.target.value)}
              disabled={isReadOnly}
              style={{
                fontFamily: 'var(--font-family-mono)',
                fontWeight: 800,
                letterSpacing: '0.03em',
                color: 'var(--brand-primary)'
              }}
            />
            {!isReadOnly && (
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setIsIdManuallyEdited(false);
                  const nextId = generateEmployeeId(workers, formData.contractorCode, formData.locationCode);
                  setFormData(prev => ({ ...prev, assignedWorkerId: nextId }));
                }}
                title="Generate next sequential Employee ID"
                style={{ whiteSpace: 'nowrap', padding: '0.55rem 0.85rem' }}
              >
                <RefreshCw size={14} />
                <span>Regenerate ID</span>
              </button>
            )}
          </div>
          {errors.assignedWorkerId && <span className="error-text">{errors.assignedWorkerId}</span>}
        </div>

        {/* Worker Full Name */}
        <div className="form-group">
          <label htmlFor="worker-full-name">
            Worker Full Name <span className="required">*</span>
          </label>
          <input
            id="worker-full-name"
            type="text"
            className={`form-input ${errors.fullName ? 'error' : ''}`}
            placeholder="e.g. Rajeshwar Kumar Gond"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            disabled={isReadOnly}
          />
          {errors.fullName && <span className="error-text">{errors.fullName}</span>}
        </div>

        {/* Father/Husband Name */}
        <div className="form-group">
          <label htmlFor="father-husband-name">
            Father's / Husband's Name
          </label>
          <input
            id="father-husband-name"
            type="text"
            className={`form-input ${errors.fatherHusbandName ? 'error' : ''}`}
            placeholder="e.g. Sohan Lal Gond"
            value={formData.fatherHusbandName}
            onChange={(e) => handleChange('fatherHusbandName', e.target.value)}
            disabled={isReadOnly}
          />
          {errors.fatherHusbandName && <span className="error-text">{errors.fatherHusbandName}</span>}
        </div>

        {/* DOB & Age */}
        <div className="form-group">
          <label htmlFor="worker-dob">
            Date of Birth
          </label>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <input
              id="worker-dob"
              type="date"
              className={`form-input ${errors.dob ? 'error' : ''}`}
              value={formData.dob}
              onChange={(e) => handleChange('dob', e.target.value)}
              disabled={isReadOnly}
              style={{ flex: 2 }}
            />
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'var(--bg-surface-subtle)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-medium)',
              fontSize: '0.85rem',
              fontWeight: 700,
              color: 'var(--text-secondary)'
            }}>
              {formData.age ? `${formData.age} yrs` : 'Age'}
            </div>
          </div>
          {errors.dob && <span className="error-text">{errors.dob}</span>}
        </div>

        {/* Gender */}
        <div className="form-group">
          <label htmlFor="worker-gender">
            Gender
          </label>
          <SearchableSelect
            id="worker-gender"
            className="form-select"
            value={formData.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            disabled={isReadOnly}
          >
            {genderOptions.map(g => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </SearchableSelect>
        </div>

        {/* Mobile Number */}
        <div className="form-group">
          <label htmlFor="worker-mobile">
            Mobile Number (10 Digits)
          </label>
          <input
            id="worker-mobile"
            type="tel"
            maxLength={10}
            className={`form-input ${errors.mobileNumber ? 'error' : ''}`}
            placeholder="e.g. 9823456712"
            value={formData.mobileNumber}
            onChange={(e) => handleChange('mobileNumber', e.target.value.replace(/\D/g, ''))}
            disabled={isReadOnly}
          />
          {errors.mobileNumber && <span className="error-text">{errors.mobileNumber}</span>}
        </div>

        {/* ID Proof Type */}
        <div className="form-group">
          <label htmlFor="worker-id-type">
            Government ID Type
          </label>
          <SearchableSelect
            id="worker-id-type"
            className="form-select"
            value={formData.idProofType}
            onChange={(e) => handleChange('idProofType', e.target.value)}
            disabled={isReadOnly}
          >
            {idTypeOptions.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </SearchableSelect>
        </div>

        {/* ID Proof Reference */}
        <div className="form-group">
          <label htmlFor="worker-id-ref">
            ID Proof Reference No.
          </label>
          <input
            id="worker-id-ref"
            type="text"
            className={`form-input ${errors.idProofRef ? 'error' : ''}`}
            placeholder="e.g. 8821 4452 9012"
            value={formData.idProofRef}
            onChange={(e) => handleChange('idProofRef', e.target.value)}
            disabled={isReadOnly}
          />
          {errors.idProofRef && <span className="error-text">{errors.idProofRef}</span>}
        </div>

        {/* Contractor Name */}
        <div className="form-group">
          <label htmlFor="contractor-name">
            Contractor / Agency
          </label>
          <SearchableSelect
            id="contractor-name"
            className={`form-select ${errors.contractorName ? 'error' : ''}`}
            value={formData.contractorName}
            onChange={(e) => handleChange('contractorName', e.target.value)}
            disabled={isReadOnly}
            searchPlaceholder="Search contractor code or name..."
          >
            {availableContractors.length === 0 ? (
              <option value="">-- No Active Contractors (Add in Contractor Master) --</option>
            ) : (
              availableContractors.map(c => (
                <option key={c.id || c.companyName} value={c.companyName}>
                  {c.contractorCode ? `${c.contractorCode} — ${c.companyName}` : c.companyName}
                </option>
              ))
            )}
          </SearchableSelect>
          {errors.contractorName && <span className="error-text">{errors.contractorName}</span>}
        </div>

        {/* Contractor Code */}
        <div className="form-group">
          <label htmlFor="contractor-code">Contractor Code</label>
          <input
            id="contractor-code"
            type="text"
            className="form-input"
            value={formData.contractorCode || ''}
            readOnly
            placeholder="Auto-filled from Contractor Master"
            style={{ backgroundColor: 'var(--bg-surface-subtle)' }}
          />
        </div>

        {/* Location Code & Location Name Dropdown */}
        <div className="form-group">
          <label htmlFor="worker-location-code">
            Location Code &amp; Name <span className="required">*</span>
          </label>
          <SearchableSelect
            id="worker-location-code"
            className="form-select"
            value={formData.locationCode || DEFAULT_LOCATION_CODE}
            onChange={(e) => handleChange('locationCode', e.target.value)}
            disabled={isReadOnly}
            style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 700 }}
            searchPlaceholder="Search location code or name..."
          >
            {availableLocations.map(loc => (
              <option key={loc.id || loc.locationCode} value={loc.locationCode}>
                {loc.locationCode} — {loc.locationName}
              </option>
            ))}
          </SearchableSelect>
        </div>

        {/* Contractor License */}
        <div className="form-group">
          <label htmlFor="contractor-license">Contractor License No.</label>
          <input
            id="contractor-license"
            type="text"
            className="form-input"
            value={formData.contractorLicense}
            readOnly
            style={{ backgroundColor: 'var(--bg-surface-subtle)' }}
          />
        </div>

        {/* Trade Category */}
        <div className="form-group">
          <label htmlFor="worker-trade">
            Trade / Skill Category <span className="required">*</span>
          </label>
          <SearchableSelect
            id="worker-trade"
            className="form-select"
            value={formData.trade}
            onChange={(e) => handleChange('trade', e.target.value)}
            disabled={isReadOnly}
            searchPlaceholder="Search trade..."
          >
            {tradeOptions.map(trade => (
              <option key={trade} value={trade}>{trade}</option>
            ))}
          </SearchableSelect>
        </div>

        {/* Working Location (Printed on Gate Pass ID Card) */}
        <div className="form-group">
          <label htmlFor="worker-location">
            Working Location (Plant Area)
          </label>
          <input
            id="worker-location"
            type="text"
            className="form-input"
            placeholder="e.g. LLOYDS METALS AND ENERGY LIMITED HEDRI"
            value={formData.workingLocation}
            onChange={(e) => handleChange('workingLocation', e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        {/* Specific Activity (Printed on Gate Pass ID Card) */}
        <div className="form-group">
          <label htmlFor="worker-activity">
            Activity / Task Nature
          </label>
          <input
            id="worker-activity"
            type="text"
            className="form-input"
            placeholder="e.g. Welding & Structural Fabrication"
            value={formData.activity}
            onChange={(e) => handleChange('activity', e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        {/* Worker Residential Address (Printed on Back of Gate Pass ID Card) */}
        <div className="form-group" style={{ gridColumn: '1 / -1' }}>
          <label htmlFor="worker-address">
            Worker Permanent / Residential Address (Printed on Back of ID Card)
          </label>
          <input
            id="worker-address"
            type="text"
            className="form-input"
            placeholder="e.g. At Post Konsari, Tahsil Chamorshi, Dist: Gadchiroli, Maharashtra - 442603"
            value={formData.address}
            onChange={(e) => handleChange('address', e.target.value)}
            disabled={isReadOnly}
          />
        </div>
      </div>

      <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
        <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Emergency Contact Information
        </h4>
        <div className="form-grid">
          <div className="form-group">
            <label htmlFor="emergency-person">Contact Person Name</label>
            <input
              id="emergency-person"
              type="text"
              className={`form-input ${errors.emergencyPerson ? 'error' : ''}`}
              placeholder="e.g. Sunita Gond"
              value={formData.emergencyPerson}
              onChange={(e) => handleChange('emergencyPerson', e.target.value)}
              disabled={isReadOnly}
            />
            {errors.emergencyPerson && <span className="error-text">{errors.emergencyPerson}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="emergency-rel">Relationship</label>
            <input
              id="emergency-rel"
              type="text"
              className={`form-input ${errors.emergencyRelationship ? 'error' : ''}`}
              placeholder="e.g. Wife / Father / Brother"
              value={formData.emergencyRelationship}
              onChange={(e) => handleChange('emergencyRelationship', e.target.value)}
              disabled={isReadOnly}
            />
            {errors.emergencyRelationship && <span className="error-text">{errors.emergencyRelationship}</span>}
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="emergency-mobile" style={{ marginBottom: 0 }}>
                Emergency Mobile
              </label>
              {!isReadOnly && (
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.72rem', fontWeight: 600, color: 'var(--brand-primary)', cursor: 'pointer', marginBottom: 0 }}>
                  <input
                    type="checkbox"
                    checked={isEmergencySynced}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setIsEmergencySynced(checked);
                      if (checked) {
                        setFormData(prev => ({ ...prev, emergencyMobile: prev.mobileNumber }));
                      }
                    }}
                  />
                  <span>Same as Mobile</span>
                </label>
              )}
            </div>
            <input
              id="emergency-mobile"
              type="tel"
              maxLength={10}
              className={`form-input ${errors.emergencyMobile ? 'error' : ''}`}
              placeholder="Auto-filled from Mobile Number"
              value={formData.emergencyMobile}
              onChange={(e) => handleChange('emergencyMobile', e.target.value.replace(/\D/g, ''))}
              disabled={isReadOnly}
            />
            {errors.emergencyMobile && <span className="error-text">{errors.emergencyMobile}</span>}
          </div>
        </div>
      </div>

      {!isReadOnly && (
        <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          {Object.keys(errors).length > 0 && (
            <div style={{ color: 'var(--danger-solid, #EF4444)', fontSize: '0.82rem', fontWeight: 600 }}>
              * Please resolve the required fields above before routing to Medical Team.
            </div>
          )}
          <button id="btn-save-step1" type="submit" disabled={isSubmitting} className="btn btn-primary">
            <span>{isSubmitting ? 'Routing Candidate...' : 'Save & Route to Medical Team'}</span>
            <CheckCircle2 size={16} />
          </button>
        </div>
      )}
    </form>
  );
};
