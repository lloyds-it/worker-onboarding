import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { connectToFabric } from './fabricDb.js';

dotenv.config();

async function resetFabricDatabase() {
  console.log('Connecting to Microsoft Fabric SQL Database...');
  const pool = await connectToFabric(true);

  if (!pool || !pool.connected) {
    console.error('❌ Unable to reach Microsoft Fabric SQL Database (TCP port 1433 unreachable from this host).');
    console.error('Run database/cleanup_fabric.sql in Microsoft Fabric Query Editor or execute this script from a host with port 1433 access.');
    process.exit(1);
  }

  const sqlPath = path.join(process.cwd(), 'database', 'cleanup_fabric.sql');
  const cleanupSql = fs.readFileSync(sqlPath, 'utf8');

  await pool.request().query(cleanupSql);
  console.log('✅ All worker records, audit logs, and non-hmk@lloyds.in login records removed from Microsoft Fabric SQL Database.');
  process.exit(0);
}

resetFabricDatabase().catch(err => {
  console.error('❌ Fabric cleanup failed:', err.message);
  process.exit(1);
});
