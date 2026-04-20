import { saveAndSync } from './fireSync';

const STORAGE_KEY = 'ksei_feedback';

// --- Read ---
export const getFeedback = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
export const saveFeedback = (data) => saveAndSync(STORAGE_KEY, data);

// --- Create ---
export const submitFeedback = (nama, jenis, pesan) => {
  const list = getFeedback();
  const fb = { id: `fb-${Date.now()}`, nama, jenis, pesan, createdAt: new Date().toISOString() };
  list.unshift(fb);
  saveFeedback(list);
  return fb;
};

// --- Delete ---
export const deleteFeedback = (id) => {
  const list = getFeedback().filter(f => f.id !== id);
  saveFeedback(list);
  return list;
};

// --- Initialize (hanya lokal, TIDAK push ke cloud) ---
export const initializeFeedback = () => {
  if (!localStorage.getItem(STORAGE_KEY)) localStorage.setItem(STORAGE_KEY, JSON.stringify([]));
};
