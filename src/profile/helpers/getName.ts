import { MyProfileQuery } from '../../graphql/generatedTypes';

export default function getName(data: MyProfileQuery): string {
  if (data.myProfile) {
    const profile = data.myProfile;
    return `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
  }
  return '';
}
