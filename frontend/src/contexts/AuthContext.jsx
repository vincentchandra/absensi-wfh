import React, { createContext, useState, useEffect } from 'react';
import apiClient from '../api/client';

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Checks if user is logged in upon app load
  useEffect(() => {
    const checkAuthStatus = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Verify token by fetching user profile
          const response = await apiClient.get('/auth/profile');
          setUser(response.data);
        } catch (error) {
          console.error("Token verification failed", error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setIsLoading(false);
    };

    checkAuthStatus();
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  const updateUser = (userData) => {
    setUser({ ...user, ...userData });
    localStorage.setItem('user', JSON.stringify({ ...user, ...userData }));
  };

  if (isLoading) {
    return (
      <div className="page-container" style={{ alignItems: 'center', justifyContent: 'center' }}>
        <div className="animate-fade-in" style={{ fontSize: '1.2rem', color: 'var(--text-secondary)' }}>
          Loading application...
        </div>
      </div>
    );
  }

  // Provide state to children components via Context
  return (
    <AuthContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
};
