import React from 'react';
import { act, waitFor } from '@testing-library/react';

import {
  renderComponentWithMocksAndContexts,
  cleanComponentMocks,
} from '../../common/test/testingLibraryTools';
import useAuthorizationCodeIFrame from '../useAuthorizationCodeIFrame';
import {
  createIFrameMockUtil,
  getStatus,
  OutputComponent,
  getTestId,
} from '../../common/test/iFrameUrlLoaderMock.util';

const {
  mockIFrameUrlLoader,
  mockCleanUpIFrame,
  trackingData,
  resetTracker,
} = createIFrameMockUtil();

jest.mock('../../common/iframe/iFrameUrlLoader', () => ({
  iFrameUrlLoader: (...args: unknown[]) => mockIFrameUrlLoader(...args),
  cleanUpIFrame: (...args: unknown[]) => mockCleanUpIFrame(...args),
}));

const scopes = ['scope1', 'scope2'];

describe('<useAuthorizationCodeIFrame /> ', () => {
  const callback = jest.fn();

  const ComponentWithHook = () => {
    const [load, loadStatus, code] = useAuthorizationCodeIFrame(callback);
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

  const renderTestSuite = () =>
    renderComponentWithMocksAndContexts(() => ({}), <ComponentWithHook />);

  afterEach(() => {
    cleanComponentMocks();
    jest.clearAllMocks();
    resetTracker();
  });

  it(`Load status changes with load progress`, async () => {
    await act(async () => {
      const { clickElement, getElement } = await renderTestSuite();
      await waitFor(() => {
        const status = getStatus(getElement);
        expect(status.loadStatus).toBeFalsy();
      });
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        const status = getStatus(getElement);
        expect(status.loadStatus).toBeTruthy();
      });
      await waitFor(() => {
        const status = getStatus(getElement);
        expect(status.loadStatus).toBeFalsy();
      });
    });
  });

  it(`Called url includes given scopes and a state`, async () => {
    await act(async () => {
      const { clickElement, getElement } = await renderTestSuite();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        const status = getStatus(getElement);
        expect(status.loadStatus).toBeTruthy();
      });
      const args = trackingData.tracker.mock.calls[0];
      const urlParams = new URL(args[0]);
      const scopesInQuery = String(urlParams.searchParams.get('scope'));
      const state = String(urlParams.searchParams.get('state'));
      expect(
        scopesInQuery.includes(scopes[0]) && scopesInQuery.includes(scopes[1])
      ).toBeTruthy();
      expect(state.length > 1).toBeTruthy();
    });
  });

  it(`When code load succeeds, code is returned`, async () => {
    await act(async () => {
      const { clickElement } = await renderTestSuite();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenLastCalledWith(trackingData.code);
      });
    });
  });

  it(`When code load fails, null is returned`, async () => {
    trackingData.resolve = false;
    await act(async () => {
      const { clickElement } = await renderTestSuite();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenLastCalledWith(null);
      });
    });
  });

  it(`Code can be refetched multiple times`, async () => {
    await act(async () => {
      const { clickElement } = await renderTestSuite();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenLastCalledWith(trackingData.code);
      });
      trackingData.code = 'code2';
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(2);
        expect(callback).toHaveBeenLastCalledWith(trackingData.code);
      });
      trackingData.resolve = false;
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(3);
        expect(callback).toHaveBeenLastCalledWith(null);
      });
      trackingData.code = 'code3';
      trackingData.resolve = true;
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(callback).toHaveBeenCalledTimes(4);
        expect(callback).toHaveBeenLastCalledWith(trackingData.code);
      });
    });
  });
});
