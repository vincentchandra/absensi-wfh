import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, AuthContext } from './AuthContext';
import React, { useContext } from 'react';

// Mock the API client module
vi.mock('../api/client', () => ({
  default: {
    get: vi.fn(),
  },
}));

// Helper component that exposes context for testing
const TestConsumer = ({ onContext }) => {
  const ctx = useContext(AuthContext);
  React.useEffect(() => {
    if (onContext) onContext(ctx);
  }, [ctx]);
  return (
    <div>
      <span data-testid="user">{ctx.user ? JSON.stringify(ctx.user) : 'null'}</span>
    </div>
  );
};

describe('AuthContext', () => {
  let localStorageMock;

  beforeEach(() => {
    localStorageMock = {};
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation((key) => localStorageMock[key] || null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation((key, value) => {
      localStorageMock[key] = value;
    });
    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation((key) => {
      delete localStorageMock[key];
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should start with null user when no token in localStorage', async () => {
    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer />
        </AuthProvider>
      );
    });

    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('should provide login function that stores token and user', async () => {
    let capturedCtx;

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onContext={(ctx) => { capturedCtx = ctx; }} />
        </AuthProvider>
      );
    });

    const userData = { id: 1, username: 'test', role: 'EMPLOYEE' };

    await act(async () => {
      capturedCtx.login('test_token', userData);
    });

    expect(localStorageMock['token']).toBe('test_token');
    expect(localStorageMock['user']).toBe(JSON.stringify(userData));
    expect(screen.getByTestId('user').textContent).toBe(JSON.stringify(userData));
  });

  it('should provide logout function that clears token and user', async () => {
    let capturedCtx;
    localStorageMock['token'] = 'existing_token';
    localStorageMock['user'] = JSON.stringify({ id: 1 });

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onContext={(ctx) => { capturedCtx = ctx; }} />
        </AuthProvider>
      );
    });

    // First login to set user state
    await act(async () => {
      capturedCtx.login('token', { id: 1, username: 'test' });
    });

    // Then logout
    await act(async () => {
      capturedCtx.logout();
    });

    expect(localStorageMock['token']).toBeUndefined();
    expect(localStorageMock['user']).toBeUndefined();
    expect(screen.getByTestId('user').textContent).toBe('null');
  });

  it('should provide updateUser function that merges user data', async () => {
    let capturedCtx;

    await act(async () => {
      render(
        <AuthProvider>
          <TestConsumer onContext={(ctx) => { capturedCtx = ctx; }} />
        </AuthProvider>
      );
    });

    // Login first
    await act(async () => {
      capturedCtx.login('token', { id: 1, username: 'test', needResetPassword: true });
    });

    // Update user
    await act(async () => {
      capturedCtx.updateUser({ needResetPassword: false });
    });

    const userText = screen.getByTestId('user').textContent;
    const parsedUser = JSON.parse(userText);
    expect(parsedUser.needResetPassword).toBe(false);
    expect(parsedUser.username).toBe('test'); // Preserved
  });
});
