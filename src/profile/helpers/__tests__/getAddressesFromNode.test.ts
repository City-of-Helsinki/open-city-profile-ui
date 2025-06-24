import getAddressesFromNode from '../getAddressesFromNode';
import {
  getMyProfile,
  getProfileDataWithoutSomeNodes,
} from '../../../common/test/myProfileMocking';
import { ProfileData, ProfileRoot } from '../../../graphql/typings';

it('returns correct array of addresses', () => {
  const profile = getMyProfile();
  const addressesPickedByDefault = getAddressesFromNode(getMyProfile());
  expect(addressesPickedByDefault).toHaveLength(1);
  expect(addressesPickedByDefault).toEqual([
    profile.myProfile?.addresses?.edges[1]?.node,
  ]);
  const addressesWithKeptPrimary = getAddressesFromNode(getMyProfile(), true);
  expect(addressesWithKeptPrimary).toHaveLength(2);
  expect(addressesWithKeptPrimary).toEqual(
    profile.myProfile?.addresses?.edges.map((edge) => edge?.node)
  );
});

it('returns an empty array when profile has no addresses', () => {
  const emptyAddressProfile = {
    myProfile: getProfileDataWithoutSomeNodes({
      dataType: 'addresses',
      profileData: getMyProfile().myProfile as ProfileData,
      noNodes: true,
    }),
  } as ProfileRoot;

  const addresses = getAddressesFromNode(emptyAddressProfile);
  expect(addresses).toEqual([]);
});
