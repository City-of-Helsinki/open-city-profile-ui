import React from 'react';
import { render, screen } from '@testing-library/react';
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';

import UserGuide from '../UserGuide';
import TestLoginProvider from '../../common/test/TestLoginProvider';

vi.mock('react-router-dom', async () => {
  const module = await vi.importActual('react-router-dom');

  return {
    ...module,
    Link: () => <div></div>,
    useLocation: vi.fn().mockReturnValue({ data: { data: ['string'] } }),
  };
});

describe('User guide', () => {
  const renderLang = (language: string) => {
    i18n.changeLanguage(language);
    render(
      <TestLoginProvider>
        <I18nextProvider i18n={i18n}>
          <UserGuide />
        </I18nextProvider>
      </TestLoginProvider>
    );
  };
  test('renders UserGuide without errors', () => {
    const { container } = render(
      <TestLoginProvider>
        <UserGuide />
      </TestLoginProvider>
    );
    expect(container).toBeTruthy();
    expect(container).toMatchSnapshot();
  });
  test('renders UserGuide component in Finnish', () => {
    renderLang('fi');
    expect(screen.getByText('Helsinki-profiilin ohje')).toBeInTheDocument();
  });

  test('renders UserGuide component in Swedish', () => {
    renderLang('sv');
    expect(screen.getByText('Helsingforsprofilens hjälp')).toBeInTheDocument();
  });

  test('renders UserGuide component in English', () => {
    renderLang('en');
    expect(screen.getByText('Helsinki profile guide')).toBeInTheDocument();
  });
});
