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
    connectionTimeout: 6000,
    greetingTimeout: 6000,
    socketTimeout: 8000,
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
    completedLabel: 'Step 2: Medical Fitness Examination',
    nextLabel: 'Step 3: EHS Safety Induction & PPE Issuance',
    actionSummary: 'Candidate has been medically cleared (FIT / FIT WITH PRECAUTIONS) and routed to your EHS Safety Induction queue.'
  },
  STEP_2_HOLD_ALERT: {
    completedLabel: 'Step 2: Medical Fitness Examination (HOLD)',
    nextLabel: 'Medical Hold — Follow-up Required',
    actionSummary: 'Candidate has been placed on MEDICAL HOLD pending further clinical evaluation or documentation.'
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
  const portalUrl = process.env.APP_URL || 'https://taskai.lloyds.in/onboarding/';

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

const sendTrackedMail = async ({ recipients = [], subject, text, html, meta = {} }) => {
  const cleanRecipients = [...new Set(recipients.filter(Boolean).map(e => String(e).trim().toLowerCase()))];
  const logEntry = {
    id: `MAIL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    timestamp: new Date().toISOString(),
    ...meta,
    recipients: cleanRecipients,
    subject,
    status: 'PENDING',
    messageId: null,
    error: null
  };

  if (cleanRecipients.length === 0) {
    logEntry.status = 'NO_ACTIVE_RECIPIENTS';
    logEntry.error = meta.emptyRecipientsError || 'No active recipient email addresses found.';
    emailLogs.unshift(logEntry);
    saveEmailLogs(emailLogs);
    return logEntry;
  }

  const smtp = getSmtpStatus();
  if (!smtp.configured) {
    logEntry.status = 'QUEUED_NO_SMTP';
    logEntry.error = 'SMTP not configured in .env (SMTP_HOST, SMTP_USER, SMTP_PASS).';
    console.log(`[Email] Queued (${meta.transitionKey || 'MAIL'}) -> ${cleanRecipients.join(', ')} | Subject: "${subject}" [SMTP not configured]`);
    emailLogs.unshift(logEntry);
    saveEmailLogs(emailLogs);
    return logEntry;
  }

  try {
    const transporter = createTransporter();
    const info = await transporter.sendMail({
      from: smtp.from,
      to: cleanRecipients.join(', '),
      subject,
      text,
      html
    });
    logEntry.status = 'SENT';
    logEntry.messageId = info.messageId || null;
    console.log(`[Email] Sent (${meta.transitionKey || 'MAIL'}) -> ${cleanRecipients.join(', ')} | MessageId: ${info.messageId}`);
  } catch (err) {
    logEntry.status = 'FAILED';
    logEntry.error = err.message;
    console.error(`[Email] Failed (${meta.transitionKey || 'MAIL'}) -> ${cleanRecipients.join(', ')}:`, err.message);
  }

  emailLogs.unshift(logEntry);
  saveEmailLogs(emailLogs);
  return logEntry;
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
  const recipients = accounts
    .filter(acc => acc && acc.status !== 'INACTIVE' && roles.includes(acc.role) && acc.email)
    .map(acc => acc.email.toLowerCase());

  const { subject, text, html } = buildEmailContent({
    transitionKey,
    worker,
    nextRoles: roles,
    actor,
    extraDetails
  });

  return sendTrackedMail({
    recipients,
    subject,
    text,
    html,
    meta: {
      transitionKey,
      workerId: worker?.id || '',
      assignedWorkerId: worker?.assignedWorkerId || '',
      workerName: worker?.hr?.fullName || '',
      nextRoles: roles,
      emptyRecipientsError: `No active user accounts found for role(s): ${roles.join(', ')}`
    }
  });
};

/**
 * Send welcome credentials + portal URL + password reset link when a new user account is created.
 */
export const sendAccountCreatedEmail = async ({ user, rawPassword, portalUrl, resetUrl, createdBy }) => {
  const cleanPortal = portalUrl || process.env.APP_URL || 'https://taskai.lloyds.in/onboarding/';
  const usernameAlias = user?.aliases?.[1] || user?.email?.split('@')[0] || user?.email;
  const subject = `[Lloyds Worker Onboarding] Your Account Credentials & Portal Access (${user?.role || 'STAFF'})`;

  const text = [
    `Hello ${user?.name || 'Team Member'},`,
    ``,
    `Your account has been created in the Lloyds Worker Onboarding & Camp Management Portal by ${createdBy || 'Site Administrator'}.`,
    ``,
    `Portal Link:         ${cleanPortal}`,
    `Username / Email:    ${user?.email}`,
    `Short Username:      ${usernameAlias}`,
    `Temporary Password:  ${rawPassword}`,
    `Assigned Department: ${user?.department || user?.role || 'Operations'} (${user?.role || 'STAFF'})`,
    ``,
    `Set / Reset Password Link (valid 24 hours):`,
    `${resetUrl}`,
    ``,
    `For security, please sign in and update your password using the reset link above.`
  ].join('\n');

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; background: #FFFFFF;">
      <div style="background: #0F172A; color: #FFFFFF; padding: 18px 24px; border-bottom: 4px solid #E82329;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94A3B8; font-weight: 700;">
          Lloyds Worker Onboarding Portal
        </div>
        <h2 style="margin: 6px 0 0 0; font-size: 18px; color: #FFFFFF;">Welcome! Your Staff Account Is Ready</h2>
      </div>
      <div style="padding: 22px 24px; color: #1E293B; font-size: 14px; line-height: 1.55;">
        <p style="margin-top: 0;">Hello <strong>${user?.name || 'Team Member'}</strong>,</p>
        <p>Your portal account has been authorized by <strong>${createdBy || 'Administrator'}</strong>. Below are your login credentials and password reset link:</p>
        <table style="width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 13px;">
          <tr><td style="padding: 8px 10px; border: 1px solid #E2E8F0; background: #F8FAFC; font-weight: 700; width: 38%;">Portal URL</td><td style="padding: 8px 10px; border: 1px solid #E2E8F0;"><a href="${cleanPortal}" style="color: #2563EB; font-weight: 600;">${cleanPortal}</a></td></tr>
          <tr><td style="padding: 8px 10px; border: 1px solid #E2E8F0; background: #F8FAFC; font-weight: 700;">Username (Work Email)</td><td style="padding: 8px 10px; border: 1px solid #E2E8F0; font-weight: 700;">${user?.email}</td></tr>
          <tr><td style="padding: 8px 10px; border: 1px solid #E2E8F0; background: #F8FAFC; font-weight: 700;">Short Username</td><td style="padding: 8px 10px; border: 1px solid #E2E8F0;">${usernameAlias}</td></tr>
          <tr><td style="padding: 8px 10px; border: 1px solid #E2E8F0; background: #F8FAFC; font-weight: 700;">Password</td><td style="padding: 8px 10px; border: 1px solid #E2E8F0; font-family: monospace; font-weight: 700; color: #DC2626;">${rawPassword}</td></tr>
          <tr><td style="padding: 8px 10px; border: 1px solid #E2E8F0; background: #F8FAFC; font-weight: 700;">Role / Department</td><td style="padding: 8px 10px; border: 1px solid #E2E8F0;">${user?.department || user?.role} (${user?.role})</td></tr>
        </table>
        <div style="margin-top: 20px; display: flex; gap: 10px; flex-wrap: wrap;">
          <a href="${cleanPortal}" style="display: inline-block; padding: 10px 18px; background: #E82329; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 13px; margin-right: 8px;">
            Open Onboarding Portal →
          </a>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 18px; background: #0F172A; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 13px;">
            Reset / Change Password →
          </a>
        </div>
        <p style="margin-top: 16px; font-size: 12px; color: #64748B;">
          Password Reset Link (valid 24 hours): <a href="${resetUrl}" style="color: #2563EB; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    </div>
  `;

  return sendTrackedMail({
    recipients: [user?.email],
    subject,
    text,
    html,
    meta: {
      transitionKey: 'USER_ACCOUNT_CREATED',
      workerName: user?.name || '',
      nextRoles: [user?.role || 'STAFF']
    }
  });
};

/**
 * Send a one-time password reset link to an existing user's email.
 */
export const sendPasswordResetEmail = async ({ user, portalUrl, resetUrl, requestedBy = null }) => {
  const cleanPortal = portalUrl || process.env.APP_URL || 'https://taskai.lloyds.in/onboarding/';
  const subject = `[Lloyds Worker Onboarding] Password Reset Link`;

  const text = [
    `Hello ${user?.name || 'Team Member'},`,
    ``,
    requestedBy
      ? `An administrator (${requestedBy}) sent you a password reset link for the Lloyds Worker Onboarding Portal.`
      : `We received a request to reset your password for the Lloyds Worker Onboarding Portal.`,
    ``,
    `Username / Email: ${user?.email}`,
    `Portal Link:      ${cleanPortal}`,
    ``,
    `Click the link below to set a new password (valid for 1 hour):`,
    `${resetUrl}`,
    ``,
    `If you did not request this, you can safely ignore this email.`
  ].join('\n');

  const html = `
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 620px; margin: 0 auto; border: 1px solid #E2E8F0; border-radius: 10px; overflow: hidden; background: #FFFFFF;">
      <div style="background: #0F172A; color: #FFFFFF; padding: 18px 24px; border-bottom: 4px solid #2563EB;">
        <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #94A3B8; font-weight: 700;">
          Lloyds Worker Onboarding Portal
        </div>
        <h2 style="margin: 6px 0 0 0; font-size: 18px; color: #FFFFFF;">Password Reset Request</h2>
      </div>
      <div style="padding: 22px 24px; color: #1E293B; font-size: 14px; line-height: 1.55;">
        <p style="margin-top: 0;">Hello <strong>${user?.name || 'Team Member'}</strong>,</p>
        <p>${requestedBy ? `An administrator (<strong>${requestedBy}</strong>) generated a password reset link for your account.` : 'Use the secure link below to reset your portal password.'}</p>
        <p style="font-size: 13px; color: #475569;"><strong>Username:</strong> ${user?.email}<br/><strong>Portal URL:</strong> <a href="${cleanPortal}" style="color: #2563EB;">${cleanPortal}</a></p>
        <div style="margin: 20px 0;">
          <a href="${resetUrl}" style="display: inline-block; padding: 11px 20px; background: #E82329; color: #FFFFFF; text-decoration: none; border-radius: 6px; font-weight: 700; font-size: 13px;">
            Reset Your Password →
          </a>
        </div>
        <p style="font-size: 12px; color: #64748B;">
          This link expires in <strong>1 hour</strong>. Direct URL: <a href="${resetUrl}" style="color: #2563EB; word-break: break-all;">${resetUrl}</a>
        </p>
      </div>
    </div>
  `;

  return sendTrackedMail({
    recipients: [user?.email],
    subject,
    text,
    html,
    meta: {
      transitionKey: 'PASSWORD_RESET_LINK',
      workerName: user?.name || '',
      nextRoles: [user?.role || 'STAFF']
    }
  });
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
