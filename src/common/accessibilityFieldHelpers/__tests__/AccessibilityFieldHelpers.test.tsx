import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { I18nextProvider, useTranslation } from 'react-i18next';

import i18nModule from '../../test/testi18nInit';
import AccessibilityFieldHelpers from '../AccessibilityFieldHelpers';
import { createDomHelpersWithTesting } from '../../test/testingLibraryTools';
import { getFormFields } from '../../../profile/helpers/formProperties';
import { basicDataType, EditDataType } from '../../../profile/helpers/editData';

describe('<AccessibilityFieldHelpers /> ', () => {
  const dataTypesWhereUsed: EditDataType[] = [
    basicDataType,
    'addresses',
    'phones',
    'emails',
  ];

  const changeLanguageButtonId = 'change-language';
  const currentLanguageIndicatorId = 'current-language';

  const TestComponent = ({ dataType }: { dataType: EditDataType }) => {
    const { i18n } = useTranslation();
    const changeLanguage = (code: string) => {
      i18n.changeLanguage(code);
    };
    return (
      <I18nextProvider i18n={i18n}>
        <AccessibilityFieldHelpers dataType={dataType} />
        <button
          id={changeLanguageButtonId}
          onClick={() => changeLanguage('sv')}
        />
        <span id={currentLanguageIndicatorId}>{i18n.language}</span>
      </I18nextProvider>
    );
  };

  dataTypesWhereUsed.forEach(dataType => {
    it(`renders helper texts for dataType '${dataType}' `, async () => {
      const { findById } = createDomHelpersWithTesting(
        render(<TestComponent dataType={dataType} />)
      );
      const keys = Object.keys(getFormFields(dataType));
      // cannot use forEach with async/await
      for (const key of keys) {
        const addressElement = await findById(`${dataType}-${key}-helper`);
        expect(addressElement).toBeDefined();
        expect(
          (addressElement as HTMLElement).innerHTML.length > 0
        ).toBeTruthy();
      }
    });
  });

  it('helper texts change when language changes', async () => {
    const dataType = 'addresses';
    const { findById, click } = createDomHelpersWithTesting(
      render(<TestComponent dataType={dataType} />)
    );

    const pickRenderedTexts = async () => {
      const keys = Object.keys(getFormFields(dataType));
      const texts: Record<string, string> = {};
      for (const key of keys) {
        const addressElement = (await findById(
          `${dataType}-${key}-helper`
        )) as HTMLElement;
        texts[key] = addressElement.innerHTML;
      }
      return texts;
    };

    const getCurrentLanguageFromHTML = async () =>
      ((await findById(currentLanguageIndicatorId)) as HTMLElement).innerHTML;

    const currentLanguage = await getCurrentLanguageFromHTML();
    expect(currentLanguage).toBe(i18nModule.language);

    const initialTexts = await pickRenderedTexts();
    await click((await findById(changeLanguageButtonId)) as HTMLElement);
    await waitFor(async () => {
      const language = await getCurrentLanguageFromHTML();
      if (language === currentLanguage) {
        throw new Error('Language has not changed');
      }
    });
    const updatedTexts = await pickRenderedTexts();
    expect(updatedTexts).not.toEqual(initialTexts);
  });
});
