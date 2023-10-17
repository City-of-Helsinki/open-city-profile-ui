import React from 'react';
import { act, waitFor } from '@testing-library/react';

import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
  ElementSelector,
} from '../../../../common/test/testingLibraryTools';
import getMyProfileWithServiceConnections from '../../../../common/test/getMyProfileWithServiceConnections';
import getServiceConnectionData, {
  ServiceConnectionData,
} from '../../../helpers/getServiceConnectionData';
import i18n from '../../../../common/test/testi18nInit';
import mockWindowLocation from '../../../../common/test/mockWindowLocation';
import { Action } from '../../../../common/actionQueue/actionQueue';
import config from '../../../../config';
import {
  ActionMockData,
  initMockQueue,
} from '../../../../gdprApi/actions/__mocks__/mock.util';
import {
  AuthCodeQueuesProps,
  authCodeQueuesStorageKey,
} from '../../../../gdprApi/useAuthCodeQueues';
import ServiceConnectionRemover from '../ServiceConnectionRemover';
// eslint-disable-next-line max-len
import { getScenarioWhereDeleteServiceConnectionIsResumable } from '../../../../gdprApi/actions/__mocks__/queueScenarios';
import { defaultRedirectionCatcherActionType } from '../../../../gdprApi/actions/redirectionHandlers';
import { createNextActionParams } from '../../../../gdprApi/actions/utils';
import { deleteServiceConnectionType } from '../../../../gdprApi/actions/deleteServiceConnection';

jest.mock('../../../../gdprApi/actions/queues');

describe('<ServiceConnectionRemover /> ', () => {
  const onDeleteTracker = jest.fn();
  const onAbortTracker = jest.fn();
  const mockedWindowControls = mockWindowLocation();

  const defaultServiceConnectionData = getServiceConnectionData(
    getMyProfileWithServiceConnections()
  )[0];

  const testIds = {
    confirmButton: 'confirmation-modal-confirm-button',
    cancelButton: 'confirmation-modal-cancel-button',
    deleteVerificationText: 'service-connection-delete-verification-text',
    loadIndicator: 'service-connection-delete-load-indicator',
  };

  const t = i18n.getFixedT('fi');

  const getTestId = (key: keyof typeof testIds): ElementSelector => ({
    testId: testIds[key],
  });

  const TestingComponent = ({
    service,
  }: {
    service: ServiceConnectionData;
  }) => (
    <ServiceConnectionRemover
      service={service}
      onDeletion={onDeleteTracker}
      onAbort={onAbortTracker}
    />
  );

  const renderTestSuite = (service: ServiceConnectionData) =>
    renderComponentWithMocksAndContexts(
      jest.fn(),
      <TestingComponent service={service} />
    );

  const authCodeQueueProps: AuthCodeQueuesProps = {
    queueName: 'deleteServiceConnection',
    startPagePath: config.serviceConnectionsPath,
    serviceName: defaultServiceConnectionData.name,
  };

  const initTestQueue = (props: ActionMockData[]) => {
    initMockQueue(props, authCodeQueueProps, authCodeQueuesStorageKey);
  };

  const initQueueAndLocationForResume = (
    ...args: Parameters<
      typeof getScenarioWhereDeleteServiceConnectionIsResumable
    >
  ) => {
    initTestQueue(getScenarioWhereDeleteServiceConnectionIsResumable(...args));
    mockedWindowControls.setPath(config.serviceConnectionsPath);
    mockedWindowControls.setSearch(
      createNextActionParams({
        type: defaultRedirectionCatcherActionType,
      } as Action)
    );
  };

  afterEach(async () => {
    mockedWindowControls.reset();
    cleanComponentMocks();
    jest.clearAllMocks();
    jest.resetAllMocks();
  });

  const initTests = async (
    service?: ServiceConnectionData
  ): Promise<TestTools> =>
    renderTestSuite(service || defaultServiceConnectionData);

  it(`Renders the confirmation modal on initial render. 
      Close button closes it and calls the onAbort callback`, async () => {
    await act(async () => {
      const { clickElement, waitForElement } = await initTests();

      await waitForElement(getTestId('deleteVerificationText'));
      await clickElement(getTestId('cancelButton'));
      await waitFor(async () => {
        expect(onAbortTracker).toHaveBeenCalledTimes(1);
      });
    });
  });
  it(`Shows a loading indicator when deletion starts`, async () => {
    await act(async () => {
      const { clickElement, waitForElement } = await initTests();
      await waitForElement(getTestId('deleteVerificationText'));
      await clickElement(getTestId('confirmButton'));
      await waitForElement(getTestId('loadIndicator'));
    });
  });
  it(`Shows a loading indicator when returned back from gdpr callback and queue has started`, async () => {
    await act(async () => {
      initQueueAndLocationForResume();
      const { waitForElement } = await initTests();
      await waitForElement(getTestId('loadIndicator'));
    });
  });
  it(`If deletion succeeds, a success text is shown in the modal and 
      onDelete-callback is called when ok-button is pressed .`, async () => {
    initQueueAndLocationForResume();

    await act(async () => {
      const { waitForElement, clickElement } = await initTests();
      await waitForElement(getTestId('loadIndicator'));
      await waitForElement({ text: t('notification.removeSuccess') });
      await waitFor(async () => {
        expect(onDeleteTracker).toHaveBeenCalledTimes(0);
        expect(onAbortTracker).toHaveBeenCalledTimes(0);
      });
      await clickElement(getTestId('cancelButton'));
      await waitFor(async () => {
        expect(onDeleteTracker).toHaveBeenCalledTimes(1);
        expect(onAbortTracker).toHaveBeenCalledTimes(0);
      });
    });
  });
  it(`If deletion fails with a non-forbidden error, a specific error text is shown in the modal.`, async () => {
    initQueueAndLocationForResume({
      overrides: [
        {
          type: deleteServiceConnectionType,
          rejectValue: 'queryError',
          resolveValue: undefined,
        },
      ],
    });

    await act(async () => {
      const { clickElement, waitForElement } = await initTests(
        defaultServiceConnectionData
      );

      await waitForElement(getTestId('loadIndicator'));
      await waitForElement({ text: t('notification.removeError') });
      await waitForElement({
        text: t('serviceConnections.connectionRemovalError'),
      });
      await clickElement(getTestId('cancelButton'));
      await waitFor(async () => {
        expect(onAbortTracker).toHaveBeenCalledTimes(1);
      });
    });
  });
  it(`If deletion query succeeds, but result indicates removal was unsuccessful, 
      a forbidden message is shown`, async () => {
    initQueueAndLocationForResume({
      overrides: [
        {
          type: deleteServiceConnectionType,
          rejectValue: 'forbidden',
          resolveValue: undefined,
        },
      ],
    });

    await act(async () => {
      const { clickElement, waitForElement } = await initTests(
        defaultServiceConnectionData
      );

      await waitForElement({ text: t('notification.removeError') });
      await waitForElement({
        text: t('serviceConnections.connectionRemovalForbidden'),
      });
      await clickElement(getTestId('cancelButton'));
      await waitFor(async () => {
        expect(onAbortTracker).toHaveBeenCalledTimes(1);
      });
    });
  });
});
