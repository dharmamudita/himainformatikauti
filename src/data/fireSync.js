// ===== FIREBASE SYNC LAYER =====
// Sinkronisasi data antara localStorage (cache) dan Firestore (cloud)
// Pattern: Write-through cache
// - Read: dari localStorage (cepat, synchronous)
// - Write: ke localStorage DAN Firestore (persisten, realtime)
// - Init: load dari Firestore → simpan ke localStorage

import { db } from '../firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Nama dokumen di Firestore per collection
const COLLECTIONS = {
  ksei_users: 'users',
  ksei_kegiatan: 'kegiatan',
  ksei_submissions: 'submissions',
  ksei_attendance: 'attendance',
  ksei_forum: 'forum',
  ksei_registrations: 'registrations',
  ksei_feedback: 'feedback',
};

// --- Push ke Firestore (async, fire-and-forget) ---
export const pushToCloud = (storageKey) => {
  const colName = COLLECTIONS[storageKey];
  if (!colName) return;
  try {
    const data = JSON.parse(localStorage.getItem(storageKey) || '[]');
    setDoc(doc(db, 'appData', colName), { items: data, updatedAt: new Date().toISOString() })
      .catch(err => console.warn('Firestore push error:', err.message));
  } catch (e) {
    console.warn('Push error:', e.message);
  }
};

// --- Pull dari Firestore ke localStorage ---
export const pullFromCloud = async (storageKey) => {
  const colName = COLLECTIONS[storageKey];
  if (!colName) return false;
  try {
    const snap = await getDoc(doc(db, 'appData', colName));
    if (snap.exists() && snap.data().items) {
      localStorage.setItem(storageKey, JSON.stringify(snap.data().items));
      return true;
    }
  } catch (e) {
    console.warn('Firestore pull error:', e.message);
  }
  return false;
};

// --- Sinkronisasi semua data saat app start ---
export const syncAllFromCloud = async () => {
  const keys = Object.keys(COLLECTIONS);
  const results = await Promise.allSettled(keys.map(k => pullFromCloud(k)));
  const synced = results.filter(r => r.status === 'fulfilled' && r.value).length;
  console.log(`☁️ Firestore sync: ${synced}/${keys.length} collections loaded`);
  return synced > 0;
};

// --- Wrapper: simpan ke localStorage + push ke Firestore ---
export const saveAndSync = (storageKey, data) => {
  localStorage.setItem(storageKey, JSON.stringify(data));
  pushToCloud(storageKey);
};
