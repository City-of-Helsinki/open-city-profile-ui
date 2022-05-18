import getPhonesFromNode from '../getPhonesFromNode';
import {
  getMyProfile,
  getProfileDataWithoutSomeNodes,
} from '../../../common/test/myProfileMocking';
import { ProfileData, ProfileRoot } from '../../../graphql/typings';

it('returns correct array of phones', () => {
  const profile = getMyProfile();
  const phonesPickedByDefault = getPhonesFromNode(getMyProfile());
  expect(phonesPickedByDefault).toHaveLength(1);
  expect(phonesPickedByDefault).toEqual([
    profile.myProfile?.phones?.edges[1]?.node,
  ]);
  const phonesWithKeptPrimary = getPhonesFromNode(getMyProfile(), true);
  expect(phonesWithKeptPrimary).toHaveLength(2);
  expect(phonesWithKeptPrimary).toEqual(
    profile.myProfile?.phones?.edges.map(edge => edge?.node)
  );
});

it('returns an empty array when profile has no phone numbers', () => {
  const emptyEmailProfile = {
    myProfile: getProfileDataWithoutSomeNodes({
      dataType: 'phones',
      profileData: getMyProfile().myProfile as ProfileData,
      noNodes: true,
    }),
  } as ProfileRoot;

  const phones = getPhonesFromNode(emptyEmailProfile);
  expect(phones).toEqual([]);
});
