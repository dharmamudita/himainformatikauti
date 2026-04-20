import { createContext, useContext, useState } from 'react';
import { useData } from './DataContext';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const { loginUser, loading } = useData();

  const login = (npm, password) => {
    const u = loginUser(npm, password);
    if (u) { setUser(u); return { success: true }; }
    return { success: false, error: 'NPM atau Password salah' };
  };

  const logout = () => { setUser(null); };
  const isAdmin = user?.role === 'admin';

  if (loading) return null;

  return (
    <AuthContext.Provider value={{ user, login, logout, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};
