import React from 'react';
import { mount } from 'enzyme';
import enzymeToJson from 'enzyme-to-json';

import ProfileInformationAuthenticationSourceBackLink from '../ProfileInformationAccountManagementLink';

jest.mock('../../../../config', () => ({
  identityProviderManagementUrlHelsinki: 'https://test-url',
  helsinkiAccountAMR: 'helusername-test',
}));

jest.mock('../../../../auth/useProfile', () => () => ({
  profile: {
    amr: 'helusername-test',
    auth_time: 1593431180,
    email: 'email@email.com',
    email_verified: false,
    family_name: 'Betty',
    given_name: 'Smith',
    name: 'Betty Smith',
    nickname: 'Betty',
    sub: 'uuidvalue',
  },
}));

describe('<ProfileInformationAuthenticationSourceBackLink />', () => {
  const defaultProps = {};
  const getWrapper = props =>
    mount(
      <ProfileInformationAuthenticationSourceBackLink
        {...defaultProps}
        {...props}
      />
    );

  beforeAll(() => {
    process.env.REACT_APP_HELSINKI_ACCOUNT_AMR = 'helusername-test';
  });

  afterAll(() => {
    process.env.REACT_APP_HELSINKI_ACCOUNT_AMR = 'helusername';
  });

  it('should render helsinki account link as expected based on config', () => {
    const wrapper = getWrapper();

    expect(enzymeToJson(wrapper)).toMatchSnapshot();
  });
});
