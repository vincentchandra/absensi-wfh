import React, { useContext } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';

import LoginPage from './pages/LoginPage';
import ChangePasswordPage from './pages/ChangePasswordPage';
import DashboardPage from './pages/DashboardPage';
import AttendanceHistoryPage from './pages/AttendanceHistoryPage';
import EmployeesPage from './pages/admin/EmployeesPage';
import AttendanceMonitorPage from './pages/admin/AttendanceMonitorPage';

function App() {
  const { user } = useContext(AuthContext);

  // If user hits root (/), redirect them based on their auth status & role
  const getRootRedirect = () => {
    if (!user) return <Navigate to="/login" replace />;
    if (user.needResetPassword) return <Navigate to="/change-password" replace />;
    return user.role === 'ADMIN' ? <Navigate to="/admin/employees" replace /> : <Navigate to="/dashboard" replace />;
  };

  return (
    <Routes>
      <Route path="/" element={getRootRedirect()} />
      <Route path="/login" element={user ? getRootRedirect() : <LoginPage />} />

      {/* Authenticated Routes */}
      <Route element={<ProtectedRoute />}>
        <Route path="/change-password" element={<ChangePasswordPage />} />
      </Route>

      {/* App Routes wrapped in Layout */}
      <Route element={<DashboardLayout />}>
        {/* Employee Routes */}
        <Route element={<ProtectedRoute allowedRoles={['EMPLOYEE']} />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/my-attendance" element={<AttendanceHistoryPage />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin/employees" element={<EmployeesPage />} />
          <Route path="/admin/attendance" element={<AttendanceMonitorPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
