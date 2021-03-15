import React from 'react';

import EditableAdditionalInformation from '../EditableAdditionalInformation';
import { renderProfileContextWrapper } from '../../../../common/test/componentMocking';
import { createMutationMocksAndTestData } from '../../../../common/test/graphQLDataMocking';
import { additionalInformationType } from '../../../helpers/mutationEditor';
import { Language } from '../../../../graphql/typings';
import profileConstants from '../../../constants/profileConstants';

describe('<EditableAdditionalInformation />', () => {
  const testData = createMutationMocksAndTestData(additionalInformationType, [
    { action: 'edit', id: '' },
    { action: 'error', id: '' },
  ]);

  const renderEditableAdditionalInformation = () =>
    renderProfileContextWrapper(
      testData.mocks,
      <EditableAdditionalInformation />
    );

  it('should render language selection, auto save and show success/error message', async () => {
    const {
      triggerAction,
      getTextOrInputValue,
      createWaitForDataChange,
    } = await renderEditableAdditionalInformation();

    const findLanguageIndex = (langugage: Language): number =>
      profileConstants.LANGUAGES.findIndex(
        constLang => constLang === langugage
      );
    const selectLanguage = async (langugage: Language) => {
      const index = findLanguageIndex(langugage);
      await triggerAction({ id: 'hds-toggle-button' });
      await triggerAction({ id: `hds-item-${index}` });
    };

    const getSelectedLanguageIndex = async () => {
      const buttonText = (await getTextOrInputValue({
        id: `hds-toggle-button`,
      })) as string;
      return profileConstants.LANGUAGES.findIndex(constLang =>
        buttonText.includes(constLang)
      );
    };

    const waitForDataChange = createWaitForDataChange();
    // change new language
    await selectLanguage(Language.SWEDISH);
    // wait until save is complete and success is rendered
    await waitForDataChange();
    const notificationContent = (await getTextOrInputValue({
      id: `${additionalInformationType}-edit-notifications`,
    })) as string;
    expect(notificationContent.includes('notification.saveSuccess'));

    // verify updated component shows SWEDISH as selected language
    const selectedLanguageIndex = await getSelectedLanguageIndex();
    expect(selectedLanguageIndex).toEqual(findLanguageIndex(Language.SWEDISH));

    // change new language for error scenario
    await selectLanguage(Language.ENGLISH);
    const errorNotificationContent = (await getTextOrInputValue({
      id: `${additionalInformationType}-edit-notifications`,
    })) as string;
    // check error is displayed
    expect(
      errorNotificationContent.includes('notification.saveError')
    ).toBeTruthy();
  });
});
