import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Stethoscope, AlertTriangle, CheckCircle2, XCircle, HeartPulse, ShieldAlert, PauseCircle, CalendarClock, History } from 'lucide-react';
import { validateMedicalStep, calculateBMI, addDaysToIsoDate, formatTimestamp, getMedicalFitnessMeta } from '../../services/validationService';
import { useAuth } from '../../context/AuthContext';
import { useWorkers } from '../../context/WorkerContext';
import { DEFAULT_DROPDOWN_MASTERS } from '../../types/constants';
import { SearchableSelect } from '../common/SearchableSelect';

export const Step2Medical = ({ initialData, onSave, isReadOnly }) => {
  const { currentUser } = useAuth();
  const { dropdownMasters = {} } = useWorkers();

  const bloodGroupOptions = useMemo(() => {
    const base = dropdownMasters?.bloodGroups?.length ? dropdownMasters.bloodGroups : DEFAULT_DROPDOWN_MASTERS.bloodGroups;
    return initialData?.bloodGroup && !base.includes(initialData.bloodGroup) ? [...base, initialData.bloodGroup] : base;
  }, [dropdownMasters, initialData]);

  const visionOptions = useMemo(() => {
    const base = dropdownMasters?.visionTests?.length ? dropdownMasters.visionTests : DEFAULT_DROPDOWN_MASTERS.visionTests;
    return initialData?.visionTest && !base.some(v => v.value === initialData.visionTest)
      ? [...base, { value: initialData.visionTest, label: initialData.visionTest }]
      : base;
  }, [dropdownMasters, initialData]);

  const hearingOptions = useMemo(() => {
    const base = dropdownMasters?.hearingTests?.length ? dropdownMasters.hearingTests : DEFAULT_DROPDOWN_MASTERS.hearingTests;
    return initialData?.hearingTest && !base.some(h => h.value === initialData.hearingTest)
      ? [...base, { value: initialData.hearingTest, label: initialData.hearingTest }]
      : base;
  }, [dropdownMasters, initialData]);

  const vertigoOptions = useMemo(() => {
    const base = dropdownMasters?.vertigoTests?.length ? dropdownMasters.vertigoTests : DEFAULT_DROPDOWN_MASTERS.vertigoTests;
    return initialData?.vertigoTest && !base.some(v => v.value === initialData.vertigoTest)
      ? [...base, { value: initialData.vertigoTest, label: initialData.vertigoTest }]
      : base;
  }, [dropdownMasters, initialData]);

  const loggedInExaminer = currentUser?.name
    ? `${currentUser.name}${currentUser.designation ? ` (${currentUser.designation})` : ''}`
    : '';

  const buildInitialForm = (data, examiner) => {
    const defaultFollowUpDays = data?.followUpDays ? String(data.followUpDays) : '7';
    return {
      bloodGroup: data?.bloodGroup || 'B+',
      heightCm: data?.heightCm || '',
      weightKg: data?.weightKg || '',
      bmi: data?.bmi || '',
      bmiCategory: data?.bmiCategory || '',
      bpSystolic: data?.bpSystolic || '120',
      bpDiastolic: data?.bpDiastolic || '80',
      spo2: data?.spo2 || '98',
      pulseRate: data?.pulseRate || '72',
      respirationRate: data?.respirationRate || '16',
      rbs: data?.rbs || '100',
      alcoholTest: data?.alcoholTest || 'Pass',
      visionTest: data?.visionTest || 'Normal',
      hearingTest: data?.hearingTest || 'Normal',
      vertigoTest: data?.vertigoTest || 'Fit',
      existingIllness: data?.existingIllness || 'No',
      fitnessStatus: data?.fitnessStatus || 'FIT',
      followUpDays: defaultFollowUpDays,
      followUpDate: data?.followUpDate || addDaysToIsoDate(defaultFollowUpDays),
      examinerName: data?.examinerName || examiner,
      remarks: data?.remarks || 'Fit for heavy industrial plant work.'
    };
  };

  const [formData, setFormData] = useState(() => buildInitialForm(initialData, loggedInExaminer));
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isDirtyRef = useRef(false);
  const lastInitialJsonRef = useRef(JSON.stringify(initialData || null));
  const formRef = useRef(null);

  const priorMedicalHistory = Array.isArray(initialData?.history) ? initialData.history : [];
  const hasPreviousExam = Boolean(initialData?.fitnessStatus);

  useEffect(() => {
    const serialized = JSON.stringify(initialData || null);
    if (serialized === lastInitialJsonRef.current) return;
    lastInitialJsonRef.current = serialized;
    if (isDirtyRef.current) return;
    if (initialData) {
      setFormData(buildInitialForm(initialData, loggedInExaminer));
      setErrors({});
    }
  }, [initialData, loggedInExaminer]);

  useEffect(() => {
    if (!initialData?.examinerName && loggedInExaminer && !isDirtyRef.current) {
      setFormData(prev => (prev.examinerName ? prev : { ...prev, examinerName: loggedInExaminer }));
    }
  }, [loggedInExaminer, initialData]);

  const handleVitalChange = (field, val) => {
    if (isReadOnly) return;
    isDirtyRef.current = true;
    setFormData(prev => {
      const next = { ...prev, [field]: val };

      if (field === 'heightCm' || field === 'weightKg') {
        const h = field === 'heightCm' ? val : prev.heightCm;
        const w = field === 'weightKg' ? val : prev.weightKg;
        const res = calculateBMI(h, w);
        next.bmi = res.bmi;
        next.bmiCategory = res.category;
      }

      if (field === 'followUpDays') {
        next.followUpDate = addDaysToIsoDate(val);
      }

      if (field === 'fitnessStatus') {
        if (val === 'FIT_WITH_FOLLOW_UP') {
          const days = prev.followUpDays || '7';
          next.followUpDays = days;
          next.followUpDate = addDaysToIsoDate(days);
        }
        if (val !== 'FIT' && prevRemarksIsDefaultFit(prev.remarks)) {
          next.remarks = '';
        } else if (val === 'FIT' && !prev.remarks?.trim()) {
          next.remarks = 'Fit for heavy industrial plant work.';
        }
      }

      return next;
    });
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  // Move pointer sequentially to the next entry block when Enter is pressed inside an input/select
  const handleFormKeyDown = (e) => {
    if (e.key !== 'Enter') return;
    if (e.target?.classList?.contains('searchable-select-search')) return;
    const tag = e.target?.tagName;
    if (tag === 'TEXTAREA' || e.target?.type === 'submit' || (tag === 'BUTTON' && !e.target?.classList?.contains('searchable-select-trigger'))) return;
    e.preventDefault();
    const container = formRef.current;
    if (!container) return;
    const focusables = Array.from(
      container.querySelectorAll('input:not([disabled]):not([type="hidden"]), button.searchable-select-trigger:not([disabled]), select:not([disabled]), textarea:not([disabled])')
    ).filter(el => el.offsetParent !== null);
    const idx = focusables.indexOf(e.target);
    if (idx !== -1 && idx + 1 < focusables.length) {
      const nextEl = focusables[idx + 1];
      nextEl.focus();
      if (typeof nextEl.select === 'function' && nextEl.tagName === 'INPUT' && nextEl.type !== 'radio') {
        try { nextEl.select(); } catch (err) { }
      }
    }
  };

  const prevRemarksIsDefaultFit = (text) => text === 'Fit for heavy industrial plant work.';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isReadOnly || isSubmitting) return;

    const validation = validateMedicalStep(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
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
    <form ref={formRef} onSubmit={handleSubmit} onKeyDown={handleFormKeyDown} className="form-card" style={{ marginBottom: 0 }}>
      <div className="form-section-header">
        <h3>
          <Stethoscope size={20} color="var(--warning-solid)" />
          <span>Step 2: Medical & Physical Fitness Examination</span>
        </h3>
        {isReadOnly ? (
          <span className="badge badge-info">Completed by Medical Officer</span>
        ) : hasPreviousExam ? (
          <span className="badge badge-warning">Re-Performing Exam (Old + New Records Preserved)</span>
        ) : null}
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
          <AlertTriangle size={20} color="var(--danger-solid, #EF4444)" style={{ flexShrink: 0, marginTop: '2px' }} />
          <div>
            <div style={{ fontWeight: 700, color: 'var(--danger-solid, #EF4444)', fontSize: '0.88rem', marginBottom: '0.25rem' }}>
              Please correct the following clinical / medical exam field(s):
            </div>
            <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              {Object.entries(errors).map(([field, msg]) => (
                <li key={field} style={{ marginBottom: '2px' }}>{msg}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Vitals Grid */}
      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
        Physical Vitals & Clinical Metrics
      </h4>

      <div className="form-grid">
        {/* Blood Group */}
        <div className="form-group">
          <label htmlFor="med-blood-group">Blood Group <span className="required">*</span></label>
          <SearchableSelect
            id="med-blood-group"
            className="form-select"
            value={formData.bloodGroup}
            onChange={(e) => handleVitalChange('bloodGroup', e.target.value)}
            disabled={isReadOnly}
          >
            {bloodGroupOptions.map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </SearchableSelect>
          {errors.bloodGroup && <span className="error-text">{errors.bloodGroup}</span>}
        </div>

        {/* Height & Weight */}
        <div className="form-group">
          <label htmlFor="med-height">Height (cm) <span className="required">*</span></label>
          <input
            id="med-height"
            type="number"
            className={`form-input ${errors.heightCm ? 'error' : ''}`}
            placeholder="e.g. 170"
            value={formData.heightCm}
            onChange={(e) => handleVitalChange('heightCm', e.target.value)}
            disabled={isReadOnly}
          />
          {errors.heightCm && <span className="error-text">{errors.heightCm}</span>}
        </div>

        <div className="form-group">
          <label htmlFor="med-weight">Weight (kg) <span className="required">*</span></label>
          <input
            id="med-weight"
            type="number"
            className={`form-input ${errors.weightKg ? 'error' : ''}`}
            placeholder="e.g. 65"
            value={formData.weightKg}
            onChange={(e) => handleVitalChange('weightKg', e.target.value)}
            disabled={isReadOnly}
          />
          {errors.weightKg && <span className="error-text">{errors.weightKg}</span>}
        </div>

        {/* BMI Auto Display */}
        <div className="form-group">
          <label>Calculated BMI</label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.55rem 0.85rem',
            backgroundColor: 'var(--bg-surface-subtle)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-medium)'
          }}>
            <span style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text-primary)' }}>
              {formData.bmi ? `${formData.bmi} kg/m²` : '—'}
            </span>
            {formData.bmiCategory && (
              <span className={`badge badge-${formData.bmiCategory === 'Normal' ? 'success' : (formData.bmiCategory === 'Overweight' ? 'warning' : 'danger')}`}>
                {formData.bmiCategory}
              </span>
            )}
          </div>
        </div>

        {/* Blood Pressure */}
        <div className="form-group">
          <label>Blood Pressure (Systolic / Diastolic) <span className="required">*</span></label>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <input
              id="med-bp-sys"
              type="number"
              className={`form-input ${errors.bpSystolic ? 'error' : ''}`}
              placeholder="Sys (120)"
              value={formData.bpSystolic}
              onChange={(e) => handleVitalChange('bpSystolic', e.target.value)}
              disabled={isReadOnly}
              style={{ flex: 1 }}
            />
            <span>/</span>
            <input
              id="med-bp-dia"
              type="number"
              className={`form-input ${errors.bpDiastolic ? 'error' : ''}`}
              placeholder="Dia (80)"
              value={formData.bpDiastolic}
              onChange={(e) => handleVitalChange('bpDiastolic', e.target.value)}
              disabled={isReadOnly}
              style={{ flex: 1 }}
            />
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>mmHg</span>
          </div>
          {(errors.bpSystolic || errors.bpDiastolic) && (
            <span className="error-text">{errors.bpSystolic || errors.bpDiastolic}</span>
          )}
        </div>

        {/* SpO2 */}
        <div className="form-group">
          <label htmlFor="med-spo2">Oxygen Saturation (SpO2 %) <span className="required">*</span></label>
          <input
            id="med-spo2"
            type="number"
            className={`form-input ${errors.spo2 ? 'error' : ''}`}
            placeholder="e.g. 98"
            value={formData.spo2}
            onChange={(e) => handleVitalChange('spo2', e.target.value)}
            disabled={isReadOnly}
          />
          {errors.spo2 && <span className="error-text">{errors.spo2}</span>}
        </div>

        {/* Pulse Rate */}
        <div className="form-group">
          <label htmlFor="med-pulse">Pulse Rate (bpm) <span className="required">*</span></label>
          <input
            id="med-pulse"
            type="number"
            className={`form-input ${errors.pulseRate ? 'error' : ''}`}
            placeholder="e.g. 72"
            value={formData.pulseRate}
            onChange={(e) => handleVitalChange('pulseRate', e.target.value)}
            disabled={isReadOnly}
          />
          {errors.pulseRate && <span className="error-text">{errors.pulseRate}</span>}
        </div>

        {/* Respiration Rate */}
        <div className="form-group">
          <label htmlFor="med-resp">Respiration Rate (/min)</label>
          <input
            id="med-resp"
            type="number"
            className="form-input"
            placeholder="e.g. 16"
            value={formData.respirationRate}
            onChange={(e) => handleVitalChange('respirationRate', e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        {/* Blood Sugar (RBS) */}
        <div className="form-group">
          <label htmlFor="med-rbs">Random Blood Sugar (RBS mg/dL) <span className="required">*</span></label>
          <input
            id="med-rbs"
            type="number"
            className={`form-input ${errors.rbs ? 'error' : ''}`}
            placeholder="e.g. 110"
            value={formData.rbs}
            onChange={(e) => handleVitalChange('rbs', e.target.value)}
            disabled={isReadOnly}
          />
          {errors.rbs && <span className="error-text">{errors.rbs}</span>}
        </div>
      </div>

      {/* Diagnostic Screening Tests */}
      <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', marginTop: '1.5rem', marginBottom: '0.75rem' }}>
        Diagnostic Screening & Field Clearance Tests
      </h4>

      <div className="form-grid">
        {/* Alcohol Test */}
        <div className="form-group">
          <label>Alcohol Breathalyzer Test <span className="required">*</span></label>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="alcoholTest"
                value="Pass"
                checked={formData.alcoholTest === 'Pass'}
                onChange={() => handleVitalChange('alcoholTest', 'Pass')}
                disabled={isReadOnly}
              />
              <span style={{ fontWeight: 600, color: 'var(--success-solid)' }}>Pass (0.00% BAC)</span>
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
              <input
                type="radio"
                name="alcoholTest"
                value="Fail"
                checked={formData.alcoholTest === 'Fail'}
                onChange={() => handleVitalChange('alcoholTest', 'Fail')}
                disabled={isReadOnly}
              />
              <span style={{ fontWeight: 600, color: 'var(--danger-solid)' }}>Fail (Alcohol Detected)</span>
            </label>
          </div>
        </div>

        {/* Vision Test */}
        <div className="form-group">
          <label>Vision Test</label>
          <SearchableSelect
            className="form-select"
            value={formData.visionTest}
            onChange={(e) => handleVitalChange('visionTest', e.target.value)}
            disabled={isReadOnly}
          >
            {visionOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </SearchableSelect>
        </div>

        {/* Hearing Test */}
        <div className="form-group">
          <label>Hearing Test</label>
          <SearchableSelect
            className="form-select"
            value={formData.hearingTest}
            onChange={(e) => handleVitalChange('hearingTest', e.target.value)}
            disabled={isReadOnly}
          >
            {hearingOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </SearchableSelect>
        </div>

        {/* Vertigo / Height Test */}
        <div className="form-group">
          <label>Vertigo & Height Work Test</label>
          <SearchableSelect
            className="form-select"
            value={formData.vertigoTest}
            onChange={(e) => handleVitalChange('vertigoTest', e.target.value)}
            disabled={isReadOnly}
          >
            {vertigoOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </SearchableSelect>
        </div>
      </div>

      {/* Gate Decision: FIT / FIT WITH PRECAUTIONS / FIT WITH FOLLOW UP / HOLD / UNFIT */}
      {(() => {
        const statusTheme = {
          FIT: { bg: 'var(--success-bg)', border: 'var(--success-solid)', text: 'var(--success-text)' },
          FIT_WITH_PRECAUTIONS: { bg: 'var(--info-bg)', border: 'var(--info-solid)', text: 'var(--info-text)' },
          FIT_WITH_FOLLOW_UP: { bg: 'var(--purple-bg)', border: 'var(--purple-solid)', text: 'var(--purple-text)' },
          HOLD: { bg: 'var(--warning-bg)', border: 'var(--warning-solid)', text: 'var(--warning-text)' },
          UNFIT: { bg: 'var(--danger-bg)', border: 'var(--danger-solid)', text: 'var(--danger-text)' }
        }[formData.fitnessStatus] || { bg: 'var(--success-bg)', border: 'var(--success-solid)', text: 'var(--success-text)' };

        const statusIcon = formData.fitnessStatus === 'FIT'
          ? <CheckCircle2 size={20} />
          : formData.fitnessStatus === 'FIT_WITH_PRECAUTIONS'
            ? <ShieldAlert size={20} />
            : formData.fitnessStatus === 'FIT_WITH_FOLLOW_UP'
              ? <CalendarClock size={20} />
              : formData.fitnessStatus === 'HOLD'
                ? <PauseCircle size={20} />
                : <XCircle size={20} />;

        const remarksPlaceholder = formData.fitnessStatus === 'FIT'
          ? 'Certified fit for plant work...'
          : formData.fitnessStatus === 'FIT_WITH_PRECAUTIONS'
            ? 'Specify work precautions (e.g. ground-level work only, no height/confined space, regular BP check)...'
            : formData.fitnessStatus === 'FIT_WITH_FOLLOW_UP'
              ? 'Specify medical follow-up requirement (e.g. re-check BP / RBS after scheduled days)...'
              : formData.fitnessStatus === 'HOLD'
                ? 'Specify reason for HOLD and follow-up test / specialist opinion required...'
                : 'Specify medical contraindications and reasons for rejection...';

        return (
          <div style={{
            marginTop: '2rem',
            padding: '1.25rem',
            backgroundColor: statusTheme.bg,
            border: `2px solid ${statusTheme.border}`,
            borderRadius: 'var(--radius-md)'
          }}>
            <h4 style={{
              fontSize: '1rem',
              fontWeight: 800,
              color: statusTheme.text,
              marginBottom: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              {statusIcon}
              <span>FINAL MEDICAL FITNESS STATUS (DOCTOR OPINION / STAGE GATE DECISION)</span>
            </h4>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 240px), 1fr))', gap: '0.75rem', marginBottom: '1rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fitnessStatus"
                  value="FIT"
                  checked={formData.fitnessStatus === 'FIT'}
                  onChange={() => handleVitalChange('fitnessStatus', 'FIT')}
                  disabled={isReadOnly}
                />
                <span style={{ fontWeight: 800, color: 'var(--success-text)', fontSize: '0.88rem' }}>
                  FIT FOR GENERAL WORK (Routes to Safety)
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fitnessStatus"
                  value="FIT_WITH_PRECAUTIONS"
                  checked={formData.fitnessStatus === 'FIT_WITH_PRECAUTIONS'}
                  onChange={() => handleVitalChange('fitnessStatus', 'FIT_WITH_PRECAUTIONS')}
                  disabled={isReadOnly}
                />
                <span style={{ fontWeight: 800, color: 'var(--info-text)', fontSize: '0.88rem' }}>
                  FIT WITH PRECAUTIONS (Routes to Safety)
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fitnessStatus"
                  value="FIT_WITH_FOLLOW_UP"
                  checked={formData.fitnessStatus === 'FIT_WITH_FOLLOW_UP'}
                  onChange={() => handleVitalChange('fitnessStatus', 'FIT_WITH_FOLLOW_UP')}
                  disabled={isReadOnly}
                />
                <span style={{ fontWeight: 800, color: 'var(--purple-text)', fontSize: '0.88rem' }}>
                  FIT WITH FOLLOW UP (1–30 Days Alert)
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fitnessStatus"
                  value="HOLD"
                  checked={formData.fitnessStatus === 'HOLD'}
                  onChange={() => handleVitalChange('fitnessStatus', 'HOLD')}
                  disabled={isReadOnly}
                />
                <span style={{ fontWeight: 800, color: 'var(--warning-text)', fontSize: '0.88rem' }}>
                  HOLD (Pending Review / Re-test)
                </span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                <input
                  type="radio"
                  name="fitnessStatus"
                  value="UNFIT"
                  checked={formData.fitnessStatus === 'UNFIT'}
                  onChange={() => handleVitalChange('fitnessStatus', 'UNFIT')}
                  disabled={isReadOnly}
                />
                <span style={{ fontWeight: 800, color: 'var(--danger-text)', fontSize: '0.88rem' }}>
                  UNFIT (Halts Onboarding &amp; Flags Profile)
                </span>
              </label>
            </div>

            {formData.fitnessStatus === 'FIT_WITH_FOLLOW_UP' && (
              <div className="form-grid" style={{
                marginBottom: '1rem',
                padding: '0.85rem',
                backgroundColor: 'var(--bg-surface)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--purple-border, #C4B5FD)'
              }}>
                <div className="form-group">
                  <label htmlFor="med-followup-days">Follow-Up Review After (1–30 Days) <span className="required">*</span></label>
                  <SearchableSelect
                    id="med-followup-days"
                    className={`form-select ${errors.followUpDays ? 'error' : ''}`}
                    value={formData.followUpDays || '7'}
                    onChange={(e) => handleVitalChange('followUpDays', e.target.value)}
                    disabled={isReadOnly}
                    searchPlaceholder="Search days (1-30)..."
                  >
                    {Array.from({ length: 30 }, (_, idx) => String(idx + 1)).map(day => (
                      <option key={day} value={day}>
                        {day} {day === '1' ? 'Day' : 'Days'} (Due {addDaysToIsoDate(day)})
                      </option>
                    ))}
                  </SearchableSelect>
                  {errors.followUpDays && <span className="error-text">{errors.followUpDays}</span>}
                </div>

                <div className="form-group">
                  <label>Scheduled Follow-Up Date (Auto Notification Mail)</label>
                  <input
                    type="text"
                    readOnly
                    className="form-input"
                    value={formData.followUpDate || addDaysToIsoDate(formData.followUpDays || 7)}
                    style={{ backgroundColor: 'var(--bg-surface-subtle)', fontFamily: 'var(--font-family-mono)', fontWeight: 700 }}
                  />
                  <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                    Automated reminder email will be dispatched to Medical / HR once this date completes.
                  </span>
                </div>
              </div>
            )}

            <div className="form-group">
              <label style={{ color: statusTheme.text }}>
                Medical Officer Clinical Remarks / Doctor Opinion {formData.fitnessStatus !== 'FIT' && <span className="required">*</span>}
              </label>
              <textarea
                className={`form-textarea ${errors.remarks ? 'error' : ''}`}
                rows={3}
                placeholder={remarksPlaceholder}
                value={formData.remarks}
                onChange={(e) => handleVitalChange('remarks', e.target.value)}
                disabled={isReadOnly}
              />
              {errors.remarks && <span className="error-text">{errors.remarks}</span>}
            </div>

            <div className="form-group" style={{ marginTop: '0.75rem' }}>
              <label style={{ color: statusTheme.text }}>
                Medical Examiner Name &amp; Registration No. <span className="required">*</span>
              </label>
              <input
                type="text"
                className={`form-input ${errors.examinerName ? 'error' : ''}`}
                placeholder="Logged-in Medical Officer Name"
                value={formData.examinerName}
                onChange={(e) => handleVitalChange('examinerName', e.target.value)}
                disabled={isReadOnly}
              />
              {errors.examinerName && <span className="error-text">{errors.examinerName}</span>}
            </div>
          </div>
        );
      })()}

      {!isReadOnly && (
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            id="btn-save-step2"
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary"
            style={{
              backgroundColor: formData.fitnessStatus === 'UNFIT'
                ? 'var(--danger-solid)'
                : formData.fitnessStatus === 'HOLD'
                  ? 'var(--warning-solid)'
                  : formData.fitnessStatus === 'FIT_WITH_PRECAUTIONS'
                    ? 'var(--info-solid)'
                    : undefined,
              color: '#FFF'
            }}
          >
            {formData.fitnessStatus === 'FIT' && (
              <>
                <span>Certify FIT &amp; Route to EHS Safety</span>
                <CheckCircle2 size={16} />
              </>
            )}
            {formData.fitnessStatus === 'FIT_WITH_PRECAUTIONS' && (
              <>
                <span>Certify FIT WITH PRECAUTIONS &amp; Route to Safety</span>
                <ShieldAlert size={16} />
              </>
            )}
            {formData.fitnessStatus === 'FIT_WITH_FOLLOW_UP' && (
              <>
                <span>Certify FIT WITH FOLLOW UP ({formData.followUpDays || 7}d) &amp; Route to Safety</span>
                <CalendarClock size={16} />
              </>
            )}
            {formData.fitnessStatus === 'HOLD' && (
              <>
                <span>Place on Medical HOLD (Keep at Medical)</span>
                <PauseCircle size={16} />
              </>
            )}
            {formData.fitnessStatus === 'UNFIT' && (
              <>
                <span>Flag Profile as UNFIT &amp; Halt Onboarding</span>
                <XCircle size={16} />
              </>
            )}
          </button>
        </div>
      )}

      {/* Preserved Medical Re-Examination History (Old + New Records) */}
      {priorMedicalHistory.length > 0 && (
        <div style={{
          marginTop: '1.75rem',
          padding: '1rem 1.25rem',
          backgroundColor: 'var(--bg-surface-subtle)',
          border: '1px solid var(--border-light)',
          borderRadius: 'var(--radius-md)'
        }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <History size={16} color="var(--brand-primary)" />
            <span>Saved Previous Medical Records ({priorMedicalHistory.length} Archived Exam{priorMedicalHistory.length === 1 ? '' : 's'})</span>
          </h4>
          <div className="data-table-wrapper">
            <table className="data-table" style={{ fontSize: '0.78rem' }}>
              <thead>
                <tr>
                  <th>Recorded Date</th>
                  <th>Verdict</th>
                  <th>Blood Group</th>
                  <th>Height / Weight / BMI</th>
                  <th>BP / SpO2 / RBS</th>
                  <th>Examiner &amp; Remarks</th>
                </tr>
              </thead>
              <tbody>
                {priorMedicalHistory.map((rec, i) => {
                  const fm = getMedicalFitnessMeta(rec.fitnessStatus);
                  return (
                    <tr key={i}>
                      <td>{formatTimestamp(rec.examinedAt || rec.archivedAt)}</td>
                      <td><span className={`badge badge-${fm.badge}`}>{fm.shortLabel}</span></td>
                      <td>{rec.bloodGroup || '—'}</td>
                      <td>{rec.heightCm || '—'}cm / {rec.weightKg || '—'}kg {rec.bmi ? `(BMI ${rec.bmi})` : ''}</td>
                      <td>{rec.bpSystolic || '—'}/{rec.bpDiastolic || '—'} • {rec.spo2 || '—'}% • {rec.rbs || '—'}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{rec.examinerName || '—'}</div>
                        <div style={{ color: 'var(--text-muted)' }}>{rec.remarks || '—'}</div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </form>
  );
};
