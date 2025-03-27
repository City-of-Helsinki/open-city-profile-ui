import React from 'react';
import { act } from '@testing-library/react';
import { useOidcClient } from 'hds-react';
import { Mock } from 'vitest';

import {
  cloneProfileAndProvideManipulationFunctions,
  getMyProfile,
  getProfileDataWithoutSomeNodes,
} from '../../../../common/test/myProfileMocking';
import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
  ElementSelector,
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
import {
  AMRStatic,
  ProfileState,
  tunnistusSuomifiAMR,
} from '../../../../auth/useProfile';
import * as useProfile from '../../../../auth/useProfile';
import {
  CommonTestSuite,
  DataSource,
  getElementSelectors,
  getNotificationMessages,
  testDataIsRendered,
  testEditingItem,
  testDoubleFailing,
  testEditingItemFailsAndCancelResets,
  testInvalidValues,
  testUnchangedDataIsNotSent,
  testAddingItem,
  ValidationTest,
} from '../../../../common/test/commonTestRuns';

const suomifiAmr: AMRStatic = 'tunnistusSuomifi';

vi.mock('hds-react', async () => {
  const module = await vi.importActual('hds-react');
  const getAmrMock = vi.fn();

  return {
    ...module,
    useOidcClient: () => ({
      getAmr: getAmrMock,
    }),
  };
});

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

  const inputSelector: ElementSelector = { id: fieldSelectorValue };
  const valueSelector: ElementSelector = { testId: fieldSelectorValue };
  const errorSelector = {
    id: `${fieldSelectorValue}-error`,
  };
  const verifyEmailSelector = { testId: 'verify-email-notification' };
  const validEmailValue: EmailValue = {
    email: 'test.email@domain.com',
  };
  const invalidEmailValue: EmailValue = { email: 'invalid@..com' };
  const t = i18n.getFixedT('fi');

  beforeEach(() => {
    responses.length = 0;
    const { getAmr } = useOidcClient();
    (getAmr as Mock).mockReturnValue([suomifiAmr]); // Change mock return value
  });
  afterEach(() => {
    cleanComponentMocks();
  });

  const verifyEmailValue = async (
    testTools: TestTools,
    source: DataSource,
    targetIsInput = false
  ) => {
    const { getTextOrInputValue } = testTools;
    const { email } = source as Partial<EmailValue | EmailNode>;
    const getSelector = (): ElementSelector =>
      targetIsInput ? inputSelector : valueSelector;
    await expect(getTextOrInputValue(getSelector())).resolves.toBe(email);
  };

  const setEmailToInput = async (testTools: TestTools, source: DataSource) => {
    const { setInputValue } = testTools;
    const { email } = source as Partial<EmailValue | EmailNode>;
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

  const getUpdatedProfile = (newValue: EmailValue) =>
    cloneProfileAndProvideManipulationFunctions(initialProfile)
      .add(dataType, newValue)
      .getProfile();

  const commonTestProps: Exclude<CommonTestSuite, 'sentDataPicker'> = {
    selectors: getElementSelectors(dataType),
    valueSetter: setEmailToInput,
    valueVerifier: verifyEmailValue,
    responses,
    notificationMessages: getNotificationMessages(t),
  };

  const profileWithoutEmails = getProfileDataWithoutSomeNodes({
    noNodes: true,
    dataType,
  });
  const profileWithEmail = cloneProfileAndProvideManipulationFunctions(
    profileWithoutEmails
  )
    .add(dataType, { ...validEmailValue, id: '666', primary: true })
    .getProfile();

  it("renders user's email - also in edit mode", async () => {
    await act(async () => {
      const testTools = await initTests();
      const testSuite = {
        testTools,
        formData: getDataFromInitialProfile(0),
        ...commonTestProps,
      };
      await testDataIsRendered(testSuite);
    });
  });

  it('sends new data and returns to view mode when saved and shows only save notifications', async () => {
    await act(async () => {
      const testTools = await initTests();
      await testEditingItem({
        testTools,
        formData: validEmailValue,
        assumedResponse: getUpdatedProfile(validEmailValue),
        sentDataPicker: variables =>
          (variables.input.profile.updateEmails as DataSource[])[0],
        ...commonTestProps,
      });
      // "verify email" notification should not be rendered with current amr
      expect(() => testTools.getElement(verifyEmailSelector)).toThrow();
    });
  });

  it("will render email verification information when user's amr is tunnistusSuomifiAMR", async () => {
    vi.spyOn(useProfile, 'default').mockImplementation(
      () =>
        (({
          profile: mockProfileCreator({
            amr: [tunnistusSuomifiAMR],
          }),
        } as unknown) as ProfileState)
    );

    const { getAmr } = useOidcClient();
    (getAmr as Mock).mockReturnValue([tunnistusSuomifiAMR]); // Change mock return value

    await act(async () => {
      const testTools = await initTests();
      await testEditingItem({
        testTools,
        formData: validEmailValue,
        assumedResponse: getUpdatedProfile(validEmailValue),
        submitProps: {
          waitForAfterSaveNotification: {
            selector: verifyEmailSelector,
            value: t('profileInformation.verifyEmailText'),
          },
        },
        sentDataPicker: variables =>
          (variables.input.profile.updateEmails as DataSource[])[0],
        ...commonTestProps,
      });
    });
  });

  it('on send error shows error notification and stays in edit mode. Cancel-button resets data', async () => {
    await act(async () => {
      const testTools = await initTests();
      await testEditingItemFailsAndCancelResets({
        testTools,
        formData: validEmailValue,
        initialValues: getDataFromInitialProfile(0),
        ...commonTestProps,
      });
    });
  });

  it('saving unchanged email does not send requests or show verify email notification', async () => {
    await act(async () => {
      const testTools = await initTests();
      await testUnchangedDataIsNotSent({
        testTools,
        formData: getDataFromInitialProfile(0),
        initialValues: initialProfile,
        ...commonTestProps,
      });
      // "verify email" notification should not be rendered when email is not actually saved
      expect(() => testTools.getElement(verifyEmailSelector)).toThrow();
    });
  });

  it('invalid values are indicated and setting a valid value removes error', async () => {
    await act(async () => {
      const testTools = await initTests();
      const testRuns: ValidationTest[] = [
        {
          prop: 'email',
          value: invalidEmailValue.email,
          inputSelector,
          errorSelector,
        },
      ];
      await testInvalidValues(
        {
          testTools,
          initialValues: initialProfile,
          formData: validEmailValue,
          ...commonTestProps,
        },
        testRuns
      );
    });
  });

  it(`When there is no email, an add button is rendered and email can be added
      Add button is not shown after it has been clicked and email is saved.`, async () => {
    await act(async () => {
      const testTools = await initTests(profileWithoutEmails);
      await testAddingItem({
        ...commonTestProps,
        testTools,
        formData: validEmailValue,
        assumedResponse: profileWithEmail,
        sentDataPicker: variables =>
          ((variables.input.profile.addEmails as unknown) as DataSource[])[0],
      });
    });
  });

  it('When saving fails twice, the second one does result in save success, because data did not change.', async () => {
    await act(async () => {
      const testTools = await initTests();
      await testDoubleFailing({
        testTools,
        formData: validEmailValue,
        assumedResponse: getUpdatedProfile(validEmailValue),
        ...commonTestProps,
      });
    });
  });
});
