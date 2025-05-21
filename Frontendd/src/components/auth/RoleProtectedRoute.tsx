import React, { useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  redirectTo?: string;
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  allowedRoles,
  redirectTo = '/dashboard' 
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  // Memoize the role check to prevent unnecessary re-renders
  const hasAccess = useMemo(() => {
    if (!user || !user.role) return false;
    return allowedRoles.includes(user.role);
  }, [user, allowedRoles]);

  // If authentication is still being checked, show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated but wrong role, redirect to the appropriate dashboard
  if (!hasAccess) {
    return <Navigate to={redirectTo} replace />;
  }

  // If authenticated with correct role, render the protected content
  return <>{children}</>;
};

export default RoleProtectedRoute;
