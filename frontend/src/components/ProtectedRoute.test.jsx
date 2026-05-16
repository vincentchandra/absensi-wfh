import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import ProtectedRoute from './ProtectedRoute';

// Helper to render ProtectedRoute with a given context and route
const renderWithAuth = (user, { allowedRoles = [], initialPath = '/test' } = {}) => {
  return render(
    <AuthContext.Provider value={{ user, login: vi.fn(), logout: vi.fn(), updateUser: vi.fn() }}>
      <MemoryRouter initialEntries={[initialPath]}>
        <Routes>
          <Route element={<ProtectedRoute allowedRoles={allowedRoles} />}>
            <Route path="/test" element={<div>Protected Content</div>} />
            <Route path="/change-password" element={<div>Change Password</div>} />
          </Route>
          {/* Redirect targets must be outside ProtectedRoute to avoid re-triggering guard */}
          <Route path="/login" element={<div>Login Page</div>} />
          <Route path="/dashboard" element={<div>Employee Dashboard</div>} />
          <Route path="/admin/employees" element={<div>Admin Dashboard</div>} />
        </Routes>
      </MemoryRouter>
    </AuthContext.Provider>
  );
};

describe('ProtectedRoute', () => {
  it('should redirect to /login when user is null', () => {
    renderWithAuth(null);

    expect(screen.getByText('Login Page')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should render protected content when user is authenticated with allowed role', () => {
    const user = { id: 1, role: 'EMPLOYEE', needResetPassword: false };
    renderWithAuth(user, { allowedRoles: ['EMPLOYEE'] });

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should render content when no allowedRoles are specified (any authenticated user)', () => {
    const user = { id: 1, role: 'EMPLOYEE', needResetPassword: false };
    renderWithAuth(user, { allowedRoles: [] });

    expect(screen.getByText('Protected Content')).toBeInTheDocument();
  });

  it('should redirect EMPLOYEE to /dashboard when role not allowed', () => {
    const user = { id: 1, role: 'EMPLOYEE', needResetPassword: false };
    renderWithAuth(user, { allowedRoles: ['ADMIN'] });

    expect(screen.getByText('Employee Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });

  it('should redirect ADMIN to /admin/employees when role not allowed', () => {
    const user = { id: 1, role: 'ADMIN', needResetPassword: false };
    renderWithAuth(user, { allowedRoles: ['EMPLOYEE'] });

    expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
    expect(screen.queryByText('Protected Content')).not.toBeInTheDocument();
  });
});
