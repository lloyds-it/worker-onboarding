import React, { useState } from 'react';
import {
  Building2, Plus, Pencil, Trash2, Search, X, CheckCircle2,
  AlertCircle, Phone, Mail, MapPin, FileText, Hash, Briefcase,
  ChevronDown, ChevronUp, Users, Save, XCircle
} from 'lucide-react';
import { useWorkers } from '../../context/WorkerContext';

// ─── Department options ──────────────────────────────────────────────────────
const DEPARTMENTS = ['Civil', 'Mechanical', 'Electrical', 'Other'];

const EMPTY_FORM = {
  contractorCode: '',
  locationCode: '15',
  companyName: '',
  licenseNo: '',
  department: 'Civil',
  contactPerson: '',
  contactMobile: '',
  email: '',
  address: '',
  registrationNo: '',
  labourLicenseNo: '',
  pfCode: '',
  esicCode: '',
  gstNo: '',
  panNo: '',
  validFrom: '',
  validUpto: '',
  status: 'ACTIVE'
};

// ─── Add / Edit Modal ────────────────────────────────────────────────────────
const ContractorModal = ({ contractor, onSave, onClose }) => {
  const [form, setForm] = useState(contractor ? { locationCode: '15', ...contractor } : { ...EMPTY_FORM });
  const [errors, setErrors] = useState({});

  const set = (field, val) => {
    const normalizedVal = (field === 'contractorCode' || field === 'locationCode') ? val.toUpperCase() : val;
    setForm(prev => ({ ...prev, [field]: normalizedVal }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const validate = () => {
    const e = {};
    if (!String(form.contractorCode || '').trim()) e.contractorCode = 'Contractor code is required.';
    if (!String(form.locationCode || '').trim()) e.locationCode = 'Location code is required (e.g. 15).';
    if (!String(form.companyName || '').trim()) e.companyName = 'Company name is required.';
    if (!String(form.licenseNo || '').trim()) e.licenseNo = 'License number is required.';
    if (String(form.contactMobile || '').trim() && !/^\d{10}$/.test(String(form.contactMobile).trim()))
      e.contactMobile = 'Enter a valid 10-digit mobile number.';
    if (form.email && !/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    onSave({
      ...form,
      contractorCode: String(form.contractorCode || '').trim().toUpperCase(),
      locationCode: String(form.locationCode || '15').trim().toUpperCase() || '15'
    });
  };

  const field = (label, key, type = 'text', placeholder = '', required = false, extraStyle = {}) => (
    <div className="form-group" style={extraStyle}>
      <label htmlFor={`ctr-${key}`}>
        {label} {required && <span className="required">*</span>}
      </label>
      <input
        id={`ctr-${key}`}
        type={type}
        className={`form-input ${errors[key] ? 'error' : ''}`}
        placeholder={placeholder}
        value={form[key] ?? ''}
        onChange={e => set(key, e.target.value)}
      />
      {errors[key] && <span className="error-text">{errors[key]}</span>}
    </div>
  );

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1000,
      backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '1rem', overflowY: 'auto'
    }}>
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-medium)',
        boxShadow: 'var(--shadow-xl)',
        width: '100%', maxWidth: '860px',
        maxHeight: '90vh', overflowY: 'auto',
        display: 'flex', flexDirection: 'column'
      }}>
        {/* Modal Header */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          position: 'sticky', top: 0, zIndex: 2,
          backgroundColor: 'var(--bg-surface)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              padding: '0.5rem', borderRadius: '8px',
              backgroundColor: 'var(--brand-primary)', color: '#FFF'
            }}>
              <Building2 size={18} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {contractor ? 'Edit Contractor' : 'Add New Contractor'}
              </h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                All registered contractor/agency company details
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: '0.4rem', borderRadius: '6px', cursor: 'pointer',
              color: 'var(--text-muted)', border: '1px solid var(--border-light)',
              backgroundColor: 'transparent', display: 'flex', alignItems: 'center'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem', flex: 1 }}>

          {/* Section: Basic Info */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: '1rem', paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border-light)'
            }}>
              <Building2 size={15} color="var(--brand-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Company Identification
              </span>
            </div>
            <div className="form-grid">
              {field('Company / Agency Name', 'companyName', 'text', 'e.g. L&T Construction Heavy Civil', true, { gridColumn: '1 / -1' })}
              {field('Contractor Code', 'contractorCode', 'text', 'e.g. GRY1001', true)}
              {field('Location Code', 'locationCode', 'text', 'e.g. 15', true)}
              {field('Contractor License No.', 'licenseNo', 'text', 'e.g. LIC-MH-2024-8841', true)}
              <div className="form-group">
                <label htmlFor="ctr-dept">
                  Department / Category <span className="required">*</span>
                </label>
                <select
                  id="ctr-dept"
                  className="form-select"
                  value={form.department}
                  onChange={e => set('department', e.target.value)}
                >
                  {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="ctr-status">Status</label>
                <select
                  id="ctr-status"
                  className="form-select"
                  value={form.status}
                  onChange={e => set('status', e.target.value)}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="EXPIRED">Expired</option>
                  <option value="SUSPENDED">Suspended</option>
                </select>
              </div>
              {field('Valid From', 'validFrom', 'date', '')}
              {field('Valid Upto', 'validUpto', 'date', '')}
            </div>
          </div>

          {/* Section: Contact */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: '1rem', paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border-light)'
            }}>
              <Phone size={15} color="var(--brand-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Contact Details
              </span>
            </div>
            <div className="form-grid">
              {field('Contact Person Name', 'contactPerson', 'text', 'e.g. Ramesh Kulkarni')}
              {field('Mobile Number (10 digits)', 'contactMobile', 'tel', 'e.g. 9823001001')}
              {field('Email Address', 'email', 'email', 'e.g. contact@contractor.com')}
              {field('Registered Address', 'address', 'text', 'Full company registered address', false, { gridColumn: '1 / -1' })}
            </div>
          </div>

          {/* Section: Legal & Compliance */}
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              marginBottom: '1rem', paddingBottom: '0.5rem',
              borderBottom: '1px solid var(--border-light)'
            }}>
              <FileText size={15} color="var(--brand-primary)" />
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Legal & Compliance Numbers
              </span>
            </div>
            <div className="form-grid">
              {field('Company Registration No.', 'registrationNo', 'text', 'e.g. REG-MH-LTC-2024')}
              {field('Labour License No.', 'labourLicenseNo', 'text', 'e.g. LL-MH-2024-8841')}
              {field('PF (EPFO) Code', 'pfCode', 'text', 'e.g. MH/MUM/0012481')}
              {field('ESIC Code', 'esicCode', 'text', 'e.g. ESIC-MH-24-8841')}
              {field('GST Number', 'gstNo', 'text', 'e.g. 27AAACL0036G1Z0')}
              {field('PAN Number', 'panNo', 'text', 'e.g. AAACL0036G')}
            </div>
          </div>

          {/* Footer Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1rem', borderTop: '1px solid var(--border-light)' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              <XCircle size={16} />
              <span>Cancel</span>
            </button>
            <button type="submit" className="btn btn-primary">
              <Save size={16} />
              <span>{contractor ? 'Update Contractor' : 'Add Contractor'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Delete Confirm Modal ────────────────────────────────────────────────────
const DeleteConfirm = ({ contractor, onConfirm, onCancel }) => (
  <div style={{
    position: 'fixed', inset: 0, zIndex: 1100,
    backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
  }}>
    <div style={{
      backgroundColor: 'var(--bg-surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--danger-border)',
      boxShadow: 'var(--shadow-xl)',
      padding: '2rem', maxWidth: '440px', width: '100%', textAlign: 'center'
    }}>
      <div style={{
        width: '52px', height: '52px', borderRadius: '50%',
        backgroundColor: 'var(--danger-bg)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        margin: '0 auto 1rem'
      }}>
        <Trash2 size={22} color="var(--danger-solid)" />
      </div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
        Remove Contractor?
      </h3>
      <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.5 }}>
        You are about to permanently remove <strong>{contractor.companyName}</strong> from the master list.
        This cannot be undone.
      </p>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
        <button className="btn btn-secondary" onClick={onCancel}>Cancel</button>
        <button
          className="btn"
          onClick={onConfirm}
          style={{ backgroundColor: 'var(--danger-solid)', color: '#FFF', border: 'none' }}
        >
          <Trash2 size={15} />
          <span>Yes, Remove</span>
        </button>
      </div>
    </div>
  </div>
);

// ─── Status Badge ─────────────────────────────────────────────────────────────
const StatusBadge = ({ status }) => {
  const map = {
    ACTIVE: { cls: 'badge-success', label: 'Active' },
    EXPIRED: { cls: 'badge-danger', label: 'Expired' },
    SUSPENDED: { cls: 'badge-warning', label: 'Suspended' }
  };
  const { cls, label } = map[status] || { cls: 'badge-info', label: status };
  return <span className={`badge ${cls}`}>{label}</span>;
};

// ─── Department Badge ─────────────────────────────────────────────────────────
const DeptBadge = ({ dept }) => {
  const color = {
    Civil: 'badge-info',
    Mechanical: 'badge-warning',
    Electrical: 'badge-purple',
    Other: 'badge-secondary'
  }[dept] || 'badge-info';
  return <span className={`badge ${color}`}>{dept}</span>;
};

// ─── Expandable Row Detail ────────────────────────────────────────────────────
const DetailRow = ({ label, value }) => (
  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.78rem', marginBottom: '0.3rem' }}>
    <span style={{ color: 'var(--text-muted)', minWidth: '130px', flexShrink: 0 }}>{label}:</span>
    <span style={{ color: 'var(--text-secondary)', fontWeight: 600, wordBreak: 'break-all' }}>{value || '—'}</span>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────
export const ContractorMaster = () => {
  const { contractors = [], saveContractor, deleteContractor } = useWorkers();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTarget, setEditTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [expandedRow, setExpandedRow] = useState(null);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
    setTimeout(() => setToast(null), 3500);
  };

  const filtered = contractors.filter(c => {
    const q = search.toLowerCase();
    const matchSearch = !q ||
      (c.contractorCode || '').toLowerCase().includes(q) ||
      (c.companyName || '').toLowerCase().includes(q) ||
      (c.licenseNo || '').toLowerCase().includes(q) ||
      (c.contactPerson || '').toLowerCase().includes(q) ||
      (c.gstNo || '').toLowerCase().includes(q);
    const matchDept = deptFilter === 'ALL' || c.department === deptFilter;
    const matchStatus = statusFilter === 'ALL' || c.status === statusFilter;
    return matchSearch && matchDept && matchStatus;
  });

  const handleSave = async (formData) => {
    try {
      await saveContractor(formData, editTarget?.id || null);
      if (editTarget) {
        showToast(`${formData.companyName} updated successfully.`);
      } else {
        showToast(`${formData.companyName} added to master list.`);
      }
      setModalOpen(false);
      setEditTarget(null);
    } catch (err) {
      showToast(err.message || 'Failed to save contractor.', 'danger');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteContractor(deleteTarget.id);
      showToast(`${deleteTarget.companyName} removed.`, 'danger');
      setDeleteTarget(null);
    } catch (err) {
      showToast(err.message || 'Failed to remove contractor.', 'danger');
    }
  };

  const openAdd = () => { setEditTarget(null); setModalOpen(true); };
  const openEdit = (c) => { setEditTarget(c); setModalOpen(true); };
  const toggleRow = (id) => setExpandedRow(prev => prev === id ? null : id);

  // ─── Summary Counts ──────────────────────────────────────────────────────
  const totalActive = contractors.filter(c => c.status === 'ACTIVE').length;
  const deptCounts = DEPARTMENTS.reduce((acc, d) => {
    acc[d] = contractors.filter(c => c.department === d).length;
    return acc;
  }, {});

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: '1.25rem', right: '1.25rem', zIndex: 9999,
          display: 'flex', alignItems: 'center', gap: '0.65rem',
          padding: '0.85rem 1.25rem',
          backgroundColor: toast.type === 'danger' ? 'var(--danger-solid)' : 'var(--success-solid)',
          color: '#FFF',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          fontWeight: 600, fontSize: '0.875rem',
          animation: 'slideIn 0.3s ease'
        }}>
          {toast.type === 'danger' ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
          {toast.message}
        </div>
      )}

      {/* Page Header */}
      <div style={{
        display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between',
        marginBottom: '1.75rem', flexWrap: 'wrap', gap: '1rem'
      }}>
        <div>
          <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
            Contractor Master Register
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '0.2rem' }}>
            Manage all contractor / agency company details, compliance codes, and validity.
          </p>
        </div>
        <button id="btn-add-contractor" className="btn btn-primary" onClick={openAdd}>
          <Plus size={16} />
          <span>Add New Contractor</span>
        </button>
      </div>

      {/* KPI Summary Strip */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
        gap: '1rem',
        marginBottom: '1.5rem'
      }}>
        <div className="stat-card" style={{ padding: '1rem 1.25rem' }}>
          <div className="stat-info">
            <h3>Total Contractors</h3>
            <div className="stat-value" style={{ fontSize: '1.6rem' }}>{contractors.length}</div>
            <div className="stat-sub"><span style={{ color: 'var(--success-solid)', fontWeight: 700 }}>{totalActive} Active</span></div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-solid)' }}>
            <Building2 size={20} />
          </div>
        </div>
        {DEPARTMENTS.map(d => (
          <div key={d} className="stat-card" style={{ padding: '1rem 1.25rem' }}>
            <div className="stat-info">
              <h3>{d}</h3>
              <div className="stat-value" style={{ fontSize: '1.6rem' }}>{deptCounts[d]}</div>
              <div className="stat-sub"><span style={{ color: 'var(--text-muted)' }}>agencies</span></div>
            </div>
            <div className="stat-icon" style={{
              backgroundColor: d === 'Civil' ? 'var(--info-bg)' : d === 'Mechanical' ? 'var(--warning-bg)' : d === 'Electrical' ? 'var(--purple-bg)' : 'var(--bg-surface-subtle)',
              color: d === 'Civil' ? 'var(--info-solid)' : d === 'Mechanical' ? 'var(--warning-solid)' : d === 'Electrical' ? 'var(--purple-solid)' : 'var(--text-secondary)'
            }}>
              <Briefcase size={18} />
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1rem 1.25rem',
        marginBottom: '1.25rem',
        display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap'
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: '1 1 240px', minWidth: '200px' }}>
          <Search size={15} style={{
            position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--text-muted)', pointerEvents: 'none'
          }} />
          <input
            id="contractor-search"
            type="text"
            className="form-input"
            placeholder="Search by code, name, license, GST, contact..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.2rem' }}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              style={{
                position: 'absolute', right: '0.65rem', top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                display: 'flex', alignItems: 'center'
              }}
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Department Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Dept</label>
          <select className="filter-select" value={deptFilter} onChange={e => setDeptFilter(e.target.value)}>
            <option value="ALL">All Departments</option>
            {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>

        {/* Status Filter */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
          <label style={{ fontSize: '0.68rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase' }}>Status</label>
          <select className="filter-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="EXPIRED">Expired</option>
            <option value="SUSPENDED">Suspended</option>
          </select>
        </div>

        <div style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
          Showing <strong>{filtered.length}</strong> of <strong>{contractors.length}</strong>
        </div>
      </div>

      {/* Table */}
      <div className="table-card">
        <div style={{
          padding: '1rem 1.25rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex', alignItems: 'center', gap: '0.5rem'
        }}>
          <Building2 size={16} color="var(--brand-primary)" />
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
            Contractor / Agency Register
          </h3>
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
            Lloyds Metals & Energy Ltd • Site: Hedri, Gadchiroli
          </span>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: '32px' }}></th>
                <th>Code</th>
                <th>Company / Agency Name</th>
                <th>License No.</th>
                <th>Dept</th>
                <th>Contact Person</th>
                <th>Mobile</th>
                <th>Validity</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                    <Building2 size={32} style={{ opacity: 0.3, marginBottom: '0.5rem', display: 'block', margin: '0 auto 0.5rem' }} />
                    No contractors found. {search && 'Try a different search term.'}
                  </td>
                </tr>
              ) : (
                filtered.map(c => (
                  <React.Fragment key={c.id}>
                    <tr style={{ cursor: 'pointer' }}>
                      {/* Expand toggle */}
                      <td>
                        <button
                          onClick={() => toggleRow(c.id)}
                          style={{
                            background: 'none', border: 'none', cursor: 'pointer',
                            color: 'var(--text-muted)', display: 'flex', alignItems: 'center',
                            padding: '0.25rem'
                          }}
                          title="View full details"
                        >
                          {expandedRow === c.id ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                        </button>
                      </td>

                      <td onClick={() => toggleRow(c.id)}>
                        <span className="badge badge-info" style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.75rem' }}>
                          {c.contractorCode || '—'}
                        </span>
                      </td>

                      <td onClick={() => toggleRow(c.id)}>
                        <div style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.875rem' }}>
                          {c.companyName}
                        </div>
                        <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '1px' }}>
                          ID: {c.id}
                        </div>
                      </td>

                      <td onClick={() => toggleRow(c.id)}>
                        <span style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.78rem', fontWeight: 600 }}>
                          {c.licenseNo}
                        </span>
                      </td>

                      <td onClick={() => toggleRow(c.id)}>
                        <DeptBadge dept={c.department} />
                      </td>

                      <td onClick={() => toggleRow(c.id)}>
                        <div style={{ fontSize: '0.82rem', fontWeight: 600 }}>{c.contactPerson}</div>
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{c.email || '—'}</div>
                      </td>

                      <td onClick={() => toggleRow(c.id)} style={{ fontFamily: 'var(--font-family-mono)', fontSize: '0.8rem' }}>
                        {c.contactMobile}
                      </td>

                      <td onClick={() => toggleRow(c.id)} style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                        {c.validFrom && c.validUpto ? (
                          <div>
                            <div>{c.validFrom}</div>
                            <div style={{ color: 'var(--text-muted)' }}>→ {c.validUpto}</div>
                          </div>
                        ) : '—'}
                      </td>

                      <td onClick={() => toggleRow(c.id)}>
                        <StatusBadge status={c.status} />
                      </td>

                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'flex-end' }}>
                          <button
                            id={`btn-edit-ctr-${c.id}`}
                            onClick={() => openEdit(c)}
                            title="Edit contractor"
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: '5px',
                              border: '1px solid var(--border-medium)',
                              backgroundColor: 'var(--bg-surface-subtle)',
                              color: 'var(--text-secondary)',
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '0.3rem',
                              fontSize: '0.75rem', fontWeight: 600
                            }}
                          >
                            <Pencil size={13} />
                            Edit
                          </button>
                          <button
                            id={`btn-del-ctr-${c.id}`}
                            onClick={() => setDeleteTarget(c)}
                            title="Remove contractor"
                            style={{
                              padding: '0.3rem 0.6rem',
                              borderRadius: '5px',
                              border: '1px solid var(--danger-border)',
                              backgroundColor: 'var(--danger-bg)',
                              color: 'var(--danger-text)',
                              cursor: 'pointer',
                              display: 'flex', alignItems: 'center', gap: '0.3rem',
                              fontSize: '0.75rem', fontWeight: 600
                            }}
                          >
                            <Trash2 size={13} />
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Expanded detail row */}
                    {expandedRow === c.id && (
                      <tr>
                        <td colSpan={10} style={{ padding: 0, backgroundColor: 'var(--bg-surface-subtle)' }}>
                          <div style={{
                            padding: '1.25rem 1.5rem',
                            borderTop: '1px solid var(--border-light)',
                            borderBottom: '2px solid var(--brand-primary)',
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
                            gap: '1.25rem'
                          }}>
                            {/* Legal Section */}
                            <div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                📋 Legal & Compliance
                              </div>
                              <DetailRow label="Reg. No." value={c.registrationNo} />
                              <DetailRow label="Labour License" value={c.labourLicenseNo} />
                              <DetailRow label="PF (EPFO) Code" value={c.pfCode} />
                              <DetailRow label="ESIC Code" value={c.esicCode} />
                              <DetailRow label="GST No." value={c.gstNo} />
                              <DetailRow label="PAN No." value={c.panNo} />
                            </div>
                            {/* Contact Section */}
                            <div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                📞 Contact & Address
                              </div>
                              <DetailRow label="Contact Person" value={c.contactPerson} />
                              <DetailRow label="Mobile" value={c.contactMobile} />
                              <DetailRow label="Email" value={c.email} />
                              <DetailRow label="Address" value={c.address} />
                            </div>
                            {/* Meta Section */}
                            <div>
                              <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem' }}>
                                📅 Validity & Record
                              </div>
                              <DetailRow label="Contractor Code" value={c.contractorCode} />
                              <DetailRow label="Location Code" value={c.locationCode || '15'} />
                              <DetailRow label="Contractor ID" value={c.id} />
                              <DetailRow label="Valid From" value={c.validFrom} />
                              <DetailRow label="Valid Upto" value={c.validUpto} />
                              <DetailRow label="Status" value={c.status} />
                              <DetailRow label="Created" value={c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-IN') : '—'} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div style={{
          padding: '0.75rem 1.25rem',
          borderTop: '1px solid var(--border-light)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          fontSize: '0.78rem', color: 'var(--text-muted)'
        }}>
          <span>{filtered.length} record{filtered.length !== 1 ? 's' : ''} shown</span>
          <span>Lloyds Metals & Energy Ltd • Contractor Master Register • Internal Use Only</span>
        </div>
      </div>

      {/* Modals */}
      {modalOpen && (
        <ContractorModal
          contractor={editTarget}
          onSave={handleSave}
          onClose={() => { setModalOpen(false); setEditTarget(null); }}
        />
      )}
      {deleteTarget && (
        <DeleteConfirm
          contractor={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};
