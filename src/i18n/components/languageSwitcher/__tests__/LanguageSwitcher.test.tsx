import React from 'react';
import { render, waitFor } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';

import LanguageSwitcher from '../LanguageSwitcher';
import i18n from '../../../i18nInit';

type LanguageTestElements = {
  container: HTMLElement;
  button: HTMLElement;
  currentLangElement: HTMLElement;
};

const mockI18n = {
  language: '',
  changeLanguage: jest.fn(),
};

jest.mock('react-i18next', () => ({
  ...jest.requireActual('react-i18next'),
  useTranslation: () => ({
    t: (str: string) => str,
    i18n: mockI18n,
  }),
}));

describe('<LanguageSwitcher /> ', () => {
  const selectedLanguageSelector = 'div a[aria-current="page"]';
  const renderComponentAndReturnElements = (): LanguageTestElements => {
    const result = render(
      <I18nextProvider i18n={i18n}>
        <LanguageSwitcher />
      </I18nextProvider>
    );

    const button = result.container.querySelector(
      '#languageSelector-button'
    ) as HTMLElement;

    const currentLangElements = result.container.querySelectorAll(
      selectedLanguageSelector
    );

    if (currentLangElements.length > 1) {
      throw new Error('Too many elements with aria-current="page"');
    }

    const currentLangElement = currentLangElements[0] as HTMLElement;

    return {
      container: result.container,
      button,
      currentLangElement,
    };
  };

  const testLang = (elements: LanguageTestElements, language: string) => {
    const langCode = language.split('-')[0];
    expect(elements.button.textContent).toEqual(langCode.toUpperCase());
    expect(elements.currentLangElement.getAttribute('lang')).toEqual(langCode);
  };

  it('parses the i18n.language="fi" correctly and indicates selected language as "FI" ', () => {
    mockI18n.language = 'fi';
    testLang(renderComponentAndReturnElements(), mockI18n.language);
  });

  it('parses the i18n.language="en-GB" correctly and indicates selected language as "EN"', () => {
    mockI18n.language = 'en-GB';
    testLang(renderComponentAndReturnElements(), mockI18n.language);
  });

  it('parses the i18n.language="sv-x" correctly and indicates selected language as "SV"', () => {
    mockI18n.language = 'sv-x';
    testLang(renderComponentAndReturnElements(), mockI18n.language);
  });
  it('calls the i18n.changeLanguage with "sv" when the "sv"-link in the language dropdown is clicked', async () => {
    mockI18n.language = 'fi';
    const elements = renderComponentAndReturnElements();
    elements.button.click();
    expect(mockI18n.changeLanguage).toHaveBeenCalledTimes(0);
    await waitFor(() => {
      const svSelector = elements.container.querySelectorAll(
        'div a[lang="sv"]'
      )[0] as HTMLElement;
      svSelector.click();
      expect(mockI18n.changeLanguage).toHaveBeenCalledTimes(1);
      expect(mockI18n.changeLanguage).toHaveBeenCalledWith('sv');
    });
  });
});
