// Storage Service for Workers
import { STAGES } from '../types/constants.js';

const WORKER_STORAGE_KEY = 'lloyd_workers_master_v2';

// Helper to generate realistic high-definition industrial worker avatars
export const generateAvatarSVG = (skin = '#C2410C', helmet = '#FACC15', vest = '#1E3A8A') => {
  return 'data:image/svg+xml;utf8,' + encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200" width="200" height="200">
      <rect width="200" height="200" fill="#F8FAFC"/>
      <path d="M40 200 L40 160 Q40 140 70 135 L100 145 L130 135 Q160 140 160 160 L160 200 Z" fill="${vest}"/>
      <path d="M85 142 L100 150 L115 142 L115 180 L85 180 Z" fill="#64748B"/>
      <rect x="55" y="155" width="90" height="8" fill="#FACC15"/>
      <rect x="88" y="115" width="24" height="28" fill="${skin}" rx="4"/>
      <ellipse cx="100" cy="90" rx="35" ry="42" fill="${skin}"/>
      <circle cx="86" cy="88" r="4" fill="#0F172A"/>
      <circle cx="114" cy="88" r="4" fill="#0F172A"/>
      <path d="M78 81 Q86 78 94 81" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M106 81 Q114 78 122 81" stroke="#0F172A" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <path d="M100 87 L98 98 L103 98" stroke="#9A3412" stroke-width="2" fill="none" stroke-linecap="round"/>
      <path d="M85 108 Q100 104 115 108 Q100 114 85 108 Z" fill="#1E293B"/>
      <path d="M62 68 Q100 32 138 68 Q144 70 140 75 L60 75 Q56 70 62 68 Z" fill="${helmet}"/>
      <rect x="56" y="73" width="88" height="6" fill="#94A3B8" rx="3"/>
    </svg>
  `);
};

export const INITIAL_WORKERS = [];

export const getStoredWorkers = () => {
  try {
    const raw = localStorage.getItem(WORKER_STORAGE_KEY);
    if (!raw) {
      return INITIAL_WORKERS;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (err) {
    console.error('Failed to parse workers from localStorage:', err);
    return [];
  }
};

export const clearStoredWorkers = () => {
  try {
    localStorage.removeItem(WORKER_STORAGE_KEY);
  } catch (err) {
    console.error('Failed to clear workers storage:', err);
  }
};

export const saveWorkers = (workers) => {
  try {
    if (Array.isArray(workers)) {
      localStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify(workers));
    }
  } catch (err) {
    console.error('Failed to save workers:', err);
  }
};

export const resetToInitialData = () => {
  localStorage.setItem(WORKER_STORAGE_KEY, JSON.stringify(INITIAL_WORKERS));
  return INITIAL_WORKERS;
};
