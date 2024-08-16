import React from 'react';
import { BrowserRouter, RouteChildrenProps } from 'react-router-dom';
import { act, render } from '@testing-library/react';

import PasswordChangeCallback from '../PasswordChangeCallback';

const mockedDefaultProps = {
  history: {
    replace: vi.fn(),
  },
};

const renderComponent = () =>
  render(
    <BrowserRouter>
      <PasswordChangeCallback
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

describe('<PasswordChangeCallback />', () => {
  afterEach(() => {
    mockedDefaultProps.history.replace.mockReset();
  });

  it('render without error', async () => {
    renderComponent();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  it('should redirect user', async () => {
    renderComponent();

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(getHistoryReplaceCallArgument()).toBe('/');
  });
});
