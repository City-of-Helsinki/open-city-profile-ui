import React, { useState } from 'react';
import { act, waitFor } from '@testing-library/react';

import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
  ElementSelector,
} from '../../../../common/test/testingLibraryTools';
import DeleteProfile from '../DeleteProfile';
import { ResponseProvider } from '../../../../common/test/MockApolloClientProvider';
import getMyProfileWithServiceConnections from '../../../../common/test/getMyProfileWithServiceConnections';
import i18n from '../../../../common/test/testi18nInit';
import { ServiceConnectionsQueryVariables } from '../../../../graphql/typings';
import mockWindowLocation from '../../../../common/test/mockWindowLocation';
import { Action } from '../../../../common/actionQueue/actionQueue';
import config from '../../../../config';
import {
  ActionMockData,
  initMockQueue,
  isActionTriggered,
} from '../../../../gdprApi/actions/__mocks__/mock.util';
import {
  AuthCodeQueuesProps,
  authCodeQueuesStorageKey,
} from '../../../../gdprApi/useAuthCodeQueues';
import {
  getScenarioWhereDeleteProfileCanStartAndProceedToRedirection,
  getScenarioWhereDeleteProfileIsResumable,
} from '../../../../gdprApi/actions/__mocks__/queueScenarios';
import { getServiceConnectionsAction } from '../../../../gdprApi/actions/getServiceConnections';
import { defaultRedirectionCatcherActionType } from '../../../../gdprApi/actions/redirectionHandlers';
import { createNextActionParams } from '../../../../gdprApi/actions/utils';
import { tunnistamoAuthCodeRedirectionAction } from '../../../../gdprApi/actions/authCodeRedirectionHandler';

jest.mock('../../../../gdprApi/actions/queues');

describe('<DeleteProfile /> ', () => {
  const mockedWindowControls = mockWindowLocation();
  let responseCounter = -1;
  const serviceConnections = getMyProfileWithServiceConnections();
  const queryVariableTracker = jest.fn();
  let showComponent: React.Dispatch<React.SetStateAction<boolean>>;

  const ComponentRendererWithForceUpdate = (): React.ReactElement => {
    const [isOpen, toggleOpener] = useState<boolean>(true);
    showComponent = toggleOpener;
    return <div>{isOpen ? <DeleteProfile /> : <span>closed</span>}</div>;
  };

  const renderTestSuite = (errorResponseIndex = -1) => {
    const responseProvider: ResponseProvider = payload => {
      responseCounter = responseCounter + 1;
      queryVariableTracker(payload as ServiceConnectionsQueryVariables);
      return responseCounter === errorResponseIndex
        ? { errorType: 'networkError' }
        : { profileDataWithServiceConnections: serviceConnections };
    };

    return renderComponentWithMocksAndContexts(
      responseProvider,
      <ComponentRendererWithForceUpdate />
    );
  };

  const loadIndicator: ElementSelector = {
    testId: 'delete-profile-load-indicator',
  };
  const submitButton: ElementSelector = {
    id: 'delete-profile-button',
  };
  const confirmButtonSelector: ElementSelector = {
    testId: 'confirmation-modal-confirm-button',
  };
  const deletingProfileSelector: ElementSelector = {
    testId: 'deleting-profile',
  };
  const failedServicesListSelector: ElementSelector = {
    testId: 'delete-profile-failure-list',
  };
  const reloadServiceConnectionsButtonSelector: ElementSelector = {
    testId: 'reload-service-connections',
  };
  const errorDescriptionSelector: ElementSelector = {
    testId: 'delete-profile-generic-error',
  };
  const serviceConnectionsPageLinkSelector: ElementSelector = {
    testId: 'delete-profile-service-connections-page-link',
  };

  beforeEach(() => {
    responseCounter = -1;
  });
  afterEach(() => {
    mockedWindowControls.reset();
    cleanComponentMocks();
    jest.clearAllMocks();
  });

  const onCompleted = jest.fn();
  const onError = jest.fn();

  const authCodeQueueProps: AuthCodeQueuesProps = {
    queueName: 'deleteProfile',
    startPagePath: config.deletePath,
    onCompleted,
    onError,
  };

  const initTestQueue = (props: ActionMockData[]) => {
    initMockQueue(props, authCodeQueueProps, authCodeQueuesStorageKey);
  };

  const initQueueAndLocationForResume = (
    ...args: Parameters<typeof getScenarioWhereDeleteProfileIsResumable>
  ) => {
    initTestQueue(getScenarioWhereDeleteProfileIsResumable(...args));
    mockedWindowControls.setPath(config.deletePath);
    mockedWindowControls.setSearch(
      createNextActionParams({
        type: defaultRedirectionCatcherActionType,
      } as Action)
    );
  };

  const initTests = async (errorResponseIndex = -1): Promise<TestTools> => {
    const testTools = await renderTestSuite(errorResponseIndex);
    return Promise.resolve(testTools);
  };

  const proceedUIToDeletionConfimed = async (testTools: TestTools) => {
    const { clickElement, waitForElement } = testTools;
    await clickElement(submitButton);
    await waitForElement(loadIndicator);
    await waitForElement(confirmButtonSelector);
    await clickElement(confirmButtonSelector);
  };

  it(`Submitting starts to load serviceConnections.
      When loaded, a confirmation dialog is shown and after confirmation
      queue is started.`, async () => {
    initTestQueue(
      getScenarioWhereDeleteProfileCanStartAndProceedToRedirection()
    );
    await act(async () => {
      const testTools = await initTests();
      await proceedUIToDeletionConfimed(testTools);
      await waitFor(() => {
        expect(queryVariableTracker).toHaveBeenCalledTimes(1);
      });
      expect(queryVariableTracker).toHaveBeenCalledWith({
        language: i18n.language.toUpperCase(),
      });
      expect(isActionTriggered(getServiceConnectionsAction.type)).toBeTruthy();
    });
  });

  it(`UI won't get stuck on "loading" -state when re-rendered.`, async () => {
    initTestQueue(
      getScenarioWhereDeleteProfileCanStartAndProceedToRedirection()
    );
    await act(async () => {
      const { clickElement, getElement, waitForElement } = await initTests();
      await clickElement(submitButton);
      await waitForElement(confirmButtonSelector);
      showComponent(false);
      await waitFor(() => {
        expect(() => getElement(submitButton)).toThrow();
      });
      showComponent(true);
      await clickElement(submitButton);
      await waitForElement(confirmButtonSelector);
    });
  });

  it(`When service connection load fails, an error notification is shown with a reload button. 
          After successful reload, the queue is started.`, async () => {
    initTestQueue(
      getScenarioWhereDeleteProfileCanStartAndProceedToRedirection()
    );
    await act(async () => {
      const { clickElement, waitForElement } = await initTests(0);
      await clickElement(submitButton);
      await waitForElement(loadIndicator);
      await waitForElement(reloadServiceConnectionsButtonSelector);
      expect(isActionTriggered(getServiceConnectionsAction.type)).toBeFalsy();
      await clickElement(reloadServiceConnectionsButtonSelector);
      await waitForElement(confirmButtonSelector);
      await clickElement(confirmButtonSelector);
      expect(isActionTriggered(getServiceConnectionsAction.type)).toBeTruthy();
    });
  });
  it(`When deleting starts, an indicator is shown and browser is redirected.`, async () => {
    initTestQueue(
      getScenarioWhereDeleteProfileCanStartAndProceedToRedirection()
    );
    await act(async () => {
      const testTools = await initTests();
      const { waitForElement } = testTools;
      await proceedUIToDeletionConfimed(testTools);

      await waitFor(() => {
        expect(
          isActionTriggered(getServiceConnectionsAction.type)
        ).toBeTruthy();
      });
      await waitForElement(deletingProfileSelector);
      await waitFor(() => {
        expect(
          isActionTriggered(tunnistamoAuthCodeRedirectionAction.type)
        ).toBeTruthy();
      });
    });
  });
  it(`When deletion fails with unsuccessful and successful service deletions, 
      a list of successful and failed services is shown.`, async () => {
    initQueueAndLocationForResume({
      results: {
        failures: ['Failed service'],
        successful: ['Successful service'],
      },
    });
    await act(async () => {
      const testTools = await initTests(-1);
      const { waitForElement } = testTools;
      await waitForElement(failedServicesListSelector);
      await waitForElement(serviceConnectionsPageLinkSelector);
    });
  });
  it(`When deletion returns a generic error, an error message is shown`, async () => {
    initQueueAndLocationForResume({ error: true });
    await act(async () => {
      const testTools = await initTests(1);
      const { waitForElement } = testTools;
      await waitForElement(errorDescriptionSelector);
    });
  });
});
