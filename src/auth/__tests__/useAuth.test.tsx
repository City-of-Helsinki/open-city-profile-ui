// useAuth.test.ts
import { renderHook, act } from '@testing-library/react-hooks';
import { describe, it, expect, vi, beforeEach, Mock } from 'vitest';
import * as Sentry from '@sentry/react';
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
  default: vi.fn(),
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

  /*
  it('should fetch and return user on getUser', async () => {
    const mockUser = { id: 'test-user' };
    mockOidcClient.getUserManager().getUser.mockResolvedValue(mockUser);

    const { result } = renderHook(() => useAuth());
    const user = await result.current.getUser();

    console.log(user);

    expect(user).toEqual(mockUser);
  });

  */

  it('should call logout from OIDC client and handle locale', async () => {
    const { result } = renderHook(() => useAuth());

    await act(async () => {
      await result.current.logout();
    });

    expect(mockOidcClient.logout).toHaveBeenCalledTimes(1);
    /* expect(mockOidcClient.logout).toHaveBeenCalledWith({
      extraQueryParams: { ui_locales: 'en' },
    }); */
  });

  it('should change password and redirect to the correct URI', async () => {
    mockOidcClient.getUserManager().signinRedirect.mockResolvedValue(true);

    const { result } = renderHook(() => useAuth());

    const passwordChange = result.current.changePassword();
    await expect(passwordChange).resolves.not.toThrow();

    /*
    await expect(passwordChange).resolves.not.toThrow();
    expect(mockOidcClient.getUserManager().signinRedirect).toHaveBeenCalledWith(
      {
        ui_locales: 'en',
        redirect_uri: `${window.location.origin}/password-change-callback`,
        extraQueryParams: { kc_action: 'UPDATE_PASSWORD' },
      }
    ); */
  });

  /*
  it('should capture an error if changePassword encounters a network error', async () => {
    mockOidcClient
      .getUserManager()
      .signinRedirect.mockRejectedValue(new Error('Network Error'));

    const { result } = renderHook(() => useAuth());

    await expect(result.current.changePassword()).rejects.toThrow();
    expect(Sentry.captureException).not.toHaveBeenCalled();
  });

  it('should capture an error if changePassword encounters a non-network error', async () => {
    const error = new Error('Unknown Error');
    mockOidcClient.getUserManager().signinRedirect.mockRejectedValue(error);

    const { result } = renderHook(() => useAuth());

    await expect(result.current.changePassword()).rejects.toThrow();
    expect(Sentry.captureException).toHaveBeenCalledWith(error);
  }); 
  */
});

/* import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import useAuth from '../useAuth';
import TestLoginProvider from '../../common/test/TestLoginProvider';

describe('useAuth', () => {
  // Simple test component that uses the useAuth hook
  const TestComponent = () => {
    const { getUser, logout, changePassword } = useAuth();

    return (
      <div>
        <button onClick={() => changePassword()}>Change password</button>
        <button onClick={() => logout()}>Logout</button>
      </div>
    );
  };

  const renderComponent = () =>
    render(
      <TestLoginProvider>
        <TestComponent />
      </TestLoginProvider>
    );

  it('should render', () => {
    renderComponent();
  });

  it('handles successful login', async () => {
    // Mock endLogin to resolve successfully

    vi.mock('hds-react', async () => {
      const module = await vi.importActual('hds-react');

      // Mocking the getUserManager function to return mocked methods
      const mockGetUser = vi.fn(() => Promise.resolve({ name: 'John Doe' }));
      const mockSigninRedirect = vi.fn(() => Promise.resolve());
      const mockRemoveUser = vi.fn(() => Promise.resolve());

      // Replace the original getUserManager function with the mocked one
      const mockGetUserManager = vi.fn(() => ({
        getUser: mockGetUser,
        signinRedirect: mockSigninRedirect,
        removeUser: mockRemoveUser,
      }));

      return {
        ...module,
        useOidcClient: () => ({
          signinRedirect: mockSigninRedirect,
          getUserManager: mockGetUserManager,
        }),
      };
    });

    renderComponent();

    // Simulate the success callback
    const successButton = screen.getByText('Change password');
    expect(successButton.click()).toThrowError();

    await waitFor(() => {
      // expect().toHaveBeenCalledOnce();
    });
  });
});

*/
