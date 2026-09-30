-- ============================================================================
-- MICROSOFT FABRIC SQL DATABASE / DATA WAREHOUSE DDL SCRIPT
-- Project: Lloyds Metals & Energy / Lloyds Infra - Worker Onboarding System
-- Server: 2xv4ddeoefeuhhgixzuzuy3udm-27j34hcgadaudjerknvakpsfle.database.fabric.microsoft.com
-- Database: Worker_onboarding-44af8b36-2300-4f9e-a591-53248d3d454e
-- Compliance: Microsoft Fabric T-SQL Engine (NONCLUSTERED NOT ENFORCED)
-- ============================================================================

-- 1. Create Workers Master Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkersMaster' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.WorkersMaster (
        id VARCHAR(50) NOT NULL,
        assignedWorkerId VARCHAR(50) NULL,
        stage INT NOT NULL,
        status VARCHAR(50) NOT NULL,
        fullName VARCHAR(200) NOT NULL,
        contractorName VARCHAR(200) NULL,
        trade VARCHAR(100) NULL,
        mobileNumber VARCHAR(20) NULL,
        createdAt VARCHAR(50) NULL,
        updatedAt VARCHAR(50) NULL
    );
    ALTER TABLE dbo.WorkersMaster ADD CONSTRAINT PK_WorkersMaster PRIMARY KEY NONCLUSTERED (id) NOT ENFORCED;
END;

-- 2. Create Worker HR Intake (Step 1)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkerHRData' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.WorkerHRData (
        workerId VARCHAR(50) NOT NULL,
        fullName VARCHAR(200) NOT NULL,
        fatherHusbandName VARCHAR(200) NULL,
        dob VARCHAR(50) NULL,
        age INT NULL,
        gender VARCHAR(10) NULL,
        mobileNumber VARCHAR(20) NULL,
        idProofType VARCHAR(100) NULL,
        idProofRef VARCHAR(100) NULL,
        contractorName VARCHAR(200) NULL,
        contractorLicense VARCHAR(100) NULL,
        trade VARCHAR(100) NULL,
        emergencyPerson VARCHAR(200) NULL,
        emergencyRelationship VARCHAR(100) NULL,
        emergencyMobile VARCHAR(20) NULL,
        registeredAt VARCHAR(50) NULL
    );
    ALTER TABLE dbo.WorkerHRData ADD CONSTRAINT PK_WorkerHRData PRIMARY KEY NONCLUSTERED (workerId) NOT ENFORCED;
END;

-- 3. Create Worker Medical Fitness (Step 2)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkerMedicalVitals' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.WorkerMedicalVitals (
        workerId VARCHAR(50) NOT NULL,
        bloodGroup VARCHAR(10) NULL,
        heightCm INT NULL,
        weightKg INT NULL,
        bmi VARCHAR(20) NULL,
        bmiCategory VARCHAR(50) NULL,
        bpSystolic INT NULL,
        bpDiastolic INT NULL,
        spo2 INT NULL,
        pulseRate INT NULL,
        respirationRate INT NULL,
        rbs INT NULL,
        alcoholTest VARCHAR(20) NULL,
        visionTest VARCHAR(50) NULL,
        hearingTest VARCHAR(50) NULL,
        vertigoTest VARCHAR(50) NULL,
        existingIllness VARCHAR(500) NULL,
        fitnessStatus VARCHAR(50) NULL,
        examinerName VARCHAR(200) NULL,
        remarks VARCHAR(1000) NULL,
        examinedAt VARCHAR(50) NULL
    );
    ALTER TABLE dbo.WorkerMedicalVitals ADD CONSTRAINT PK_WorkerMedicalVitals PRIMARY KEY NONCLUSTERED (workerId) NOT ENFORCED;
END;

-- 4. Create Worker Safety Induction (Step 3)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkerSafetyInduction' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.WorkerSafetyInduction (
        workerId VARCHAR(50) NOT NULL,
        briefingDone BIT NULL,
        topicsCovered VARCHAR(2000) NULL,
        ppeIssued VARCHAR(2000) NULL,
        safetyOfficerName VARCHAR(200) NULL,
        safetyDate VARCHAR(50) NULL,
        inductedAt VARCHAR(50) NULL
    );
    ALTER TABLE dbo.WorkerSafetyInduction ADD CONSTRAINT PK_WorkerSafetyInduction PRIMARY KEY NONCLUSTERED (workerId) NOT ENFORCED;
END;

-- 5. Create Worker IT Biometrics (Step 4)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkerITBiometrics' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.WorkerITBiometrics (
        workerId VARCHAR(50) NOT NULL,
        assignedWorkerId VARCHAR(50) NULL,
        faceBiometricRegistered BIT NULL,
        cwmsRegistered BIT NULL,
        campusMasterUploaded BIT NULL,
        undertakingAccepted BIT NULL,
        itAdminSignature VARCHAR(200) NULL,
        itDate VARCHAR(50) NULL,
        enrolledAt VARCHAR(50) NULL
    );
    ALTER TABLE dbo.WorkerITBiometrics ADD CONSTRAINT PK_WorkerITBiometrics PRIMARY KEY NONCLUSTERED (workerId) NOT ENFORCED;
END;

-- 6. Create Worker Camp Accommodation (Step 5)
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'WorkerCampAllocation' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.WorkerCampAllocation (
        workerId VARCHAR(50) NOT NULL,
        campName VARCHAR(100) NULL,
        blockNo VARCHAR(50) NULL,
        roomNo VARCHAR(50) NULL,
        bedNo VARCHAR(50) NULL,
        gatePassActive BIT NULL,
        allocatedBy VARCHAR(200) NULL,
        allocationDate VARCHAR(50) NULL,
        allocatedAt VARCHAR(50) NULL
    );
    ALTER TABLE dbo.WorkerCampAllocation ADD CONSTRAINT PK_WorkerCampAllocation PRIMARY KEY NONCLUSTERED (workerId) NOT ENFORCED;
END;

-- 7. Create Audit Trail Log Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuditTrailLogs' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.AuditTrailLogs (
        logId VARCHAR(50) NOT NULL,
        role VARCHAR(50) NOT NULL,
        action VARCHAR(100) NOT NULL,
        workerId VARCHAR(50) NULL,
        workerName VARCHAR(200) NULL,
        details VARCHAR(2000) NULL,
        timestamp VARCHAR(50) NULL
    );
    ALTER TABLE dbo.AuditTrailLogs ADD CONSTRAINT PK_AuditTrailLogs PRIMARY KEY NONCLUSTERED (logId) NOT ENFORCED;
END;

-- 8. Create System Users Table
IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'SystemUsers' AND schema_id = SCHEMA_ID('dbo'))
BEGIN
    CREATE TABLE dbo.SystemUsers (
        id VARCHAR(50) NOT NULL,
        name VARCHAR(200) NOT NULL,
        email VARCHAR(200) NOT NULL,
        role VARCHAR(50) NOT NULL,
        designation VARCHAR(200) NULL,
        department VARCHAR(200) NULL,
        status VARCHAR(20) NOT NULL
    );
    ALTER TABLE dbo.SystemUsers ADD CONSTRAINT PK_SystemUsers PRIMARY KEY NONCLUSTERED (id) NOT ENFORCED;
END;

-- Seed Default Administrative Staff Credentials
IF NOT EXISTS (SELECT 1 FROM dbo.SystemUsers WHERE id = 'USR-ADMIN-01')
BEGIN
    INSERT INTO dbo.SystemUsers (id, name, email, role, designation, department, status) VALUES
    ('USR-ADMIN-01', 'Sunil Kumar Sharma', 'admin@lloyds.in', 'ADMIN', 'Chief Security & HR Administrator', 'Executive Administration', 'ACTIVE'),
    ('USR-HR-01', 'Pooja Verma', 'hr.intake@lloyds.in', 'HR', 'Senior HR Intake Officer', 'Human Resources', 'ACTIVE'),
    ('USR-MED-01', 'Dr. Vivek Deshmukh', 'medical@lloyds.in', 'MEDICAL', 'Chief Industrial Medical Officer (CIH)', 'Occupational Health', 'ACTIVE'),
    ('USR-SAF-01', 'Rajesh K. Mohite', 'safety@lloyds.in', 'SAFETY', 'Head of Plant Safety (EHS)', 'Environment, Health & Safety', 'ACTIVE'),
    ('USR-IT-01', 'Ankit Bhattacharya', 'it.systems@lloyds.in', 'IT', 'CWMS & Biometrics Lead', 'Information Technology', 'ACTIVE'),
    ('USR-CAMP-01', 'Mahesh Patil', 'camp.admin@lloyds.in', 'CAMP', 'Gondwana Housing Warden', 'Camp Administration', 'ACTIVE');
END;
