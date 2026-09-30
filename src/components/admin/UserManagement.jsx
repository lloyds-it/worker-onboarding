import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  ShieldCheck, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Building2, 
  Mail, 
  Briefcase 
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROLE_LABELS } from '../../types/constants';
import { SSOConfigTab } from './SSOConfigTab';

export const UserManagement = () => {
  const { users, createUser, toggleUserStatus, deleteUser, currentUser } = useAuth();

  const [adminSubTab, setAdminSubTab] = useState('ACCOUNTS'); // 'ACCOUNTS' | 'SSO'
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ROLES.HR,
    designation: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const defaultDesignations = {
    [ROLES.ADMIN]: 'Site Administrator / Director',
    [ROLES.HR]: 'HR Induction Officer',
    [ROLES.MEDICAL]: 'Medical Officer (CIH)',
    [ROLES.SAFETY]: 'EHS Safety Inspector',
    [ROLES.IT]: 'IT Biometric Systems Lead',
    [ROLES.CAMP]: 'Camp Housing Coordinator'
  };

  const handleRoleChange = (role) => {
    setFormData({
      ...formData,
      role,
      designation: defaultDesignations[role] || ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!formData.name.trim()) {
      setError('Staff member full name is required.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('A valid work email address is required.');
      return;
    }

    const created = createUser({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      designation: formData.designation || defaultDesignations[formData.role]
    });

    if (created) {
      setSuccess(`Account successfully created for ${formData.name} in ${ROLE_LABELS[formData.role]}.`);
      setFormData({
        name: '',
        email: '',
        role: ROLES.HR,
        designation: ''
      });
      setIsCreating(false);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return <span className="badge badge-purple">👑 {ROLE_LABELS[role]}</span>;
      case ROLES.HR:
        return <span className="badge badge-info">📋 {ROLE_LABELS[role]}</span>;
      case ROLES.MEDICAL:
        return <span className="badge badge-warning">🩺 {ROLE_LABELS[role]}</span>;
      case ROLES.SAFETY:
        return <span className="badge badge-purple">🛡️ {ROLE_LABELS[role]}</span>;
      case ROLES.IT:
        return <span className="badge badge-info">💻 {ROLE_LABELS[role]}</span>;
      case ROLES.CAMP:
        return <span className="badge badge-success">🏕️ {ROLE_LABELS[role]}</span>;
      default:
        return <span className="badge badge-info">{role}</span>;
    }
  };

  return (
    <div>
      {/* Sub-Navigation Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.65rem',
        marginBottom: '1.5rem',
        borderBottom: '2px solid var(--border-light)',
        paddingBottom: '0.65rem'
      }}>
        <button
          id="btn-tab-staff-accounts"
          type="button"
          onClick={() => setAdminSubTab('ACCOUNTS')}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: adminSubTab === 'ACCOUNTS' ? 'var(--brand-primary)' : 'var(--bg-surface)',
            color: adminSubTab === 'ACCOUNTS' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: adminSubTab === 'ACCOUNTS' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          <Users size={16} />
          <span>Department Staff Accounts ({users.length})</span>
        </button>

        <button
          id="btn-tab-enterprise-sso"
          type="button"
          onClick={() => setAdminSubTab('SSO')}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: adminSubTab === 'SSO' ? 'var(--brand-primary)' : 'var(--bg-surface)',
            color: adminSubTab === 'SSO' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: adminSubTab === 'SSO' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          <ShieldCheck size={16} />
          <span>Enterprise SSO &amp; SAML Federation</span>
          <span style={{
            fontSize: '0.65rem',
            backgroundColor: adminSubTab === 'SSO' ? 'rgba(255,255,255,0.25)' : '#ECFDF5',
            color: adminSubTab === 'SSO' ? '#FFF' : '#065F46',
            padding: '0.15rem 0.5rem',
            borderRadius: '10px',
            fontWeight: 800
          }}>
            Active
          </span>
        </button>
      </div>

      {adminSubTab === 'SSO' ? (
        <SSOConfigTab />
      ) : (
        <>
          {/* Header Banner */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldCheck size={24} color="var(--brand-primary)" />
                <span>Staff Accounts & Department Role Assignment</span>
              </h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Create and authorize departmental credentials. Each user can only log into their assigned department portal.
              </p>
            </div>

            <button
              id="btn-toggle-create-user"
              className="btn btn-primary"
              onClick={() => setIsCreating(!isCreating)}
            >
              <UserPlus size={16} />
              <span>{isCreating ? 'Close Form' : '+ Add New Department Staff'}</span>
            </button>
          </div>

      {/* Success / Error alerts */}
      {success && (
        <div style={{
          backgroundColor: 'var(--success-bg)',
          color: 'var(--success-text)',
          border: '1px solid var(--success-border)',
          borderRadius: 'var(--radius-sm)',
          padding: '0.75rem 1rem',
          marginBottom: '1.25rem',
          fontSize: '0.85rem',
          fontWeight: 600
        }}>
          {success}
        </div>
      )}

      {/* Create User Card Form */}
      {isCreating && (
        <form onSubmit={handleSubmit} className="form-card" style={{ marginBottom: '1.75rem' }}>
          <div className="form-section-header">
            <h3>
              <UserPlus size={18} color="var(--brand-primary)" />
              <span>Create Staff Member & Assign Department Role</span>
            </h3>
            <span className="badge badge-info">Admin Authority</span>
          </div>

          {error && (
            <div style={{
              backgroundColor: 'var(--danger-bg)',
              color: 'var(--danger-text)',
              border: '1px solid var(--danger-border)',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              fontSize: '0.8rem',
              fontWeight: 600
            }}>
              {error}
            </div>
          )}

          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="staff-name">Staff Full Name <span className="required">*</span></label>
              <input
                id="staff-name"
                type="text"
                className="form-input"
                placeholder="e.g. Sunil Deshmukh"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="staff-email">Work Email Address <span className="required">*</span></label>
              <input
                id="staff-email"
                type="email"
                className="form-input"
                placeholder="e.g. sunil.deshmukh@lloyds.in"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label htmlFor="staff-role">Assigned Department <span className="required">*</span></label>
              <select
                id="staff-role"
                className="form-select"
                value={formData.role}
                onChange={(e) => handleRoleChange(e.target.value)}
              >
                <option value={ROLES.HR}>📋 {ROLE_LABELS[ROLES.HR]} (Step 1)</option>
                <option value={ROLES.MEDICAL}>🩺 {ROLE_LABELS[ROLES.MEDICAL]} (Step 2)</option>
                <option value={ROLES.SAFETY}>🛡️ {ROLE_LABELS[ROLES.SAFETY]} (Step 3)</option>
                <option value={ROLES.IT}>💻 {ROLE_LABELS[ROLES.IT]} (Step 4)</option>
                <option value={ROLES.CAMP}>🏕️ {ROLE_LABELS[ROLES.CAMP]} (Step 5)</option>
                <option value={ROLES.ADMIN}>👑 {ROLE_LABELS[ROLES.ADMIN]} (All Access)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="staff-designation">Official Designation / Title</label>
              <input
                id="staff-designation"
                type="text"
                className="form-input"
                placeholder="e.g. Site HR Lead"
                value={formData.designation}
                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
              />
            </div>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => setIsCreating(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              <CheckCircle2 size={16} />
              <span>Save & Authorize Account</span>
            </button>
          </div>
        </form>
      )}

      {/* KPI Stats */}
      <div className="dashboard-grid">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Staff Accounts</h3>
            <div className="stat-value">{users.length}</div>
            <div className="stat-sub">Configured credentials</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--info-bg)', color: 'var(--info-solid)' }}>
            <Users size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Active Accounts</h3>
            <div className="stat-value" style={{ color: 'var(--success-solid)' }}>
              {users.filter(u => u.status === 'ACTIVE').length}
            </div>
            <div className="stat-sub">Permitted login access</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success-solid)' }}>
            <CheckCircle2 size={22} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Departments Covered</h3>
            <div className="stat-value">6 / 6</div>
            <div className="stat-sub">All functional areas staffed</div>
          </div>
          <div className="stat-icon" style={{ backgroundColor: 'var(--purple-bg)', color: 'var(--purple-solid)' }}>
            <Building2 size={22} />
          </div>
        </div>
      </div>

      {/* Staff Roster Table */}
      <div className="table-card">
        <div style={{ padding: '1.25rem', borderBottom: '1px solid var(--border-light)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>
            Authorized Department Staff Directory
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Strict role-based isolation enforced
          </span>
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Staff Member</th>
                <th>Work Email</th>
                <th>Assigned Department</th>
                <th>Official Designation</th>
                <th>Account Status</th>
                <th style={{ textAlign: 'right' }}>Admin Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => {
                const isPrimaryAdmin = u.id === 'USR-ADMIN-01';
                const isActive = u.status === 'ACTIVE';

                return (
                  <tr key={u.id}>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--text-primary)' }}>
                        {u.name} {u.id === currentUser?.id && <span style={{ fontSize: '0.7rem', color: 'var(--brand-primary)', fontWeight: 800 }}>(You)</span>}
                      </div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family-mono)' }}>
                        {u.id}
                      </div>
                    </td>

                    <td style={{ fontSize: '0.85rem' }}>
                      <strong>{u.email}</strong>
                    </td>

                    <td>{getRoleBadge(u.role)}</td>

                    <td>
                      <div style={{ fontSize: '0.825rem', fontWeight: 600 }}>{u.designation}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{u.department}</div>
                    </td>

                    <td>
                      <span className={`badge badge-${isActive ? 'success' : 'danger'}`}>
                        {isActive ? 'ACTIVE' : 'DEACTIVATED'}
                      </span>
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.5rem' }}>
                        {!isPrimaryAdmin && (
                          <>
                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                              onClick={() => toggleUserStatus(u.id)}
                            >
                              {isActive ? 'Deactivate' : 'Activate'}
                            </button>

                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.55rem', color: 'var(--danger-solid)' }}
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to remove ${u.name}?`)) {
                                  deleteUser(u.id);
                                }
                              }}
                              title="Delete user account"
                            >
                              <Trash2 size={14} />
                            </button>
                          </>
                        )}
                        {isPrimaryAdmin && (
                          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>
                            Permanent
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
        </>
      )}
    </div>
  );
};
