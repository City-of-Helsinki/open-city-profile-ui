import React from 'react';
import { mount } from 'enzyme';

import i18n from '../../test/testi18nInit';
import Header from '../Header';

const getWrapper = () => mount(<Header />);

it('language is changed from header language selector', () => {
  i18n.changeLanguage('fi');
  const wrapper = getWrapper();

  const ariaCurrent = 'aria-current';

  const fiButton = wrapper
    .find('button')
    .filterWhere(node => node.text() === 'Suomi');
  expect(fiButton.props()[ariaCurrent]).toBe(true);
  expect(i18n.language).toBe('fi');

  const svButton = wrapper
    .find('button')
    .filterWhere(node => node.text() === 'Svenska');
  expect(svButton.props()[ariaCurrent]).toBe(false);
  // Change the language
  svButton.simulate('click');

  setTimeout(() => {
    expect(fiButton.props()[ariaCurrent]).toBe(false);
    expect(i18n.language).toBe('sv');
  }, 100);
});
