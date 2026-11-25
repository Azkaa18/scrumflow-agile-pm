import { createContext, useContext, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { api } from './api';
import { STORAGE_KEY } from '../data/seed';

const AuthContext = createContext(null);
const KEY = `${STORAGE_KEY}-user`;

function readUser() {
  try {
    return JSON.parse(localStorage.getItem(KEY));
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readUser);

  const login = async (email, password) => {
    const u = await api.login(email, password);
    setUser(u);
    try {
      localStorage.setItem(KEY, JSON.stringify(u));
    } catch {
      /* ignore */
    }
    return u;
  };

  const logout = () => {
    api.logout();
    setUser(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

export function RequireAuth({ children }) {
  const { user } = useAuth();
  const location = useLocation();
  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
