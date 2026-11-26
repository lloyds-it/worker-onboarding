-- ============================================================================
-- SEED 154 CONTRACTORS INTO dbo.ContractorsMaster (Validity through Dec 2027)
-- Idempotent: skips existing id or contractorCode
-- ============================================================================

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-JNDL1' OR contractorCode = 'JNDL1')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-JNDL1', 'JNDL1', '15', 'JANAADHAR', 'LIC-MH-2026-795678', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-795678', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2001' OR contractorCode = 'MLM2001')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2001', 'MLM2001', '15', 'S PRINCE HIGH TECH', 'LIC-MH-2026-321864', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-321864', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2002' OR contractorCode = 'MLM2002')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2002', 'MLM2002', '15', 'SHRI MAHADEV ENGICON', 'LIC-MH-2026-537507', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-537507', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2003' OR contractorCode = 'MLM2003')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2003', 'MLM2003', '15', 'SPC INFRA PROJECT', 'LIC-MH-2026-927919', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-927919', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2004' OR contractorCode = 'MLM2004')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2004', 'MLM2004', '15', 'GLOBAL BRILLIANT', 'LIC-MH-2026-179914', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-179914', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2005' OR contractorCode = 'MLM2005')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2005', 'MLM2005', '15', 'YUDHISTIR MAHATO', 'LIC-MH-2026-245575', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-245575', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2006' OR contractorCode = 'MLM2006')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2006', 'MLM2006', '15', 'DEEPAK CONSTRUCTION', 'LIC-MH-2026-128094', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-128094', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2007' OR contractorCode = 'MLM2007')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2007', 'MLM2007', '15', 'MAA VINDHYAVASHINI & SON''S', 'LIC-MH-2026-631928', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-631928', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2008' OR contractorCode = 'MLM2008')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2008', 'MLM2008', '15', 'MAKSUDH ALAM LEAF MECHANICAL', 'LIC-MH-2026-516649', 'Mechanical', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-516649', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2009' OR contractorCode = 'MLM2009')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2009', 'MLM2009', '15', 'INTERTEK INDIA PVT', 'LIC-MH-2026-867702', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-867702', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2010' OR contractorCode = 'MLM2010')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2010', 'MLM2010', '15', 'JPG INSULATION PVT.LTD', 'LIC-MH-2026-307755', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-307755', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2011' OR contractorCode = 'MLM2011')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2011', 'MLM2011', '15', 'ABHIPRAY CONSTRUCTION', 'LIC-MH-2026-885956', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-885956', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2012' OR contractorCode = 'MLM2012')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2012', 'MLM2012', '15', 'GOEL CONSTRUCTION', 'LIC-MH-2026-727803', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-727803', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2013' OR contractorCode = 'MLM2013')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2013', 'MLM2013', '15', 'HIGHLAND VANTURE', 'LIC-MH-2026-964273', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-964273', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2014' OR contractorCode = 'MLM2014')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2014', 'MLM2014', '15', 'BALAJI ELECTRONICS', 'LIC-MH-2026-546034', 'Electrical', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-546034', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2015' OR contractorCode = 'MLM2015')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2015', 'MLM2015', '15', 'RADHIKA CONSTRUCTION', 'LIC-MH-2026-145437', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-145437', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2016' OR contractorCode = 'MLM2016')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2016', 'MLM2016', '15', 'SHRITOESH INFRA PVT.LTD', 'LIC-MH-2026-125494', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-125494', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2017' OR contractorCode = 'MLM2017')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2017', 'MLM2017', '15', 'S J ENGINEERING', 'LIC-MH-2026-332510', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-332510', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2018' OR contractorCode = 'MLM2018')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2018', 'MLM2018', '15', 'DIYA TRANSPORT', 'LIC-MH-2026-953766', 'Other', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-953766', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2019' OR contractorCode = 'MLM2019')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2019', 'MLM2019', '15', 'LAXMI SHRINIVASA', 'LIC-MH-2026-967359', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-967359', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2020' OR contractorCode = 'MLM2020')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2020', 'MLM2020', '15', 'AVK ENGINEERING', 'LIC-MH-2026-738547', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-738547', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2021' OR contractorCode = 'MLM2021')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2021', 'MLM2021', '15', 'SHRI VIGHNESWARA INFRA', 'LIC-MH-2026-809112', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-809112', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2022' OR contractorCode = 'MLM2022')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2022', 'MLM2022', '15', 'BLUELADDER EPC SOLUTION', 'LIC-MH-2026-258790', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-258790', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2023' OR contractorCode = 'MLM2023')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2023', 'MLM2023', '15', 'MAXX INFRA', 'LIC-MH-2026-698610', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-698610', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2024' OR contractorCode = 'MLM2024')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2024', 'MLM2024', '15', 'URVARSHI CONSTRUCTION', 'LIC-MH-2026-249391', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-249391', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2025' OR contractorCode = 'MLM2025')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2025', 'MLM2025', '15', 'SSVV INFRABUILT PVT LDT', 'LIC-MH-2026-443184', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-443184', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2026' OR contractorCode = 'MLM2026')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2026', 'MLM2026', '15', 'JITENDRA .D. TIKLE', 'LIC-MH-2026-789015', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-789015', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2027' OR contractorCode = 'MLM2027')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2027', 'MLM2027', '15', 'SHRI JAGNNATH', 'LIC-MH-2026-554200', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-554200', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2028' OR contractorCode = 'MLM2028')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2028', 'MLM2028', '15', 'MAA BAMLESHWARI', 'LIC-MH-2026-297814', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-297814', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2029' OR contractorCode = 'MLM2029')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2029', 'MLM2029', '15', 'SHIVSHAKTI NATH JI ENT.', 'LIC-MH-2026-124932', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-124932', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2030' OR contractorCode = 'MLM2030')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2030', 'MLM2030', '15', 'MINTECK EXPLO', 'LIC-MH-2026-137743', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-137743', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2031' OR contractorCode = 'MLM2031')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2031', 'MLM2031', '15', 'TUSHAR LAHANGE', 'LIC-MH-2026-757527', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-757527', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2032' OR contractorCode = 'MLM2032')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2032', 'MLM2032', '15', 'SIDDHIVINAYAK CREATION', 'LIC-MH-2026-435426', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-435426', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2033' OR contractorCode = 'MLM2033')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2033', 'MLM2033', '15', 'GLOBAL MINING CONSTRUCTION', 'LIC-MH-2026-419002', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-419002', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2034' OR contractorCode = 'MLM2034')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2034', 'MLM2034', '15', 'MANDAL ENGINEERING', 'LIC-MH-2026-813729', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-813729', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2035' OR contractorCode = 'MLM2035')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2035', 'MLM2035', '15', 'VRUNDAVAN CONS', 'LIC-MH-2026-853962', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-853962', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2036' OR contractorCode = 'MLM2036')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2036', 'MLM2036', '15', 'TATA PMC', 'LIC-MH-2026-156798', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-156798', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2037' OR contractorCode = 'MLM2037')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2037', 'MLM2037', '15', 'OAKSWOOD WORKFORCE PVT.LTD', 'LIC-MH-2026-308975', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-308975', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2038' OR contractorCode = 'MLM2038')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2038', 'MLM2038', '15', 'MACHATRO CRAN', 'LIC-MH-2026-320946', 'Mechanical', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-320946', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2039' OR contractorCode = 'MLM2039')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2039', 'MLM2039', '15', 'SHIDDARTH CONSTRUCTION', 'LIC-MH-2026-290514', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-290514', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2040' OR contractorCode = 'MLM2040')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2040', 'MLM2040', '15', 'GMMCO LTD', 'LIC-MH-2026-104242', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-104242', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2041' OR contractorCode = 'MLM2041')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2041', 'MLM2041', '15', 'ASHANA CONSTRUCTION', 'LIC-MH-2026-731058', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-731058', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2042' OR contractorCode = 'MLM2042')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2042', 'MLM2042', '15', 'MAYUR COLLECTION', 'LIC-MH-2026-876362', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-876362', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2043' OR contractorCode = 'MLM2043')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2043', 'MLM2043', '15', 'TAVAS VENTURE', 'LIC-MH-2026-854202', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-854202', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2044' OR contractorCode = 'MLM2044')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2044', 'MLM2044', '15', 'VN steelarch', 'LIC-MH-2026-888353', 'Mechanical', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-888353', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2046' OR contractorCode = 'MLM2046')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2046', 'MLM2046', '15', 'HDICL', 'LIC-MH-2026-661253', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-661253', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2047' OR contractorCode = 'MLM2047')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2047', 'MLM2047', '15', 'YOGESH ENTERPRISES', 'LIC-MH-2026-845834', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-845834', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2048' OR contractorCode = 'MLM2048')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2048', 'MLM2048', '15', 'MSP', 'LIC-MH-2026-701761', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-701761', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2049' OR contractorCode = 'MLM2049')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2049', 'MLM2049', '15', 'SGC', 'LIC-MH-2026-137673', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-137673', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2051' OR contractorCode = 'MLM2051')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2051', 'MLM2051', '15', 'TECH MECH', 'LIC-MH-2026-448823', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-448823', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2052' OR contractorCode = 'MLM2052')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2052', 'MLM2052', '15', 'BALA CONSTRUCTION', 'LIC-MH-2026-157505', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-157505', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2053' OR contractorCode = 'MLM2053')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2053', 'MLM2053', '15', 'SR. Engineering', 'LIC-MH-2026-941864', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-941864', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2054' OR contractorCode = 'MLM2054')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2054', 'MLM2054', '15', 'SHARMA ROADLINES', 'LIC-MH-2026-616115', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-616115', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2055' OR contractorCode = 'MLM2055')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2055', 'MLM2055', '15', 'SATYARANJAN MANDAL', 'LIC-MH-2026-865144', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-865144', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2056' OR contractorCode = 'MLM2056')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2056', 'MLM2056', '15', 'PUJA ENTERPRISES', 'LIC-MH-2026-958108', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-958108', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2057' OR contractorCode = 'MLM2057')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2057', 'MLM2057', '15', 'EQUIPMENT RENTALS INDIA', 'LIC-MH-2026-484919', 'Other', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-484919', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2058' OR contractorCode = 'MLM2058')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2058', 'MLM2058', '15', 'MSPEPL', 'LIC-MH-2026-281341', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-281341', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2059' OR contractorCode = 'MLM2059')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2059', 'MLM2059', '15', 'DEXTRA INDIA', 'LIC-MH-2026-794770', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-794770', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2060' OR contractorCode = 'MLM2060')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2060', 'MLM2060', '15', 'SSNR', 'LIC-MH-2026-201507', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-201507', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2061' OR contractorCode = 'MLM2061')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2061', 'MLM2061', '15', 'JEET CONSTRUCTION', 'LIC-MH-2026-780620', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-780620', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM2062' OR contractorCode = 'MLM2062')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM2062', 'MLM2062', '15', 'AIPL', 'LIC-MH-2026-754472', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-754472', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-BHQ1051' OR contractorCode = 'BHQ1051')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-BHQ1051', 'BHQ1051', '15', 'Radhika Construction- BHQ', 'LIC-MH-2026-709205', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-709205', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-BHQ1052' OR contractorCode = 'BHQ1052')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-BHQ1052', 'BHQ1052', '15', 'Highland Venture', 'LIC-MH-2026-480351', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-480351', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-BHQ1055' OR contractorCode = 'BHQ1055')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-BHQ1055', 'BHQ1055', '15', 'Balaji Electronics', 'LIC-MH-2026-783735', 'Electrical', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-783735', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-BHQ1057' OR contractorCode = 'BHQ1057')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-BHQ1057', 'BHQ1057', '15', 'ERA CONSTRUCTION', 'LIC-MH-2026-469359', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-469359', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-BHQ1058' OR contractorCode = 'BHQ1058')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-BHQ1058', 'BHQ1058', '15', 'DEEPAK CONSTRUCTION', 'LIC-MH-2026-423681', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-423681', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1000' OR contractorCode = 'GRY1000')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1000', 'GRY1000', '15', 'S PRINCE HIGH TECH LTD', 'LIC-MH-2026-824745', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-824745', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1002' OR contractorCode = 'GRY1002')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1002', 'GRY1002', '15', 'MANOJ CONSTRUCTION', 'LIC-MH-2026-451438', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-451438', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1003' OR contractorCode = 'GRY1003')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1003', 'GRY1003', '15', 'LAXMI SHRINIVAS', 'LIC-MH-2026-945350', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-945350', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1004' OR contractorCode = 'GRY1004')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1004', 'GRY1004', '15', 'APURVA CONSTRUCTION', 'LIC-MH-2026-483314', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-483314', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1005' OR contractorCode = 'GRY1005')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1005', 'GRY1005', '15', 'ASHA ENTERPRISES', 'LIC-MH-2026-766818', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-766818', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1006' OR contractorCode = 'GRY1006')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1006', 'GRY1006', '15', 'AARAV INFOTECH', 'LIC-MH-2026-626585', 'Other', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-626585', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1007' OR contractorCode = 'GRY1007')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1007', 'GRY1007', '15', 'SK ASSOCIATES', 'LIC-MH-2026-288071', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-288071', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1008' OR contractorCode = 'GRY1008')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1008', 'GRY1008', '15', 'SGC ENTERPRISES', 'LIC-MH-2026-296406', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-296406', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1009' OR contractorCode = 'GRY1009')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1009', 'GRY1009', '15', 'LAVRAJ REALITY', 'LIC-MH-2026-610675', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-610675', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1010' OR contractorCode = 'GRY1010')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1010', 'GRY1010', '15', 'SATHIPAL ENGINEERING', 'LIC-MH-2026-684194', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-684194', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1011' OR contractorCode = 'GRY1011')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1011', 'GRY1011', '15', 'PRAKRITI ENTERPRISES', 'LIC-MH-2026-499494', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-499494', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1012' OR contractorCode = 'GRY1012')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1012', 'GRY1012', '15', 'MAKSUDH ALAM', 'LIC-MH-2026-173109', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-173109', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1013' OR contractorCode = 'GRY1013')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1013', 'GRY1013', '15', 'SHASHI KUMAR SHARMA', 'LIC-MH-2026-253937', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-253937', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1014' OR contractorCode = 'GRY1014')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1014', 'GRY1014', '15', 'V D ENGINEERING', 'LIC-MH-2026-942226', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-942226', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1015' OR contractorCode = 'GRY1015')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1015', 'GRY1015', '15', 'RANI ENGINEERING', 'LIC-MH-2026-162646', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-162646', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1016' OR contractorCode = 'GRY1016')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1016', 'GRY1016', '15', 'BALA CONSTRUCTION', 'LIC-MH-2026-246149', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-246149', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1017' OR contractorCode = 'GRY1017')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1017', 'GRY1017', '15', 'NEERAJ ENTERPRISES', 'LIC-MH-2026-405823', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-405823', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1018' OR contractorCode = 'GRY1018')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1018', 'GRY1018', '15', 'KADTEC INFRA', 'LIC-MH-2026-320274', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-320274', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1019' OR contractorCode = 'GRY1019')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1019', 'GRY1019', '15', 'OM VISHVESHVARA', 'LIC-MH-2026-490146', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-490146', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1021' OR contractorCode = 'GRY1021')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1021', 'GRY1021', '15', 'TAVAS VENTURES', 'LIC-MH-2026-295246', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-295246', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1022' OR contractorCode = 'GRY1022')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1022', 'GRY1022', '15', 'JAHAN MECHANICAL', 'LIC-MH-2026-100140', 'Mechanical', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-100140', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1023' OR contractorCode = 'GRY1023')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1023', 'GRY1023', '15', 'GLOBAL ENGINEERING', 'LIC-MH-2026-344555', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-344555', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1024' OR contractorCode = 'GRY1024')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1024', 'GRY1024', '15', 'MAA DAYMANTI', 'LIC-MH-2026-632669', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-632669', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1025' OR contractorCode = 'GRY1025')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1025', 'GRY1025', '15', 'PRATIBHA', 'LIC-MH-2026-213239', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-213239', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1026' OR contractorCode = 'GRY1026')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1026', 'GRY1026', '15', 'URMI', 'LIC-MH-2026-860095', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-860095', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1027' OR contractorCode = 'GRY1027')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1027', 'GRY1027', '15', 'IGRAPAWAR', 'LIC-MH-2026-343351', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-343351', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1028' OR contractorCode = 'GRY1028')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1028', 'GRY1028', '15', 'SARASWATI CONSTRUCTION', 'LIC-MH-2026-377155', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-377155', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1029' OR contractorCode = 'GRY1029')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1029', 'GRY1029', '15', 'CHANDEL CONSTRUCTION', 'LIC-MH-2026-588424', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-588424', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1030' OR contractorCode = 'GRY1030')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1030', 'GRY1030', '15', 'HAJIEE A.P BAVA', 'LIC-MH-2026-734147', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-734147', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1031' OR contractorCode = 'GRY1031')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1031', 'GRY1031', '15', 'KMR ENGINEERING', 'LIC-MH-2026-279570', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-279570', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1032' OR contractorCode = 'GRY1032')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1032', 'GRY1032', '15', 'SHIVA CONSTRUCTION', 'LIC-MH-2026-962353', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-962353', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1033' OR contractorCode = 'GRY1033')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1033', 'GRY1033', '15', 'SHAKTI ENGINEERING', 'LIC-MH-2026-507235', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-507235', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1034' OR contractorCode = 'GRY1034')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1034', 'GRY1034', '15', 'MAA LAXMI TRADERS', 'LIC-MH-2026-585364', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-585364', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1035' OR contractorCode = 'GRY1035')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1035', 'GRY1035', '15', 'SHRISHTI CONSTRUCTION', 'LIC-MH-2026-535374', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-535374', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1036' OR contractorCode = 'GRY1036')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1036', 'GRY1036', '15', 'SHRI JAGANNATH', 'LIC-MH-2026-736005', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-736005', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1037' OR contractorCode = 'GRY1037')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1037', 'GRY1037', '15', 'Shri Mahadev Engicon Pvt Ltd - BHQ', 'LIC-MH-2026-669099', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-669099', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1038' OR contractorCode = 'GRY1038')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1038', 'GRY1038', '15', 'SATYARANJAN MANDAL', 'LIC-MH-2026-169455', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-169455', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1039' OR contractorCode = 'GRY1039')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1039', 'GRY1039', '15', 'NIKHIL ENGINEERING', 'LIC-MH-2026-735740', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-735740', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1040' OR contractorCode = 'GRY1040')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1040', 'GRY1040', '15', 'INTERTEK INDIA PVT.LTD.', 'LIC-MH-2026-823488', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-823488', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1041' OR contractorCode = 'GRY1041')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1041', 'GRY1041', '15', 'Kusum Infra and Allied Services', 'LIC-MH-2026-110262', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-110262', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1042' OR contractorCode = 'GRY1042')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1042', 'GRY1042', '15', 'AVK ENGINEERING', 'LIC-MH-2026-929007', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-929007', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1043' OR contractorCode = 'GRY1043')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1043', 'GRY1043', '15', 'ABC ENTERPRISES', 'LIC-MH-2026-723762', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-723762', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1044' OR contractorCode = 'GRY1044')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1044', 'GRY1044', '15', 'SAYE GEO STRUCTURE', 'LIC-MH-2026-568153', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-568153', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1045' OR contractorCode = 'GRY1045')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1045', 'GRY1045', '15', 'NANOCRETE TECHNOLOGIES', 'LIC-MH-2026-273607', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-273607', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1046' OR contractorCode = 'GRY1046')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1046', 'GRY1046', '15', 'ANSH ENTERPRISES', 'LIC-MH-2026-903095', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-903095', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1047' OR contractorCode = 'GRY1047')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1047', 'GRY1047', '15', 'UNITOS TRADING PRIVATE LIMITED', 'LIC-MH-2026-942495', 'Other', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-942495', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1048' OR contractorCode = 'GRY1048')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1048', 'GRY1048', '15', 'MAHESH BABU ENGINEERING WORK', 'LIC-MH-2026-138481', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-138481', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1049' OR contractorCode = 'GRY1049')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1049', 'GRY1049', '15', 'MANSUR ANSARI', 'LIC-MH-2026-219434', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-219434', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1050' OR contractorCode = 'GRY1050')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1050', 'GRY1050', '15', 'SPK (PANNEL TESTING)', 'LIC-MH-2026-754661', 'Electrical', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-754661', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1051' OR contractorCode = 'GRY1051')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1051', 'GRY1051', '15', 'RADHIKA CONSTRUCTION- GRY', 'LIC-MH-2026-945401', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-945401', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1052' OR contractorCode = 'GRY1052')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1052', 'GRY1052', '15', 'HIGHLAND VENTURE', 'LIC-MH-2026-407804', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-407804', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1053' OR contractorCode = 'GRY1053')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1053', 'GRY1053', '15', 'SOM PRO FACILITIES INDIA PVT. LTD', 'LIC-MH-2026-578623', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-578623', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1054' OR contractorCode = 'GRY1054')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1054', 'GRY1054', '15', 'S R Engineering', 'LIC-MH-2026-924718', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-924718', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1055' OR contractorCode = 'GRY1055')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1055', 'GRY1055', '15', 'BALAJI ELECTRONICS', 'LIC-MH-2026-858027', 'Electrical', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-858027', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1056' OR contractorCode = 'GRY1056')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1056', 'GRY1056', '15', 'KONGU ENGINEERING', 'LIC-MH-2026-395815', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-395815', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1059' OR contractorCode = 'GRY1059')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1059', 'GRY1059', '15', 'GEOQUEST', 'LIC-MH-2026-816590', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-816590', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1060' OR contractorCode = 'GRY1060')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1060', 'GRY1060', '15', 'Globally Brilliant', 'LIC-MH-2026-748410', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-748410', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1062' OR contractorCode = 'GRY1062')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1062', 'GRY1062', '15', 'ABHIPRAY CONSTRUCTION PVT. LTD', 'LIC-MH-2026-759116', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-759116', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1070' OR contractorCode = 'GRY1070')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1070', 'GRY1070', '15', 'KANISHKA', 'LIC-MH-2026-877729', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-877729', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1071' OR contractorCode = 'GRY1071')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1071', 'GRY1071', '15', 'RM INFRA', 'LIC-MH-2026-841652', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-841652', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1072' OR contractorCode = 'GRY1072')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1072', 'GRY1072', '15', 'AADHYA INFRA', 'LIC-MH-2026-880966', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-880966', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1073' OR contractorCode = 'GRY1073')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1073', 'GRY1073', '15', 'MK FEBRICATOR', 'LIC-MH-2026-615221', 'Mechanical', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-615221', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1074' OR contractorCode = 'GRY1074')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1074', 'GRY1074', '15', 'MAA VINDYAWASINI', 'LIC-MH-2026-922379', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-922379', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1075' OR contractorCode = 'GRY1075')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1075', 'GRY1075', '15', 'ABC SURVEY', 'LIC-MH-2026-828829', 'Other', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-828829', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1076' OR contractorCode = 'GRY1076')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1076', 'GRY1076', '15', 'CONCORD HYDRAULICS', 'LIC-MH-2026-619227', 'Mechanical', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-619227', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1077' OR contractorCode = 'GRY1077')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1077', 'GRY1077', '15', 'BALAJI MARKETING', 'LIC-MH-2026-859823', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-859823', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1078' OR contractorCode = 'GRY1078')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1078', 'GRY1078', '15', 'Queenson Engineering & Consultants', 'LIC-MH-2026-850640', 'Other', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-850640', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1079' OR contractorCode = 'GRY1079')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1079', 'GRY1079', '15', 'Buearo Veritas', 'LIC-MH-2026-366606', 'Other', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-366606', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1080' OR contractorCode = 'GRY1080')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1080', 'GRY1080', '15', 'TECHFAB', 'LIC-MH-2026-513182', 'Mechanical', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-513182', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1081' OR contractorCode = 'GRY1081')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1081', 'GRY1081', '15', 'VISION INFRA', 'LIC-MH-2026-645871', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-645871', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1082' OR contractorCode = 'GRY1082')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1082', 'GRY1082', '15', 'OAKSWOOD WORKFORCE', 'LIC-MH-2026-902138', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-902138', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1083' OR contractorCode = 'GRY1083')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1083', 'GRY1083', '15', 'THEJO ENGINEERING', 'LIC-MH-2026-843655', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-843655', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1084' OR contractorCode = 'GRY1084')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1084', 'GRY1084', '15', 'VEMURI INFRATEC', 'LIC-MH-2026-442404', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-442404', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1086' OR contractorCode = 'GRY1086')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1086', 'GRY1086', '15', 'MAA MANGALA ENGINEERING', 'LIC-MH-2026-950898', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-950898', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1087' OR contractorCode = 'GRY1087')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1087', 'GRY1087', '15', 'SAI KRUPA ENTERPRISES', 'LIC-MH-2026-216917', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-216917', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1088' OR contractorCode = 'GRY1088')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1088', 'GRY1088', '15', 'NKS ENGINEERING', 'LIC-MH-2026-330655', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-330655', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1089' OR contractorCode = 'GRY1089')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1089', 'GRY1089', '15', 'SARANYA', 'LIC-MH-2026-710128', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-710128', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1091' OR contractorCode = 'GRY1091')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1091', 'GRY1091', '15', 'MGCPL', 'LIC-MH-2026-814915', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-814915', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1092' OR contractorCode = 'GRY1092')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1092', 'GRY1092', '15', 'SAGAR ENTERPRISES', 'LIC-MH-2026-811430', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-811430', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1093' OR contractorCode = 'GRY1093')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1093', 'GRY1093', '15', 'MINTECH EXPLOCHEM', 'LIC-MH-2026-897685', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-897685', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1094' OR contractorCode = 'GRY1094')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1094', 'GRY1094', '15', 'BKS CONTRACTOR', 'LIC-MH-2026-916535', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-916535', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1095' OR contractorCode = 'GRY1095')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1095', 'GRY1095', '15', 'LEISTUNG SOLUTION', 'LIC-MH-2026-616916', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-616916', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1096' OR contractorCode = 'GRY1096')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1096', 'GRY1096', '15', 'QUEENSON ENGINEERING & CONSULTANTS', 'LIC-MH-2026-782507', 'Other', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-782507', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1097' OR contractorCode = 'GRY1097')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1097', 'GRY1097', '15', 'GURUKRUPA', 'LIC-MH-2026-864090', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-864090', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1098' OR contractorCode = 'GRY1098')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1098', 'GRY1098', '15', 'SHRITOESH INFRA PVT.LTD', 'LIC-MH-2026-851907', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-851907', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1099' OR contractorCode = 'GRY1099')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1099', 'GRY1099', '15', 'DEEPAK CONSTRUCTION - GYRATORY', 'LIC-MH-2026-127837', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-127837', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-GRY1100' OR contractorCode = 'GRY1100')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-GRY1100', 'GRY1100', '15', 'TAP ENGINEERING', 'LIC-MH-2026-265192', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-265192', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;

IF NOT EXISTS (SELECT 1 FROM dbo.ContractorsMaster WHERE id = 'CTR-MLM1069' OR contractorCode = 'MLM1069')
BEGIN
    INSERT INTO dbo.ContractorsMaster (id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile, email, address, registrationNo, labourLicenseNo, pfCode, esicCode, gstNo, panNo, validFrom, validUpto, status, createdAt)
    VALUES ('CTR-MLM1069', 'MLM1069', '15', 'SPC INFRA PROJECT', 'LIC-MH-2026-111017', 'Civil', '', '', '', 'Hedri / Surjagarh Project Site, Gadchiroli, MH', '', 'LIC-MH-2026-111017', '', '', '', '', '2026-01-01', '2027-12-31', 'ACTIVE', '2026-11-26T06:34:50.749Z');
END;
