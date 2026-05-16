import React, { useContext } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

const ProtectedRoute = ({ allowedRoles = [] }) => {
  const { user } = useContext(AuthContext);

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Force reset password flow
  if (user.needResetPassword && window.location.pathname !== '/change-password') {
    return <Navigate to="/change-password" replace />;
  }

  // Skip role check for change password page to allow any authenticated user
  if (window.location.pathname === '/change-password') {
     return <Outlet />;
  }

  // Check role
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    // If not allowed, send back to their respective dashboard
    if (user.role === 'ADMIN') {
      return <Navigate to="/admin/employees" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return <Outlet />;
};

export default ProtectedRoute;
