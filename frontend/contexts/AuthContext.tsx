'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import {
  AuthState,
  User,
  clearAuthState,
  getAuthState,
  setAuthState,
} from '@/lib/auth';
import { refreshToken as apiRefreshToken } from '@/lib/api';

export interface AuthContextValue extends AuthState {
  isLoading: boolean;
  login: (payload: { token: string; user: User }) => void;
  logout: () => void;
  refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>(() => getAuthState());
  const [isLoading, setIsLoading] = useState(true);

  // Hydrate auth state on the client after initial render
  useEffect(() => {
    setState(getAuthState());
    setIsLoading(false);
  }, []);

  const handleLogin = useCallback((payload: { token: string; user: User }) => {
    setAuthState(payload.token, payload.user);

    setState({
      user: payload.user,
      token: payload.token,
      isAuthenticated: true,
      isAdmin: payload.user.role === 'admin',
    });
  }, []);

  const handleLogout = useCallback(() => {
    clearAuthState();

    setState({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!state.token) {
      return;
    }

    try {
      const { token, user } = await apiRefreshToken();

      setAuthState(token, user);

      setState({
        user,
        token,
        isAuthenticated: true,
        isAdmin: user.role === 'admin',
      });
    } catch (error) {
      // If refresh fails, clear the auth state and let the caller decide what to do
      clearAuthState();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isAdmin: false,
      });
    }
  }, [state.token]);

  const value: AuthContextValue = {
    ...state,
    isLoading,
    login: handleLogin,
    logout: handleLogout,
    refresh: handleRefresh,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

