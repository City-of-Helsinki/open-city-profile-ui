import React from 'react';
import { render, screen } from '@testing-library/react';
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import AboutPage from '../AboutPage';
import TestLoginProvider from '../../common/test/TestLoginProvider';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    // Mock the Link component
    Link: ({
      children,
      to,
      ...rest
    }: {
      children: React.ReactNode;
      to: string;
    }) => (
      <a href={to} {...rest}>
        {children}
      </a>
    ),
    // Mock location hook
    useLocation: vi.fn().mockReturnValue({
      pathname: '/guide',
      search: '',
      hash: '',
      state: null,
      key: 'default',
    }),
  };
});

describe('About Page', () => {
  const renderLang = (language: string) => {
    i18n.changeLanguage(language);
    render(
      <MemoryRouter>
        <TestLoginProvider>
          <I18nextProvider i18n={i18n}>
            <AboutPage />
          </I18nextProvider>{' '}
        </TestLoginProvider>
      </MemoryRouter>
    );
  };
  test('renders AboutPage without errors', () => {
    const { container } = render(
      <MemoryRouter>
        <TestLoginProvider>
          <AboutPage />
        </TestLoginProvider>
      </MemoryRouter>
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
