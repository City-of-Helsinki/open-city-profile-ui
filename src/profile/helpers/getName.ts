import { ProfileRoot } from '../../graphql/typings';

export default function getName(data: ProfileRoot): string {
  if (data.myProfile) {
    const profile = data.myProfile;
    return `${profile.firstName ?? ''} ${profile.lastName ?? ''}`.trim();
  }
  return '';
}
