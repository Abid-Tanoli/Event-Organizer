import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface Props {
  children: React.ReactNode;
  requireAdmin?: boolean;
}

const AccessDenied = () => (
  <div className="min-h-screen flex items-center justify-center bg-muted/30">
    <div className="text-center space-y-4">
      <h1 className="text-4xl font-bold text-destructive">Access Denied</h1>
      <p className="text-muted-foreground">You do not have permission to access the admin panel.</p>
      <a href="/admin/login" className="inline-block mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors">
        Go to Login
      </a>
    </div>
  </div>
);

const ProtectedRoute = ({ children, requireAdmin }: Props) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;
  if (requireAdmin && user?.role !== 'admin') return <AccessDenied />;

  return <>{children}</>;
};

export default ProtectedRoute;
