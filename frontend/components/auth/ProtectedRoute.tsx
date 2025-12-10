'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { isAuthenticated, isAdmin as checkIsAdmin } from '@/lib/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const router = useRouter();

  useEffect(() => {
    if (!isAuthenticated()) {
      router.push('/login');
      return;
    }

    if (requireAdmin && !checkIsAdmin()) {
      router.push('/dashboard');
      return;
    }
  }, [router, requireAdmin]);

  // Only render if authenticated (and admin if required)
  if (!isAuthenticated()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Checking authentication...</p>
      </div>
    );
  }

  if (requireAdmin && !checkIsAdmin()) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-400">Access denied. Admin privileges required.</p>
      </div>
    );
  }

  return <>{children}</>;
}
