import { saveAndSync } from './fireSync';

const STORAGE_KEY = 'ksei_users';
const SESSION_KEY = 'ksei_current_user';

export const defaultAdmin = {
  id: 'admin-001',
  name: 'Admin RIIEF',
  npm: 'admin',
  password: 'admin123',
  role: 'admin',
  divisi: '',
  createdAt: '2024-01-22',
};

// --- Read ---
export const getUsers = () => JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
export const saveUsers = (users) => saveAndSync(STORAGE_KEY, users);

// --- Auth ---
export const loginUser = (npm, password) => {
  const user = getUsers().find(u => u.npm === npm && u.password === password);
  if (user) {
    const { password: _, ...safe } = user;
    localStorage.setItem(SESSION_KEY, JSON.stringify(safe));
    return safe;
  }
  return null;
};

export const logoutUser = () => localStorage.removeItem(SESSION_KEY);
export const getCurrentUser = () => JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');

// --- Create ---
export const createUser = (data) => {
  const users = getUsers();
  if (users.find(u => u.npm === data.npm)) return { error: 'NPM sudah terdaftar' };
  const newUser = {
    id: `user-${Date.now()}`,
    ...data,
    createdAt: new Date().toISOString().split('T')[0],
  };
  users.push(newUser);
  saveUsers(users);
  return { success: true };
};

// --- Update ---
export const updateUser = (id, data) => {
  const users = getUsers();
  const dup = users.find(u => u.npm === data.npm && u.id !== id);
  if (dup) return { error: 'NPM sudah digunakan user lain' };
  const updated = users.map(u => u.id === id ? { ...u, ...data } : u);
  saveUsers(updated);
  return { success: true };
};

// --- Delete ---
export const deleteUser = (id) => {
  const filtered = getUsers().filter(u => u.id !== id);
  saveUsers(filtered);
  return filtered;
};

// --- Initialize (hanya lokal, TIDAK push ke cloud) ---
export const initializeUsers = () => {
  if (!localStorage.getItem(STORAGE_KEY)) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultAdmin]));
  }
};
