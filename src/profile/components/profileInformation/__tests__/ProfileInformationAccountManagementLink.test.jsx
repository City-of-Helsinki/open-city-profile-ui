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
    // eslint-disable-next-line @typescript-eslint/camelcase
    auth_time: 1593431180,
    email: 'email@email.com',
    // eslint-disable-next-line @typescript-eslint/camelcase
    email_verified: false,
    // eslint-disable-next-line @typescript-eslint/camelcase
    family_name: 'Betty',
    // eslint-disable-next-line @typescript-eslint/camelcase
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
