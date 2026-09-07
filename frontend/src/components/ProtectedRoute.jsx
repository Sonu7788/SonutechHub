import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

export function AdminRoute({ children }) {
  const { user, isAdmin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0b0f19]">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
