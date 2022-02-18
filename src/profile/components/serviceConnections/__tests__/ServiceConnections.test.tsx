import { act, cleanup, waitFor } from '@testing-library/react';
import React from 'react';

import getMyProfileWithServiceConnections from '../../../../common/test/getMyProfileWithServiceConnections';
import {
  MockedResponse,
  resetApolloMocks,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import { renderComponentWithMocksAndContexts } from '../../../../common/test/testingLibraryTools';
import {
  AnyObject,
  ServiceConnectionsQueryVariables,
} from '../../../../graphql/typings';
import getServiceConnectionData from '../../../helpers/getServiceConnectionData';
import ServiceConnections from '../ServiceConnections';
import i18n from '../../../../common/test/testi18nInit';

describe('<ServiceConnections />', () => {
  const queryVariableTracker = jest.fn();
  const renderTestSuite = (responses: MockedResponse[]) => {
    const responseProvider: ResponseProvider = payload => {
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
  const queryResultWithoutServiceConnections = getMyProfileWithServiceConnections();
  ((queryResultWithoutServiceConnections.myProfile as unknown) as AnyObject).serviceConnections = null;

  afterEach(() => {
    jest.resetAllMocks();
    cleanup();
    resetApolloMocks();
  });

  it('should render all service connections. A load indicator is shown while loading', async () => {
    const responses: MockedResponse[] = [
      { profileDataWithServiceConnections: queryResultWithServiceConnection },
    ];
    await act(async () => {
      const { getElement, waitForElement } = await renderTestSuite(responses);
      await waitForElement({ testId: 'load-indicator' });
      await waitFor(() =>
        serviceList.forEach(service => {
          expect(getElement({ text: service.title as string })).toBeDefined();
        })
      );
    });
  });

  it('should render specific text if there are no service connections', async () => {
    const t = i18n.getFixedT('fi');
    const responses: MockedResponse[] = [
      {
        profileDataWithServiceConnections: queryResultWithoutServiceConnections,
      },
    ];
    await act(async () => {
      const { getElement } = await renderTestSuite(responses);
      await waitFor(() => {
        expect(
          getElement({ text: t('serviceConnections.empty') })
        ).toBeDefined();
      });
    });
  });

  it('should send current language as a variable. Value must be in uppercase', async () => {
    const responses: MockedResponse[] = [
      { profileDataWithServiceConnections: queryResultWithServiceConnection },
    ];
    const lang = 'af';
    i18n.language = lang;
    await act(async () => {
      const { waitForElement } = await renderTestSuite(responses);
      await waitForElement({ text: serviceList[0].title as string });
      expect(queryVariableTracker).toHaveBeenCalledWith({
        language: lang.toUpperCase(),
      });
    });
  });

  it('should render a notification with reload button when error occurs. Button click refetches data.', async () => {
    const responses: MockedResponse[] = [
      {
        errorType: 'graphQLError',
      },
      { profileDataWithServiceConnections: queryResultWithServiceConnection },
    ];
    const t = i18n.getFixedT('fi');
    await act(async () => {
      const {
        getElement,
        waitForElement,
        clickElement,
      } = await renderTestSuite(responses);

      await waitForElement({ testId: 'service-connections-load-error' });

      await clickElement({
        querySelector: '[data-testid="service-connections-load-error"] button',
      });

      await waitFor(() => {
        expect(
          getElement({ text: t('serviceConnections.title') })
        ).toBeDefined();
      });
    });
  });
});
