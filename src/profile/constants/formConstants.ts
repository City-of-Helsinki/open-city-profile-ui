import {
  MyProfileQuery_myProfile_addresses_edges_node as Address,
  MyProfileQuery_myProfile_emails_edges_node as Email,
  AddressType,
  EmailType,
} from '../../graphql/generatedTypes';

type FormConstants = {
  EMPTY_VALUES: {
    [index: string]: Address | Email;
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
  },
};
