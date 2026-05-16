import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// We need to test the interceptors, so we test the module behavior
// by re-importing and checking the configuration

describe('API Client', () => {
  let localStorageMock;
  let originalLocation;

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

  it('should create axios instance with correct baseURL', async () => {
    // Dynamic import to pick up fresh module
    const { default: apiClient } = await import('./client');

    expect(apiClient.defaults.baseURL).toBe('http://localhost:3001/api');
  });

  it('should set Content-Type header to application/json', async () => {
    const { default: apiClient } = await import('./client');

    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
  });

  it('should have request and response interceptors configured', async () => {
    const { default: apiClient } = await import('./client');

    // Axios interceptors have handlers array
    expect(apiClient.interceptors.request.handlers.length).toBeGreaterThan(0);
    expect(apiClient.interceptors.response.handlers.length).toBeGreaterThan(0);
  });
});
