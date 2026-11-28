import React, { useState, useEffect } from 'react';
import { SlidersHorizontal, Plus, Trash2, RotateCcw, Save, CheckCircle2, ArrowUp, ArrowDown } from 'lucide-react';
import { useWorkers } from '../../context/WorkerContext';
import { DEFAULT_DROPDOWN_MASTERS, mergeDropdownMasters } from '../../types/constants';

const MASTER_DEFINITIONS = [
  {
    key: 'trades',
    stage: 'Step 1: HR Registration',
    title: 'Trade / Skill Categories',
    mode: 'string',
    placeholder: 'e.g. Rigging Foreman'
  },
  {
    key: 'idTypes',
    stage: 'Step 1: HR Registration',
    title: 'Government ID Proof Types',
    mode: 'string',
    placeholder: 'e.g. PAN Card'
  },
  {
    key: 'genders',
    stage: 'Step 1: HR Registration',
    title: 'Gender Options',
    mode: 'valueLabel',
    valuePlaceholder: 'Code (e.g. M)',
    labelPlaceholder: 'Display Label (e.g. Male (M))'
  },
  {
    key: 'bloodGroups',
    stage: 'Step 2: Medical Exam',
    title: 'Blood Group Dropdown Options',
    mode: 'string',
    placeholder: 'e.g. O+'
  },
  {
    key: 'visionTests',
    stage: 'Step 2: Medical Exam',
    title: 'Vision Test Options',
    mode: 'valueLabel',
    valuePlaceholder: 'Value (e.g. Normal)',
    labelPlaceholder: 'Display Label (e.g. Normal 6/6)'
  },
  {
    key: 'hearingTests',
    stage: 'Step 2: Medical Exam',
    title: 'Hearing Test Options',
    mode: 'valueLabel',
    valuePlaceholder: 'Value (e.g. Normal)',
    labelPlaceholder: 'Display Label (e.g. Normal Bilateral Hearing)'
  },
  {
    key: 'vertigoTests',
    stage: 'Step 2: Medical Exam',
    title: 'Vertigo & Height Work Test Options',
    mode: 'valueLabel',
    valuePlaceholder: 'Value (e.g. Fit)',
    labelPlaceholder: 'Display Label (e.g. Fit — No Acrophobia)'
  },
  {
    key: 'ppeItems',
    stage: 'Step 3: EHS Safety & PPE',
    title: 'PPE Equipment Checklist Items',
    mode: 'idLabel',
    valuePlaceholder: 'Key ID (e.g. welding_apron)',
    labelPlaceholder: 'PPE Item Label (e.g. Fire-Retardant Welding Apron)'
  },
  {
    key: 'safetyTopics',
    stage: 'Step 3: EHS Safety & PPE',
    title: 'Safety Induction Briefing Topics',
    mode: 'string',
    placeholder: 'e.g. Confined Space Permit-to-Work Protocol'
  },
  {
    key: 'camps',
    stage: 'Step 5: Camp Housing',
    title: 'Camp Facility Names',
    mode: 'string',
    placeholder: 'e.g. Gondwana Phase 5'
  },
  {
    key: 'blocks',
    stage: 'Step 5: Camp Housing',
    title: 'Block / Wing Options',
    mode: 'string',
    placeholder: 'e.g. Block E'
  },
  {
    key: 'beds',
    stage: 'Step 5: Camp Housing',
    title: 'Bed Number Options',
    mode: 'valueLabel',
    valuePlaceholder: 'Value (e.g. Bed 5)',
    labelPlaceholder: 'Display Label (e.g. Bed 5 — Single Cot)'
  },
  {
    key: 'contractorDepartments',
    stage: 'Admin Contractor Master',
    title: 'Contractor Departments / Categories',
    mode: 'string',
    placeholder: 'e.g. Fabrication'
  }
];

export const DropdownMastersTab = ({ onNotify }) => {
  const { dropdownMasters, saveDropdownMasters } = useWorkers();
  const [draft, setDraft] = useState(() => mergeDropdownMasters(dropdownMasters));
  const [selectedKey, setSelectedKey] = useState('trades');
  const [newText, setNewText] = useState('');
  const [newCode, setNewCode] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setDraft(mergeDropdownMasters(dropdownMasters));
  }, [dropdownMasters]);

  const activeDef = MASTER_DEFINITIONS.find(d => d.key === selectedKey) || MASTER_DEFINITIONS[0];
  const items = Array.isArray(draft[activeDef.key]) ? draft[activeDef.key] : [];

  const updateList = (nextList) => {
    setDraft(prev => ({ ...prev, [activeDef.key]: nextList }));
  };

  const handleAddItem = (e) => {
    e.preventDefault();
    if (activeDef.mode === 'string') {
      const clean = newText.trim();
      if (!clean) return;
      if (items.some(x => String(x).toLowerCase() === clean.toLowerCase())) {
        onNotify?.(`"${clean}" already exists in ${activeDef.title}.`, 'danger');
        return;
      }
      updateList([...items, clean]);
      setNewText('');
      return;
    }

    const codeKey = activeDef.mode === 'idLabel' ? 'id' : 'value';
    const rawCode = (newCode.trim() || newLabel.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'));
    const cleanLabel = newLabel.trim() || rawCode;
    if (!rawCode || !cleanLabel) return;
    if (items.some(x => String(x?.[codeKey] || '').toLowerCase() === rawCode.toLowerCase())) {
      onNotify?.(`Option key "${rawCode}" already exists in ${activeDef.title}.`, 'danger');
      return;
    }
    updateList([...items, { [codeKey]: rawCode, label: cleanLabel }]);
    setNewCode('');
    setNewLabel('');
  };

  const handleUpdateStringItem = (idx, nextVal) => {
    updateList(items.map((item, i) => (i === idx ? nextVal : item)));
  };

  const handleUpdatePairItem = (idx, field, nextVal) => {
    updateList(items.map((item, i) => (i === idx ? { ...item, [field]: nextVal } : item)));
  };

  const handleMove = (idx, delta) => {
    const target = idx + delta;
    if (target < 0 || target >= items.length) return;
    const copy = [...items];
    const [picked] = copy.splice(idx, 1);
    copy.splice(target, 0, picked);
    updateList(copy);
  };

  const handleDelete = (idx) => {
    if (items.length <= 1) {
      onNotify?.(`At least 1 option must remain in ${activeDef.title}.`, 'danger');
      return;
    }
    updateList(items.filter((_, i) => i !== idx));
  };

  const handleResetCategory = () => {
    updateList([...DEFAULT_DROPDOWN_MASTERS[activeDef.key]]);
    onNotify?.(`${activeDef.title} restored to defaults (click Save Changes to persist).`);
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      await saveDropdownMasters(draft);
      onNotify?.('All stage dropdown masters saved to database.');
    } catch (err) {
      onNotify?.(err.message || 'Failed to save dropdown masters.', 'danger');
    } finally {
      setIsSaving(false);
    }
  };

  const stages = [...new Set(MASTER_DEFINITIONS.map(d => d.stage))];

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: '1.25rem', alignItems: 'start' }}>
      {/* Left Navigation: Stage Dropdown Categories */}
      <div className="table-card" style={{ padding: '1rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.85rem', paddingBottom: '0.6rem', borderBottom: '1px solid var(--border-light)' }}>
          <SlidersHorizontal size={16} color="var(--brand-primary)" />
          <h3 style={{ fontSize: '0.9rem', fontWeight: 800 }}>Stage Dropdown Masters</h3>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
          {stages.map(stageName => (
            <div key={stageName}>
              <div style={{ fontSize: '0.68rem', fontWeight: 800, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.35rem' }}>
                {stageName}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                {MASTER_DEFINITIONS.filter(d => d.stage === stageName).map(def => {
                  const active = def.key === activeDef.key;
                  const count = (draft[def.key] || []).length;
                  return (
                    <button
                      key={def.key}
                      id={`btn-master-cat-${def.key}`}
                      type="button"
                      onClick={() => {
                        setSelectedKey(def.key);
                        setNewText('');
                        setNewCode('');
                        setNewLabel('');
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '0.5rem 0.65rem',
                        borderRadius: '6px',
                        border: active ? '1px solid var(--brand-primary)' : '1px solid transparent',
                        backgroundColor: active ? 'rgba(232, 35, 41, 0.08)' : 'var(--bg-surface-subtle)',
                        color: active ? 'var(--brand-primary)' : 'var(--text-primary)',
                        fontSize: '0.78rem',
                        fontWeight: active ? 700 : 600,
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <span>{def.title}</span>
                      <span className="badge badge-info" style={{ fontSize: '0.68rem' }}>{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Editor Panel */}
      <div className="table-card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid var(--border-light)' }}>
          <div>
            <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--brand-primary)', textTransform: 'uppercase' }}>
              {activeDef.stage}
            </div>
            <h3 style={{ fontSize: '1.08rem', fontWeight: 800, color: 'var(--text-primary)' }}>
              {activeDef.title} ({items.length})
            </h3>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn btn-secondary"
              style={{ fontSize: '0.78rem', padding: '0.45rem 0.75rem' }}
              onClick={handleResetCategory}
            >
              <RotateCcw size={14} />
              <span>Reset Section</span>
            </button>
            <button
              id="btn-save-dropdown-masters"
              type="button"
              className="btn btn-primary"
              disabled={isSaving}
              onClick={handleSaveAll}
            >
              <Save size={15} />
              <span>{isSaving ? 'Saving...' : 'Save All Dropdown Masters'}</span>
            </button>
          </div>
        </div>

        {/* Add New Option Bar */}
        <form onSubmit={handleAddItem} style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1rem' }}>
          {activeDef.mode === 'string' ? (
            <input
              id="input-add-master-string"
              type="text"
              className="form-input"
              style={{ flex: '1 1 260px' }}
              placeholder={activeDef.placeholder}
              value={newText}
              onChange={(e) => setNewText(e.target.value)}
            />
          ) : (
            <>
              <input
                id="input-add-master-code"
                type="text"
                className="form-input"
                style={{ flex: '1 1 160px', fontFamily: 'var(--font-family-mono)' }}
                placeholder={activeDef.valuePlaceholder}
                value={newCode}
                onChange={(e) => setNewCode(e.target.value)}
              />
              <input
                id="input-add-master-label"
                type="text"
                className="form-input"
                style={{ flex: '2 1 240px' }}
                placeholder={activeDef.labelPlaceholder}
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
              />
            </>
          )}
          <button id="btn-add-master-option" type="submit" className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>
            <Plus size={15} />
            <span>Add Option</span>
          </button>
        </form>

        {/* Option Rows */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '50px' }}>#</th>
                {activeDef.mode !== 'string' && <th>Option Value / Code</th>}
                <th>Display Label</th>
                <th style={{ textAlign: 'right', width: '130px' }}>Order / Remove</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, idx) => {
                const codeKey = activeDef.mode === 'idLabel' ? 'id' : 'value';
                return (
                  <tr key={idx}>
                    <td style={{ fontWeight: 700, color: 'var(--text-muted)' }}>{idx + 1}</td>
                    {activeDef.mode === 'string' ? (
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          value={String(item)}
                          onChange={(e) => handleUpdateStringItem(idx, e.target.value)}
                        />
                      </td>
                    ) : (
                      <>
                        <td>
                          <input
                            type="text"
                            className="form-input"
                            style={{ fontFamily: 'var(--font-family-mono)', fontWeight: 600 }}
                            value={item?.[codeKey] || ''}
                            onChange={(e) => handleUpdatePairItem(idx, codeKey, e.target.value)}
                          />
                        </td>
                        <td>
                          <input
                            type="text"
                            className="form-input"
                            value={item?.label || ''}
                            onChange={(e) => handleUpdatePairItem(idx, 'label', e.target.value)}
                          />
                        </td>
                      </>
                    )}
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: '0.25rem' }}>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.45rem' }}
                          disabled={idx === 0}
                          onClick={() => handleMove(idx, -1)}
                          title="Move up"
                        >
                          <ArrowUp size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.45rem' }}
                          disabled={idx === items.length - 1}
                          onClick={() => handleMove(idx, 1)}
                          title="Move down"
                        >
                          <ArrowDown size={13} />
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          style={{ padding: '0.3rem 0.5rem', color: 'var(--danger-text)', borderColor: 'var(--danger-border)' }}
                          onClick={() => handleDelete(idx)}
                          title="Delete option"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <div style={{ marginTop: '0.75rem', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <CheckCircle2 size={14} color="var(--success-solid)" />
          <span>Changes apply across HR, Medical, EHS Safety, and Camp stage forms once saved.</span>
        </div>
      </div>
    </div>
  );
};
