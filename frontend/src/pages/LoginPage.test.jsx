import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import LoginPage from './LoginPage';

// Mock the API client
vi.mock('../api/client', () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
    interceptors: {
      request: { use: vi.fn() },
      response: { use: vi.fn() },
    },
  },
}));

// Mock react-icons
vi.mock('react-icons/fi', () => ({
  FiLock: () => <span data-testid="icon-lock">🔒</span>,
  FiUser: () => <span data-testid="icon-user">👤</span>,
  FiLogIn: () => <span data-testid="icon-login">→</span>,
}));

const renderLoginPage = (authOverrides = {}) => {
  const defaultAuth = {
    user: null,
    login: vi.fn(),
    logout: vi.fn(),
    updateUser: vi.fn(),
    ...authOverrides,
  };

  return {
    ...render(
      <AuthContext.Provider value={defaultAuth}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </AuthContext.Provider>
    ),
    auth: defaultAuth,
  };
};

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form with username and password fields', () => {
    renderLoginPage();

    expect(screen.getByText('Selamat Datang')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Masukkan username')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Masukkan password')).toBeInTheDocument();
    expect(screen.getByText('Masuk sekarang')).toBeInTheDocument();
  });

  it('should show validation error when submitting empty form', async () => {
    renderLoginPage();

    const submitButton = screen.getByText('Masuk sekarang').closest('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username dan password wajib diisi')).toBeInTheDocument();
    });
  });

  it('should show validation error when only username is provided', async () => {
    renderLoginPage();

    const usernameInput = screen.getByPlaceholderText('Masukkan username');
    fireEvent.change(usernameInput, { target: { value: 'testuser' } });

    const submitButton = screen.getByText('Masuk sekarang').closest('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username dan password wajib diisi')).toBeInTheDocument();
    });
  });

  it('should call API and login context on successful submit', async () => {
    const apiClient = (await import('../api/client')).default;
    const mockResponse = {
      data: {
        access_token: 'jwt_token_123',
        user: { id: 1, username: 'EMP001', role: 'EMPLOYEE' },
      },
    };
    apiClient.post.mockResolvedValue(mockResponse);

    const { auth } = renderLoginPage();

    const usernameInput = screen.getByPlaceholderText('Masukkan username');
    const passwordInput = screen.getByPlaceholderText('Masukkan password');

    fireEvent.change(usernameInput, { target: { value: 'EMP001' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    const submitButton = screen.getByText('Masuk sekarang').closest('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(apiClient.post).toHaveBeenCalledWith('/auth/login', {
        username: 'EMP001',
        password: 'password123',
      });
      expect(auth.login).toHaveBeenCalledWith('jwt_token_123', {
        id: 1,
        username: 'EMP001',
        role: 'EMPLOYEE',
      });
    });
  });

  it('should show error message on failed login', async () => {
    const apiClient = (await import('../api/client')).default;
    apiClient.post.mockRejectedValue({
      response: { data: { message: 'Username atau password salah' } },
    });

    renderLoginPage();

    const usernameInput = screen.getByPlaceholderText('Masukkan username');
    const passwordInput = screen.getByPlaceholderText('Masukkan password');

    fireEvent.change(usernameInput, { target: { value: 'wrong' } });
    fireEvent.change(passwordInput, { target: { value: 'wrong' } });

    const submitButton = screen.getByText('Masuk sekarang').closest('button');
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Username atau password salah')).toBeInTheDocument();
    });
  });

  it('should show generic error message when API error has no message', async () => {
    const apiClient = (await import('../api/client')).default;
    apiClient.post.mockRejectedValue(new Error('Network Error'));

    renderLoginPage();

    fireEvent.change(screen.getByPlaceholderText('Masukkan username'), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText('Masukkan password'), { target: { value: 'pass' } });

    fireEvent.click(screen.getByText('Masuk sekarang').closest('button'));

    await waitFor(() => {
      expect(screen.getByText('Login gagal. Periksa username dan password Anda.')).toBeInTheDocument();
    });
  });

  it('should show loading state during form submission', async () => {
    const apiClient = (await import('../api/client')).default;
    // Create a promise that doesn't resolve immediately
    let resolvePromise;
    apiClient.post.mockReturnValue(new Promise((resolve) => { resolvePromise = resolve; }));

    renderLoginPage();

    fireEvent.change(screen.getByPlaceholderText('Masukkan username'), { target: { value: 'user' } });
    fireEvent.change(screen.getByPlaceholderText('Masukkan password'), { target: { value: 'pass' } });

    fireEvent.click(screen.getByText('Masuk sekarang').closest('button'));

    await waitFor(() => {
      expect(screen.getByText('Memproses...')).toBeInTheDocument();
    });

    // Clean up
    resolvePromise({
      data: { access_token: 'token', user: { id: 1, role: 'EMPLOYEE' } },
    });
  });
});
