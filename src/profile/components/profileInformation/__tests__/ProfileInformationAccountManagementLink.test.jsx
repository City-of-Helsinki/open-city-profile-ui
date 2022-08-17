import React from 'react';
import { mount } from 'enzyme';
import enzymeToJson from 'enzyme-to-json';

import AuthenticationProviderInformation from '../AuthenticationProviderInformation';
import { mockUserCreator } from '../../../../common/test/userMocking';

let mockCurrentAmr;
const helsinkiAccountAMR = 'helusername-test';

jest.mock('../../../../config', () => ({
  helsinkiAccountAMR,
}));

jest.mock('../../../../auth/useProfile', () => () => mockUserCreator());

jest.mock('../authenticationProviderUtil', () => ({
  ...jest.requireActual('../authenticationProviderUtil'),
  getAmrStatic: () => mockCurrentAmr,
}));

describe('<ProfileInformationAuthenticationSourceBackLink /> ', () => {
  const defaultProps = {};
  const getWrapper = props =>
    mount(<AuthenticationProviderInformation {...defaultProps} {...props} />);
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
