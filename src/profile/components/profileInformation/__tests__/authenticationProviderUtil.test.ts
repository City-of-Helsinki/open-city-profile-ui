import { LoginMethodType } from '../../../../graphql/typings';
import { getMyProfile } from '../../../../common/test/myProfileMocking';
import { MyLoginMethodNodeFragment } from '../../../../graphql/generatedTypes';
import {
  formatDate,
  requiresStrongAuthenticationForHybrid,
} from '../authenticationProviderUtil';

describe('formatDate', () => {
  it('should return formatted date', () => {
    const dateString = '2025-01-17T12:49:12.518000+00:00';
    expect(formatDate(dateString)).toEqual('17.1.2025');
  });
});

describe('requiresStrongAuthenticationForHybrid', () => {
  const suomiFiLoginMethod: MyLoginMethodNodeFragment = {
    __typename: 'LoginMethodNode',
    method: LoginMethodType.SUOMI_FI,
    createdAt: '2025-01-24T11:27:45.637Z',
    credentialId: null,
    userLabel: null,
  };

  const getHybridProfile = () => {
    const profile = getMyProfile();
    if (!profile.myProfile) {
      return profile;
    }

    return {
      ...profile,
      myProfile: {
        ...profile.myProfile,
        availableLoginMethods: [
          ...(profile.myProfile.availableLoginMethods || []),
          suomiFiLoginMethod,
        ],
      },
    };
  };

  it('returns true for hybrid account when current session is weakly authenticated', () => {
    expect(
      requiresStrongAuthenticationForHybrid(getHybridProfile(), [
        'helsinki_tunnus',
      ])
    ).toBe(true);
  });

  it('returns false for hybrid account when current session is strongly authenticated', () => {
    expect(
      requiresStrongAuthenticationForHybrid(getHybridProfile(), ['suomi_fi'])
    ).toBe(false);
  });

  it('returns false when account is not hybrid', () => {
    expect(
      requiresStrongAuthenticationForHybrid(getMyProfile(), ['helsinki_tunnus'])
    ).toBe(false);
  });
});
