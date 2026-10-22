import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiService } from '../services/api';
import { demoUser } from '../data/mockData';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('aquavision_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem('aquavision_token') || null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem('aquavision_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('aquavision_user');
    }
  }, [user]);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const res = await apiService.login(email, password);
      if (res.token) {
        setToken(res.token);
        localStorage.setItem('aquavision_token', res.token);
      }
      if (res.user) {
        setUser(res.user);
      }
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('aquavision_token');
    localStorage.removeItem('aquavision_user');
  };

  const loginDemo = (role = 'Admin') => {
    const newUser = {
      ...demoUser,
      role: role === 'Officer' ? 'Field Officer' : 'Chief Hydrogeologist / Admin',
      name: role === 'Officer' ? 'Priya Sharma (Field Officer)' : 'Dr. Rajesh Kumar (Admin)',
      email: role === 'Officer' ? 'officer@aquavision.gov.in' : 'admin@aquavision.gov.in'
    };
    setUser(newUser);
    setToken('demo-token-123');
    localStorage.setItem('aquavision_token', 'demo-token-123');
  };

  const loginWithGoogle = async (googleUser = null) => {
    setLoading(true);
    try {
      const email = googleUser?.email || 'officer.tnwater@gmail.com';
      const name = googleUser?.name || (email.split('@')[0].replace(/[._\-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase()));
      const initials = name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();

      const userProfile = {
        _id: `g-user-${Date.now()}`,
        name: name,
        email: email,
        role: 'Field Officer (Google)',
        department: 'Water Resources Department (TNDWR)',
        district: 'Coimbatore Division',
        avatar: initials,
        ...googleUser
      };
      const googleToken = `google-jwt-${Date.now()}`;
      setUser(userProfile);
      setToken(googleToken);
      localStorage.setItem('aquavision_token', googleToken);
      localStorage.setItem('aquavision_user', JSON.stringify(userProfile));
      return { success: true };
    } catch (err) {
      return { success: false, message: err.message || 'Google sign-in failed' };
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, loginDemo, loginWithGoogle, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
