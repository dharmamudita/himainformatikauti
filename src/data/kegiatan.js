// ===== DATABASE: KEGIATAN MANAGEMENT =====
// Menyimpan dan mengelola data kegiatan (materi-soal, kajian, seminar, lomba)

import { getSubmissions, saveSubmissions } from './submissions';
import { getAttendance, saveAttendance } from './attendance';
import { saveAndSync } from './fireSync';

const STORAGE_KEY = 'ksei_kegiatan';

// --- Auto status berdasarkan tanggal & jam ---
export const computeStatus = (k) => {
  if (!k.openDate && !k.closeDate) return k.status || 'open';
  const now = new Date();
  const open = k.openDate ? new Date(k.openDate) : null;
  const close = k.closeDate ? new Date(k.closeDate) : null;
  if (open && now < open) return 'closed'; // belum dibuka
  if (close && now > close) return 'closed'; // sudah ditutup
  return 'open';
};

// --- Data Default (kosong, data dibuat via admin) ---
const defaultKegiatan = [];

// --- Read (dengan auto-sync status berdasarkan tanggal) ---
export const getKegiatan = () => {
  const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
  return raw.map(k => ({ ...k, status: computeStatus(k) }));
};
export const saveKegiatan = (data) => saveAndSync(STORAGE_KEY, data);
export const getKegiatanById = (id) => {
  const k = getKegiatan().find(k => k.id === id);
  return k ? { ...k, status: computeStatus(k) } : null;
};

// --- Create ---
export const createKegiatan = (data) => {
  const list = getKegiatan();
  const item = { id: `keg-${Date.now()}`, createdAt: new Date().toISOString().split('T')[0], ...data };
  list.push(item);
  saveKegiatan(list);
  return item;
};

// --- Update ---
export const updateKegiatan = (id, data) => {
  const list = getKegiatan().map(k => k.id === id ? { ...k, ...data } : k);
  saveKegiatan(list);
  return list;
};

// --- Delete ---
export const deleteKegiatan = (id) => {
  const list = getKegiatan().filter(k => k.id !== id);
  saveKegiatan(list);
  // Hapus submissions & attendance terkait
  const subs = getSubmissions().filter(s => s.kegiatanId !== id);
  saveSubmissions(subs);
  const atts = getAttendance().filter(a => a.kegiatanId !== id);
  saveAttendance(atts);
  return list;
};

// --- Initialize (hanya lokal, TIDAK push ke cloud) ---
export const initializeKegiatan = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(defaultKegiatan));
  }
};
