import getEmailsFromNode from '../getEmailsFromNode';
import { getMyProfile, getProfileDataWithoutSomeNodes } from '../../../common/test/myProfileMocking';
import { ProfileData, ProfileRoot } from '../../../graphql/typings';

it('returns correct array of emails', () => {
  const profile = getMyProfile();
  const emailsPickedByDefault = getEmailsFromNode(getMyProfile());
  expect(emailsPickedByDefault).toHaveLength(1);
  expect(emailsPickedByDefault).toEqual([profile.myProfile?.emails?.edges[1]?.node]);
  const emailsWithKeptPrimary = getEmailsFromNode(getMyProfile(), true);
  expect(emailsWithKeptPrimary).toHaveLength(2);
  expect(emailsWithKeptPrimary).toEqual(profile.myProfile?.emails?.edges.map((edge) => edge?.node));
});

it('returns an empty array when profile has no emails', () => {
  const emptyEmailProfile = {
    myProfile: getProfileDataWithoutSomeNodes({
      dataType: 'emails',
      profileData: getMyProfile().myProfile as ProfileData,
      noNodes: true,
    }),
  } as ProfileRoot;

  const emails = getEmailsFromNode(emptyEmailProfile);
  expect(emails).toEqual([]);
});
