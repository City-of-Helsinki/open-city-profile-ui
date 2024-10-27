import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { BrowserRouter, RouteChildrenProps } from 'react-router-dom';

import OidcCallback from '../OidcCallback';
import TestLoginProvider from '../../../../common/test/TestLoginProvider';

const getApiTokensFromStorage = vi.fn(() => ({ 'foo.bar.baz': 'foo.bar.baz' }));

vi.mock('hds-react', async () => {
  // Get the original module to keep other functionalities intact
  const actualHdsReact = await vi.importActual('hds-react');
  return {
    ...actualHdsReact, // Spread the original implementation
    LoginCallbackHandler: ({
      onSuccess,
      onError,
    }: {
      onSuccess: (data: { profile: { name: string } }) => void;
      onError: (error?: { message: string }) => void;
    }) => (
      <div>
        <button onClick={() => onSuccess({ profile: { name: 'Test User' } })}>
          Trigger Success
        </button>
        <button onClick={() => onError({ message: 'Some error' })}>
          Trigger Error
        </button>
        <button onClick={() => onError()}>Trigger Empty Error</button>
        <div>oidc.authenticating</div>
      </div>
    ),
    getApiTokensFromStorage: vi.fn(() => ({ foo: 'bar' })),
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
    renderComponent();

    // Simulate the success callback
    const successButton = screen.getByText('Trigger Success');
    successButton.click();
    await waitFor(() => {
      expect(mockedDefaultProps.history.replace).toHaveBeenCalledTimes(1);
      expect(getApiTokensFromStorage).toHaveBeenCalled;
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

  it('handles undefined error during login', async () => {
    renderComponent();

    // Simulate the error callback
    const errorButton = screen.getByText('Trigger Empty Error');
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
