import React from 'react';
import { render, act } from '@testing-library/react';

import i18n from '../../test/testi18nInit';
import HelsinkiLogo from '../HelsinkiLogo';

it('language switch changes helsinki logo', async () => {
  const { getByTestId } = render(<HelsinkiLogo />);
  const fiSvg = getByTestId('helsinki-logo').getAttribute('src');

  act(() => {
    // Change the language to swedish
    i18n.changeLanguage('sv');
  });

  // Check that the logo image source has changed (Helsinki to Helsingfors)
  expect(getByTestId('helsinki-logo').getAttribute('src')).not.toBe(fiSvg);
});
