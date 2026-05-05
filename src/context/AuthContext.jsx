import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const raw = localStorage.getItem('user');
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/v1/auth/login', { email, password });
    localStorage.setItem('token', data.access_token);
    const u = { name: data.name, email: data.email, role: data.role };
    localStorage.setItem('user', JSON.stringify(u));
    setToken(data.access_token);
    setUser(u);
    return u;
  }, []);

  const signupRequest = useCallback(async (email) => {
    return api.post('/api/v1/auth/signup/request', { email });
  }, []);

  const signupVerify = useCallback(async (payload) => {
    const { data } = await api.post('/api/v1/auth/signup/verify', payload);
    localStorage.setItem('token', data.access_token);
    const u = { name: data.name, email: data.email, role: data.role };
    localStorage.setItem('user', JSON.stringify(u));
    setToken(data.access_token);
    setUser(u);
    return u;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: !!token && !!user,
      login,
      logout,
      signupRequest,
      signupVerify,
    }),
    [user, token, loading, login, logout, signupRequest, signupVerify]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
