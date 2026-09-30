import dotenv from 'dotenv';
import { connectToFabric } from './fabricDb.js';

dotenv.config();

async function migrate() {
  console.log('Connecting to Microsoft Fabric SQL Database...');
  const pool = await connectToFabric();
  if (!pool) {
    console.error('Failed to connect to Fabric SQL.');
    process.exit(1);
  }

  console.log('Checking if [photo] column exists in dbo.WorkerHRData...');
  const check = await pool.request().query(`
    SELECT COLUMN_NAME 
    FROM INFORMATION_SCHEMA.COLUMNS 
    WHERE TABLE_NAME = 'WorkerHRData' AND COLUMN_NAME = 'photo'
  `);

  if (check.recordset.length === 0) {
    console.log('Executing: ALTER TABLE dbo.WorkerHRData ADD photo VARCHAR(MAX) NULL;');
    await pool.request().query('ALTER TABLE dbo.WorkerHRData ADD photo VARCHAR(MAX) NULL;');
    console.log('✅ Success! Column [photo] VARCHAR(MAX) added to dbo.WorkerHRData in Microsoft Fabric!');
  } else {
    console.log('Column [photo] already exists in dbo.WorkerHRData.');
  }

  process.exit(0);
}

migrate().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
