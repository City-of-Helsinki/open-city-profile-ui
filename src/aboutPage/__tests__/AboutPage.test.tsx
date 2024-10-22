import React from 'react';
import { render, screen } from '@testing-library/react';
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';

import AboutPage from '../AboutPage';
import TestLoginProvider from '../../common/test/TestLoginProvider';

vi.mock('react-router-dom', async () => {
  const module = await vi.importActual('react-router-dom');

  return {
    ...module,
    Link: () => <div></div>,
    useLocation: vi.fn().mockReturnValue({ data: { data: ['string'] } }),
  };
});

describe('About Page', () => {
  const renderLang = (language: string) => {
    i18n.changeLanguage(language);
    render(
      <TestLoginProvider>
        <I18nextProvider i18n={i18n}>
          <AboutPage />
        </I18nextProvider>{' '}
      </TestLoginProvider>
    );
  };
  test('renders AboutPage without errors', () => {
    const { container } = render(
      <TestLoginProvider>
        <AboutPage />
      </TestLoginProvider>
    );
    expect(container).toBeTruthy();
  });
  test('renders AboutPage component in Finnish', () => {
    renderLang('fi');
    expect(screen.getByText('Tietoa Helsinki-profiilista')).toBeInTheDocument();
  });

  test('renders AboutPage component in Swedish', () => {
    renderLang('sv');
    expect(screen.getByText('Om Helsingfors-profilen')).toBeInTheDocument();
  });

  test('renders AboutPage component in English', () => {
    renderLang('en');
    expect(screen.getByText('About Helsinki profile')).toBeInTheDocument();
  });
});
