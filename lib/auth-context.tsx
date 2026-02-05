'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { api, AuthResponse } from './api';

export interface User {
  id: string;
  email: string;
  role: 'learner' | 'instructor' | 'admin' | 'super-admin';
  firstName?: string;
  lastName?: string;
  activeCohortId?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role?: string
  ) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
      try {
          const response = await api.getMe();
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
      } catch (error) {
          console.error("Failed to refresh user", error);
          // If token is invalid, maybe logout? For now just keep existing state or do nothing
      }
  }, []);

  // Initialize from localStorage then verify with API
  useEffect(() => {
    const initializeAuth = async () => {
      const token = api.getToken();
      if (token) {
        try {
          // First load from local storage for instant UI
          const storedUser = localStorage.getItem('user');
          if (storedUser) {
            setUser(JSON.parse(storedUser));
          }
          
          // Then fetch fresh data
          const response = await api.getMe();
          setUser(response.user);
          localStorage.setItem('user', JSON.stringify(response.user));
        } catch (error) {
          console.error("Auth initialization failed", error);
          // Only logout if it's a 401/403, but here generic catch. 
          // If getMe fails (e.g. invalid token), clear session.
          api.logout();
          localStorage.removeItem('user');
          setUser(null);
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      try {
        const response: AuthResponse = await api.login({ email, password });
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const register = useCallback(
    async (
      firstName: string,
      lastName: string,
      email: string,
      password: string,
      role = 'learner'
    ) => {
      try {
        const response: AuthResponse = await api.register({
          firstName,
          lastName,
          email,
          password,
          role: role as any,
        });
        setUser(response.user);
        localStorage.setItem('user', JSON.stringify(response.user));
      } catch (error) {
        throw error;
      }
    },
    []
  );

  const logout = useCallback(() => {
    api.logout();
    setUser(null);
    localStorage.removeItem('user');
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        refreshUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
