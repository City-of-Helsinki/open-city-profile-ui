import { MyProfileQuery } from '../graphql/__generated__/MyProfileQuery';

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
