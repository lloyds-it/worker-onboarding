import React, { useState } from 'react';
import { SearchableSelect } from '../common/SearchableSelect';
import {
  Users,
  UserPlus,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Trash2,
  Building2,
  Mail,
  Briefcase,
  Key,
  FileSignature,
  Stethoscope,
  HardHat,
  Fingerprint,
  Home,
  Eye,
  EyeOff,
  Pencil,
  Sliders,
  MapPin,
  Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useWorkers } from '../../context/WorkerContext';
import { ROLES, ROLE_LABELS } from '../../types/constants';
import { SSOConfigTab } from './SSOConfigTab';
import { ChangePasswordModal } from '../common/ChangePasswordModal';
import { DigitalSignatureModal } from '../common/DigitalSignatureModal';

export const UserManagement = () => {
  const {
    users,
    createUser,
    updateUser,
    userMasterConfig,
    saveUserMasterConfig,
    toggleUserStatus,
    deleteUser,
    sendResetPasswordLink,
    currentUser
  } = useAuth();
  const { locations = [] } = useWorkers();

  const [adminSubTab, setAdminSubTab] = useState('ACCOUNTS'); // 'ACCOUNTS' | 'CONFIG' | 'SSO'
  const [isCreating, setIsCreating] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState(null);
  const [passwordModalUser, setPasswordModalUser] = useState(null);
  const [signatureModalUser, setSignatureModalUser] = useState(null);
  const [sendingResetId, setSendingResetId] = useState(null);
  const [configDraft, setConfigDraft] = useState(userMasterConfig);
  const [savingConfig, setSavingConfig] = useState(false);

  const getRoleTemplate = (role) => {
    const cfg = userMasterConfig?.roles?.[role];
    return {
      designation: cfg?.defaultDesignation || '',
      department: cfg?.department || ''
    };
  };

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: ROLES.HR,
    designation: getRoleTemplate(ROLES.HR).designation,
    department: getRoleTemplate(ROLES.HR).department,
    locationCode: 'ALL',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  React.useEffect(() => {
    setConfigDraft(userMasterConfig);
  }, [userMasterConfig]);

  const handleRoleChange = (role) => {
    const tpl = getRoleTemplate(role);
    setFormData({
      ...formData,
      role,
      designation: tpl.designation,
      department: tpl.department
    });
  };

  const handleSubmit = async (e) => {
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

    const tpl = getRoleTemplate(formData.role);
    const created = await createUser({
      name: formData.name,
      email: formData.email,
      role: formData.role,
      designation: formData.designation || tpl.designation,
      department: formData.department || tpl.department,
      locationCode: formData.locationCode || 'ALL',
      password: formData.password || userMasterConfig?.defaultPassword || 'Lloyds@2026#'
    });

    if (created) {
      const mailStatus = created.emailNotification?.status;
      const mailNote = mailStatus === 'SENT'
        ? ` Credentials, portal link & reset password link emailed to ${formData.email}.`
        : mailStatus
          ? ` (Email status: ${mailStatus}${created.emailNotification?.error ? ` — ${created.emailNotification.error}` : ''})`
          : '';
      setSuccess(`Account created for ${formData.name} in ${ROLE_LABELS[formData.role]}.${mailNote}`);
      const resetTpl = getRoleTemplate(ROLES.HR);
      setFormData({
        name: '',
        email: '',
        role: ROLES.HR,
        designation: resetTpl.designation,
        department: resetTpl.department,
        locationCode: 'ALL',
        password: ''
      });
      setIsCreating(false);
    }
  };

  const openEditUser = (u) => {
    setError('');
    setSuccess('');
    const roleDefaults = userMasterConfig?.roles?.[u.role] || {};
    setEditingUser(u);
    setEditForm({
      name: u.name || '',
      email: u.email || '',
      role: u.role || ROLES.HR,
      designation: u.designation || roleDefaults.defaultDesignation || '',
      department: u.department || roleDefaults.department || '',
      locationCode: u.locationCode || 'ALL',
      status: u.status || 'ACTIVE',
      permissions: {
        canViewAllStages: u.permissions?.canViewAllStages ?? Boolean(roleDefaults.canViewAllStages),
        canExportReports: u.permissions?.canExportReports ?? Boolean(roleDefaults.canExportReports),
        canManageMasters: u.permissions?.canManageMasters ?? Boolean(roleDefaults.canManageMasters)
      }
    });
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    if (!editingUser || !editForm) return;
    setError('');
    setSuccess('');
    const res = await updateUser(editingUser.id, editForm);
    if (res && res.success) {
      setSuccess(`Updated configuration for ${editForm.name} (${editForm.email}).`);
      setEditingUser(null);
      setEditForm(null);
    } else {
      setError(res?.error || 'Failed to update staff account configuration.');
    }
  };

  const handleSaveMasterConfig = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSavingConfig(true);
    try {
      const res = await saveUserMasterConfig(configDraft);
      if (res && res.success) {
        setSuccess('User Master role defaults and access configuration saved.');
      } else {
        setError(res?.error || 'Failed to save User Master configuration.');
      }
    } finally {
      setSavingConfig(false);
    }
  };

  const handleSendResetLink = async (user) => {
    setError('');
    setSuccess('');
    setSendingResetId(user.id);
    try {
      const res = await sendResetPasswordLink(user.id);
      if (res && res.success) {
        setSuccess(res.message || `Password reset link emailed to ${user.email}.`);
      } else {
        setError(res?.error || `Failed to send reset link to ${user.email}.`);
      }
    } finally {
      setSendingResetId(null);
    }
  };

  const getRoleBadge = (role) => {
    switch (role) {
      case ROLES.ADMIN:
        return <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><ShieldCheck size={12} /> {ROLE_LABELS[role]}</span>;
      case ROLES.HR:
        return <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Users size={12} /> {ROLE_LABELS[role]}</span>;
      case ROLES.MEDICAL:
        return <span className="badge badge-warning" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Stethoscope size={12} /> {ROLE_LABELS[role]}</span>;
      case ROLES.SAFETY:
        return <span className="badge badge-purple" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><HardHat size={12} /> {ROLE_LABELS[role]}</span>;
      case ROLES.IT:
        return <span className="badge badge-info" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Fingerprint size={12} /> {ROLE_LABELS[role]}</span>;
      case ROLES.CAMP:
        return <span className="badge badge-success" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}><Home size={12} /> {ROLE_LABELS[role]}</span>;
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
          id="btn-tab-user-config"
          type="button"
          onClick={() => setAdminSubTab('CONFIG')}
          style={{
            padding: '0.6rem 1.1rem',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: adminSubTab === 'CONFIG' ? 'var(--brand-primary)' : 'var(--bg-surface)',
            color: adminSubTab === 'CONFIG' ? '#FFFFFF' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '0.85rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            boxShadow: adminSubTab === 'CONFIG' ? 'var(--shadow-sm)' : 'none'
          }}
        >
          <Sliders size={16} />
          <span>User Master Configuration</span>
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
            backgroundColor: adminSubTab === 'SSO' ? 'rgba(255,255,255,0.25)' : 'rgba(239, 68, 68, 0.1)',
            color: adminSubTab === 'SSO' ? '#FFF' : '#DC2626',
            padding: '0.15rem 0.5rem',
            borderRadius: '10px',
            fontWeight: 800
          }}>
            Disabled for now
          </span>
        </button>
      </div>

      {adminSubTab === 'SSO' ? (
        <SSOConfigTab />
      ) : adminSubTab === 'CONFIG' ? (
        <form onSubmit={handleSaveMasterConfig} className="form-card" style={{ marginBottom: 0 }}>
          <div className="form-section-header">
            <h3>
              <Sliders size={18} color="var(--brand-primary)" />
              <span>Configurable User Master Policies &amp; Role Templates</span>
            </h3>
            <span className="badge badge-info">Admin Config</span>
          </div>

          {success && (
            <div style={{
              backgroundColor: 'var(--success-bg)', color: 'var(--success-text)',
              border: '1px solid var(--success-border)', borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600
            }}>
              {success}
            </div>
          )}
          {error && (
            <div style={{
              backgroundColor: 'var(--danger-bg)', color: 'var(--danger-text)',
              border: '1px solid var(--danger-border)', borderRadius: 'var(--radius-sm)',
              padding: '0.75rem 1rem', marginBottom: '1rem', fontSize: '0.85rem', fontWeight: 600
            }}>
              {error}
            </div>
          )}

          <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
            <div className="form-group">
              <label htmlFor="cfg-default-pass">Default Initial Password (for New Staff)</label>
              <input
                id="cfg-default-pass"
                type="text"
                className="form-input"
                value={configDraft?.defaultPassword || ''}
                onChange={e => setConfigDraft(prev => ({ ...prev, defaultPassword: e.target.value }))}
              />
            </div>

            <div className="form-group">
              <label>Department Isolation Policy</label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.55rem 0.75rem', border: '1px solid var(--border-medium)', borderRadius: 'var(--radius-sm)', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={configDraft?.enforceDepartmentIsolation !== false}
                  onChange={e => setConfigDraft(prev => ({ ...prev, enforceDepartmentIsolation: e.target.checked }))}
                />
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>Enforce strict department queue isolation</span>
              </label>
            </div>
          </div>

          <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: 'var(--text-secondary)', textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            Department Role Templates &amp; Permissions
          </h4>

          <div className="data-table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Role</th>
                  <th>Department Name</th>
                  <th>Default Designation</th>
                  <th>All Stages</th>
                  <th>Export Reports</th>
                  <th>Manage Masters</th>
                </tr>
              </thead>
              <tbody>
                {Object.keys(ROLES).map(key => {
                  const roleKey = ROLES[key];
                  const rCfg = configDraft?.roles?.[roleKey] || {};
                  const updateRoleCfg = (field, val) => {
                    setConfigDraft(prev => ({
                      ...prev,
                      roles: {
                        ...prev.roles,
                        [roleKey]: {
                          ...(prev.roles?.[roleKey] || {}),
                          [field]: val
                        }
                      }
                    }));
                  };
                  return (
                    <tr key={roleKey}>
                      <td>{getRoleBadge(roleKey)}</td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          value={rCfg.department || ''}
                          onChange={e => updateRoleCfg('department', e.target.value)}
                          style={{ minWidth: '180px' }}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          className="form-input"
                          value={rCfg.defaultDesignation || ''}
                          onChange={e => updateRoleCfg('defaultDesignation', e.target.value)}
                          style={{ minWidth: '180px' }}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(rCfg.canViewAllStages)}
                          onChange={e => updateRoleCfg('canViewAllStages', e.target.checked)}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(rCfg.canExportReports)}
                          onChange={e => updateRoleCfg('canExportReports', e.target.checked)}
                        />
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          checked={Boolean(rCfg.canManageMasters)}
                          onChange={e => updateRoleCfg('canManageMasters', e.target.checked)}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={savingConfig}>
              <Save size={16} />
              <span>{savingConfig ? 'Saving Configuration...' : 'Save User Master Configuration'}</span>
            </button>
          </div>
        </form>
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
          {error && !isCreating && (
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
                  <SearchableSelect
                    id="staff-role"
                    className="form-select"
                    value={formData.role}
                    onChange={(e) => handleRoleChange(e.target.value)}
                  >
                    <option value={ROLES.HR}>HR Operations (Step 1)</option>
                    <option value={ROLES.MEDICAL}>Medical Health (Step 2)</option>
                    <option value={ROLES.SAFETY}>EHS Safety (Step 3)</option>
                    <option value={ROLES.IT}>IT Systems &amp; Biometrics (Step 4)</option>
                    <option value={ROLES.CAMP}>Camp Housing (Step 5)</option>
                    <option value={ROLES.ADMIN}>Chief Administrator (Executive Full Access)</option>
                  </SearchableSelect>
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

                <div className="form-group">
                  <label htmlFor="staff-department">Department Display Title</label>
                  <input
                    id="staff-department"
                    type="text"
                    className="form-input"
                    placeholder="e.g. Human Resources"
                    value={formData.department}
                    onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="staff-location">Assigned Plant Location</label>
                  <SearchableSelect
                    id="staff-location"
                    className="form-select"
                    value={formData.locationCode || 'ALL'}
                    onChange={(e) => setFormData({ ...formData, locationCode: e.target.value })}
                  >
                    <option value="ALL">ALL — All Plant Locations</option>
                    {locations.filter(l => l.status !== 'INACTIVE').map(loc => (
                      <option key={loc.id || loc.locationCode} value={loc.locationCode}>
                        {loc.locationCode} — {loc.locationName}
                      </option>
                    ))}
                  </SearchableSelect>
                </div>

                <div className="form-group">
                  <label htmlFor="staff-password">Initial Password (Optional)</label>
                  <div style={{ position: 'relative' }}>
                    <input
                      id="staff-password"
                      type={showPassword ? 'text' : 'password'}
                      className="form-input"
                      placeholder={`Leave blank for default (${userMasterConfig?.defaultPassword || 'Lloyds@2026#'})`}
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      style={{ paddingRight: '2.5rem' }}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{
                        position: 'absolute',
                        right: '0.75rem',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text-muted)'
                      }}
                      title={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
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
                    <th>Digital Signature</th>
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
                          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                            {u.department} {u.locationCode && u.locationCode !== 'ALL' ? `• Loc ${u.locationCode}` : ''}
                          </div>
                        </td>

                        <td>
                          {u.signature ? (
                            <div
                              onClick={() => setSignatureModalUser(u)}
                              title="Click to view or replace signature"
                              style={{
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.4rem',
                                padding: '0.2rem 0.5rem',
                                backgroundColor: '#FFFFFF',
                                border: '1px solid var(--border-medium)',
                                borderRadius: '6px',
                                cursor: 'pointer',
                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                              }}
                            >
                              <img
                                src={u.signature}
                                alt="Sig"
                                style={{ height: '22px', maxWidth: '65px', objectFit: 'contain' }}
                              />
                              <span style={{ fontSize: '0.7rem', color: 'var(--success-solid, #059669)', fontWeight: 800 }}>✓ Active</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              className="btn btn-secondary"
                              onClick={() => setSignatureModalUser(u)}
                              style={{ padding: '0.25rem 0.55rem', fontSize: '0.72rem', display: 'inline-flex', alignItems: 'center', gap: '0.3rem' }}
                            >
                              <FileSignature size={13} />
                              <span>+ Add Sig</span>
                            </button>
                          )}
                        </td>

                        <td>
                          <span className={`badge badge-${isActive ? 'success' : 'danger'}`}>
                            {isActive ? 'ACTIVE' : 'DEACTIVATED'}
                          </span>
                        </td>

                        <td style={{ textAlign: 'right' }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.4rem', flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                              onClick={() => openEditUser(u)}
                              title={`Edit / configure ${u.name}`}
                            >
                              <Pencil size={13} color="var(--brand-primary)" />
                              <span>Edit</span>
                            </button>

                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                              onClick={() => handleSendResetLink(u)}
                              disabled={sendingResetId === u.id || !isActive}
                              title={`Email password reset link to ${u.email}`}
                            >
                              <Mail size={13} color="#2563EB" />
                              <span>{sendingResetId === u.id ? 'Sending...' : 'Reset Link'}</span>
                            </button>

                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.6rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                              onClick={() => setPasswordModalUser(u)}
                              title={`Set password directly for ${u.name}`}
                            >
                              <Key size={13} color="var(--brand-primary)" />
                              <span>Password</span>
                            </button>

                            <button
                              className="btn btn-secondary"
                              style={{ padding: '0.35rem 0.55rem', fontSize: '0.75rem' }}
                              onClick={() => setSignatureModalUser(u)}
                              title={`Upload or manage digital signature for ${u.name}`}
                            >
                              <FileSignature size={14} color="#2563EB" />
                            </button>

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
                              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontStyle: 'italic', paddingLeft: '0.25rem' }}>
                                Chief
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

      {/* Edit Staff Configuration Modal */}
      {editingUser && editForm && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1000,
          backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-surface)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-medium)', boxShadow: 'var(--shadow-xl)',
            width: '100%', maxWidth: '640px', maxHeight: '90vh', overflowY: 'auto', padding: '1.5rem'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-light)', paddingBottom: '0.75rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                Configure Staff Account — {editingUser.name}
              </h3>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem' }}
                onClick={() => { setEditingUser(null); setEditForm(null); }}
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveUserEdit}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Full Name <span className="required">*</span></label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.name}
                    onChange={e => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Work Email <span className="required">*</span></label>
                  <input
                    type="email"
                    className="form-input"
                    value={editForm.email}
                    onChange={e => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                    disabled={editingUser.id === 'USR-ADMIN-01'}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Assigned Department Role</label>
                  <SearchableSelect
                    className="form-select"
                    value={editForm.role}
                    disabled={editingUser.id === 'USR-ADMIN-01'}
                    onChange={e => {
                      const nextRole = e.target.value;
                      const tpl = getRoleTemplate(nextRole);
                      setEditForm(prev => ({
                        ...prev,
                        role: nextRole,
                        designation: tpl.designation || prev.designation,
                        department: tpl.department || prev.department
                      }));
                    }}
                  >
                    <option value={ROLES.HR}>HR Operations (Step 1)</option>
                    <option value={ROLES.MEDICAL}>Medical Health (Step 2)</option>
                    <option value={ROLES.SAFETY}>EHS Safety (Step 3)</option>
                    <option value={ROLES.IT}>IT Systems &amp; Biometrics (Step 4)</option>
                    <option value={ROLES.CAMP}>Camp Housing (Step 5)</option>
                    <option value={ROLES.ADMIN}>Chief Administrator</option>
                  </SearchableSelect>
                </div>
                <div className="form-group">
                  <label>Official Designation</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.designation}
                    onChange={e => setEditForm(prev => ({ ...prev, designation: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Department Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editForm.department}
                    onChange={e => setEditForm(prev => ({ ...prev, department: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label>Assigned Plant Location Scope</label>
                  <SearchableSelect
                    className="form-select"
                    value={editForm.locationCode || 'ALL'}
                    onChange={e => setEditForm(prev => ({ ...prev, locationCode: e.target.value }))}
                  >
                    <option value="ALL">ALL — All Plant Locations</option>
                    {locations.filter(l => l.status !== 'INACTIVE').map(loc => (
                      <option key={loc.id || loc.locationCode} value={loc.locationCode}>
                        {loc.locationCode} — {loc.locationName}
                      </option>
                    ))}
                  </SearchableSelect>
                </div>
              </div>

              <div style={{ marginTop: '1rem', padding: '0.85rem', backgroundColor: 'var(--bg-surface-subtle)', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-light)' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  Granular Account Capabilities
                </div>
                <div style={{ display: 'flex', gap: '1.25rem', flexWrap: 'wrap', fontSize: '0.82rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editForm.permissions?.canViewAllStages)}
                      onChange={e => setEditForm(prev => ({ ...prev, permissions: { ...prev.permissions, canViewAllStages: e.target.checked } }))}
                    />
                    <span>View All Stages</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editForm.permissions?.canExportReports)}
                      onChange={e => setEditForm(prev => ({ ...prev, permissions: { ...prev.permissions, canExportReports: e.target.checked } }))}
                    />
                    <span>Export Reports</span>
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={Boolean(editForm.permissions?.canManageMasters)}
                      onChange={e => setEditForm(prev => ({ ...prev, permissions: { ...prev.permissions, canManageMasters: e.target.checked } }))}
                    />
                    <span>Manage Contractors &amp; Locations</span>
                  </label>
                </div>
              </div>

              <div style={{ marginTop: '1.25rem', display: 'flex', justifyContent: 'flex-end', gap: '0.65rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => { setEditingUser(null); setEditForm(null); }}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  <Save size={15} />
                  <span>Save User Configuration</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Change / Reset Password Modal */}
      {passwordModalUser && (
        <ChangePasswordModal
          isOpen={true}
          onClose={() => setPasswordModalUser(null)}
          targetUser={passwordModalUser}
          isAdminReset={true}
        />
      )}

      {/* Digital Signature Upload/Draw Modal */}
      {signatureModalUser && (
        <DigitalSignatureModal
          isOpen={true}
          onClose={() => setSignatureModalUser(null)}
          targetUser={signatureModalUser}
        />
      )}
    </div>
  );
};
