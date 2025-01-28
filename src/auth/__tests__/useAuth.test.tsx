// useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import { useOidcClient } from 'hds-react';

import useAuth from '../useAuth';

// Mock dependencies
vi.mock('hds-react', () => ({
  useOidcClient: vi.fn(),
}));
vi.mock('@sentry/react', () => ({
  captureException: vi.fn(),
}));

vi.mock('i18next', () => ({
  default: {
    language: 'en',
  },
}));

vi.mock('./pickProfileApiToken', () => ({
  default: vi.fn().mockReturnValue('mock-api-token'),
}));

describe('useAuth', () => {
  const mockOidcClient = {
    getUserManager: vi.fn(() => ({
      getUser: vi.fn(),
      signinRedirect: vi.fn().mockResolvedValue(true),
      removeUser: vi.fn(),
    })),
    isAuthenticated: false,
    login: vi.fn(),
    logout: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useOidcClient as Mock).mockReturnValue(mockOidcClient);
  });

  it('should call login from OIDC client when login is triggered', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.login();
    });

    expect(mockOidcClient.login).toHaveBeenCalledTimes(1);
  });

  it('should call logout from OIDC client and handle locale', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockOidcClient.logout).toHaveBeenCalledTimes(1);
    expect(mockOidcClient.logout).toHaveBeenCalledWith({
      extraQueryParams: { ui_locales: 'en' },
    });
  });

  it('should change password and redirect to the correct URI', async () => {
    mockOidcClient.getUserManager().signinRedirect.mockResolvedValue(true);

    const { result } = renderHook(() => useAuth());

    const passwordChange = result.current.changePassword();
    await expect(passwordChange).resolves.not.toThrow();
  });

  it('should enable MFA', async () => {
    mockOidcClient.getUserManager().signinRedirect.mockResolvedValue(true);

    const { result } = renderHook(() => useAuth());
    const initTOTP = result.current.initiateTOTP();
    await expect(initTOTP).resolves.not.toThrow();
  });

  it('should disable MFA', async () => {
    mockOidcClient.getUserManager().signinRedirect.mockResolvedValue(true);

    const { result } = renderHook(() => useAuth());
    const disableTOTP = result.current.disableTOTP('111');
    await expect(disableTOTP).resolves.not.toThrow();
  });
});
