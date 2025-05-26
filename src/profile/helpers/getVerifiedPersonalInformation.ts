import { ProfileRoot, VerifiedPersonalInformation } from '../../graphql/typings';

function getVerifiedPersonalInformation(
  myProfileQuery: ProfileRoot | undefined,
): VerifiedPersonalInformation | null | undefined {
  return myProfileQuery && myProfileQuery.myProfile && myProfileQuery.myProfile.verifiedPersonalInformation;
}

export default getVerifiedPersonalInformation;
