import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { act, render } from '@testing-library/react';

import OtpConfigurationCallback, {
  OtpConfigurationCallbackProps,
} from '../OtpConfigurationCallback';

const historyReplaceMock = {
  replace: vi.fn(),
};

const mockedDefaultProps = {
  history: historyReplaceMock,
  action: null,
};

const mockedDeleteProps = {
  history: historyReplaceMock,
  action: 'delete',
};

const renderComponent = (props: OtpConfigurationCallbackProps) =>
  render(
    <BrowserRouter>
      <OtpConfigurationCallback {...props} />
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

describe('<OtpConfigurationCallback />', () => {
  afterEach(() => {
    mockedDefaultProps.history.replace.mockReset();
  });

  it('render without error', async () => {
    renderComponent(
      (mockedDefaultProps as unknown) as OtpConfigurationCallbackProps
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  it('should redirect user', async () => {
    renderComponent(
      (mockedDefaultProps as unknown) as OtpConfigurationCallbackProps
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(getHistoryReplaceCallArgument()).toBe('/');
  });
});

describe('<OtpConfigurationCallback /> delete', () => {
  afterEach(() => {
    mockedDefaultProps.history.replace.mockReset();
  });

  it('render without error', async () => {
    renderComponent(
      (mockedDeleteProps as unknown) as OtpConfigurationCallbackProps
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });
  });

  it('should redirect user', async () => {
    renderComponent(
      (mockedDeleteProps as unknown) as OtpConfigurationCallbackProps
    );

    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 0));
    });

    expect(getHistoryReplaceCallArgument()).toBe('/');
  });
});
