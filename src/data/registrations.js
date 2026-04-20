import { saveAndSync } from './fireSync';

const STORAGE_KEY = 'ksei_registrations';
const SETTINGS_KEY = 'ksei_reg_settings';

// --- Read ---
export const getRegistrations = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
export const saveRegistrations = (data) => saveAndSync(STORAGE_KEY, data);

// --- Settings (buka/tutup pendaftaran) ---
export const getRegSettings = () => JSON.parse(localStorage.getItem(SETTINGS_KEY) || '{"isOpen":true,"waNumber":"6281234567890"}');
export const saveRegSettings = (data) => { localStorage.setItem(SETTINGS_KEY, JSON.stringify(data)); };
export const toggleRegistration = () => { const s = getRegSettings(); s.isOpen = !s.isOpen; saveRegSettings(s); return s; };

// --- Create ---
export const submitRegistration = (data) => {
  const list = getRegistrations();
  const exists = list.find(r => r.npm === data.npm);
  if (exists) return { error: 'NPM ini sudah pernah mendaftar' };
  const reg = { id: `reg-${Date.now()}`, ...data, status: 'pending', submittedAt: new Date().toISOString() };
  list.push(reg);
  saveRegistrations(list);
  return { success: true, reg };
};

// --- Update status ---
export const updateRegStatus = (id, status) => {
  const list = getRegistrations().map(r => r.id === id ? { ...r, status } : r);
  saveRegistrations(list);
  return list;
};

// --- Delete ---
export const deleteRegistration = (id) => {
  const list = getRegistrations().filter(r => r.id !== id);
  saveRegistrations(list);
  return list;
};

// --- Initialize (hanya lokal, TIDAK push ke cloud) ---
export const initializeRegistrations = () => {
  if (!localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
  if (!localStorage.getItem(SETTINGS_KEY)) saveRegSettings({ isOpen: true, waNumber: '6281234567890' });
};
