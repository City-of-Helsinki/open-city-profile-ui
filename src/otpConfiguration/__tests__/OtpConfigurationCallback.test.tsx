import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, render } from '@testing-library/react';

import OtpConfigurationCallback, { OtpConfigurationCallbackProps } from '../OtpConfigurationCallback';

// Mock navigate function
const navigateMock = vi.fn();

const mockedDefaultProps = {
  action: null,
};

const mockedDeleteProps = {
  action: 'delete',
};
const renderComponent = (props: OtpConfigurationCallbackProps) =>
  render(
    <BrowserRouter>
      <OtpConfigurationCallback {...props} />
    </BrowserRouter>,
  );

const getNavigateCallArgument = () => navigateMock.mock.calls[0][0];

vi.mock('react-router-dom', async () => {
  const module = await vi.importActual('react-router-dom');

  return {
    ...module,
    useNavigate: () => navigateMock,
  };
});

describe('<OtpConfigurationCallback />', () => {
  afterEach(() => {
    navigateMock.mockReset();
  });

  it('render without error', async () => {
    renderComponent(mockedDefaultProps as unknown as OtpConfigurationCallbackProps);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  it('should redirect user', async () => {
    renderComponent(mockedDefaultProps as unknown as OtpConfigurationCallbackProps);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(getNavigateCallArgument()).toBe('/');
  });
});

describe('<OtpConfigurationCallback /> delete', () => {
  afterEach(() => {
    navigateMock.mockReset();
  });

  it('render without error', async () => {
    renderComponent(mockedDeleteProps as unknown as OtpConfigurationCallbackProps);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });
  });

  it('should redirect user', async () => {
    renderComponent(mockedDeleteProps as unknown as OtpConfigurationCallbackProps);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(getNavigateCallArgument()).toBe('/');
  });
});
