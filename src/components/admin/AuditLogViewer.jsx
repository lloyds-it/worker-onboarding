import React, { useState, useEffect } from 'react';
import { History, Search, Filter, ShieldCheck, RefreshCw, Trash2 } from 'lucide-react';
import { getAuditLogs, clearAuditLogs } from '../../services/auditService';
import { ROLES, ROLE_LABELS } from '../../types/constants';

export const AuditLogViewer = () => {
  const [logs, setLogs] = useState([]);
  const [filterRole, setFilterRole] = useState('ALL');
  const [search, setSearch] = useState('');

  const reloadLogs = () => {
    setLogs(getAuditLogs());
  };

  useEffect(() => {
    reloadLogs();
  }, []);

  const handleClear = () => {
    if (window.confirm('Are you sure you want to clear the audit trail for this session?')) {
      clearAuditLogs();
      reloadLogs();
    }
  };

  const filteredLogs = logs.filter(log => {
    if (filterRole !== 'ALL' && log.role !== filterRole) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const matchAction = log.action.toLowerCase().includes(q);
      const matchWorker = log.workerName.toLowerCase().includes(q) || log.workerId.toLowerCase().includes(q);
      const matchDetails = log.details.toLowerCase().includes(q);
      return matchAction || matchWorker || matchDetails;
    }
    return true;
  });

  return (
    <div>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={24} color="var(--purple-solid)" />
            <span>System Compliance & Immutable Audit Trail</span>
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Conforming to OWASP ASVS 5.0 and BRD Chapter 4: Timestamped tracking of every department action.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={reloadLogs}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
          <button className="btn btn-secondary" style={{ color: 'var(--danger-solid)' }} onClick={handleClear}>
            <Trash2 size={14} />
            <span>Clear Logs</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        border: '1px solid var(--border-light)',
        borderRadius: 'var(--radius-lg)',
        padding: '1.25rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        flexWrap: 'wrap'
      }}>
        <div style={{ flex: 1, minWidth: '260px' }}>
          <input
            type="text"
            className="form-input"
            placeholder="Search audit actions, worker names, or IDs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Filter size={16} color="var(--text-muted)" />
          <select
            className="filter-select"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="ALL">All Department Roles</option>
            {Object.keys(ROLES).map(r => (
              <option key={r} value={r}>{ROLE_LABELS[r] || r}</option>
            ))}
          </select>
        </div>

        <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          Total Logged Events: <strong>{filteredLogs.length}</strong>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="table-card">
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Department / Role</th>
                <th>System Action</th>
                <th>Target Worker</th>
                <th>Audit Details & Parameters</th>
                <th>Gateway IP</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    No audit records logged yet. Stage updates and approvals will appear here automatically.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.75rem', fontFamily: 'var(--font-family-mono)', color: 'var(--text-secondary)' }}>
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td>
                      <span className="badge badge-purple" style={{ fontSize: '0.7rem' }}>
                        {log.role}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-family-mono)',
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        color: log.action.includes('FLAGGED') ? 'var(--danger-solid)' : (log.action.includes('FIT') || log.action.includes('COMPLETED') ? 'var(--success-solid)' : 'var(--info-solid)')
                      }}>
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.825rem' }}>{log.workerName}</div>
                      <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{log.workerId}</div>
                    </td>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', maxWidth: '360px' }}>
                      {log.details}
                    </td>
                    <td style={{ fontSize: '0.725rem', color: 'var(--text-muted)', fontFamily: 'var(--font-family-mono)' }}>
                      {log.ip}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
