import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';

import i18n from '../../test/testi18nInit';
import Header from '../Header';

it('language is changed from header language selector', async () => {
  i18n.changeLanguage('fi');
  const { getByText } = render(<Header />);

  const ariaCurrent = 'aria-current';

  // Find the button for Finnish
  const fiButton = getByText('Suomi').parentElement;
  expect(fiButton?.getAttribute(ariaCurrent)).toBe('true');
  expect(i18n.language).toBe('fi');

  // Find the button for Swedish
  const svButton = getByText('Svenska').parentElement;
  expect(svButton?.getAttribute(ariaCurrent)).toBe('false');

  // Change the language
  if (svButton) {
    fireEvent.click(svButton);
  }

  await waitFor(() => {
    expect(fiButton?.getAttribute(ariaCurrent)).toBe('false');
    expect(svButton?.getAttribute(ariaCurrent)).toBe('true');
    expect(i18n.language).toBe('sv');
  });
});
