import React from 'react';
import { mount } from 'enzyme';
import enzymeToJson from 'enzyme-to-json';

import ProfileInformationAuthenticationSourceBackLink from '../ProfileInformationAccountManagementLink';

let mockCurrentAmr;
const helsinkiAccountAMR = 'helusername-test';

jest.mock('../../../../config', () => ({
  identityProviderManagementUrlHelsinki: 'https://test-url',
  identityProviderManagementUrlTunnistusSuomifi: 'https://test-url-suomif-fi',
  helsinkiAccountAMR,
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

jest.mock('../profileInformationAccountManagementLinkUtils', () => ({
  ...jest.requireActual('../profileInformationAccountManagementLinkUtils'),
  getAmr: () => mockCurrentAmr,
}));

describe('<ProfileInformationAuthenticationSourceBackLink /> ', () => {
  const defaultProps = {};
  const getWrapper = props =>
    mount(
      <ProfileInformationAuthenticationSourceBackLink
        {...defaultProps}
        {...props}
      />
    );
  describe('renders correctly when AMR is helsinkiAccountAMR', () => {
    beforeAll(() => {
      window._env_.REACT_APP_HELSINKI_ACCOUNT_AMR = helsinkiAccountAMR;
    });

    afterAll(() => {
      window._env_.REACT_APP_HELSINKI_ACCOUNT_AMR = 'helusername';
    });

    it('should render helsinki account link as expected based on config', () => {
      mockCurrentAmr = 'helsinkiAccount';
      const wrapper = getWrapper();
      expect(enzymeToJson(wrapper)).toMatchSnapshot();
    });
  });
  describe('renders correctly when AMR is tunnistusSuomifiAMR', () => {
    it('should render suomi.fi link as expected based on config', () => {
      mockCurrentAmr = 'tunnistusSuomifi';
      const wrapper = getWrapper();
      expect(enzymeToJson(wrapper)).toMatchSnapshot();
    });
  });
});
