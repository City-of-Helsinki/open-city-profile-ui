import React from 'react';
import { shallow } from 'enzyme';

import i18n from '../../test/testi18nInit';
import HelsinkiLogo from '../HelsinkiLogo';

type Props = {
  isLinkToFrontPage?: boolean;
};

const getWrapper = (props?: Props) => {
  return shallow(<HelsinkiLogo {...props} />);
};

describe('renders correct logo based on language', () => {
  test('finnish logo', () => {
    const wrapper = getWrapper();
    expect(wrapper.find('.logoFi').length).toEqual(1);
  });

  test('swedish logo', () => {
    i18n.changeLanguage('sv');
    const wrapper = getWrapper();
    expect(wrapper.find('.logoSv').length).toEqual(1);
  });
});

test('renders link', () => {
  const wrapper = getWrapper({ isLinkToFrontPage: true });
  expect(wrapper.props().to).toEqual('/');
});

test('renders span', () => {
  const wrapper = getWrapper();
  expect(wrapper.props().to).toBeFalsy();
});
