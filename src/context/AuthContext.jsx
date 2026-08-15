import { createContext, useContext, useEffect, useState } from 'react';
import { apiClient } from '../lib/apiClient';
import { queryClient } from '../lib/queryClient';
import { disconnectEcho } from '../lib/echo';

const AuthContext = createContext(undefined);
const TOKEN_KEY = 'fleet_auth_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) { setIsLoading(false); return; }

    apiClient.get('/auth/me')
      .then((res) => setUser(res.data.data ?? res.data))
      .catch(() => localStorage.removeItem(TOKEN_KEY))
      .finally(() => setIsLoading(false));
  }, []);

  async function login(email, password) {
    queryClient.clear();
    const res = await apiClient.post('/auth/login', { email, password });
    localStorage.setItem(TOKEN_KEY, res.data.token);
    setUser(res.data.user);
    return res.data.user;
  }

  async function logout() {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      queryClient.clear();
      disconnectEcho();
    }
  }

  async function refreshUser() {
    const res = await apiClient.get('/auth/me');
    setUser(res.data.data ?? res.data);
  }

  function hasRole(...roles) {
    return !!user && roles.some((r) => user.roles?.includes(r));
  }

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, hasRole, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}