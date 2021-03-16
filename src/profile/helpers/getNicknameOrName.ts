import { ProfileRoot } from '../../graphql/typings';

export default function getNicknameOrName(data?: ProfileRoot): string {
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
