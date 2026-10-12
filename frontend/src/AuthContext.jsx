import React, { createContext, useContext, useState, useEffect } from 'react';
import { loginUser } from './api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('btrust_auth');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const login = async (username, password) => {
    // Authenticate against backend API
    const response = await loginUser(username, password);
    const data = response.data;
    const userData = { 
      username, 
      token: data.token || 'authenticated',
      role: data.role || 'admin',
      customer_id: data.customer_id || null,
      name: data.name || (data.role === 'admin' ? 'Bank Admin' : username)
    };
    localStorage.setItem('btrust_auth', JSON.stringify({ username, password, ...userData }));
    setUser(userData);
    return data;
  };

  const logout = () => {
    localStorage.removeItem('btrust_auth');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
