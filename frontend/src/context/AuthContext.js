import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [token, setToken]     = useState(localStorage.getItem('saviour_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      const stored = localStorage.getItem('saviour_user');
      if (stored) { try { setUser(JSON.parse(stored)); } catch {} }
    }
    setLoading(false);
  }, [token]);

  const login = async (phone, password) => {
    const res = await axios.post(`${API}/auth/login`, { phone, password });
    const { token: t, user: u } = res.data;
    setToken(t); setUser(u);
    localStorage.setItem('saviour_token', t);
    localStorage.setItem('saviour_user', JSON.stringify(u));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    return u;
  };

  const register = async (data) => {
    const res = await axios.post(`${API}/auth/register`, data);
    const { token: t, user: u } = res.data;
    setToken(t); setUser(u);
    localStorage.setItem('saviour_token', t);
    localStorage.setItem('saviour_user', JSON.stringify(u));
    axios.defaults.headers.common['Authorization'] = `Bearer ${t}`;
    return u;
  };

  const logout = () => {
    setToken(null); setUser(null);
    localStorage.removeItem('saviour_token');
    localStorage.removeItem('saviour_user');
    delete axios.defaults.headers.common['Authorization'];
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
