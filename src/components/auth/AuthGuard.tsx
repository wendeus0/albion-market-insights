import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/useAuth';
import type { ReactNode } from 'react';

export function AuthGuard({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) return <div role="status" aria-label="Carregando..." />;
  if (!user) return <Navigate to="/login" replace />;

  return <>{children}</>;
}
