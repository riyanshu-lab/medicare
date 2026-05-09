import React, { createContext, useContext, useState, useEffect } from 'react';
import { mockUsers } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem('hms_user');
    if (stored) setUser(JSON.parse(stored));
    setLoading(false);
  }, []);

  const login = (email, password) => {
    const allUsers = JSON.parse(localStorage.getItem('hms_registered_users') || '[]');
    const combined = [...mockUsers, ...allUsers];
    const found    = combined.find(u => u.email === email && u.password === password);
    if (!found) return { success: false, message: 'Invalid email or password.' };
    const { password: _pw, ...safe } = found;
    setUser(safe);
    localStorage.setItem('hms_user', JSON.stringify(safe));
    return { success: true, user: safe };
  };

  const register = (data) => {
    const allUsers = JSON.parse(localStorage.getItem('hms_registered_users') || '[]');
    const exists   = [...mockUsers, ...allUsers].find(u => u.email === data.email);
    if (exists) return { success: false, message: 'An account with this email already exists.' };
    const newUser = {
      id: `u_${Date.now()}`,
      role: 'patient',
      joinedDate: new Date().toISOString().split('T')[0],
      ...data,
    };
    localStorage.setItem('hms_registered_users', JSON.stringify([...allUsers, newUser]));
    const { password: _pw, ...safe } = newUser;
    setUser(safe);
    localStorage.setItem('hms_user', JSON.stringify(safe));
    return { success: true, user: safe };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('hms_user');
  };

  const updateProfile = (updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('hms_user', JSON.stringify(updated));

    // Also update in registered users list if present
    const allUsers = JSON.parse(localStorage.getItem('hms_registered_users') || '[]');
    const idx = allUsers.findIndex(u => u.id === user.id);
    if (idx !== -1) {
      allUsers[idx] = { ...allUsers[idx], ...updates };
      localStorage.setItem('hms_registered_users', JSON.stringify(allUsers));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateProfile }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
