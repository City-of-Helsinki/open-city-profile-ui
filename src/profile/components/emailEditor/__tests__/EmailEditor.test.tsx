import React from 'react';
import { act } from '@testing-library/react';
import fetchMock from 'jest-fetch-mock';

import {
  cloneProfileAndProvideManipulationFunctions,
  getMyProfile,
  getProfileDataWithoutSomeNodes,
} from '../../../../common/test/myProfileMocking';
import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
  WaitForElementAndValueProps,
  ElementSelector,
  submitButtonSelector,
  waitForElementAttributeValue,
  waitForElementFocus,
} from '../../../../common/test/testingLibraryTools';
import { EmailNode, ProfileData } from '../../../../graphql/typings';
import EmailEditor from '../EmailEditor';
import {
  MockedResponse,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import { EditDataType, EmailValue } from '../../../helpers/editData';
import i18n from '../../../../common/test/testi18nInit';
import RenderChildrenWhenDataIsComplete from '../../../../common/test/RenderChildrenWhenDataIsComplete';
import getEmailsFromNode from '../../../helpers/getEmailsFromNode';
import { mockProfileCreator } from '../../../../common/test/userMocking';
import { AMRStatic } from '../../../../auth/useProfile';

let mockedAmr: AMRStatic;
const suomifiAmr: AMRStatic = 'tunnistusSuomifi';

jest.mock('../../../../auth/useProfile', () => ({
  __esModule: true,
  ...jest.requireActual('../../../../auth/useProfile'),
  tunnistusSuomifiAMR: suomifiAmr,
  default: () => ({ profile: mockProfileCreator({ amr: [mockedAmr] }) }),
}));

describe('<EmailEditor /> ', () => {
  const responses: MockedResponse[] = [];
  const initialProfile = getMyProfile().myProfile as ProfileData;
  const renderTestSuite = () => {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    return renderComponentWithMocksAndContexts(
      responseProvider,
      <RenderChildrenWhenDataIsComplete>
        <EmailEditor />
      </RenderChildrenWhenDataIsComplete>
    );
  };
  const dataType: EditDataType = 'emails';
  const fieldSelectorValue = `${dataType}-email`;
  const editButtonSelector: ElementSelector = { id: `${dataType}-edit-button` };
  const addButtonSelector: ElementSelector = {
    id: `${dataType}-add-button`,
  };
  const inputSelector: ElementSelector = { id: fieldSelectorValue };
  const valueSelector: ElementSelector = { testId: fieldSelectorValue };
  const errorSelector = {
    id: `${fieldSelectorValue}-error`,
  };
  const verifyEmailSelector = { testId: 'verify-email-notification' };
  const validEmailValue: EmailValue = {
    email: 'test.email@domain.com',
  };
  const t = i18n.getFixedT('fi');

  beforeEach(() => {
    responses.length = 0;
    mockedAmr = suomifiAmr;
  });
  afterEach(() => {
    cleanComponentMocks();
  });

  const verifyEmailValue = async (
    getTextOrInputValue: TestTools['getTextOrInputValue'],
    source: Partial<EmailValue | EmailNode>,
    targetIsInput = false
  ) => {
    const { email } = source;
    const getSelector = (): ElementSelector =>
      targetIsInput ? inputSelector : valueSelector;
    await expect(getTextOrInputValue(getSelector())).resolves.toBe(email);
  };

  const setEmailToInput = async (
    setInputValue: TestTools['setInputValue'],
    source: Partial<EmailValue | EmailNode>
  ) => {
    const { email } = source;
    await setInputValue({
      selector: inputSelector,
      newValue: email as string,
    });
  };

  const initTests = async (
    profileData: ProfileData = initialProfile
  ): Promise<TestTools> => {
    responses.push({ profileData });
    const testTools = await renderTestSuite();
    await testTools.fetch();
    return Promise.resolve(testTools);
  };

  const getDataFromInitialProfile = (index: number): EmailNode => {
    const emailNodes = getEmailsFromNode({ myProfile: initialProfile }, true);
    return emailNodes[index];
  };

  it("renders user's email - also in edit mode", async () => {
    await act(async () => {
      const { getTextOrInputValue, clickElement } = await initTests();
      await verifyEmailValue(getTextOrInputValue, getDataFromInitialProfile(0));
      // goto edit mode
      await clickElement(editButtonSelector);
      await verifyEmailValue(
        getTextOrInputValue,
        getDataFromInitialProfile(0),
        true
      );
    });
  });
  it('sends new data and returns to view mode when saved and shows only save notifications', async () => {
    await act(async () => {
      mockedAmr = 'google';
      const {
        clickElement,
        setInputValue,
        submit,
        getTextOrInputValue,
        getElement,
      } = await initTests();
      await clickElement(editButtonSelector);
      await setEmailToInput(setInputValue, validEmailValue);
      // create graphQL response for the update
      const updatedProfileData = cloneProfileAndProvideManipulationFunctions(
        initialProfile
      )
        .add(dataType, validEmailValue)
        .getProfile();
      // add the graphQL response
      responses.push({
        updatedProfileData,
      });

      const waitForOnSaveNotification: WaitForElementAndValueProps = {
        selector: { testId: `${dataType}-save-indicator` },
        value: t('notification.saving'),
      };
      const waitForAfterSaveNotification: WaitForElementAndValueProps = {
        selector: { id: `${dataType}-edit-notifications` },
        value: t('notification.saveSuccess'),
      };
      // submit and wait for "saving" notification
      await submit({
        waitForOnSaveNotification,
        waitForAfterSaveNotification,
      });
      // "verify email" notification should not be rendered with current amr
      expect(() => getElement(verifyEmailSelector)).toThrow();
      await verifyEmailValue(getTextOrInputValue, validEmailValue);
      // focus is set to edit button
      await waitForElementFocus(() => getElement(editButtonSelector));
    });
  });
  it("will render email verification information when user's amr is tunnistusSuomifiAMR", async () => {
    await act(async () => {
      const {
        clickElement,
        setInputValue,
        waitForElement,
        getElement,
      } = await initTests();
      await clickElement(editButtonSelector);
      await setEmailToInput(setInputValue, validEmailValue);
      // add the graphQL response
      const updatedProfileData = cloneProfileAndProvideManipulationFunctions(
        initialProfile
      )
        .add(dataType, validEmailValue)
        .getProfile();
      // add the graphQL response
      responses.push({
        updatedProfileData,
      });
      await clickElement(submitButtonSelector);
      // "verify email" notification should be rendered
      await waitForElement(verifyEmailSelector);
      // save success is not rendered with verify notification
      expect(() =>
        getElement({ id: `${dataType}-edit-notifications` })
      ).toThrow();
    });
  });
  it('on send error shows error notification and stays in edit mode. Cancel-button resets data', async () => {
    await act(async () => {
      const {
        clickElement,
        setInputValue,
        submit,
        getTextOrInputValue,
        getElement,
      } = await initTests();
      await clickElement(editButtonSelector);
      await setEmailToInput(setInputValue, validEmailValue);
      // add the graphQL response
      responses.push({
        errorType: 'networkError',
      });

      const waitForAfterSaveNotification: WaitForElementAndValueProps = {
        selector: { id: `${dataType}-edit-notifications` },
        value: t('notification.saveError'),
      };
      // submit and wait for saving and error notifications
      await submit({
        waitForAfterSaveNotification,
        skipDataCheck: true,
      });
      // input fields are still rendered
      await verifyEmailValue(getTextOrInputValue, validEmailValue, true);
      // "verify email" notification should not be rendered
      expect(() => getElement(verifyEmailSelector)).toThrow();
      await clickElement({
        testId: `${dataType}-cancel-button`,
      });
      // values are reset to previous values
      await verifyEmailValue(getTextOrInputValue, getDataFromInitialProfile(0));
    });
  });
  it('saving unchanged email does not send requests or show verify email notification', async () => {
    await act(async () => {
      const {
        clickElement,
        setInputValue,
        getTextOrInputValue,
        getElement,
      } = await initTests();
      // initial profile has been fetched
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const email = (await getTextOrInputValue(valueSelector)) as string;
      await clickElement(editButtonSelector);
      await setEmailToInput(setInputValue, { email });
      await clickElement(submitButtonSelector);
      // save indicator is not shown
      expect(() =>
        getElement({ testId: `${dataType}-save-indicator` })
      ).toThrow();
      // "verify email" notification should not be rendered
      expect(() => getElement(verifyEmailSelector)).toThrow();
      // focus is set to edit button
      await waitForElementFocus(() => getElement(editButtonSelector));
      // same value is still shown
      await verifyEmailValue(getTextOrInputValue, { email });
      // new requests haven't been done
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });
  });
  it('invalid email is indicated and setting a valid value removes error', async () => {
    await act(async () => {
      const { clickElement, setInputValue, getElement } = await initTests();
      await clickElement(editButtonSelector);
      const invalidEmailValue = { email: 'invalid@..com' };

      const elementGetter = () => getElement(inputSelector);
      const errorElementGetter = () => getElement(errorSelector);
      const errorListElementGetter = () =>
        getElement({ testId: `${dataType}-error-list` });

      // set invalid values
      await setEmailToInput(setInputValue, invalidEmailValue);
      // submit also validates the form
      await clickElement(submitButtonSelector);
      await waitForElementAttributeValue(elementGetter, 'aria-invalid', 'true');
      // error element and list are found
      expect(errorElementGetter).not.toThrow();
      expect(errorListElementGetter).not.toThrow();
      // set valid value
      await setEmailToInput(setInputValue, validEmailValue);
      await waitForElementAttributeValue(
        elementGetter,
        'aria-invalid',
        'false'
      );
      // error element and list are not found
      expect(errorElementGetter).toThrow();
      expect(errorListElementGetter).toThrow();
    });
  });
  it('When there is no email, an add button is rendered and email can be added', async () => {
    await act(async () => {
      const profileWithoutEmails = getProfileDataWithoutSomeNodes({
        noNodes: true,
        dataType,
      });
      const {
        clickElement,
        setInputValue,
        getElement,
        submit,
        waitForElement,
        getTextOrInputValue,
      } = await initTests(profileWithoutEmails);

      // edit button is not rendered
      expect(() => getElement(editButtonSelector)).toThrow();

      // info text is shown instead of an email address
      await expect(getTextOrInputValue(valueSelector)).resolves.toBe(
        t('profileInformation.noEmail')
      );
      // click add button to create an email
      await clickElement(addButtonSelector);
      await setEmailToInput(setInputValue, validEmailValue);
      // create the graphQL response
      const profileWithEmail = cloneProfileAndProvideManipulationFunctions(
        profileWithoutEmails
      )
        .add(dataType, { ...validEmailValue, id: '666', primary: true })
        .getProfile();
      // add the graphQL response
      responses.push({ updatedProfileData: profileWithEmail });
      await submit({
        skipDataCheck: true,
      });
      await waitForElement(verifyEmailSelector);
      await verifyEmailValue(getTextOrInputValue, validEmailValue);
    });
  });
});
