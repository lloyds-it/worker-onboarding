// ============================================================================
// ENTERPRISE EMAIL NOTIFICATION SERVICE (NODEMAILER SMTP)
// Triggers automated email notifications to the next stage department users
// whenever an onboarding step is completed.
// ============================================================================

import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';

const EMAIL_LOG_PATH = path.join(process.cwd(), 'server', 'data', 'email_logs.json');

const loadEmailLogs = () => {
  try {
    if (fs.existsSync(EMAIL_LOG_PATH)) {
      const parsed = JSON.parse(fs.readFileSync(EMAIL_LOG_PATH, 'utf8'));
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {
    console.warn('[Email] Notice reading email_logs.json:', e.message);
  }
  return [];
};

const saveEmailLogs = (logs) => {
  try {
    const dir = path.dirname(EMAIL_LOG_PATH);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(EMAIL_LOG_PATH, JSON.stringify(logs.slice(0, 200), null, 2), 'utf8');
  } catch (e) {
    console.warn('[Email] Notice writing email_logs.json:', e.message);
  }
};

let emailLogs = loadEmailLogs();

export const getEmailLogs = () => emailLogs;

export const getSmtpStatus = () => {
  const host = (process.env.SMTP_HOST || '').trim();
  const user = (process.env.SMTP_USER || '').trim();
  const pass = (process.env.SMTP_PASS || '').trim();
  const port = parseInt(process.env.SMTP_PORT || '587', 10);
  const configured = Boolean(host && user && pass);
  return {
    configured,
    host: host || null,
    port,
    user: user || null,
    from: (process.env.SMTP_FROM || user || 'noreply@lloyds.in').trim()
  };
};

const createTransporter = () => {
  const smtp = getSmtpStatus();
  if (!smtp.configured) return null;

  const secure = process.env.SMTP_SECURE === 'true' || smtp.port === 465;
  return nodemailer.createTransport({
    host: smtp.host,
    port: smtp.port,
    secure,
    auth: {
      user: smtp.user,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== 'false'
    }
  });
};

const STAGE_EMAIL_META = {
  STEP_1_TO_MEDICAL: {
    completedLabel: 'Step 1: HR Registration',
    nextLabel: 'Step 2: Medical Fitness Examination',
    actionSummary: 'Candidate has been registered by HR with an Employee ID and routed to your Medical Screening queue.'
  },
  STEP_2_TO_SAFETY: {
    completedLabel: 'Step 2: Medical Fitness Examination (FIT)',
    nextLabel: 'Step 3: EHS Safety Induction & PPE Issuance',
    actionSummary: 'Candidate has been certified medically FIT and routed to your EHS Safety Induction queue.'
  },
  STEP_2_UNFIT_ALERT: {
    completedLabel: 'Step 2: Medical Fitness Examination (UNFIT)',
    nextLabel: 'Onboarding Halted / HR & Admin Review',
    actionSummary: 'Candidate has been flagged medically UNFIT. Onboarding is halted pending review.'
  },
  STEP_3_TO_IT: {
    completedLabel: 'Step 3: EHS Safety Induction & PPE',
    nextLabel: 'Step 4: IT Biometrics & CWMS Enrollment',
    actionSummary: 'Candidate has completed EHS Safety induction and PPE issuance. Please enroll face biometrics and CWMS.'
  },
  STEP_4_TO_CAMP: {
    completedLabel: 'Step 4: IT Biometrics & CWMS',
    nextLabel: 'Step 5: Camp Housing & Gate Pass Activation',
    actionSummary: 'Candidate has completed IT biometric enrollment and is ready for Gondwana camp housing allocation.'
  },
  STEP_5_COMPLETED: {
    completedLabel: 'Step 5: Camp Housing & Gate Pass Activation',
    nextLabel: 'Onboarding Completed (Gate Pass Active)',
    actionSummary: 'All 5 onboarding stages are complete. Worker living quarters are allocated and Gate Pass is ACTIVE.'
  }
};

const buildEmailContent = ({ transitionKey, worker, nextRoles, actor, extraDetails }) => {
  const meta = STAGE_EMAIL_META[transitionKey] || {
    completedLabel: 'Onboarding Stage Completed',
    nextLabel: `Pending ${nextRoles.join(' / ')} Action`,
    actionSummary: 'A worker onboarding stage has been completed and routed to your department.'
  };

  const empId = worker?.assignedWorkerId || worker?.id || 'Pending';
  const refId = worker?.id || 'N/A';
  const fullName = worker?.hr?.fullName || 'Worker';
  const contractor = worker?.hr?.contractorName || 'N/A';
  const trade = worker?.hr?.trade || 'N/A';
  const portalUrl = process.env.APP_URL || 'https://taskai.lloyds.in/workeronboarding/';

  const isAlert = transitionKey === 'STEP_2_UNFIT_ALERT';
  const isCompleted = transitionKey === 'STEP_5_COMPLETED';
  const subjectPrefix = isAlert ? '[ALERT - Medical UNFIT]' : (isCompleted ? '[Completed]' : '[Action Required]');
  const subject = `${subjectPrefix} ${meta.nextLabel} — ${fullName} (${empId})`;

  const text = [
    `Lloyds Metals & Energy / Lloyds Infrastructure — Worker Onboarding System`,
    ``,
    `${meta.actionSummary}`,
    ``,
    `Worker Name:    ${fullName}`,
    `Employee ID:    ${empId}`,
    `Reference ID:   ${refId}`,
    `Trade:          ${trade}`,
    `Contractor:     ${contractor}`,
    `Completed Step: ${meta.completedLabel}`,
    `Next Step:      ${meta.nextLabel}`,
    `Processed By:   ${actor?.name || 'System'} (${actor?.email || actor?.role || 'Staff'})`,
    extraDetails ? `Notes:          ${extraDetails}` : null,
    ``,
    `Open Portal: ${portalUrl}`
  ].filter(Boolean).join('\n');

  const accentColor = isAlert ? '#DC2626' : (isCompleted ? '#059669' : '#1E3A8A');

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; background: #FFFFFF;">
      <div style="background: #0F172A; color: #FFFFFF; padding: 18px 24px; border-bottom: 4px solid ${accentColor};">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94A3B8; font-weight: 700;">
          Lloyds Metals &amp; Energy • Worker Onboarding Portal
        </div>
        <h2 style="margin: 6px 0 0 0; font-size: 18px; color: #FFFFFF;">${meta.nextLabel}</h2>
      </div>
      <div style="padding: 22px 24px; color: #1E293B; font-size: 14px; line-height: 1.55;">
        <p style="margin-top: 0;">${meta.actionSummary}</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr><td style="padding: 8px 10px; border: 1px solid #E2E8F0; background: #F8FAFC; font-weight: 700; width: 36%;">Employee ID</td><td style="padding: 8px 10px; border: 1px solid #E2E8F0; font-weight: 700; color: #DC2626;">${empId}</td></tr>
          <tr><td style="padding: 8px 10px; border: 1px solid #E2E8F0; background: #F8FAFC; font-weight: 700;">Worker Name</td><td style="padding: 8px 10px; border: 1px solid #E2E8F0;">${fullName}</td></tr>
          <tr><td style="padding: 8px 10px; border: 1px solid #E2E8F0; background: #F8FAFC; font-weight: 700;">Reference ID</td><td style="padding: 8px 10px; border: 1px solid #E2E8F0;">${refId}</td></tr>
          <tr><td style="padding: 8px 10px; border: 1px solid #E2E8F0; background: #F8FAFC; font-weight: 700;">Trade / Skill</td><td style="padding: 8px 10px; border: 1px solid #E2E8F0;">${trade}</td></tr>
          <tr><td style="padding: 8px 10px; border: 1px solid #E2E8F0; background: #F8FAFC; font-weight: 700;">Contractor</td><td style="padding: 8px 10px; border: 1px solid #E2E8F0;">${contractor}</td></tr>
          <tr><td style="padding: 8px 10px; border: 1px solid #E2E8F0; background: #F8FAFC; font-weight: 700;">Completed Step</td><td style="padding: 8px 10px; border: 1px solid #E2E8F0;">${meta.completedLabel}</td></tr>
          <tr><td style="padding: 8px 10px; border: 1px solid #E2E8F0; background: #F8FAFC; font-weight: 700;">Processed By</td><td style="padding: 8px 10px; border: 1px solid #E2E8F0;">${actor?.name || 'System'} (${actor?.email || actor?.role || 'Staff'})</td></tr>
          ${extraDetails ? `<tr><td style="padding: 8px 10px; border: 1px solid #E2E8F0; background: #F8FAFC; font-weight: 700;">Details</td><td style="padding: 8px 10px; border: 1px solid #E2E8F0;">${extraDetails}</td></tr>` : ''}
        </table>
        <div style="margin-top: 20px;">
          <a href="${portalUrl}" style="display: inline-block; padding: 10px 18px; background: ${accentColor}; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 13px;">
            Open Worker Onboarding Portal →
          </a>
        </div>
      </div>
    </div>
  `;

  return { subject, text, html };
};

/**
 * Resolve active recipient email addresses for the next step's role(s) and send/log email.
 */
export const notifyNextStageUsers = async ({
  transitionKey,
  nextRoles = [],
  worker,
  accounts = [],
  actor = null,
  extraDetails = ''
}) => {
  const roles = Array.isArray(nextRoles) ? nextRoles : [nextRoles];
  const recipients = [...new Set(
    accounts
      .filter(acc => acc && acc.status !== 'INACTIVE' && roles.includes(acc.role) && acc.email)
      .map(acc => acc.email.toLowerCase())
  )];

  const { subject, text, html } = buildEmailContent({
    transitionKey,
    worker,
    nextRoles: roles,
    actor,
    extraDetails
  });

  const logEntry = {
    id: `MAIL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
    transitionKey,
    workerId: worker?.id || '',
    assignedWorkerId: worker?.assignedWorkerId || '',
    workerName: worker?.hr?.fullName || '',
    nextRoles: roles,
    recipients,
    subject,
    status: 'PENDING',
    messageId: null,
    error: null
  };

  if (recipients.length === 0) {
    logEntry.status = 'NO_ACTIVE_RECIPIENTS';
    logEntry.error = `No active user accounts found for role(s): ${roles.join(', ')}`;
    console.warn(`[Email] ${transitionKey}: ${logEntry.error}`);
    emailLogs.unshift(logEntry);
    saveEmailLogs(emailLogs);
    return logEntry;
  }

  const smtp = getSmtpStatus();
  if (!smtp.configured) {
    logEntry.status = 'QUEUED_NO_SMTP';
    logEntry.error = 'SMTP not configured in .env (SMTP_HOST, SMTP_USER, SMTP_PASS).';
    console.log(`[Email] Triggered (${transitionKey}) -> ${recipients.join(', ')} | Subject: "${subject}" [SMTP not configured]`);
    emailLogs.unshift(logEntry);
    saveEmailLogs(emailLogs);
    return logEntry;
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: smtp.from,
      to: recipients.join(', '),
      subject,
      text,
      html
    });
    logEntry.status = 'SENT';
    logEntry.messageId = info.messageId || null;
    console.log(`[Email] Sent (${transitionKey}) -> ${recipients.join(', ')} | MessageId: ${info.messageId}`);
  } catch (err) {
    logEntry.status = 'FAILED';
    logEntry.error = err.message;
    console.error(`[Email] Failed (${transitionKey}) -> ${recipients.join(', ')}:`, err.message);
  }

  emailLogs.unshift(logEntry);
  saveEmailLogs(emailLogs);
  return logEntry;
};

export const sendTestEmail = async (toEmail) => {
  const smtp = getSmtpStatus();
  if (!smtp.configured) {
    return {
      success: false,
      status: 'QUEUED_NO_SMTP',
      error: 'SMTP settings (SMTP_HOST, SMTP_USER, SMTP_PASS) are not configured in .env.'
    };
  }
  const transporter = createTransporter();
  const info = await transporter.sendMail({
    from: smtp.from,
    to: toEmail,
    subject: '[Test] Lloyds Worker Onboarding — SMTP Email Notifications Active',
    text: 'SMTP email notifications for the Worker Onboarding System are configured and working properly.'
  });
  return {
    success: true,
    status: 'SENT',
    messageId: info.messageId,
    to: toEmail
  };
};
