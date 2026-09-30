import React, { useState } from 'react';
import { Key, Eye, EyeOff, ShieldCheck, Check, X, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ROLE_LABELS } from '../../types/constants';

export const ChangePasswordModal = ({ 
  isOpen, 
  onClose, 
  targetUser = null, 
  isAdminReset = false 
}) => {
  const { currentUser, changePassword } = useAuth();

  const userToUpdate = targetUser || currentUser;

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen || !userToUpdate) return null;

  // Calculate password strength
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, text: 'Empty', color: '#94A3B8' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[A-Z]/.test(pass) && /[a-z]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    switch (score) {
      case 1:
        return { score: 20, text: 'Very Weak', color: '#EF4444' };
      case 2:
        return { score: 40, text: 'Weak', color: '#F97316' };
      case 3:
        return { score: 60, text: 'Fair', color: '#F59E0B' };
      case 4:
        return { score: 80, text: 'Good', color: '#3B82F6' };
      case 5:
        return { score: 100, text: 'Strong', color: '#10B981' };
      default:
        return { score: 10, text: 'Too Short', color: '#EF4444' };
    }
  };

  const strength = getPasswordStrength(newPassword);

  const generateStrongPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%&*';
    let generated = 'Lloyds@';
    for (let i = 0; i < 6; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(generated);
    setConfirmPassword(generated);
    setShowNew(true);
    setShowConfirm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!isAdminReset && !currentPassword) {
      setErrorMsg('Please enter your current password.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('New password and confirmation do not match.');
      return;
    }

    if (!isAdminReset && currentPassword === newPassword) {
      setErrorMsg('New password must be different from current password.');
      return;
    }

    setIsLoading(true);

    try {
      const res = await changePassword({
        username: userToUpdate.email || userToUpdate.id,
        currentPassword,
        newPassword,
        isAdminReset,
        targetUserId: userToUpdate.id
      });

      if (res.success) {
        setSuccessMsg(res.message || 'Password successfully updated.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => {
          onClose();
        }, 1400);
      } else {
        setErrorMsg(res.error || 'Failed to update password.');
      }
    } catch (err) {
      setErrorMsg('An unexpected error occurred while updating password.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 100 }}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '480px', width: '100%', borderRadius: '14px', overflow: 'hidden' }}
      >
        {/* Header */}
        <div style={{
          padding: '1.25rem 1.5rem',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--bg-surface-subtle)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              backgroundColor: 'rgba(220, 38, 38, 0.1)',
              color: 'var(--brand-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Key size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: 'var(--text-primary)' }}>
                {isAdminReset ? 'Reset Staff Password' : 'Change Password'}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {isAdminReset ? `Administrative override for ${userToUpdate.name}` : 'Update your account credentials'}
              </span>
            </div>
          </div>

          <button 
            className="btn btn-secondary" 
            onClick={onClose}
            style={{ padding: '0.35rem 0.5rem', borderRadius: '6px' }}
            aria-label="Close modal"
          >
            <X size={16} />
          </button>
        </div>

        {/* User Badge Info */}
        <div style={{
          padding: '0.85rem 1.5rem',
          backgroundColor: 'var(--bg-surface)',
          borderBottom: '1px solid var(--border-light)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div>
            <div style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-primary)' }}>
              {userToUpdate.name}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {userToUpdate.email}
            </div>
          </div>
          <span className="badge badge-info" style={{ fontSize: '0.72rem' }}>
            {ROLE_LABELS[userToUpdate.role] || userToUpdate.role}
          </span>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '1.5rem' }}>
          {errorMsg && (
            <div style={{
              backgroundColor: 'var(--danger-bg, #FEF2F2)',
              color: 'var(--danger-text, #991B1B)',
              border: '1px solid var(--danger-border, #F87171)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              marginBottom: '1.25rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div style={{
              backgroundColor: 'var(--success-bg, #ECFDF5)',
              color: 'var(--success-text, #065F46)',
              border: '1px solid var(--success-border, #34D399)',
              borderRadius: '8px',
              padding: '0.65rem 0.85rem',
              marginBottom: '1.25rem',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Check size={16} style={{ flexShrink: 0 }} />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Current Password (if not admin reset) */}
          {!isAdminReset && (
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label htmlFor="current-pass" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
                Current Password <span style={{ color: 'var(--brand-primary)' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  id="current-pass"
                  type={showCurrent ? 'text' : 'password'}
                  className="form-input"
                  style={{ width: '100%', paddingRight: '2.5rem' }}
                  placeholder="Enter current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  style={{
                    position: 'absolute',
                    right: '0.65rem',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer'
                  }}
                  title={showCurrent ? "Hide password" : "Show password"}
                >
                  {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
          )}

          {/* New Password */}
          <div className="form-group" style={{ marginBottom: '0.75rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
              <label htmlFor="new-pass" style={{ fontSize: '0.8rem', fontWeight: 700 }}>
                New Password <span style={{ color: 'var(--brand-primary)' }}>*</span>
              </label>
              <button
                type="button"
                onClick={generateStrongPassword}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--brand-primary)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.25rem'
                }}
              >
                <RefreshCw size={12} />
                <span>Suggest Strong</span>
              </button>
            </div>
            <div style={{ position: 'relative' }}>
              <input
                id="new-pass"
                type={showNew ? 'text' : 'password'}
                className="form-input"
                style={{ width: '100%', paddingRight: '2.5rem' }}
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                style={{
                  position: 'absolute',
                  right: '0.65rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
                title={showNew ? "Hide password" : "Show password"}
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Password strength meter */}
            {newPassword && (
              <div style={{ marginTop: '0.5rem' }}>
                <div style={{
                  height: '4px',
                  width: '100%',
                  backgroundColor: 'var(--border-light)',
                  borderRadius: '2px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    width: `${strength.score}%`,
                    backgroundColor: strength.color,
                    transition: 'all 0.3s ease'
                  }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginTop: '0.25rem', color: strength.color, fontWeight: 700 }}>
                  <span>Strength: {strength.text}</span>
                  <span>{newPassword.length} characters</span>
                </div>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div className="form-group" style={{ marginBottom: '1.5rem' }}>
            <label htmlFor="confirm-pass" style={{ display: 'block', fontSize: '0.8rem', fontWeight: 700, marginBottom: '0.35rem' }}>
              Confirm New Password <span style={{ color: 'var(--brand-primary)' }}>*</span>
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="confirm-pass"
                type={showConfirm ? 'text' : 'password'}
                className="form-input"
                style={{ width: '100%', paddingRight: '2.5rem' }}
                placeholder="Re-type new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                style={{
                  position: 'absolute',
                  right: '0.65rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer'
                }}
                title={showConfirm ? "Hide password" : "Show password"}
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {confirmPassword && newPassword && (
              <div style={{
                fontSize: '0.72rem',
                marginTop: '0.3rem',
                fontWeight: 600,
                color: newPassword === confirmPassword ? 'var(--success-solid, #059669)' : 'var(--danger-solid, #DC2626)'
              }}>
                {newPassword === confirmPassword ? '✓ Passwords match' : '✗ Passwords do not match'}
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={isLoading || !newPassword || newPassword !== confirmPassword}
              style={{ minWidth: '130px' }}
            >
              {isLoading ? 'Updating...' : (isAdminReset ? 'Set New Password' : 'Save Password')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
