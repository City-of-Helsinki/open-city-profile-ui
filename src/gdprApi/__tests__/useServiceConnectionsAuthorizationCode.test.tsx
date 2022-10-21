import React from 'react';
import { act, waitFor } from '@testing-library/react';

import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
} from '../../common/test/testingLibraryTools';
import { ResponseProvider } from '../../common/test/MockApolloClientProvider';
import getMyProfileWithServiceConnections from '../../common/test/getMyProfileWithServiceConnections';
import { DownloadMyProfileQueryVariables } from '../../graphql/generatedTypes';
import useServiceConnectionsAuthorizationCode from '../useServiceConnectionsAuthorizationCode';
import { getDeleteScopes } from '../utils';
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

describe('<useServiceConnectionsAuthorizationCode /> ', () => {
  let responseCounter = -1;
  const serviceConnections = getMyProfileWithServiceConnections(true);

  const queryVariableTracker = jest.fn();
  const onCompletedTracker = jest.fn();
  const onErrorTracker = jest.fn();

  const ComponentWithHook = () => {
    const [load, status] = useServiceConnectionsAuthorizationCode({
      requiredGdprScope: 'delete',
      onCompleted: onCompletedTracker,
      onError: onErrorTracker,
    });
    return (
      <OutputComponent
        data={{
          loading: status.loading,
          complete: status.complete,
          authorizationCode: status.authorizationCode,
          serviceConnectionsCount: status.serviceConnections?.length,
        }}
        onClick={() => load()}
      />
    );
  };

  const renderTestSuite = (errorResponseIndex = -1) => {
    const responseProvider: ResponseProvider = payload => {
      responseCounter = responseCounter + 1;
      queryVariableTracker(payload as DownloadMyProfileQueryVariables);
      if (responseCounter === errorResponseIndex) {
        return { errorType: 'networkError' };
      }
      return { profileDataWithServiceConnections: serviceConnections };
    };

    return renderComponentWithMocksAndContexts(
      responseProvider,
      <ComponentWithHook />
    );
  };

  beforeEach(() => {
    responseCounter = -1;
  });

  afterEach(() => {
    cleanComponentMocks();
    jest.clearAllMocks();
    resetTracker();
  });

  const initTests = async (errorResponseIndex = -1): Promise<TestTools> =>
    renderTestSuite(errorResponseIndex);

  it(`Loads service connections first with variable withGdprScopes:true`, async () => {
    await act(async () => {
      const { clickElement, getElement } = await initTests();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        const status = getStatus(getElement);
        expect(status.loading).toBeTruthy();
      });

      expect(queryVariableTracker.mock.calls[0][0].withGdprScopes).toBeTruthy();

      await waitFor(() => {
        expect(getStatus(getElement).loading).toBeFalsy();
      });
    });
  });

  it(`If service connection load fails, onError is called`, async () => {
    await act(async () => {
      const { clickElement, getElement } = await initTests(0);
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(getStatus(getElement).loading).toBeTruthy();
      });
      await waitFor(() => {
        expect(onErrorTracker).toHaveBeenCalledTimes(1);
      });
    });
  });

  it(`Loads authorization code after service connections. Service scopes are in the url `, async () => {
    await act(async () => {
      const { clickElement } = await initTests();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(queryVariableTracker).toHaveBeenCalledTimes(1);
        expect(trackingData.tracker).toHaveBeenCalledTimes(1);
      });

      const args = trackingData.tracker.mock.calls[0];
      const urlParams = new URL(args[0]);
      const scopesInQuery = String(urlParams.searchParams.get('scope'));
      const scopes = getDeleteScopes(serviceConnections);
      expect(scopes).toHaveLength(2);
      scopes.forEach(scope => {
        expect(scopesInQuery.includes(scope)).toBeTruthy();
      });
    });
  });

  it(`If authorization code load fails, onError is called`, async () => {
    trackingData.resolve = false;
    await act(async () => {
      const { clickElement, getElement } = await initTests();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(getStatus(getElement).loading).toBeTruthy();
      });
      await waitFor(() => {
        expect(onErrorTracker).toHaveBeenCalledTimes(1);
        expect(getStatus(getElement).complete).toBeFalsy();
      });
    });
  });
  it(`Status includes the code when all loads succeed. OnCompleted is called with the code`, async () => {
    await act(async () => {
      const { clickElement, getElement } = await initTests();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        const status = getStatus(getElement);
        expect(status.loading).toBeTruthy();
      });
      await waitFor(() => {
        const status = getStatus(getElement);
        expect(status.loading).toBeFalsy();
        expect(status.complete).toBeTruthy();
        expect(status.authorizationCode).toBe(trackingData.code);
        expect(status.serviceConnectionsCount).toBe(2);
        expect(onCompletedTracker).toHaveBeenCalledTimes(1);
        expect(onCompletedTracker).toHaveBeenLastCalledWith(trackingData.code);
      });
    });
  });
  it(`Code can be refetched multiple times`, async () => {
    await act(async () => {
      const { clickElement } = await renderTestSuite();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(onCompletedTracker).toHaveBeenCalledTimes(1);
        expect(queryVariableTracker).toHaveBeenCalledTimes(1);
        expect(onCompletedTracker).toHaveBeenLastCalledWith(trackingData.code);
      });
      trackingData.code = 'code2';
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(onCompletedTracker).toHaveBeenCalledTimes(2);
        expect(queryVariableTracker).toHaveBeenCalledTimes(2);
        expect(onCompletedTracker).toHaveBeenLastCalledWith(trackingData.code);
      });
      trackingData.resolve = false;
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(onErrorTracker).toHaveBeenCalledTimes(1);
        expect(queryVariableTracker).toHaveBeenCalledTimes(3);
      });
      trackingData.code = 'code3';
      trackingData.resolve = true;
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(onCompletedTracker).toHaveBeenCalledTimes(3);
        expect(queryVariableTracker).toHaveBeenCalledTimes(4);
        expect(onCompletedTracker).toHaveBeenLastCalledWith(trackingData.code);
      });
    });
  });
  it(`When already loading, loading in not started again`, async () => {
    await act(async () => {
      const { clickElement } = await renderTestSuite();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(queryVariableTracker).toHaveBeenCalledTimes(1);
        expect(onCompletedTracker).toHaveBeenCalledTimes(0);
      });
      await clickElement(getTestId('loadButton'));
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(onCompletedTracker).toHaveBeenCalledTimes(1);
        expect(queryVariableTracker).toHaveBeenCalledTimes(1);
      });
    });
  });
});
