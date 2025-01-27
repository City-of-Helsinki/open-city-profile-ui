import React from 'react';
import { render } from '@testing-library/react';

import AuthenticationProviderInformation from '../AuthenticationProviderInformation';
import { mockProfileCreator } from '../../../../common/test/userMocking';
import TestLoginProvider from '../../../../common/test/TestLoginProvider';
import * as useProfile from '../../../../auth/useProfile';
import * as authenticationProviderUtil from '../authenticationProviderUtil';
import { LoginMethodType } from '../../../../graphql/typings';
import { MyLoginMethodNodeFragment } from '../../../../graphql/generatedTypes';

const helsinkiAccountAMR = 'helsinki_tunnus-test';

vi.spyOn(useProfile, 'default').mockImplementation(
  () =>
    (({
      profile: mockProfileCreator(),
    } as unknown) as useProfile.ProfileState)
);

const mockLoginMethodNodeFragment: MyLoginMethodNodeFragment = {
  createdAt: '2023-01-01T00:00:00Z',
  method: LoginMethodType.OTP,
  __typename: 'LoginMethodNode',
  credentialId: '3837373',
  userLabel: 'foo',
};

describe('<AuthenticationProviderInformation /> ', () => {
  const defaultProps = {};

  const getWrapper = () =>
    render(
      <TestLoginProvider>
        <AuthenticationProviderInformation {...defaultProps} />
      </TestLoginProvider>
    );

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

  describe('renders correctly according to MFA setting', () => {
    it('should render enable MFA button', () => {
      vi.spyOn(
        authenticationProviderUtil,
        'hasPasswordLogin'
      ).mockImplementation(() => true);

      vi.spyOn(
        authenticationProviderUtil,
        'getMFALoginMethod'
      ).mockImplementation(() => undefined);

      const { container, queryByTestId } = getWrapper();
      expect(queryByTestId('enable-totp-button')).toBeVisible();
      expect(queryByTestId('disable-totp-button')).not.toBeInTheDocument();
      expect(container).toMatchSnapshot();
    });

    it('should render "disable MFA button" when MFA is already configured', () => {
      vi.spyOn(
        authenticationProviderUtil,
        'hasPasswordLogin'
      ).mockImplementation(() => true);

      vi.spyOn(
        authenticationProviderUtil,
        'getMFALoginMethod'
      ).mockImplementation(() => mockLoginMethodNodeFragment);

      const { container, queryByTestId } = getWrapper();
      expect(queryByTestId('enable-totp-button')).not.toBeInTheDocument();
      expect(queryByTestId('disable-totp-button')).toBeVisible();
      expect(container).toMatchSnapshot();
    });
  });
});
