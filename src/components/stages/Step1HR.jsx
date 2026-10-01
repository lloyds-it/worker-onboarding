import React, { useState } from 'react';
import { User, Briefcase, Phone, AlertCircle, CheckCircle2, MapPin, Building2, Wrench } from 'lucide-react';
import { TRADES, ID_TYPES, CONTRACTORS } from '../../types/constants';
import { validateHRStep, calculateAge } from '../../services/validationService';
import { WorkerPhotoUpload } from '../common/WorkerPhotoUpload';

export const Step1HR = ({ initialData, onSave, isReadOnly }) => {
  const [formData, setFormData] = useState({
    fullName: initialData?.fullName || '',
    fatherHusbandName: initialData?.fatherHusbandName || '',
    dob: initialData?.dob || '',
    age: initialData?.age || (initialData?.dob ? calculateAge(initialData.dob) : ''),
    gender: initialData?.gender || 'M',
    mobileNumber: initialData?.mobileNumber || '',
    idProofType: initialData?.idProofType || ID_TYPES[0],
    idProofRef: initialData?.idProofRef || '',
    contractorName: initialData?.contractorName || CONTRACTORS[0].name,
    contractorLicense: initialData?.contractorLicense || CONTRACTORS[0].license,
    trade: initialData?.trade || TRADES[0],
    photo: initialData?.photo || '',
    address: initialData?.address || '',
    workingLocation: initialData?.workingLocation || 'LLOYDS METALS AND ENERGY LIMITED HEDRI',
    activity: initialData?.activity || (initialData?.trade ? `${initialData.trade} & Structural Work` : 'Welding & Structural Fabrication'),
    emergencyPerson: initialData?.emergencyPerson || '',
    emergencyRelationship: initialData?.emergencyRelationship || '',
    emergencyMobile: initialData?.emergencyMobile || ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        fullName: initialData?.fullName || '',
        fatherHusbandName: initialData?.fatherHusbandName || '',
        dob: initialData?.dob || '',
        age: initialData?.age || (initialData?.dob ? calculateAge(initialData.dob) : ''),
        gender: initialData?.gender || 'M',
        mobileNumber: initialData?.mobileNumber || '',
        idProofType: initialData?.idProofType || ID_TYPES[0],
        idProofRef: initialData?.idProofRef || '',
        contractorName: initialData?.contractorName || CONTRACTORS[0].name,
        contractorLicense: initialData?.contractorLicense || CONTRACTORS[0].license,
        trade: initialData?.trade || TRADES[0],
        photo: initialData?.photo || '',
        address: initialData?.address || '',
        workingLocation: initialData?.workingLocation || 'LLOYDS METALS AND ENERGY LIMITED HEDRI',
        activity: initialData?.activity || (initialData?.trade ? `${initialData.trade} & Structural Work` : 'Welding & Structural Fabrication'),
        emergencyPerson: initialData?.emergencyPerson || '',
        emergencyRelationship: initialData?.emergencyRelationship || '',
        emergencyMobile: initialData?.emergencyMobile || ''
      });
      setErrors({});
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    if (isReadOnly) return;
    const next = { ...formData, [field]: value };
    if (field === 'dob') {
      next.age = calculateAge(value);
    }
    if (field === 'contractorName') {
      const match = CONTRACTORS.find(c => c.name === value);
      if (match) next.contractorLicense = match.license;
    }
    if (field === 'trade' && !formData.activity) {
      next.activity = `${value} & Plant Operations`;
    }
    setFormData(next);
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleSubmit = (e) => {
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
    onSave(formData);
    setTimeout(() => {
      setIsSubmitting(false);
    }, 2500);
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
            Father's / Husband's Name <span className="required">*</span>
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
            Date of Birth <span className="required">*</span>
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
            Gender <span className="required">*</span>
          </label>
          <select
            id="worker-gender"
            className="form-select"
            value={formData.gender}
            onChange={(e) => handleChange('gender', e.target.value)}
            disabled={isReadOnly}
          >
            <option value="M">Male (M)</option>
            <option value="F">Female (F)</option>
            <option value="O">Other (O)</option>
          </select>
        </div>

        {/* Mobile Number */}
        <div className="form-group">
          <label htmlFor="worker-mobile">
            Mobile Number (10 Digits) <span className="required">*</span>
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
            Government ID Type <span className="required">*</span>
          </label>
          <select
            id="worker-id-type"
            className="form-select"
            value={formData.idProofType}
            onChange={(e) => handleChange('idProofType', e.target.value)}
            disabled={isReadOnly}
          >
            {ID_TYPES.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        {/* ID Proof Reference */}
        <div className="form-group">
          <label htmlFor="worker-id-ref">
            ID Proof Reference No. <span className="required">*</span>
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
            Contractor / Agency <span className="required">*</span>
          </label>
          <select
            id="contractor-name"
            className="form-select"
            value={formData.contractorName}
            onChange={(e) => handleChange('contractorName', e.target.value)}
            disabled={isReadOnly}
          >
            {CONTRACTORS.map(c => (
              <option key={c.name} value={c.name}>{c.name}</option>
            ))}
          </select>
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
          <select
            id="worker-trade"
            className="form-select"
            value={formData.trade}
            onChange={(e) => handleChange('trade', e.target.value)}
            disabled={isReadOnly}
          >
            {TRADES.map(trade => (
              <option key={trade} value={trade}>{trade}</option>
            ))}
          </select>
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
            <label htmlFor="emergency-person">Contact Person Name <span className="required">*</span></label>
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
            <label htmlFor="emergency-rel">Relationship <span className="required">*</span></label>
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
            <label htmlFor="emergency-mobile">Emergency Mobile <span className="required">*</span></label>
            <input
              id="emergency-mobile"
              type="tel"
              maxLength={10}
              className={`form-input ${errors.emergencyMobile ? 'error' : ''}`}
              placeholder="e.g. 9765432109"
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
