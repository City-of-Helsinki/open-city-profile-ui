import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter, RouteChildrenProps } from 'react-router-dom';

import OidcCallback from '../OidcCallback';
import * as useAuthMock from '../../../../auth/useAuth';
import TestLoginProvider from '../../../../common/test/TestLoginProvider';

vi.mock('hds-react', async () => {
  // Get the original module to keep other functionalities intact
  const actualHdsReact = await vi.importActual('hds-react');
  return {
    ...actualHdsReact, // Spread the original implementation
    LoginCallbackHandler: ({ onSuccess, onError }: any) => (
      <div>
        <button onClick={() => onSuccess({ profile: { name: 'Test User' } })}>
          Trigger Success
        </button>
        <button onClick={() => onError({ message: 'Some error' })}>
          Trigger Error
        </button>
        <div>oidc.authenticating</div>
      </div>
    ),
  };
});

const mockedDefaultProps = {
  history: {
    replace: vi.fn(),
  },
};

const renderComponent = () =>
  render(
    <TestLoginProvider>
      <BrowserRouter>
        <OidcCallback
          {...((mockedDefaultProps as unknown) as RouteChildrenProps)}
        />
      </BrowserRouter>
    </TestLoginProvider>
  );

const getHistoryReplaceCallArgument = () =>
  mockedDefaultProps.history.replace.mock.calls[0][0];

vi.mock('react-router-dom', async () => {
  const module = await vi.importActual('react-router-dom');

  return {
    ...module,
    useHistory: vi.fn().mockImplementation(() => mockedDefaultProps.history),
  };
});

describe('OidcCallback', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('handles successful login', async () => {
    // Mock endLogin to resolve successfully
    const authServiceEndLoginSpy = vi.fn().mockResolvedValueOnce(undefined);

    vi.spyOn(useAuthMock, 'default').mockImplementationOnce(() => ({
      isAuthenticated: vi.fn().mockReturnValue(true),
      getUser: vi.fn(),
      endLogin: authServiceEndLoginSpy,
      logout: vi.fn(),
      changePassword: vi.fn(),
    }));

    renderComponent();

    // Simulate the success callback
    const successButton = screen.getByText('Trigger Success');
    successButton.click();

    await waitFor(() => {
      expect(authServiceEndLoginSpy).toHaveBeenCalledOnce();
      expect(mockedDefaultProps.history.replace).toHaveBeenCalledTimes(1);
    });
  });

  it('handles error during login', async () => {
    renderComponent();

    // Simulate the error callback
    const errorButton = screen.getByText('Trigger Error');
    errorButton.click();

    await waitFor(() => {
      expect(
        getHistoryReplaceCallArgument().includes(
          'authentication.genericError.message'
        )
      ).toBe(true);
    });
  });
});
