import {
  MyProfileQuery,
  MyProfileQuery_myProfile_verifiedPersonalInformation as VerifiedPersonalInformation,
} from '../../graphql/generatedTypes';

function getVerifiedPersonalInformation(
  myProfileQuery: MyProfileQuery | undefined
): VerifiedPersonalInformation | null | undefined {
  return (
    myProfileQuery &&
    myProfileQuery.myProfile &&
    myProfileQuery.myProfile.verifiedPersonalInformation
  );
}

export default getVerifiedPersonalInformation;
