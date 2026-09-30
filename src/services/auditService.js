// Audit Logging Service conforming to ASVS and BRD Audit Requirements

const AUDIT_STORAGE_KEY = 'lloyd_worker_audit_logs_v1';

export const getAuditLogs = () => {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('Failed to load audit logs:', err);
    return [];
  }
};

export const logAuditEvent = ({ role, action, workerId, workerName, details }) => {
  try {
    const logs = getAuditLogs();
    const newLog = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      role,
      action,
      workerId: workerId || 'N/A',
      workerName: workerName || 'System',
      details: details || '',
      ip: '127.0.0.1 (Internal Gateway)'
    };
    logs.unshift(newLog);
    // Keep last 1000 logs
    if (logs.length > 1000) logs.pop();
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(logs));
    return newLog;
  } catch (err) {
    console.error('Failed to write audit log:', err);
  }
};

export const clearAuditLogs = () => {
  localStorage.removeItem(AUDIT_STORAGE_KEY);
};
