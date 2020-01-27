import { MyProfileQuery } from '../../graphql/generatedTypes';

export default function getNicknameOrName(data?: MyProfileQuery) {
  if (data && data.myProfile) {
    const myProfile = data.myProfile;
    if (myProfile.nickname) {
      return myProfile.nickname;
    }
    if (myProfile.firstName || myProfile.lastName) {
      return `${myProfile.firstName} ${myProfile.lastName}`;
    }
  }
  return '';
}
