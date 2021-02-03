import { MyProfileQuery } from '../../graphql/generatedTypes';

export default function getNames(
  data: MyProfileQuery
): { firstName: string; nickName: string; lastName: string } {
  if (data.myProfile) {
    const profile = data.myProfile;
    return {
      firstName: profile.firstName || '',
      nickName: profile.nickname || '',
      lastName: profile.lastName || '',
    };
  }
  return {
    firstName: '',
    nickName: '',
    lastName: '',
  };
}
