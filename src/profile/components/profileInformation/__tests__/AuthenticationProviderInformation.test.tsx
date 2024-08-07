import React from 'react';
import { render } from '@testing-library/react';

import AuthenticationProviderInformation from '../AuthenticationProviderInformation';
import { mockProfileCreator } from '../../../../common/test/userMocking';
import * as useProfile from '../../../../auth/useProfile';
import * as authenticationProviderUtil from '../authenticationProviderUtil';

const helsinkiAccountAMR = 'helsinki_tunnus-test';

vi.spyOn(useProfile, 'default').mockImplementation(
  () =>
    (({
      profile: mockProfileCreator(),
    } as unknown) as useProfile.ProfileState)
);

describe('<AuthenticationProviderInformation /> ', () => {
  const defaultProps = {};

  const getWrapper = () =>
    render(<AuthenticationProviderInformation {...defaultProps} />);

  describe('renders correctly when AMR is helsinkiAccountAMR', () => {
    beforeAll(() => {
      window._env_.REACT_APP_HELSINKI_ACCOUNT_AMR = helsinkiAccountAMR;
    });

    afterAll(() => {
      window._env_.REACT_APP_HELSINKI_ACCOUNT_AMR = 'helsinki_tunnus';
    });

    it('should render helsinki account information as expected based on config', () => {
      vi.spyOn(authenticationProviderUtil, 'getAmrStatic').mockImplementation(
        () => 'helsinkiAccount' as useProfile.AMRStatic
      );

      const { container } = getWrapper();
      expect(container).toMatchSnapshot();
    });
  });
  describe('renders correctly when AMR is tunnistusSuomifiAMR', () => {
    it('should render suomi.fi information as expected based on config', () => {
      vi.spyOn(authenticationProviderUtil, 'getAmrStatic').mockImplementation(
        () => 'tunnistusSuomifi' as useProfile.AMRStatic
      );

      const { container } = getWrapper();
      expect(container).toMatchSnapshot();
    });
  });

  describe('renders correctly according to Login method', () => {
    it('should render change password button when password is used', () => {
      vi.spyOn(
        authenticationProviderUtil,
        'hasPasswordLogin'
      ).mockImplementation(() => true);

      const { container, getByTestId } = getWrapper();
      expect(getByTestId('change-password-button')).toBeVisible();
      expect(container).toMatchSnapshot();
    });

    it('should not render change password button when password is not used', () => {
      vi.spyOn(
        authenticationProviderUtil,
        'hasPasswordLogin'
      ).mockImplementation(() => false);

      const { container, queryByTestId } = getWrapper();
      expect(queryByTestId('change-password-button')).not.toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });
  });
});
