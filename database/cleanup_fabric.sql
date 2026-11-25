-- ============================================================================
-- MICROSOFT FABRIC SQL DATABASE CLEANUP SCRIPT
-- Removes all worker records, audit logs, and login accounts except hmk@lloyds.in
-- ============================================================================

-- 1. Remove all worker onboarding records across all stage tables
DELETE FROM dbo.WorkerCampAllocation;
DELETE FROM dbo.WorkerITBiometrics;
DELETE FROM dbo.WorkerSafetyInduction;
DELETE FROM dbo.WorkerMedicalVitals;
DELETE FROM dbo.WorkerHRData;
DELETE FROM dbo.WorkersMaster;

-- 2. Remove all audit trail records
DELETE FROM dbo.AuditTrailLogs;

-- 3. Remove all login credentials/users except hmk@lloyds.in
DELETE FROM dbo.SystemUsers
WHERE LOWER(email) <> 'hmk@lloyds.in';

-- 4. Ensure hmk@lloyds.in exists and is ACTIVE
IF NOT EXISTS (SELECT 1 FROM dbo.SystemUsers WHERE LOWER(email) = 'hmk@lloyds.in')
BEGIN
    INSERT INTO dbo.SystemUsers (id, name, email, role, designation, department, status)
    VALUES ('USR-ADMIN-01', 'Kolli Hemanth', 'hmk@lloyds.in', 'ADMIN', 'Site Administrator & Chief Director', 'Site Administration & Master Control', 'ACTIVE');
END;
