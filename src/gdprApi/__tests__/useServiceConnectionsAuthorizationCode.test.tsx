import React, { useState } from 'react';
import { act, waitFor } from '@testing-library/react';

import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
  ElementSelector,
} from '../../common/test/testingLibraryTools';
import { ResponseProvider } from '../../common/test/MockApolloClientProvider';
import getMyProfileWithServiceConnections from '../../common/test/getMyProfileWithServiceConnections';
import useServiceConnectionsAuthorizationCode from '../useServiceConnectionsAuthorizationCode';
import { getDeleteScopes, getQueryScopes } from '../utils';
import { GdprServiceConnectionsRoot } from '../../graphql/typings';

const mockStartFetchingAuthorizationCode = jest.fn();
const defaultTrackingData = {
  returnValidAuthorizationCode: true,
  authorizationCode: 'authCode',
};
const mockTrackingData = {
  tracker: jest.fn(),
  ...defaultTrackingData,
};

jest.mock(
  '../useAuthorizationCode.ts',
  () => (...args: [string, (code: string | null) => void]) => [
    async (scopes: string[]) => {
      const cb = args[1];
      mockStartFetchingAuthorizationCode(scopes);
      await new Promise(resolve => {
        setTimeout(resolve, 100);
      });
      return cb(
        mockTrackingData.returnValidAuthorizationCode
          ? mockTrackingData.authorizationCode
          : null
      );
    },
    false,
  ]
);

type HookOptions = Partial<
  Parameters<typeof useServiceConnectionsAuthorizationCode>[0]
>;

describe('<useServiceConnectionsAuthorizationCode /> ', () => {
  let responseCounter = -1;
  const serviceConnections = getMyProfileWithServiceConnections(true);

  const queryTracker = jest.fn();
  const onCompletedTracker = jest.fn();
  const onErrorTracker = jest.fn();

  const testIds = {
    loadButton: 'load-button',
    rerenderButton: 'rerender-button',
    authorizationCodeIndicator: 'authorizationCode-indicator',
    loadStatusIndicator: 'load-status-indicator',
    status: 'status-output',
    removeComponentButton: 'remove-component-button',
  };

  const OutputComponent = (props: {
    data: Record<string, unknown>;
    onClick: () => void;
  }) => {
    const { data, onClick } = props;
    return (
      <div>
        <button
          type="button"
          data-testid={testIds.loadButton}
          onClick={onClick}
        >
          Load
        </button>
        <div data-testid={testIds.status}>{JSON.stringify(data)}</div>
      </div>
    );
  };

  const getTestId = (key: keyof typeof testIds): ElementSelector => ({
    testId: testIds[key],
  });

  const getStatus = (getElement: TestTools['getElement']) => {
    const statusElementContent = getElement(getTestId('status'))?.textContent;
    return statusElementContent ? JSON.parse(statusElementContent) : {};
  };

  const ComponentWithHook = (props?: { options?: HookOptions }) => {
    const [load, status] = useServiceConnectionsAuthorizationCode({
      requiredGdprScope: props?.options?.requiredGdprScope || 'delete',
      deferredAction: 'testDeferredAction',
      onCompleted: onCompletedTracker,
      onError: e => {
        onErrorTracker(e);
      },
    });
    // useServiceConnectionsAuthorizationCode uses "useRef" to store its inner status
    // Updating the data stored in useRef, does not cause re-render, so added a forceRender button here.
    const [, forceRender] = useState<number>(0);
    return (
      <div>
        <OutputComponent
          data={{
            loading: status.loading,
            complete: status.complete,
            authorizationCode: status.authorizationCode,
          }}
          onClick={() => load()}
        />
        <button
          type="button"
          data-testid={testIds.rerenderButton}
          onClick={() => forceRender(Date.now())}
        >
          Rerender
        </button>
      </div>
    );
  };

  const renderTestSuite = (
    errorResponseIndex = -1,
    hookOptions?: HookOptions
  ) => {
    const responseProvider: ResponseProvider = () => {
      responseCounter = responseCounter + 1;
      queryTracker();
      if (responseCounter === errorResponseIndex) {
        return { errorType: 'networkError' };
      }
      return { profileDataWithServiceConnections: serviceConnections };
    };

    return renderComponentWithMocksAndContexts(
      responseProvider,
      <ComponentWithHook options={hookOptions} />
    );
  };

  beforeEach(() => {
    responseCounter = -1;
    Object.assign(mockTrackingData, defaultTrackingData);
  });

  afterEach(async () => {
    // makes sure timeouts are complete before starting next test
    await waitFor(() => {
      if (
        onCompletedTracker.mock.calls.length === 0 &&
        onErrorTracker.mock.calls.length === 0
      ) {
        throw new Error('Test not finished');
      }
    });
    cleanComponentMocks();
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  const initTests = async (
    errorResponseIndex = -1,
    hookOptions?: HookOptions
  ): Promise<TestTools> => renderTestSuite(errorResponseIndex, hookOptions);

  it(`Loads service connections then gets the auth code with the returned scopes`, async () => {
    await act(async () => {
      const { clickElement, getElement } = await initTests();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        const status = getStatus(getElement);
        expect(status.loading).toBeTruthy();
      });

      await waitFor(() => {
        expect(mockStartFetchingAuthorizationCode).toHaveBeenCalledTimes(1);
      });
      await waitFor(() => {
        expect(onCompletedTracker).toHaveBeenCalledTimes(1);
      });

      await waitFor(async () => {
        await clickElement(getTestId('rerenderButton'));
        const status = getStatus(getElement);
        expect(status.loading).toBeFalsy();
        expect(status.complete).toBeTruthy();
        expect(status.authorizationCode).toBe(
          mockTrackingData.authorizationCode
        );
        expect(onCompletedTracker).toHaveBeenLastCalledWith(
          mockTrackingData.authorizationCode,
          {
            authorizationCode: mockTrackingData.authorizationCode,
            complete: true,
            error: undefined,
            loading: false,
          }
        );
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
  describe('useAuthorizationCode is called with required scopes', () => {
    const waitForLoadStart = async (
      scopeType: HookOptions['requiredGdprScope']
    ) => {
      const { clickElement } = await initTests(-1, {
        requiredGdprScope: scopeType,
      });
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(queryTracker).toHaveBeenCalledTimes(1);
        expect(mockStartFetchingAuthorizationCode).toHaveBeenCalledTimes(1);
      });
    };
    const compareScopes = (scopePicker: typeof getQueryScopes) => {
      const scopesInCall = mockStartFetchingAuthorizationCode.mock.calls[0][0];
      const scopes = scopePicker(
        serviceConnections as GdprServiceConnectionsRoot
      );
      expect(scopes).toHaveLength(2);
      scopes.forEach(scope => {
        expect(scopesInCall.includes(scope)).toBeTruthy();
      });
    };
    it(`which are delete scopes when requiredGdprScope is 'delete' (default in tests)`, async () => {
      await act(async () => {
        await waitForLoadStart('delete');
        compareScopes(getDeleteScopes);
      });
    });
    it(`which are query scopes when requiredGdprScope is 'query'`, async () => {
      await waitForLoadStart('query');
      compareScopes(getQueryScopes);
    });
  });
  it(`If authorization code load fails, onError is called`, async () => {
    mockTrackingData.returnValidAuthorizationCode = false;
    await act(async () => {
      const { clickElement, getElement } = await initTests();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(getStatus(getElement).loading).toBeTruthy();
      });
      await waitFor(async () => {
        await clickElement(getTestId('rerenderButton'));
        expect(onErrorTracker).toHaveBeenCalledTimes(1);
        expect(getStatus(getElement).loading).toBeFalsy();
        expect(getStatus(getElement).complete).toBeFalsy();
      });
    });
  });
  it(`Code can be refetched multiple times`, async () => {
    const getLastAuthorizationCode = (): string | null => {
      const count = onCompletedTracker.mock.calls.length;
      return onCompletedTracker.mock.calls[count - 1][0];
    };
    await act(async () => {
      const { clickElement } = await renderTestSuite();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(onCompletedTracker).toHaveBeenCalledTimes(1);
        expect(queryTracker).toHaveBeenCalledTimes(1);
        expect(getLastAuthorizationCode()).toBe(
          mockTrackingData.authorizationCode
        );
      });
      mockTrackingData.authorizationCode = 'code2';
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(onCompletedTracker).toHaveBeenCalledTimes(2);
        expect(queryTracker).toHaveBeenCalledTimes(2);
        expect(getLastAuthorizationCode()).toBe('code2');
      });
      mockTrackingData.returnValidAuthorizationCode = false;
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(onErrorTracker).toHaveBeenCalledTimes(1);
        expect(queryTracker).toHaveBeenCalledTimes(3);
      });
      mockTrackingData.authorizationCode = 'code3';
      mockTrackingData.returnValidAuthorizationCode = true;
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(onCompletedTracker).toHaveBeenCalledTimes(3);
        expect(queryTracker).toHaveBeenCalledTimes(4);
        expect(getLastAuthorizationCode()).toBe('code3');
      });
    });
  });
  it(`When already loading, loading in not started again`, async () => {
    await act(async () => {
      const { clickElement } = await renderTestSuite();
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(queryTracker).toHaveBeenCalledTimes(1);
        expect(onCompletedTracker).toHaveBeenCalledTimes(0);
      });
      await clickElement(getTestId('loadButton'));
      await clickElement(getTestId('loadButton'));
      await waitFor(() => {
        expect(onCompletedTracker).toHaveBeenCalledTimes(1);
        expect(queryTracker).toHaveBeenCalledTimes(1);
      });
    });
  });
});
