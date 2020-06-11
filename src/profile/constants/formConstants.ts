import {
  AddressType,
  EmailType,
  MyProfileQuery_myProfile_phones_edges_node as Phone,
  MyProfileQuery_myProfile_addresses_edges_node as Address,
  MyProfileQuery_myProfile_emails_edges_node as Email,
  PhoneType,
} from '../../graphql/generatedTypes';

type FormConstants = {
  EMPTY_VALUES: {
    [index: string]: Address | Email | Phone;
  };
};

export const formConstants: FormConstants = {
  EMPTY_VALUES: {
    addresses: Object.freeze({
      address: '',
      countryCode: 'FI',
      city: '',
      postalCode: '',
      primary: false,
      id: '',
      addressType: AddressType.OTHER,
      __typename: 'AddressNode',
    }),
    emails: Object.freeze({
      email: '',
      emailType: EmailType.OTHER,
      primary: false,
      id: '',
      __typename: 'EmailNode',
    }),
    phones: Object.freeze({
      phone: '',
      id: '',
      phoneType: PhoneType.OTHER,
      primary: false,
      __typename: 'PhoneNode',
    }),
  },
};
