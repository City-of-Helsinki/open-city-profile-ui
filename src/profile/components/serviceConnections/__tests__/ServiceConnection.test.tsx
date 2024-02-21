import React, { useState } from 'react';
import { act, waitFor } from '@testing-library/react';

import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
  ElementSelector,
} from '../../../../common/test/testingLibraryTools';
import { ResponseProvider } from '../../../../common/test/MockApolloClientProvider';
import getMyProfileWithServiceConnections from '../../../../common/test/getMyProfileWithServiceConnections';
import ServiceConnection from '../ServiceConnection';
import getServiceConnectionData, {
  ServiceConnectionData,
} from '../../../helpers/getServiceConnectionData';
import encodeServiceName from '../../../helpers/encodeServiceName';

describe('<ServiceConnection /> ', () => {
  const onDeleteTracker = vi.fn();

  const queryResultWithServiceConnection = getMyProfileWithServiceConnections();
  const serviceConnectionDataList = getServiceConnectionData(
    queryResultWithServiceConnection
  );
  const defaultServiceConnectionData = serviceConnectionDataList[0];

  const testIds = {
    deleteButton: 'delete-button',
    rerenderButton: 'rerender-button',
  };

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

  const TestingComponent = ({
    service,
    isActive,
  }: {
    service: ServiceConnectionData;
    isActive: boolean;
  }) => {
    // useDeleteServiceConnection is mocked, so nothing will force re-render
    const [, forceRender] = useState<number>(0);
    return (
      <div>
        <ServiceConnection
          service={service}
          isActive={isActive}
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

  const renderTestSuite = (
    service: ServiceConnectionData,
    isActive: boolean
  ) => {
    const responseProvider: ResponseProvider = () => ({
      errorType: 'networkError',
    });

    return renderComponentWithMocksAndContexts(
      responseProvider,
      <TestingComponent service={service} isActive={isActive} />
    );
  };

  afterEach(async () => {
    cleanComponentMocks();
    vi.clearAllMocks();
    vi.resetAllMocks();
  });

  const initTests = async (
    service?: ServiceConnectionData,
    isActive = false
  ): Promise<TestTools> =>
    renderTestSuite(service || defaultServiceConnectionData, isActive);

  it(`Shows the service title and the accordion can be expanded.
      Expanding shows service connection info and a remove button.`, async () => {
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
    });
  });
  it(`If "isActive"-prop is true, the accordion is initially open and delete button and data are visible`, async () => {
    await act(async () => {
      const { waitForElement } = await initTests(
        defaultServiceConnectionData,
        true
      );

      await waitForElement(
        getDeleteButtonSelector(defaultServiceConnectionData)
      );
      await waitForElement(
        getServiceInformationSelector(defaultServiceConnectionData)
      );
    });
  });
  it(`Clicking the remove button calls the onDeletion() with service data`, async () => {
    await act(async () => {
      const { clickElement } = await initTests();

      await clickElement(getExpandableSelector(defaultServiceConnectionData));
      await waitFor(async () => {
        await clickElement(
          getDeleteButtonSelector(defaultServiceConnectionData)
        );
      });
      await waitFor(async () => {
        expect(onDeleteTracker).toHaveBeenCalledTimes(1);
      });
    });
  });
});
