import React from 'react';
import { render, screen } from '@testing-library/react';
import i18n from 'i18next';
import { I18nextProvider } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import UserGuide from '../UserGuide';
import TestLoginProvider from '../../common/test/TestLoginProvider';

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    Link: ({ children, to, ...rest }: { children: React.ReactNode; to: string }) => (
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

describe('User guide', () => {
  const renderLang = (language: string) => {
    i18n.changeLanguage(language);
    return render(
      <MemoryRouter>
        <TestLoginProvider>
          <I18nextProvider i18n={i18n}>
            <UserGuide />
          </I18nextProvider>
        </TestLoginProvider>
      </MemoryRouter>,
    );
  };

  test('renders UserGuide without errors', () => {
    const { container } = render(
      <MemoryRouter>
        <TestLoginProvider>
          <UserGuide />
        </TestLoginProvider>
      </MemoryRouter>,
    );
    expect(container).toBeTruthy();
    expect(container).toMatchSnapshot();
  });

  test('renders UserGuide component in Finnish', () => {
    const container = renderLang('fi');
    expect(screen.getByText('Helsinki-profiilin ohje')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  test('renders UserGuide component in Swedish', () => {
    const container = renderLang('sv');
    expect(screen.getByText('Helsingforsprofilens hjälp')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });

  test('renders UserGuide component in English', () => {
    const container = renderLang('en');
    expect(screen.getByText('Helsinki profile guide')).toBeInTheDocument();
    expect(container).toMatchSnapshot();
  });
});
