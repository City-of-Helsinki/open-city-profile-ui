import { NameQuery } from '../graphql/__generated__/NameQuery';

export default function getNicknameOrName(data?: NameQuery) {
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
