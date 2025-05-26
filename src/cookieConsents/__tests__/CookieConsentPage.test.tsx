import React from 'react';
import { render, screen } from '@testing-library/react';

import CookieConsentPage from '../CookieConsentPage';

// Mock the dependencies
vi.mock('hds-react', () => ({
  CookieSettingsPage: vi.fn(() => <div data-testid='cookie-settings-page' />),
}));

vi.mock('../../common/pageLayout/PageLayout', () => ({
  default: ({ children, title }: { children: React.ReactNode; title: string }) => (
    <div data-testid='page-layout' data-title={title}>
      {children}
    </div>
  ),
}));

describe('CookieConsentPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the component with correct structure', () => {
    const { container } = render(<CookieConsentPage />);

    // Check that PageLayout is rendered with the correct title
    const pageLayout = screen.getByTestId('page-layout');
    expect(pageLayout).toBeInTheDocument();
    expect(pageLayout.getAttribute('data-title')).toBe('cookies.pageName');

    // Check that CookieSettingsPage is rendered
    const cookieSettingsPage = screen.getByTestId('cookie-settings-page');
    expect(cookieSettingsPage).toBeInTheDocument();

    // Check that the div with the CSS classes exists
    const contentDiv = container.querySelector('div[data-testid="page-layout"] > div');
    expect(contentDiv).toBeInTheDocument();
  });
});
