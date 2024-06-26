import React from 'react';
import { BrowserRouter, RouteChildrenProps } from 'react-router-dom';
import { act, render } from '@testing-library/react';

import authService from '../../../authService';
import OidcCallback from '../OidcCallback';

const mockedDefaultProps = {
  history: {
    replace: vi.fn(),
  },
};

const renderComponent = () =>
  render(
    <BrowserRouter>
      <OidcCallback
        {...((mockedDefaultProps as unknown) as RouteChildrenProps)}
      />
    </BrowserRouter>
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

describe('<OidcCallback />', () => {
  afterEach(() => {
    mockedDefaultProps.history.replace.mockReset();
  });

  it('as a user I want to see an error message about incorrect device time, because only I can fix it', async () => {
    vi.spyOn(authService, 'endLogin').mockRejectedValue(
      new Error('iat is in the future')
    );

    renderComponent();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(
      getHistoryReplaceCallArgument().includes(
        'authentication.deviceTimeError.message'
      )
    ).toBe(true);
  });

  // eslint-disable-next-line max-len
  it('as a user I want to be informed when I deny permissions, because the application is unusable due to my choice', async () => {
    vi.spyOn(authService, 'endLogin').mockRejectedValue(
      new Error('The resource owner or authorization server denied the request')
    );

    renderComponent();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(
      getHistoryReplaceCallArgument().includes(
        'authentication.permissionRequestDenied.message'
      )
    ).toBe(true);
  });

  describe('implementation details', () => {
    it('should call authService.endLogin', async () => {
      const authServiceEndLoginSpy = vi.spyOn(authService, 'endLogin');

      renderComponent();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(authServiceEndLoginSpy).toHaveBeenCalled();
    });

    it('should redirect user after successful login', async () => {
      vi.spyOn(authService, 'endLogin');

      renderComponent();

      await act(async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
      });

      expect(mockedDefaultProps.history.replace).toHaveBeenCalledTimes(1);
    });
  });
});
