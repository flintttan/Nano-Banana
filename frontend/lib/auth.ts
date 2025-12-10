import React from 'react';

// Authentication utilities and JWT token helpers

const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'user';

export interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  // Normalized points field used by the dashboard UI
  points: number;
  // Optional fields returned by the backend APIs
  drawing_points?: number;
  creation_count?: number;
  created_at?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Shape of the JWT payload issued by the backend
export interface DecodedTokenPayload {
  id: number;
  username: string;
  email: string;
  role: string;
  drawing_points?: number;
  creation_count?: number;
  iat?: number;
  exp?: number;
  // Allow additional arbitrary claims without breaking callers
  [key: string]: unknown;
}

/**
 * Get authentication state from localStorage and cookies
 */
export function getAuthState(): AuthState {
  if (typeof window === 'undefined') {
    return {
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
    };
  }

  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  const userStr = localStorage.getItem(USER_STORAGE_KEY);

  let user: User | null = null;
  if (userStr) {
    try {
      const parsed = JSON.parse(userStr);
      const normalizedPoints =
        typeof parsed.points === 'number'
          ? parsed.points
          : typeof parsed.drawing_points === 'number'
          ? parsed.drawing_points
          : 0;

      user = {
        ...parsed,
        points: normalizedPoints,
      } as User;
    } catch {
      user = null;
    }
  }

  return {
    user,
    token,
    isAuthenticated: !!token && !!user,
    isAdmin: user?.role === 'admin',
  };
}

/**
 * Set authentication state (stores in both localStorage and cookies)
 */
export function setAuthState(token: string, user: User): void {
  if (typeof window !== 'undefined') {
    const normalizedUser: User = {
      ...user,
      points:
        typeof (user as any).points === 'number'
          ? (user as any).points
          : typeof (user as any).drawing_points === 'number'
          ? (user as any).drawing_points
          : 0,
    };

    localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(normalizedUser));

    // Also set as cookie for middleware access
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  const { isAuthenticated } = getAuthState();
  return isAuthenticated;
}

/**
 * Check if user is admin
 */
export function isAdmin(): boolean {
  const { isAdmin } = getAuthState();
  return isAdmin;
}

/**
 * Get current user
 */
export function getCurrentUser(): User | null {
  const { user } = getAuthState();
  return user;
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
  const { token } = getAuthState();
  return token;
}

/**
 * Clear authentication state without performing a redirect
 */
export function clearAuthState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);

    // Remove cookie
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
  }
}

/**
 * Logout user
 */
export function logout(redirectTo: string = '/login'): void {
  if (typeof window !== 'undefined') {
    clearAuthState();
    window.location.href = redirectTo;
  }
}

/**
 * Make authenticated API request
 */
export async function authenticatedFetch(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = getAuthToken();

  if (!token) {
    throw new Error('Not authenticated');
  }

  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle 401 Unauthorized
  if (response.status === 401) {
    logout();
    throw new Error('Session expired. Please login again.');
  }

  return response;
}

/**
 * Decode a JWT token payload without verifying the signature.
 *
 * This is safe on the client when used only for UX decisions
 * (for example, checking expiry) and not for authorisation.
 */
export function decodeToken(token: string): DecodedTokenPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded =
      typeof window === 'undefined'
        ? Buffer.from(payload, 'base64').toString('utf8')
        : atob(payload.replace(/-/g, '+').replace(/_/g, '/'));

    return JSON.parse(decoded) as DecodedTokenPayload;
  } catch {
    return null;
  }
}

/**
 * Get the decoded token payload either from an explicit token
 * or from the current auth state.
 */
export function getTokenPayload(token?: string | null): DecodedTokenPayload | null {
  const rawToken = token ?? getAuthToken();
  if (!rawToken) return null;
  return decodeToken(rawToken);
}

/**
 * Get token expiry date if present.
 */
export function getTokenExpiration(token?: string | null): Date | null {
  const payload = getTokenPayload(token);
  if (!payload?.exp) return null;
  // exp is in seconds since epoch
  return new Date(payload.exp * 1000);
}

/**
 * Check whether a token is expired (optionally with a negative/positive skew).
 * A positive skewSeconds value will treat the token as expired a bit earlier
 * to give the app time to refresh.
 */
export function isTokenExpired(token?: string | null, skewSeconds = 0): boolean {
  const expiresAt = getTokenExpiration(token);
  if (!expiresAt) return false;

  const now = Date.now();
  const skewMs = skewSeconds * 1000;
  return expiresAt.getTime() - skewMs <= now;
}

/**
 * Protected route wrapper - use in page components
 */
export function withAuth<P extends object>(
  Component: React.ComponentType<P>,
  options: { requireAdmin?: boolean } = {}
): React.ComponentType<P> {
  const ProtectedRoute = (props: P) => {
    const { isAuthenticated, isAdmin: userIsAdmin } = getAuthState();

    if (typeof window !== 'undefined') {
      if (!isAuthenticated) {
        window.location.href = '/login';
        return null;
      }

      if (options.requireAdmin && !userIsAdmin) {
        window.location.href = '/dashboard';
        return null;
      }
    }
    return React.createElement(Component, props);
  };

  return ProtectedRoute;
}
