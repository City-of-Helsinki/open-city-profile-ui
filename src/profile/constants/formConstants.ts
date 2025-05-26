import { AddressNode, EmailNode, PhoneNode, AddressType, EmailType, PhoneType } from '../../graphql/typings';

type FormConstants = {
  EMPTY_VALUES: {
    [index: string]: AddressNode | EmailNode | PhoneNode;
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
