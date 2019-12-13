import { MyProfileQuery } from '../graphql/__generated__/MyProfileQuery';

export default function getName(data: MyProfileQuery) {
  if (data.myProfile) {
    const profile = data.myProfile;
    return `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
  }
  return '';
}
