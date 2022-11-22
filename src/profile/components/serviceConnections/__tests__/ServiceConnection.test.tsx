import React, { useState } from 'react';
import { act, waitFor } from '@testing-library/react';
import { ApolloError } from '@apollo/client';

import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
  ElementSelector,
} from '../../../../common/test/testingLibraryTools';
import { ResponseProvider } from '../../../../common/test/MockApolloClientProvider';
import useDeleteServiceConnection from '../../../../gdprApi/useDeleteServiceConnection';
import { GdprDeleteMyServiceDataMutation } from '../../../../graphql/generatedTypes';
import getMyProfileWithServiceConnections from '../../../../common/test/getMyProfileWithServiceConnections';
import ServiceConnection from '../ServiceConnection';
import getServiceConnectionData, {
  ServiceConnectionData,
} from '../../../helpers/getServiceConnectionData';
import encodeServiceName from '../../../helpers/encodeServiceName';
import i18n from '../../../../common/test/testi18nInit';
import { getServiceConnectionDeleteResult } from '../../../../common/test/serviceConnectionDeleteMocking';

type UseDeleteServiceConnectionOptions = Parameters<
  typeof useDeleteServiceConnection
>[1];

type UseDeleteServiceConnectionHookReturnTuple = ReturnType<
  typeof useDeleteServiceConnection
>;

type DeletionStatus = UseDeleteServiceConnectionHookReturnTuple[1];

const mockDeleteConnection = jest.fn();
const mockCompletedTracker = jest.fn();
const mockErrorTracker = jest.fn();
const mockHookTracker = jest.fn();

const defaultQueryTracker: {
  returnValidResponse: boolean;
  response: null | GdprDeleteMyServiceDataMutation;
} = {
  returnValidResponse: true,
  response: null,
};

const mockQueryTracker = {
  tracker: jest.fn(),
  ...defaultQueryTracker,
};

const defaultDeleteConnectionStatus: DeletionStatus = {
  isLoading: false,
  isDeleting: false,
  hasCode: false,
};

let mockDeleteConnectionStatus: DeletionStatus = {
  ...defaultDeleteConnectionStatus,
};

const updateDeleteConnectionStatus = (
  newStatus: Partial<DeletionStatus>
): void => {
  mockDeleteConnectionStatus = {
    ...mockDeleteConnectionStatus,
    ...newStatus,
  };
};

const resetDeleteConnectionStatus = (): void => {
  mockDeleteConnectionStatus = {
    ...defaultDeleteConnectionStatus,
  };
};

const mockApolloError = () => new ApolloError({ errorMessage: 'Error' });

jest.mock(
  '../../../../gdprApi/useDeleteServiceConnection.ts',
  () => (
    serviceName: string,
    options: UseDeleteServiceConnectionOptions
  ): UseDeleteServiceConnectionHookReturnTuple => {
    mockHookTracker(serviceName, options);
    return [
      async () => {
        updateDeleteConnectionStatus({
          isLoading: true,
        });
        mockDeleteConnection();
        await new Promise(resolve => {
          setTimeout(resolve, 100);
        });
        updateDeleteConnectionStatus({
          isDeleting: false,
          isLoading: false,
          hasCode: true,
        });
        if (mockQueryTracker.returnValidResponse) {
          mockCompletedTracker();
          if (options.onCompleted) {
            options.onCompleted(
              mockQueryTracker.response as GdprDeleteMyServiceDataMutation
            );
          }
        } else {
          mockErrorTracker();
          if (options.onError) {
            options.onError(mockApolloError());
          }
        }
      },
      mockDeleteConnectionStatus,
    ];
  }
);

describe('<ServiceConnection /> ', () => {
  const onDeleteTracker = jest.fn();

  const queryResultWithServiceConnection = getMyProfileWithServiceConnections();
  const serviceConnectionDataList = getServiceConnectionData(
    queryResultWithServiceConnection
  );
  const defaultServiceConnectionData = serviceConnectionDataList[0];

  const testIds = {
    deleteButton: 'delete-button',
    rerenderButton: 'rerender-button',
    confirmButton: 'confirmation-modal-confirm-button',
    cancelButton: 'confirmation-modal-cancel-button',
    deleteVerificationText: 'service-connection-delete-verification-text',
    loadIndicator: 'service-connection-delete-load-indicator',
  };

  const t = i18n.getFixedT('fi');

  const getTestId = (key: keyof typeof testIds): ElementSelector => ({
    testId: testIds[key],
  });

  const getDeleteButtonSelector = (
    service: ServiceConnectionData
  ): ElementSelector => ({
    testId: `delete-service-connection-${encodeServiceName(service)}-button`,
  });

  const getServiceInformationSelector = (
    service: ServiceConnectionData
  ): ElementSelector => ({
    testId: `service-connection-${encodeServiceName(service)}-information`,
  });

  const getExpandableSelector = (
    service: ServiceConnectionData
  ): ElementSelector => ({
    querySelector: `button[title="${service.title}"]`,
  });

  const TestingComponent = (props: { service: ServiceConnectionData }) => {
    // useDeleteServiceConnection is mocked, so nothing will force re-render
    const [, forceRender] = useState<number>(0);
    return (
      <div>
        <ServiceConnection
          service={props.service}
          onDeletion={onDeleteTracker}
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

  const renderTestSuite = (service: ServiceConnectionData) => {
    const responseProvider: ResponseProvider = () => ({
      errorType: 'networkError',
    });

    return renderComponentWithMocksAndContexts(
      responseProvider,
      <TestingComponent service={service} />
    );
  };

  beforeEach(() => {
    Object.assign(mockQueryTracker, defaultQueryTracker);
    resetDeleteConnectionStatus();
  });

  afterEach(async () => {
    // makes sure timeouts are complete before starting next test
    if (mockDeleteConnection.mock.calls.length) {
      await waitFor(() => {
        if (
          mockCompletedTracker.mock.calls.length === 0 &&
          mockErrorTracker.mock.calls.length === 0
        ) {
          throw new Error('Test not finished');
        }
      });
    }
    cleanComponentMocks();
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  const initTests = async (
    service?: ServiceConnectionData
  ): Promise<TestTools> =>
    renderTestSuite(service || defaultServiceConnectionData);

  it(`Shows the service title and the accordion can be expanded. 
      Expanding shows service connection info and a remove button. 
      Service name is passed to the useDeleteServiceConnection hook`, async () => {
    await act(async () => {
      const { clickElement, getByText, waitForElement } = await initTests();
      expect(
        getByText(defaultServiceConnectionData.title as string)
      ).toBeDefined();
      expect(
        getByText(defaultServiceConnectionData.description as string)
      ).toBeDefined();
      await clickElement(getExpandableSelector(defaultServiceConnectionData));
      await waitForElement(
        getDeleteButtonSelector(defaultServiceConnectionData)
      );
      await waitForElement(
        getServiceInformationSelector(defaultServiceConnectionData)
      );
      expect(mockHookTracker.mock.calls[0][0]).toBe(
        defaultServiceConnectionData.name
      );
    });
  });
  it(`Clicking the remove button shows the confirmation modal. Close button closes it.`, async () => {
    await act(async () => {
      const {
        clickElement,
        waitForElement,
        waitForElementNotToExist,
      } = await initTests();

      await clickElement(getExpandableSelector(defaultServiceConnectionData));
      await waitFor(async () => {
        await clickElement(
          getDeleteButtonSelector(defaultServiceConnectionData)
        );
      });
      await waitForElement(getTestId('deleteVerificationText'));
      await clickElement(getTestId('cancelButton'));
      await waitForElementNotToExist(getTestId('cancelButton'));
    });
  });
  it(`If deletion succeeds, a success text is shown in the modal and 
      closing the modal calls the onDelete-callback.
      `, async () => {
    mockQueryTracker.response = getServiceConnectionDeleteResult();

    await act(async () => {
      const { clickElement, waitForElement } = await initTests();
      await clickElement(getExpandableSelector(defaultServiceConnectionData));
      await waitFor(async () => {
        await clickElement(
          getDeleteButtonSelector(defaultServiceConnectionData)
        );
        await clickElement(getTestId('confirmButton'));
      });
      await waitFor(async () => {
        expect(mockDeleteConnection).toHaveBeenCalledTimes(1);
      });
      await waitForElement({ text: t('notification.removeSuccess') });
      await clickElement(getTestId('cancelButton'));
      await waitFor(async () => {
        expect(onDeleteTracker).toHaveBeenCalledTimes(1);
      });
    });
  });
  it(`When delete is confirmed, loading is indicated. 
      Note: IRL the browser jumps to Tunnistamo.
      If deletion fails with a graphQL error, an specific error text is shown in the modal.
      `, async () => {
    mockQueryTracker.returnValidResponse = false;

    await act(async () => {
      const { clickElement, waitForElement } = await initTests(
        defaultServiceConnectionData
      );

      await clickElement(getExpandableSelector(defaultServiceConnectionData));
      await waitFor(async () => {
        await clickElement(
          getDeleteButtonSelector(defaultServiceConnectionData)
        );
        await clickElement(getTestId('confirmButton'));
      });
      await waitForElement(getTestId('loadIndicator'));
      await waitFor(async () => {
        expect(mockDeleteConnection).toHaveBeenCalledTimes(1);
      });
      await waitForElement({ text: t('notification.removeError') });
      await waitForElement({
        text: t('serviceConnections.connectionRemovalError'),
      });
      await clickElement(getTestId('cancelButton'));
      await waitFor(async () => {
        expect(onDeleteTracker).toHaveBeenCalledTimes(0);
      });
    });
  });
  it(`If deletion query succeeds but returns errors, 
      a different error text is shown in the modal.
      `, async () => {
    mockQueryTracker.response = getServiceConnectionDeleteResult(['errorCode']);

    await act(async () => {
      const { clickElement, waitForElement } = await initTests();
      await clickElement(getExpandableSelector(defaultServiceConnectionData));
      await waitFor(async () => {
        await clickElement(
          getDeleteButtonSelector(defaultServiceConnectionData)
        );
        await clickElement(getTestId('confirmButton'));
      });
      await waitFor(async () => {
        expect(mockDeleteConnection).toHaveBeenCalledTimes(1);
      });
      await waitForElement({
        text: t('serviceConnections.connectionRemovalForbidden'),
      });
      await clickElement(getTestId('cancelButton'));
      await waitFor(async () => {
        expect(onDeleteTracker).toHaveBeenCalledTimes(0);
      });
    });
  });
  it(`When browser returns from Tunnistamo, 
      accordion is auto-opened, 
      modal is rendered and
      load indicator is shown in the modal.`, async () => {
    updateDeleteConnectionStatus({
      isLoading: true,
      hasCode: true,
    });
    mockQueryTracker.response = getServiceConnectionDeleteResult();
    await act(async () => {
      const { waitForElement } = await initTests();
      await waitForElement(
        getServiceInformationSelector(defaultServiceConnectionData)
      );
      await waitForElement(getTestId('loadIndicator'));
    });
  });
});
