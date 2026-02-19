import { cleanup, waitFor } from '@testing-library/react';
import React from 'react';

import getMyProfileWithServiceConnections from '../../../../common/test/getMyProfileWithServiceConnections';
import {
  MockedResponse,
  resetApolloMocks,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import {
  ElementSelector,
  renderComponentWithMocksAndContexts,
} from '../../../../common/test/testingLibraryTools';
import {
  AnyObject,
  ServiceConnectionsQueryVariables,
} from '../../../../graphql/typings';
import getServiceConnectionData, {
  ServiceConnectionData,
} from '../../../helpers/getServiceConnectionData';
import ServiceConnections from '../ServiceConnections';
import i18n from '../../../../common/test/testi18nInit';
import encodeServiceName from '../../../helpers/encodeServiceName';
import { createQueueFromProps } from '../../../../common/actionQueue/actionQueue';
import { storeQueue } from '../../../../common/actionQueue/actionQueueStorage';
import { authCodeQueuesStorageKey } from '../../../../gdprApi/useAuthCodeQueues';
import { getServiceConnectionsAction } from '../../../../gdprApi/actions/getServiceConnections';

describe('<ServiceConnections />', () => {
  const queryVariableTracker = vi.fn();
  const renderTestSuite = (responses: MockedResponse[]) => {
    const responseProvider: ResponseProvider = (payload) => {
      queryVariableTracker(payload as ServiceConnectionsQueryVariables);
      return responses.shift() as MockedResponse;
    };
    return renderComponentWithMocksAndContexts(
      responseProvider,
      <ServiceConnections />
    );
  };

  const queryResultWithServiceConnection = getMyProfileWithServiceConnections();
  const serviceList = getServiceConnectionData(
    queryResultWithServiceConnection
  );
  const queryResultWithoutServiceConnections =
    getMyProfileWithServiceConnections();
  (
    queryResultWithoutServiceConnections.myProfile as unknown as AnyObject
  ).serviceConnections = null;

  const getDefaultResponse = () => [
    { profileDataWithServiceConnections: queryResultWithServiceConnection },
  ];

  const testIds = {
    confirmButton: 'confirmation-modal-confirm-button',
    cancelButton: 'confirmation-modal-cancel-button',
    deleteVerificationText: 'service-connection-delete-verification-text',
    loadIndicator: 'service-connection-delete-load-indicator',
  };

  const getTestId = (key: keyof typeof testIds): ElementSelector => ({
    testId: testIds[key],
  });

  const getDeleteButtonSelector = (
    service: ServiceConnectionData
  ): ElementSelector => ({
    testId: `delete-service-connection-${encodeServiceName(service)}-button`,
  });

  const setServiceDataToStorage = () => {
    storeQueue(
      authCodeQueuesStorageKey,
      createQueueFromProps([
        {
          type: getServiceConnectionsAction.type,
          executor: vi.fn(),
          data: {
            serviceName: serviceList[0].name,
          },
        },
      ])
    );
  };

  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
    resetApolloMocks();
  });
  describe('Loads and lists service connections', () => {
    it('should render all service connections. A load indicator is shown while loading', async () => {
      const { getElement, waitForElement } =
        await renderTestSuite(getDefaultResponse());
      await waitForElement({ testId: 'load-indicator' });
      await waitFor(() =>
        serviceList.forEach((service) => {
          expect(getElement({ text: service.title as string })).toBeDefined();
        })
      );
    });

    it('should render specific text if there are no service connections', async () => {
      const t = i18n.getFixedT('fi');
      const responses: MockedResponse[] = [
        {
          profileDataWithServiceConnections:
            queryResultWithoutServiceConnections,
        },
      ];

      const { getElement } = await renderTestSuite(responses);
      await waitFor(() => {
        expect(
          getElement({ text: t('serviceConnections.empty') })
        ).toBeDefined();
      });
    });

    it('should send current language as a variable. Value must be in uppercase', async () => {
      const lang = 'af';
      i18n.language = lang;

      const { waitForElement } = await renderTestSuite(getDefaultResponse());
      await waitForElement({ text: serviceList[0].title as string });
      expect(queryVariableTracker).toHaveBeenCalledWith({
        language: lang.toUpperCase(),
      });
    }); 
  });
  describe('Renders the ServiceConnectionsRemover when a delete button is clicked', () => {
    it('Modal is shown. It is removed when close button is clicked', async () => {
      setServiceDataToStorage();

      const { clickElement, waitForElement, waitForElementNotToExist } =
        await renderTestSuite(getDefaultResponse());
      await waitFor(async () => {
        await clickElement(getDeleteButtonSelector(serviceList[0]));
      });
      await waitForElement(getTestId('deleteVerificationText'));
      await clickElement(getTestId('cancelButton'));
      await waitForElementNotToExist(getTestId('cancelButton'));
    });
  });
});
