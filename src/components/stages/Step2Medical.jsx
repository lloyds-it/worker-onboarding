import React, { useState } from 'react';
import { Stethoscope, AlertTriangle, CheckCircle2, XCircle, HeartPulse } from 'lucide-react';
import { validateMedicalStep, calculateBMI } from '../../services/validationService';

export const Step2Medical = ({ initialData, onSave, isReadOnly }) => {
  const [formData, setFormData] = useState({
    bloodGroup: initialData?.bloodGroup || 'B+',
    heightCm: initialData?.heightCm || '',
    weightKg: initialData?.weightKg || '',
    bmi: initialData?.bmi || '',
    bmiCategory: initialData?.bmiCategory || '',
    bpSystolic: initialData?.bpSystolic || '120',
    bpDiastolic: initialData?.bpDiastolic || '80',
    spo2: initialData?.spo2 || '98',
    pulseRate: initialData?.pulseRate || '72',
    respirationRate: initialData?.respirationRate || '16',
    rbs: initialData?.rbs || '100',
    alcoholTest: initialData?.alcoholTest || 'Pass',
    visionTest: initialData?.visionTest || 'Normal',
    hearingTest: initialData?.hearingTest || 'Normal',
    vertigoTest: initialData?.vertigoTest || 'Fit',
    existingIllness: initialData?.existingIllness || 'No',
    fitnessStatus: initialData?.fitnessStatus || 'FIT',
    examinerName: initialData?.examinerName || 'Gopal Ray (Chief Medical Officer)',
    remarks: initialData?.remarks || 'Fit for heavy industrial plant work.'
  });

  const [errors, setErrors] = useState({});

  const handleVitalChange = (field, val) => {
    if (isReadOnly) return;
    const next = { ...formData, [field]: val };

    if (field === 'heightCm' || field === 'weightKg') {
      const h = field === 'heightCm' ? val : formData.heightCm;
      const w = field === 'weightKg' ? val : formData.weightKg;
      const res = calculateBMI(h, w);
      next.bmi = res.bmi;
      next.bmiCategory = res.category;
    }

    setFormData(next);
    if (errors[field]) {
      setErrors({ ...errors, [field]: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    const validation = validateMedicalStep(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="form-card" style={{ marginBottom: 0 }}>
      <div className="form-section-header">
        <h3>
          <Stethoscope size={20} color="var(--warning-solid)" />
          <span>Step 2: Medical & Physical Fitness Examination</span>
        </h3>
        {isReadOnly && (
          <span className="badge badge-info">Completed by Medical Officer</span>
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
          <select
            id="med-blood-group"
            className="form-select"
            value={formData.bloodGroup}
            onChange={(e) => handleVitalChange('bloodGroup', e.target.value)}
            disabled={isReadOnly}
          >
            {['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'].map(bg => (
              <option key={bg} value={bg}>{bg}</option>
            ))}
          </select>
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
          <select
            className="form-select"
            value={formData.visionTest}
            onChange={(e) => handleVitalChange('visionTest', e.target.value)}
            disabled={isReadOnly}
          >
            <option value="Normal">Normal (6/6 or with corrective lenses)</option>
            <option value="Impaired">Impaired (Deficient visual acuity)</option>
          </select>
        </div>

        {/* Hearing Test */}
        <div className="form-group">
          <label>Hearing Test</label>
          <select
            className="form-select"
            value={formData.hearingTest}
            onChange={(e) => handleVitalChange('hearingTest', e.target.value)}
            disabled={isReadOnly}
          >
            <option value="Normal">Normal Bilateral Hearing</option>
            <option value="Impaired">Impaired / Partial Deafness</option>
          </select>
        </div>

        {/* Vertigo / Height Test */}
        <div className="form-group">
          <label>Vertigo & Height Work Test</label>
          <select
            className="form-select"
            value={formData.vertigoTest}
            onChange={(e) => handleVitalChange('vertigoTest', e.target.value)}
            disabled={isReadOnly}
          >
            <option value="Fit">Fit (No Acrophobia/Dizziness)</option>
            <option value="Unfit">Unfit (Vertigo Symptoms Present)</option>
            <option value="N/A">Not Applicable (Ground Trade Only)</option>
          </select>
        </div>
      </div>

      {/* Gate Decision: FIT vs UNFIT */}
      <div style={{
        marginTop: '2rem',
        padding: '1.25rem',
        backgroundColor: formData.fitnessStatus === 'FIT' ? 'var(--success-bg)' : 'var(--danger-bg)',
        border: `2px solid ${formData.fitnessStatus === 'FIT' ? 'var(--success-solid)' : 'var(--danger-solid)'}`,
        borderRadius: 'var(--radius-md)'
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: 800,
          color: formData.fitnessStatus === 'FIT' ? 'var(--success-text)' : 'var(--danger-text)',
          marginBottom: '0.75rem',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {formData.fitnessStatus === 'FIT' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          <span>FINAL MEDICAL FITNESS STATUS (STAGE GATE DECISION)</span>
        </h4>

        <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="radio"
              name="fitnessStatus"
              value="FIT"
              checked={formData.fitnessStatus === 'FIT'}
              onChange={() => handleVitalChange('fitnessStatus', 'FIT')}
              disabled={isReadOnly}
            />
            <span style={{ fontWeight: 800, color: 'var(--success-text)', fontSize: '0.95rem' }}>
              FIT FOR GENERAL WORK (Auto-routes to Safety)
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
            <span style={{ fontWeight: 800, color: 'var(--danger-text)', fontSize: '0.95rem' }}>
              UNFIT (HALTS ONBOARDING & FLAGS PROFILE)
            </span>
          </label>
        </div>

        <div className="form-group">
          <label style={{ color: formData.fitnessStatus === 'FIT' ? 'var(--success-text)' : 'var(--danger-text)' }}>
            Medical Officer Clinical Remarks / Rationale {formData.fitnessStatus === 'UNFIT' && <span className="required">*</span>}
          </label>
          <textarea
            className={`form-textarea ${errors.remarks ? 'error' : ''}`}
            rows={3}
            placeholder={formData.fitnessStatus === 'FIT' ? "Certified fit for plant work..." : "Specify medical contraindications and reasons for rejection..."}
            value={formData.remarks}
            onChange={(e) => handleVitalChange('remarks', e.target.value)}
            disabled={isReadOnly}
          />
          {errors.remarks && <span className="error-text">{errors.remarks}</span>}
        </div>

        <div className="form-group" style={{ marginTop: '0.75rem' }}>
          <label style={{ color: formData.fitnessStatus === 'FIT' ? 'var(--success-text)' : 'var(--danger-text)' }}>
            Medical Examiner Name & Registration No. <span className="required">*</span>
          </label>
          <input
            type="text"
            className="form-input"
            value={formData.examinerName}
            onChange={(e) => handleVitalChange('examinerName', e.target.value)}
            disabled={isReadOnly}
          />
        </div>
      </div>

      {!isReadOnly && (
        <div style={{ marginTop: '1.5rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            id="btn-save-step2"
            type="submit"
            className={`btn ${formData.fitnessStatus === 'FIT' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ backgroundColor: formData.fitnessStatus === 'UNFIT' ? 'var(--danger-solid)' : '', color: '#FFF' }}
          >
            {formData.fitnessStatus === 'FIT' ? (
              <>
                <span>Certify FIT & Route to EHS Safety</span>
                <CheckCircle2 size={16} />
              </>
            ) : (
              <>
                <span>Flag Profile as UNFIT & Halt Onboarding</span>
                <XCircle size={16} />
              </>
            )}
          </button>
        </div>
      )}
    </form>
  );
};
