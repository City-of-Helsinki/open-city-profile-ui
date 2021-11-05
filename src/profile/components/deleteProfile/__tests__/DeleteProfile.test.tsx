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

const mockStartFetchingAuthorizationCode = jest.fn();

jest.mock('../../../../gdprApi/useAuthorizationCode.ts', () => () => [
  mockStartFetchingAuthorizationCode,
  false,
]);

describe('<DeleteProfile /> ', () => {
  let responseCounter = -1;
  const serviceConnections = getMyProfileWithServiceConnections();

  let showComponent: React.Dispatch<React.SetStateAction<boolean>>;

  const ComponentRendererWithForceUpdate = (): React.ReactElement => {
    const [isOpen, toggleOpener] = useState<boolean>(true);
    showComponent = toggleOpener;
    return <div>{isOpen ? <DeleteProfile /> : <span>closed</span>}</div>;
  };

  const renderTestSuite = (errorResponseIndex = -1) => {
    const responseProvider: ResponseProvider = () => {
      responseCounter = responseCounter + 1;
      return responseCounter === errorResponseIndex
        ? { errorType: 'networkError' }
        : { profileDataWithServiceConnections: serviceConnections };
    };

    return renderComponentWithMocksAndContexts(
      responseProvider,
      <ComponentRendererWithForceUpdate />
    );
  };

  const toggleButton: ElementSelector = {
    testId: 'delete-profile-toggle-button',
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
  const reloadButtonSelector: ElementSelector = {
    testId: 'reload-service-connections',
  };

  beforeEach(() => {
    responseCounter = -1;
  });
  afterEach(() => {
    cleanComponentMocks();
  });

  const initTests = async (errorResponseIndex = -1): Promise<TestTools> => {
    const testTools = await renderTestSuite(errorResponseIndex);
    return Promise.resolve(testTools);
  };

  it(`toggle button opens the panel 
      which first loads service connections 
      and then shows a checkbox and a submit button`, async () => {
    await act(async () => {
      const { clickElement, waitForElement } = await initTests();
      await clickElement(toggleButton);
      await waitForElement(loadIndicator);
      await waitForElement(checkbox);
      await waitForElement(submitButton);
    });
  });

  it(`Submit button is disabled until checkbox is checked.
      Submitting opens a confirmation dialog and after confirmation
      authorisation code is fetched.
      `, async () => {
    await act(async () => {
      const {
        clickElement,
        getElement,
        isDisabled,
        waitForElement,
      } = await initTests();
      await clickElement(toggleButton);
      await waitFor(() => {
        expect(isDisabled(getElement(submitButton))).toBeTruthy();
      });
      await clickElement(checkbox);
      await waitFor(() => {
        expect(isDisabled(getElement(submitButton))).toBeFalsy();
      });
      await clickElement(submitButton);
      await waitForElement(confirmButtonSelector);
      await clickElement(confirmButtonSelector);
      await waitFor(() => {
        expect(mockStartFetchingAuthorizationCode).toHaveBeenCalledTimes(1);
      });
    });
  });

  it(`When re-rendered, service connections are fetched from cache.
    UI won't get stuck on "loading" -state, but works like on first load.`, async () => {
    await act(async () => {
      const { clickElement, getElement, waitForElement } = await initTests();
      await clickElement(toggleButton);
      await waitForElement(checkbox);
      showComponent(false);
      await waitFor(() => {
        expect(() => getElement(checkbox)).toThrow();
      });
      showComponent(true);
      await clickElement(toggleButton);
      await waitForElement(checkbox);
    });
  });

  it(`When service connection load fails, an error is shown.
    Clicking "Try again"-button reloads data`, async () => {
    await act(async () => {
      const { clickElement, waitForElement } = await initTests(0);
      await clickElement(toggleButton);
      await waitForElement(reloadButtonSelector);
      await clickElement(reloadButtonSelector);
      await waitForElement(checkbox);
    });
  });
});
