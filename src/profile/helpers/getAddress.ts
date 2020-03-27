import { MyProfileQuery } from '../../graphql/generatedTypes';

export default function getAddress(data: MyProfileQuery) {
  if (data.myProfile?.primaryAddress) {
    const address = data.myProfile.primaryAddress;
    return `${address.address}, ${address.city} ${address.postalCode}`;
  }
  return '';
}
