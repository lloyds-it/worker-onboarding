import dotenv from 'dotenv';
import { connectToFabric, dbUpdateWorkerPhoto } from './fabricDb.js';
import fs from 'fs';

dotenv.config();

function generateAvatarSVG(bg1, bg2, accent) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 240 280" width="240" height="280">
    <defs>
      <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="#E2E8F0" />
        <stop offset="100%" stop-color="#CBD5E1" />
      </linearGradient>
      <linearGradient id="shirt" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${bg1}" />
        <stop offset="100%" stop-color="${bg2}" />
      </linearGradient>
    </defs>
    <rect width="240" height="280" fill="url(#bg)" />
    <!-- Shoulders & Shirt -->
    <path d="M 30 280 C 40 220, 70 200, 120 200 C 170 200, 200 220, 210 280 Z" fill="url(#shirt)" />
    <!-- Collar -->
    <polygon points="120,225 100,200 140,200" fill="#FFFFFF" />
    <polygon points="120,245 110,215 130,215" fill="${accent}" />
    <!-- Neck -->
    <rect x="105" y="160" width="30" height="45" fill="#E2A77A" rx="4" />
    <!-- Head / Face -->
    <ellipse cx="120" cy="130" rx="48" ry="58" fill="#F3C39D" />
    <!-- Hair -->
    <path d="M 68 120 C 68 70, 90 60, 120 60 C 150 60, 172 70, 172 120 C 160 85, 140 80, 120 80 C 100 80, 80 85, 68 120 Z" fill="#1E293B" />
    <!-- Eyes -->
    <ellipse cx="102" cy="128" rx="4" ry="3" fill="#1E293B" />
    <ellipse cx="138" cy="128" rx="4" ry="3" fill="#1E293B" />
    <!-- Eyebrows -->
    <path d="M 94 120 Q 102 116 110 120" stroke="#1E293B" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <path d="M 130 120 Q 138 116 146 120" stroke="#1E293B" stroke-width="2.5" fill="none" stroke-linecap="round" />
    <!-- Nose -->
    <path d="M 120 128 L 118 142 L 124 142" stroke="#D4976A" stroke-width="2" fill="none" stroke-linecap="round" />
    <!-- Mouth -->
    <path d="M 110 156 Q 120 162 130 156" stroke="#C27D56" stroke-width="2" fill="none" stroke-linecap="round" />
    <!-- Safety Helmet Brim / Border -->
    <path d="M 62 95 Q 120 80 178 95" stroke="${accent}" stroke-width="6" fill="none" stroke-linecap="round" opacity="0.9" />
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

const workerPhotos = {
  'WRK-2026-001': generateAvatarSVG('#D97706', '#EAB308', '#1E3A8A'),
  'WRK-2026-002': generateAvatarSVG('#C2410C', '#3B82F6', '#1E293B'),
  'WRK-2026-003': generateAvatarSVG('#B45309', '#EF4444', '#0F172A'),
  'WRK-2026-004': generateAvatarSVG('#9A3412', '#10B981', '#1E3A8A'),
  'WRK-2026-005': generateAvatarSVG('#C2410C', '#F97316', '#334155'),
  'WRK-2026-006': generateAvatarSVG('#D97706', '#EAB308', '#7C3AED'),
  'WRK-2026-007': generateAvatarSVG('#C2410C', '#F8FAFC', '#DC2626'),
  'WRK-2026-008': generateAvatarSVG('#9A3412', '#FACC15', '#047857'),
  'WRK-2026-009': generateAvatarSVG('#D97706', '#EAB308', '#2563EB'),
  'WRK-2026-010': generateAvatarSVG('#C2410C', '#3B82F6', '#D97706'),
  'WRK-2026-011': generateAvatarSVG('#B45309', '#EF4444', '#1E293B'),
  'WRK-2026-012': generateAvatarSVG('#D97706', '#F59E0B', '#1E3A8A'),
  'WRK-2026-013': generateAvatarSVG('#C2410C', '#EAB308', '#0F172A'),
  'WRK-2026-014': generateAvatarSVG('#9A3412', '#EF4444', '#1E3A8A'),
  'WRK-2026-015': generateAvatarSVG('#C2410C', '#F59E0B', '#334155'),
  'WRK-2026-016': generateAvatarSVG('#D97706', '#EAB308', '#0284C7'),
  'WRK-2026-017': generateAvatarSVG('#9A3412', '#EF4444', '#475569')
};

async function main() {
  console.log('Connecting to Microsoft Fabric SQL to populate initial photos...');
  const pool = await connectToFabric();
  if (!pool) {
    console.error('Connection failed');
    process.exit(1);
  }

  let count = 0;
  for (const [id, photo] of Object.entries(workerPhotos)) {
    await dbUpdateWorkerPhoto(id, photo);
    count++;
  }
  console.log(`✅ Successfully populated ${count} worker photographs directly into Microsoft Fabric SQL!`);
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
