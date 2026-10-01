import React, { useState } from 'react';
import { HardHat, ShieldCheck, CheckCircle2, AlertTriangle } from 'lucide-react';
import { SAFETY_TOPICS, PPE_ITEMS } from '../../types/constants';

export const Step3Safety = ({ initialData, onSave, isReadOnly }) => {
  const [topicsCovered, setTopicsCovered] = useState(
    initialData?.topicsCovered || SAFETY_TOPICS
  );
  const [ppeIssued, setPpeIssued] = useState(
    initialData?.ppeIssued || ['helmet', 'jacket', 'shoes', 'gloves', 'earplugs']
  );
  const [safetyOfficerName, setSafetyOfficerName] = useState(
    initialData?.safetyOfficerName || 'Jithendra Parida (EHS Safety Lead)'
  );
  const [safetyDate, setSafetyDate] = useState(
    initialData?.safetyDate || new Date().toISOString().slice(0, 10)
  );
  const [error, setError] = useState(null);

  const toggleTopic = (topic) => {
    if (isReadOnly) return;
    if (topicsCovered.includes(topic)) {
      setTopicsCovered(topicsCovered.filter(t => t !== topic));
    } else {
      setTopicsCovered([...topicsCovered, topic]);
    }
  };

  const togglePpe = (itemId) => {
    if (isReadOnly) return;
    if (ppeIssued.includes(itemId)) {
      setPpeIssued(ppeIssued.filter(id => id !== itemId));
    } else {
      setPpeIssued([...ppeIssued, itemId]);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isReadOnly) return;

    if (topicsCovered.length < 3) {
      setError('At least 3 core safety briefing topics must be confirmed.');
      return;
    }
    if (!ppeIssued.includes('helmet') || !ppeIssued.includes('jacket') || !ppeIssued.includes('shoes')) {
      setError('Mandatory baseline PPE (Helmet, Reflective Jacket, Safety Shoes) MUST be issued before advancing.');
      return;
    }
    if (!safetyOfficerName.trim()) {
      setError('Safety Officer Name is required.');
      return;
    }

    onSave({
      briefingDone: true,
      topicsCovered,
      ppeIssued,
      safetyOfficerName,
      safetyDate
    });
  };

  return (
    <form onSubmit={handleSubmit} className="form-card" style={{ marginBottom: 0 }}>
      <div className="form-section-header">
        <h3>
          <HardHat size={20} color="var(--purple-solid)" />
          <span>Step 3: EHS Safety Induction & PPE Issuance</span>
        </h3>
        {isReadOnly && (
          <span className="badge badge-info">Completed by EHS Safety Team</span>
        )}
      </div>

      {error && (
        <div style={{
          backgroundColor: 'var(--danger-bg)',
          color: 'var(--danger-text)',
          border: '1px solid var(--danger-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {error}
        </div>
      )}

      {/* Topics Covered */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Safety Induction Topics Covered in Briefing
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {topicsCovered.length} of {SAFETY_TOPICS.length} topics confirmed
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '0.5rem' }}>
          {SAFETY_TOPICS.map((topic, idx) => {
            const isChecked = topicsCovered.includes(topic);
            return (
              <label
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isChecked ? 'rgba(139, 92, 246, 0.08)' : 'var(--bg-surface-subtle)',
                  border: isChecked ? '1px solid var(--purple-border)' : '1px solid var(--border-light)',
                  cursor: isReadOnly ? 'default' : 'pointer',
                  fontSize: '0.825rem',
                  fontWeight: isChecked ? 600 : 400,
                  color: isChecked ? 'var(--purple-text)' : 'var(--text-secondary)'
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggleTopic(topic)}
                  disabled={isReadOnly}
                />
                <span>{topic}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* PPE Items Issued */}
      <div style={{ marginBottom: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Mandatory PPE Issued to Worker (Physical Verification)
          </h4>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {ppeIssued.length} PPE items dispatched
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '0.5rem' }}>
          {PPE_ITEMS.map((item) => {
            const isChecked = ppeIssued.includes(item.id);
            return (
              <label
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.65rem',
                  padding: '0.65rem 0.85rem',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: isChecked ? 'var(--success-bg)' : 'var(--bg-surface-subtle)',
                  border: isChecked ? '1px solid var(--success-border)' : '1px solid var(--border-light)',
                  cursor: isReadOnly ? 'default' : 'pointer',
                  fontSize: '0.825rem',
                  fontWeight: isChecked ? 600 : 400,
                  color: isChecked ? 'var(--success-text)' : 'var(--text-secondary)'
                }}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => togglePpe(item.id)}
                  disabled={isReadOnly}
                />
                <span>{item.label}</span>
              </label>
            );
          })}
        </div>
      </div>

      {/* Safety Sign-off */}
      <div className="form-grid" style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
        <div className="form-group">
          <label htmlFor="safety-officer-name">Safety Officer Name & Credentials <span className="required">*</span></label>
          <input
            id="safety-officer-name"
            type="text"
            className="form-input"
            value={safetyOfficerName}
            onChange={(e) => setSafetyOfficerName(e.target.value)}
            disabled={isReadOnly}
          />
        </div>

        <div className="form-group">
          <label htmlFor="safety-date">Induction Date</label>
          <input
            id="safety-date"
            type="date"
            className="form-input"
            value={safetyDate}
            onChange={(e) => setSafetyDate(e.target.value)}
            disabled={isReadOnly}
          />
        </div>
      </div>

      {!isReadOnly && (
        <div style={{ marginTop: '2rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button id="btn-save-step3" type="submit" className="btn btn-primary">
            <span>Certify Safety Induction & Route to IT</span>
            <CheckCircle2 size={16} />
          </button>
        </div>
      )}
    </form>
  );
};
