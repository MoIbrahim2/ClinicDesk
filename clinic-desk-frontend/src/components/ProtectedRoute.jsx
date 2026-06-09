import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center w-full h-full" style={{ minHeight: '100vh' }}>
        <div className="flex flex-col items-center gap-md">
          <span className="material-symbols-outlined font-bold text-muted" style={{ fontSize: '48px', animation: 'spin 1.5s linear infinite' }}>
            progress_activity
          </span>
          <span className="text-sm font-semibold text-muted">Checking Session...</span>
        </div>
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If roles are specified, check if user's role is allowed
  // Backend returns role object on user, let's check user.role?.name or user.role
  const userRole = user.role?.name || user.role;
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
