'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserRole } from './mockData';
import { api } from './api';

interface AuthContextType {
  user: { id: string; email: string; role: UserRole; name?: string; token?: string } | null;
  login: (email: string, password: string) => Promise<any>;
  logout: () => void;
  isAuthenticated: boolean;
  isHydrated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthContextType['user']>(null);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsedUser = JSON.parse(stored);
        setUser(parsedUser);
      } catch (e) {
        console.error("Failed to parse user from local storage", e);
      }
    }
    setIsHydrated(true);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const data = await api.login(email, password);
      // data = { token, role, name, ... }
      const newUser = {
        id: data.id,
        email: email,
        role: data.role as UserRole,
        name: data.name,
        token: data.token
      };

      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
      return newUser; // Return for immediate use
    } catch (error) {
      console.error("Login Error:", error);
      throw error;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated: !!user, isHydrated }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    return {
      user: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => { },
      logout: () => { },
      isHydrated: false,
    };
  }
  return context;
}
