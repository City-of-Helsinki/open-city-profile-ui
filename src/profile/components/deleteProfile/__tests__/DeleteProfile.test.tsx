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
import { GdprDeleteMyProfileMutationVariables } from '../../../../graphql/generatedTypes';

const mockStartFetchingAuthorizationCode = jest.fn();

jest.mock(
  '../../../../gdprApi/useAuthorizationCode.ts',
  () => (...args: [string, (code: string) => void]) => [
    async () => {
      const cb = args[1];
      mockStartFetchingAuthorizationCode();
      await new Promise(resolve => {
        setTimeout(resolve, 100);
      });
      return Promise.resolve(cb('code'));
    },
    false,
  ]
);

describe('<DeleteProfile /> ', () => {
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
      if (
        payload &&
        (payload as GdprDeleteMyProfileMutationVariables).input &&
        (payload as GdprDeleteMyProfileMutationVariables).input
          .authorizationCode
      ) {
        return { deleteMyProfile: { clientMutationId: '' } };
      }
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
  const checkbox: ElementSelector = {
    id: 'deleteInstructions',
  };
  const submitButton: ElementSelector = {
    id: 'delete-profile-button',
  };
  const confirmButtonSelector: ElementSelector = {
    testId: 'confirmation-modal-confirm-button',
  };
  const errorModalButtonSelector: ElementSelector = {
    testId: 'delete-profile-error-modal-close-button',
  };
  const deletingProfileSelector: ElementSelector = {
    testId: 'deleting-profile',
  };

  beforeEach(() => {
    responseCounter = -1;
  });
  afterEach(() => {
    cleanComponentMocks();
    jest.resetAllMocks();
  });

  const initTests = async (errorResponseIndex = -1): Promise<TestTools> => {
    const testTools = await renderTestSuite(errorResponseIndex);
    return Promise.resolve(testTools);
  };

  it(`Submit button is disabled until checkbox is checked.
      Submitting starts to load serviceConnections.
      When loaded, a confirmation dialog is shown and after confirmation
      authorisation code is fetched.
      `, async () => {
    await act(async () => {
      const {
        clickElement,
        getElement,
        isDisabled,
        waitForElement,
      } = await initTests();
      await waitFor(() => {
        expect(isDisabled(getElement(submitButton))).toBeTruthy();
      });
      await clickElement(checkbox);
      await waitFor(() => {
        expect(isDisabled(getElement(submitButton))).toBeFalsy();
      });
      await clickElement(submitButton);
      await waitForElement(loadIndicator);
      await waitForElement(confirmButtonSelector);
      await clickElement(confirmButtonSelector);
      await waitFor(() => {
        expect(mockStartFetchingAuthorizationCode).toHaveBeenCalledTimes(1);
      });
      expect(queryVariableTracker).toHaveBeenCalledWith({
        language: i18n.language.toUpperCase(),
      });
    });
  });

  it(`When re-rendered, service connections are fetched from cache.
    UI won't get stuck on "loading" -state, but works like on first load.`, async () => {
    await act(async () => {
      const { getElement, waitForElement } = await initTests();
      await waitForElement(checkbox);
      showComponent(false);
      await waitFor(() => {
        expect(() => getElement(checkbox)).toThrow();
      });
      showComponent(true);
      await waitForElement(checkbox);
    });
  });

  it(`When service connection load fails, an error is shown.
    Modal can be closed and delete started again`, async () => {
    await act(async () => {
      const { clickElement, waitForElement } = await initTests(1);
      await clickElement(checkbox);
      await clickElement(submitButton);
      await waitForElement(loadIndicator);
      await waitForElement(confirmButtonSelector);
      await clickElement(confirmButtonSelector);
      await waitForElement(errorModalButtonSelector);
      await clickElement(errorModalButtonSelector);
      await clickElement(submitButton);
      await clickElement(confirmButtonSelector);
    });
  });
  it(`When deleting starts, an indicator is shown`, async () => {
    await act(async () => {
      const { clickElement, waitForElement } = await initTests();
      await clickElement(checkbox);
      await clickElement(submitButton);
      await waitForElement(loadIndicator);
      await waitForElement(confirmButtonSelector);
      await clickElement(confirmButtonSelector);

      await waitFor(() => {
        expect(mockStartFetchingAuthorizationCode).toHaveBeenCalledTimes(1);
      });
      await waitForElement(deletingProfileSelector);
    });
  });
});
