import React, { useState } from 'react';
import { act, waitFor } from '@testing-library/react';
import { ApolloError } from '@apollo/client';

import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
  ElementSelector,
} from '../../common/test/testingLibraryTools';
import { ResponseProvider } from '../../common/test/MockApolloClientProvider';
import useServiceConnectionsAuthorizationCode from '../useServiceConnectionsAuthorizationCode';
import useDeleteServiceConnection from '../useDeleteServiceConnection';

type UseServiceConnectionsHookOptions = Partial<
  Parameters<typeof useServiceConnectionsAuthorizationCode>[0]
>;
type UseServiceConnectionsHookReturnTuple = ReturnType<
  typeof useServiceConnectionsAuthorizationCode
>;

type UseDeleteServiceConnectionServiceName = Partial<
  Parameters<typeof useDeleteServiceConnection>[0]
>;
type UseDeleteServiceConnectionHookReturnTuple = ReturnType<
  typeof useDeleteServiceConnection
>;
type ServiceConnectionsLoadStatus = UseServiceConnectionsHookReturnTuple[1];

const mockStartFetchingAuthorizationCode = jest.fn();

const defaultTrackingData = {
  returnValidAuthorizationCode: true,
  authorizationCode: 'authCode',
};

const mockTrackingData = {
  tracker: jest.fn(),
  ...defaultTrackingData,
};

const defaultServiceName = 'defaultServiceName';

let mockServiceConnectionsLoadStatus: ServiceConnectionsLoadStatus;

const defaultServiceConnectionsLoadStatus: ServiceConnectionsLoadStatus = {
  loading: false,
  complete: false,
  authorizationCode: undefined,
  error: undefined,
};

const updateServiceConnectionsLoadStatus = (
  newStatus: Partial<ServiceConnectionsLoadStatus>
): void => {
  mockServiceConnectionsLoadStatus = {
    ...mockServiceConnectionsLoadStatus,
    ...newStatus,
  };
};
const resetServiceConnectionsLoadStatus = (): void => {
  mockServiceConnectionsLoadStatus = {
    ...defaultServiceConnectionsLoadStatus,
  };
};

const mockApolloError = () => new ApolloError({ errorMessage: 'Error' });

jest.mock(
  '../useServiceConnectionsAuthorizationCode.ts',
  () => (
    options: UseServiceConnectionsHookOptions
  ): UseServiceConnectionsHookReturnTuple => [
    async () => {
      mockStartFetchingAuthorizationCode();
      await new Promise(resolve => {
        setTimeout(resolve, 100);
      });
      if (mockTrackingData.returnValidAuthorizationCode) {
        if (options.onCompleted) {
          options.onCompleted(
            defaultTrackingData.authorizationCode,
            mockServiceConnectionsLoadStatus
          );
        }
      } else {
        if (options.onError) {
          options.onError(mockApolloError(), mockServiceConnectionsLoadStatus);
        }
      }
    },
    mockServiceConnectionsLoadStatus,
  ]
);

describe('<useDeleteServiceConnection /> ', () => {
  let responseCounter = -1;

  const queryTracker = jest.fn();
  const onCompletedTracker = jest.fn();
  const onErrorTracker = jest.fn();

  const testIds = {
    deleteButton: 'delete-button',
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
          data-testid={testIds.deleteButton}
          onClick={onClick}
        >
          Delete
        </button>
        <div data-testid={testIds.status}>{JSON.stringify(data)}</div>
      </div>
    );
  };

  const getTestId = (key: keyof typeof testIds): ElementSelector => ({
    testId: testIds[key],
  });

  const getStatus = (
    getElement: TestTools['getElement']
  ): Partial<UseDeleteServiceConnectionHookReturnTuple[1]> => {
    const statusElementContent = getElement(getTestId('status'))?.textContent;
    return statusElementContent ? JSON.parse(statusElementContent) : {};
  };

  const ComponentWithHook = (props?: {
    serviceName?: UseDeleteServiceConnectionServiceName;
  }) => {
    const [deleteConnection, status] = useDeleteServiceConnection(
      props?.serviceName ? props.serviceName : defaultServiceName,
      {
        onCompleted: onCompletedTracker,
        onError: onErrorTracker,
      }
    );
    // useDeleteServiceConnection has no inner state which would cause re-render, so using forceRender
    const [, forceRender] = useState<number>(0);
    return (
      <div>
        <OutputComponent
          data={{
            hasCode: status.hasCode,
            isDeleting: status.isDeleting,
            isLoading: status.isLoading,
          }}
          onClick={() => deleteConnection()}
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
    serviceName?: UseDeleteServiceConnectionServiceName
  ) => {
    const responseProvider: ResponseProvider = (...args: unknown[]) => {
      responseCounter = responseCounter + 1;
      queryTracker(...args);
      if (responseCounter === errorResponseIndex) {
        return { errorType: 'networkError' };
      }
      return {
        deleteMyServiceData: {
          __typename: 'DeleteMyServiceDataMutationPayload',
          result: {
            __typename: 'DeletionResultNode',
            success: true,
            errors: null,
          },
        },
      };
    };

    return renderComponentWithMocksAndContexts(
      responseProvider,
      <ComponentWithHook serviceName={serviceName} />
    );
  };

  beforeEach(() => {
    responseCounter = -1;
    Object.assign(mockTrackingData, defaultTrackingData);
    resetServiceConnectionsLoadStatus();
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
    serviceName?: UseDeleteServiceConnectionServiceName,
    errorResponseIndex = -1
  ): Promise<TestTools> => renderTestSuite(errorResponseIndex, serviceName);

  it(`Gets the authorization code with useServiceConnectionsAuthorizationCode and
      then runs the delete query.
      `, async () => {
    await act(async () => {
      const { clickElement, getElement } = await initTests();
      await clickElement(getTestId('deleteButton'));
      await waitFor(() => {
        const status = getStatus(getElement);
        expect(status.isLoading).toBeTruthy();
      });

      await waitFor(() => {
        expect(mockStartFetchingAuthorizationCode).toHaveBeenCalledTimes(1);
      });
      await waitFor(() => {
        expect(onCompletedTracker).toHaveBeenCalledTimes(1);
      });

      updateServiceConnectionsLoadStatus({
        loading: false,
        authorizationCode: 'authCode',
        complete: true,
      });

      await waitFor(async () => {
        await clickElement(getTestId('rerenderButton'));
        await waitFor(() => {
          expect(queryTracker).toHaveBeenCalledTimes(1);
          expect(onCompletedTracker).toHaveBeenCalledTimes(1);
        });
        expect(queryTracker).toHaveBeenLastCalledWith({
          input: {
            authorizationCode:
              mockServiceConnectionsLoadStatus.authorizationCode,
            dryRun: false,
            serviceName: defaultServiceName,
          },
        });
      });
    });
  });

  it(`If service connection / authorization code load fails, the onError is called`, async () => {
    await act(async () => {
      mockTrackingData.returnValidAuthorizationCode = false;
      const { clickElement, getElement } = await initTests(
        defaultServiceName,
        -1
      );
      await clickElement(getTestId('deleteButton'));
      await waitFor(() => {
        expect(onErrorTracker).toHaveBeenCalledTimes(1);
        expect(getStatus(getElement).isLoading).toBeFalsy();
        expect(getStatus(getElement).isDeleting).toBeFalsy();
      });
    });
  });

  it(`If deletion fails, the onError is called`, async () => {
    await act(async () => {
      const { clickElement, getElement } = await initTests(
        defaultServiceName,
        0
      );
      await clickElement(getTestId('deleteButton'));
      await waitFor(() => {
        expect(getStatus(getElement).isLoading).toBeTruthy();
      });
      await waitFor(async () => {
        await clickElement(getTestId('rerenderButton'));
        expect(onErrorTracker).toHaveBeenCalledTimes(1);
        expect(getStatus(getElement).isLoading).toBeFalsy();
        expect(getStatus(getElement).isDeleting).toBeFalsy();
      });
    });
  });

  it(`Deletion can be attempted multiple times`, async () => {
    await act(async () => {
      mockTrackingData.returnValidAuthorizationCode = false;
      const { clickElement } = await initTests(defaultServiceName, 0);
      await clickElement(getTestId('deleteButton'));
      await waitFor(() => {
        expect(onErrorTracker).toHaveBeenCalledTimes(1);
        expect(queryTracker).toHaveBeenCalledTimes(0);
      });
      mockTrackingData.returnValidAuthorizationCode = true;
      await clickElement(getTestId('deleteButton'));
      await waitFor(() => {
        expect(onErrorTracker).toHaveBeenCalledTimes(2);
        expect(queryTracker).toHaveBeenCalledTimes(1);
      });

      await clickElement(getTestId('deleteButton'));
      await waitFor(() => {
        expect(onErrorTracker).toHaveBeenCalledTimes(2);
        expect(queryTracker).toHaveBeenCalledTimes(2);
        expect(onCompletedTracker).toHaveBeenCalledTimes(1);
      });

      await clickElement(getTestId('deleteButton'));
      await waitFor(() => {
        expect(onErrorTracker).toHaveBeenCalledTimes(2);
        expect(queryTracker).toHaveBeenCalledTimes(3);
        expect(onCompletedTracker).toHaveBeenCalledTimes(2);
      });
    });
  });
  it(`Hook's inner status changes with useServiceConnectionsAuthorizationCode state and 
      when graphql query is executed
      `, async () => {
    await act(async () => {
      const { clickElement, getElement } = await initTests();

      updateServiceConnectionsLoadStatus({
        loading: true,
      });
      await clickElement(getTestId('rerenderButton'));
      await waitFor(() => {
        const status = getStatus(getElement);
        expect(status.isLoading).toBeTruthy();
        expect(status.isDeleting).toBeFalsy();
        expect(status.hasCode).toBeFalsy();
      });

      updateServiceConnectionsLoadStatus({
        loading: false,
        complete: true,
        authorizationCode: defaultTrackingData.authorizationCode,
      });
      await clickElement(getTestId('rerenderButton'));
      await waitFor(() => {
        const status = getStatus(getElement);
        expect(status.isLoading).toBeFalsy();
        expect(status.isDeleting).toBeFalsy();
        expect(status.hasCode).toBeTruthy();
      });

      await clickElement(getTestId('deleteButton'));

      await waitFor(async () => {
        await clickElement(getTestId('rerenderButton'));
        expect(queryTracker).toHaveBeenCalledTimes(1);
        const status = getStatus(getElement);
        expect(status.isLoading).toBeTruthy();
        expect(status.isDeleting).toBeTruthy();
        expect(status.hasCode).toBeTruthy();
      });

      await waitFor(async () => {
        await clickElement(getTestId('rerenderButton'));
        const status = getStatus(getElement);
        expect(onCompletedTracker).toHaveBeenCalledTimes(1);
        expect(status.isLoading).toBeFalsy();
        expect(status.isDeleting).toBeFalsy();
        expect(status.hasCode).toBeTruthy();
      });
    });
  });
});
