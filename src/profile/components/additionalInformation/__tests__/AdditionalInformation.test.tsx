import React from 'react';

import {
  cloneProfileAndProvideManipulationFunctions,
  getMyProfile,
} from '../../../../common/test/myProfileMocking';
import {
  renderComponentWithMocksAndContexts,
  TestTools,
  cleanComponentMocks,
} from '../../../../common/test/testingLibraryTools';
import { Language, ProfileData } from '../../../../graphql/typings';
import AdditionalInformation from '../AdditionalInformation';
import {
  MockedResponse,
  ResponseProvider,
} from '../../../../common/test/MockApolloClientProvider';
import {
  additionalInformationType,
  AdditionalInformationValue,
} from '../../../helpers/editData';
import i18n from '../../../../common/test/testi18nInit';
import RenderChildrenWhenDataIsComplete from '../../../../common/test/RenderChildrenWhenDataIsComplete';
import profileConstants from '../../../constants/profileConstants';

type LanguageTestTools = {
  selectLanguage: (language: Language) => Promise<void>;
  getSelectedLanguageIndex: () => Promise<number>;
  waitForElementAndValue: TestTools['waitForElementAndValue'];
};

describe('<AdditionalInformation /> ', () => {
  const responses: MockedResponse[] = [];
  const initialProfile = getMyProfile().myProfile as ProfileData;
  const renderTestSuite = () => {
    const responseProvider: ResponseProvider = () =>
      responses.shift() as MockedResponse;
    return renderComponentWithMocksAndContexts(
      responseProvider,
      <RenderChildrenWhenDataIsComplete>
        <AdditionalInformation />
      </RenderChildrenWhenDataIsComplete>
    );
  };

  const languageSelectionIdPrefix = `${additionalInformationType}-language`;
  const initialLanguage = initialProfile.language as Language;
  const t = i18n.getFixedT('fi');

  const findLanguageIndex = (language: Language): number =>
    profileConstants.LANGUAGES.findIndex(lang => lang === language);

  const initTests = async (): Promise<LanguageTestTools> => {
    responses.push({ profileData: initialProfile });
    const testTools = await renderTestSuite();
    await testTools.fetch();

    const {
      clickElement,
      getTextOrInputValue,
      waitForElementAndValue,
    } = testTools;

    const selectLanguage = async (language: Language) => {
      const index = findLanguageIndex(language);
      await clickElement({ id: `${languageSelectionIdPrefix}-main-button` });
      await clickElement({
        id: `${languageSelectionIdPrefix}-option-${index}`,
      });
    };

    const getSelectedLanguageIndex = async () => {
      const buttonText = (await getTextOrInputValue({
        id: `${languageSelectionIdPrefix}-main-button`,
      })) as string;
      return profileConstants.LANGUAGES.findIndex(language => {
        const translation = t(`LANGUAGE_OPTIONS.${language}`);
        return buttonText.includes(translation);
      });
    };

    return Promise.resolve({
      selectLanguage,
      getSelectedLanguageIndex,
      waitForElementAndValue,
    });
  };

  beforeEach(() => {
    responses.length = 0;
  });
  afterEach(() => {
    cleanComponentMocks();
  });

  it('should render language selection, auto save and show success message', async () => {
    const {
      waitForElementAndValue,
      selectLanguage,
      getSelectedLanguageIndex,
    } = await initTests();

    const newAdditionalInformation: AdditionalInformationValue = {
      language: Language.SWEDISH,
    };

    const updatedProfileData = cloneProfileAndProvideManipulationFunctions(
      initialProfile
    )
      .setAdditionalInformation(newAdditionalInformation)
      .getProfile();

    // add the graphQL response
    responses.push({
      updatedProfileData,
    });

    // verify initial selected item matches initialProfile.language
    const initialSelectedLanguageIndex = await getSelectedLanguageIndex();
    expect(initialSelectedLanguageIndex).toEqual(
      findLanguageIndex(initialLanguage)
    );

    // change new language
    await selectLanguage(newAdditionalInformation.language);
    // wait until save is complete and success is rendered
    await waitForElementAndValue({
      selector: { id: `${additionalInformationType}-edit-notifications` },
      value: t('notification.saveSuccess'),
    });

    // verify updated component shows SWEDISH as selected language
    const selectedLanguageIndex = await getSelectedLanguageIndex();
    expect(selectedLanguageIndex).toEqual(
      findLanguageIndex(newAdditionalInformation.language)
    );
  });

  it('should show error message when saving fails and revert selected item in dropdown', async () => {
    const {
      waitForElementAndValue,
      selectLanguage,
      getSelectedLanguageIndex,
    } = await initTests();

    // add the graphQL response
    responses.push({
      errorType: 'networkError',
    });

    // change new language for error scenario
    await selectLanguage(Language.ENGLISH);
    await waitForElementAndValue({
      selector: { id: `${additionalInformationType}-edit-notifications` },
      value: t('notification.saveError'),
    });

    // verify component has reverted and initialLanguage is the selected language
    const selectedLanguageIndex = await getSelectedLanguageIndex();
    expect(selectedLanguageIndex).toEqual(findLanguageIndex(initialLanguage));
  });
});
