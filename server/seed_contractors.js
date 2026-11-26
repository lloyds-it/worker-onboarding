import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import sql from 'mssql';
import { connectToFabric } from './fabricDb.js';

const STORE_PATH = path.join(process.cwd(), 'server', 'data', 'contractors_store.json');

const inferDepartment = (name) => {
  const upper = name.toUpperCase();
  if (upper.includes('ELECTRONIC') || upper.includes('ELECTRIC') || upper.includes('PANNEL')) return 'Electrical';
  if (upper.includes('MECHANICAL') || upper.includes('CRAN') || upper.includes('HYDRAULIC') || upper.includes('FEBRICATOR') || upper.includes('FAB') || upper.includes('STEEL')) return 'Mechanical';
  if (upper.includes('TRANSPORT') || upper.includes('RENTAL') || upper.includes('SURVEY') || upper.includes('VERITAS') || upper.includes('CONSULTANT') || upper.includes('INFOTECH') || upper.includes('TRADING')) return 'Other';
  return 'Civil';
};

export const seedContractors = async () => {
  if (!fs.existsSync(STORE_PATH)) {
    throw new Error(`Missing contractors seed file at ${STORE_PATH}`);
  }
  const contractors = JSON.parse(fs.readFileSync(STORE_PATH, 'utf8'));
  console.log(`[Seed] Loaded ${contractors.length} contractors from ${STORE_PATH}`);

  const pool = await connectToFabric(true);
  if (!pool || !pool.connected) {
    console.warn('[Seed] Could not connect to Microsoft Fabric SQL. Local contractors_store.json is ready.');
    return { total: contractors.length, inserted: 0, skipped: 0, connected: false };
  }

  let inserted = 0;
  let skipped = 0;

  for (const c of contractors) {
    const checkReq = new sql.Request(pool);
    const existing = await checkReq
      .input('id', sql.VarChar(50), c.id)
      .input('contractorCode', sql.VarChar(50), c.contractorCode)
      .query('SELECT TOP 1 id FROM dbo.ContractorsMaster WHERE id = @id OR contractorCode = @contractorCode;');

    if (existing.recordset.length > 0) {
      skipped++;
      continue;
    }

    const req = new sql.Request(pool);
    await req
      .input('id', sql.VarChar(50), c.id)
      .input('contractorCode', sql.VarChar(50), c.contractorCode || '')
      .input('locationCode', sql.VarChar(20), c.locationCode || '15')
      .input('companyName', sql.VarChar(200), c.companyName)
      .input('licenseNo', sql.VarChar(100), c.licenseNo || '')
      .input('department', sql.VarChar(100), c.department || inferDepartment(c.companyName))
      .input('contactPerson', sql.VarChar(200), c.contactPerson || '')
      .input('contactMobile', sql.VarChar(30), c.contactMobile || '')
      .input('email', sql.VarChar(200), c.email || '')
      .input('address', sql.VarChar(500), c.address || '')
      .input('registrationNo', sql.VarChar(100), c.registrationNo || '')
      .input('labourLicenseNo', sql.VarChar(100), c.labourLicenseNo || '')
      .input('pfCode', sql.VarChar(100), c.pfCode || '')
      .input('esicCode', sql.VarChar(100), c.esicCode || '')
      .input('gstNo', sql.VarChar(50), c.gstNo || '')
      .input('panNo', sql.VarChar(50), c.panNo || '')
      .input('validFrom', sql.VarChar(50), c.validFrom || '2026-01-01')
      .input('validUpto', sql.VarChar(50), c.validUpto || '2027-12-31')
      .input('status', sql.VarChar(30), c.status || 'ACTIVE')
      .input('createdAt', sql.VarChar(50), c.createdAt || new Date().toISOString())
      .query(`
        INSERT INTO dbo.ContractorsMaster (
          id, contractorCode, locationCode, companyName, licenseNo, department, contactPerson, contactMobile,
          email, address, registrationNo, labourLicenseNo, pfCode, esicCode,
          gstNo, panNo, validFrom, validUpto, status, createdAt
        ) VALUES (
          @id, @contractorCode, @locationCode, @companyName, @licenseNo, @department, @contactPerson, @contactMobile,
          @email, @address, @registrationNo, @labourLicenseNo, @pfCode, @esicCode,
          @gstNo, @panNo, @validFrom, @validUpto, @status, @createdAt
        );
      `);
    inserted++;
  }

  console.log(`[Seed] Completed Microsoft Fabric sync: ${inserted} inserted, ${skipped} already existed.`);
  await pool.close();
  return { total: contractors.length, inserted, skipped, connected: true };
};

if (process.argv[1] && path.resolve(process.argv[1]).endsWith('seed_contractors.js')) {
  seedContractors()
    .then(res => {
      console.log('[Seed Result]', JSON.stringify(res));
      process.exit(0);
    })
    .catch(err => {
      console.error('[Seed Error]', err.message);
      process.exit(1);
    });
}
