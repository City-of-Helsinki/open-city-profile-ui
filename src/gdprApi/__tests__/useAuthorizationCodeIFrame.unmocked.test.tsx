import React, { useState } from 'react';
import { act, fireEvent, waitFor } from '@testing-library/react';

import {
  renderComponentWithMocksAndContexts,
  cleanComponentMocks,
} from '../../common/test/testingLibraryTools';
import useAuthorizationCodeIFrame from '../useAuthorizationCodeIFrame';
import {
  getStatus,
  OutputComponent,
  getTestId,
} from '../../common/test/iFrameUrlLoaderMock.util';

const scopes = ['scope1', 'scope2'];

describe('<useAuthorizationCodeIFrame /> ', () => {
  const testIds = {
    loadButton: 'load-button',
    removeComponentButton: 'remove-component-button',
    status: 'status-output',
  };

  const messageTracker = jest.fn();
  const authCodeCallback = jest.fn();

  const sendWindowMessage = (props: MessageEventInit) => {
    fireEvent(window, new MessageEvent('message', props));
  };

  const ComponentWithHook = () => {
    const [load, loadStatus, code] = useAuthorizationCodeIFrame(e => {
      authCodeCallback(e);
      return true;
    });
    return (
      <OutputComponent
        data={{
          loadStatus,
          code,
        }}
        onClick={() => load(scopes)}
      />
    );
  };

  const WrapperWithHook = () => {
    const [unmounted, setUnmounted] = useState(false);
    if (unmounted) {
      return null;
    }
    return (
      <div>
        <button
          type="button"
          data-testid={testIds.removeComponentButton}
          onClick={() => setUnmounted(true)}
        >
          Load
        </button>
        <ComponentWithHook />
      </div>
    );
  };

  const renderTestSuite = () =>
    renderComponentWithMocksAndContexts(() => ({}), <WrapperWithHook />);

  beforeEach(() => {
    window.addEventListener('message', messageTracker, false);
  });
  afterEach(async () => {
    window.removeEventListener('message', messageTracker, false);
    jest.resetAllMocks();
    cleanComponentMocks();
    // give jsdom postMessage time to resolve.
    await new Promise<boolean>(resolve => setTimeout(() => resolve(true), 200));
  });

  it(`cleanUpIFrame is called when hook is removed by unmounting the component`, async () => {
    await act(async () => {
      const { clickElement, getElement } = await renderTestSuite();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        const status = getStatus(getElement);
        expect(status.loadStatus).toBeTruthy();
      });
      await clickElement(getTestId('removeComponentButton'));
      await waitFor(() => {
        expect(authCodeCallback).toHaveBeenCalledTimes(0);
        expect(messageTracker).toHaveBeenCalledTimes(1);
        const lastCallArgs = messageTracker.mock.calls[0][0].data;
        expect(lastCallArgs.cleanUpIFrameLoader).toBeTruthy();
        expect(lastCallArgs.iframeName).toBeDefined();
      });
    });
  });
  it(`cleanUpIFrame is not called when iframe is already removed. Its message is not dispatched.`, async () => {
    await act(async () => {
      const { clickElement, getElement, baseElement } = await renderTestSuite();
      const getIFrame = () => baseElement.querySelectorAll('iframe')[0];

      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(!!getIFrame()).toBeTruthy();
        const status = getStatus(getElement);
        expect(status.code).toBeDefined();
      });

      const iframe = getIFrame();
      const urlParams = new URL(iframe.src);
      const state = String(urlParams.searchParams.get('state'));

      sendWindowMessage({
        origin: window.location.origin,
        source: iframe.contentWindow,
        data: { code: 'authCode', state },
      });

      await waitFor(() => {
        expect(!!getIFrame()).toBeFalsy();
        expect(messageTracker).toHaveBeenCalledTimes(1);
        expect(authCodeCallback).toHaveBeenCalledTimes(1);
      });
      await clickElement(getTestId('removeComponentButton'));
      await waitFor(() => {
        // receives the authcode message and iframe kill message
        expect(messageTracker).toHaveBeenCalledTimes(2);
      });
    });
  });
});
