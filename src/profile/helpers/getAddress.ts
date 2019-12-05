import { MyProfileQuery } from '../graphql/__generated__/MyProfileQuery';

export default function getAddress(data: MyProfileQuery) {
  if (data.myProfile?.primaryAddress) {
    const address = data.myProfile.primaryAddress;
    return `${address.address}, ${address.city} ${address.postalCode}`;
  }
  return '';
}
