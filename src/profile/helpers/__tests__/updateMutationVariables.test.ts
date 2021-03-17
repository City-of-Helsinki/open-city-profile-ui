import { UpdateMyProfileVariables } from '../../../graphql/generatedTypes';
import {
  AddressType,
  EmailType,
  Language,
  PhoneType,
  AddressNode,
  EmailNode,
  PhoneNode,
} from '../../../graphql/typings';
import { updateMutationVariables } from '../updateMutationVariables';
import { getMyProfile } from '../../../common/test/myProfileMocking';
import { FormValues } from '../mutationEditor';

type ClonedObject = Record<string, unknown>;
type ReplacerFunction = (key: string, value: unknown) => unknown;

const myProfile = getMyProfile();

const JSONReplacer: ReplacerFunction = (
  key: string,
  value: unknown
): unknown => {
  if (key === 'id' && value === '') {
    return undefined;
  }
  return key.indexOf('_') === 0 || key === 'id' ? undefined : value;
};

const cloneObject = <T>(source: T, replacer?: ReplacerFunction): T =>
  JSON.parse(JSON.stringify(source, replacer));

const cloneAndReplace = <T>(source: T): ClonedObject =>
  cloneObject<T>(source, JSONReplacer) as ClonedObject;

const getAddressAsComparisonObject = (
  source: AddressNode
): Partial<AddressNode> => {
  const clone = cloneAndReplace<AddressNode>(source);
  if (source.id) {
    clone.id = source.id;
  }
  return clone;
};

const getPhoneAsComparisonObject = (source: PhoneNode): Partial<PhoneNode> => {
  const clone = cloneAndReplace<PhoneNode>(source);
  if (source.id) {
    clone.id = source.id;
  }
  return clone;
};

const getEmailAsComparisonObject = (source: EmailNode): Partial<EmailNode> => {
  const clone = cloneAndReplace<EmailNode>(source);
  if (source.email && source.id) {
    clone.id = source.id;
  }
  return clone;
};

const primaryEmail = cloneObject(
  myProfile.myProfile?.primaryEmail as EmailNode
);
const updatedSecondaryEmail = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ...cloneObject(myProfile.myProfile.emails.edges[0].node),
  ...{ email: 'kolmas@testi.fi' },
} as EmailNode;
const newEmail = {
  email: 'toinen@testi.fi',
  primary: false,
  emailType: EmailType.OTHER,
  id: '',
  __typename: 'EmailNode',
} as EmailNode;

const primaryPhone = cloneObject(
  myProfile.myProfile?.primaryPhone as PhoneNode
);
const updatedSecondaryPhone = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ...cloneObject(myProfile.myProfile?.phones.edges[0].node),
  ...{ phone: '0505472568' },
} as PhoneNode;
const newPhone = {
  id: '',
  phone: '0507654321',
  phoneType: PhoneType.OTHER,
  primary: false,
  __typename: 'PhoneNode',
} as PhoneNode;

const primaryAddress = cloneObject(
  myProfile.myProfile?.primaryAddress as AddressNode
);
const updatedSecondaryAddress = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ...cloneObject(myProfile.myProfile?.addresses.edges[0].node as AddressNode),
  ...{ address: 'Testaajaraitti' },
} as AddressNode;
const newAddress = {
  id: '',
  address: 'Testikatu 66',
  city: 'Helsinki',
  countryCode: 'FI',
  postalCode: '00000',
  primary: false,
  addressType: AddressType.OTHER,
  __typename: 'AddressNode',
} as AddressNode;

const formValues: FormValues = {
  firstName: 'Teemu',
  nickname: 'Lempinimi',
  lastName: 'Testaaja',
  profileLanguage: Language.FINNISH,
  primaryEmail,
  emails: [primaryEmail, newEmail, updatedSecondaryEmail],
  phones: [primaryPhone, newPhone, updatedSecondaryPhone],
  primaryPhone,
  addresses: [primaryAddress, newAddress, updatedSecondaryAddress],
  primaryAddress,
};

test('add arrays are formed correctly with new data', () => {
  const variables: UpdateMyProfileVariables = updateMutationVariables(
    formValues,
    myProfile
  );

  expect(variables.input.profile.addAddresses).toEqual([
    getAddressAsComparisonObject(newAddress),
  ]);

  expect(variables.input.profile.addEmails).toEqual([
    getEmailAsComparisonObject(newEmail),
  ]);

  expect(variables.input.profile.addPhones).toEqual([
    getPhoneAsComparisonObject(newPhone),
  ]);
});

test('add arrays are empty when using existing data', () => {
  const variables: UpdateMyProfileVariables = updateMutationVariables(
    {
      ...formValues,
      addresses: [primaryAddress, updatedSecondaryAddress],
      emails: [primaryEmail, updatedSecondaryEmail],
      phones: [primaryPhone, updatedSecondaryPhone],
    },
    myProfile
  );

  expect(variables.input.profile.addPhones).toEqual([]);
  expect(variables.input.profile.addEmails).toEqual([]);
  expect(variables.input.profile.addAddresses).toEqual([]);
});

test('update arrays are formed correctly with updated data objects', () => {
  const variables: UpdateMyProfileVariables = updateMutationVariables(
    formValues,
    myProfile
  );
  expect(variables.input.profile.updateAddresses).toEqual([
    getAddressAsComparisonObject(updatedSecondaryAddress),
  ]);
  expect(variables.input.profile.updateEmails).toEqual([
    getEmailAsComparisonObject(updatedSecondaryEmail),
  ]);
  expect(variables.input.profile.updatePhones).toEqual([
    getPhoneAsComparisonObject(updatedSecondaryPhone),
  ]);
});

test('update arrays are empty when using unchanged or new data', () => {
  const variables: UpdateMyProfileVariables = updateMutationVariables(
    {
      ...formValues,
      addresses: [primaryAddress, newAddress],
      emails: [primaryEmail, newEmail],
      phones: [primaryPhone, newPhone],
    },
    myProfile
  );

  expect(variables.input.profile.updateAddresses).toEqual([]);
  expect(variables.input.profile.updateEmails).toEqual([]);
  expect(variables.input.profile.updatePhones).toEqual([]);
});

test('remove arrays are formed correctly with existing data', () => {
  const variables: UpdateMyProfileVariables = updateMutationVariables(
    { ...formValues, addresses: [], emails: [], phones: [] },
    myProfile
  );

  expect(variables.input.profile.removeAddresses).toEqual([
    primaryAddress.id,
    updatedSecondaryAddress.id,
  ]);
  expect(variables.input.profile.removeEmails).toEqual([
    primaryEmail.id,
    updatedSecondaryEmail.id,
  ]);
  expect(variables.input.profile.removePhones).toEqual([
    primaryPhone.id,
    updatedSecondaryPhone.id,
  ]);
});

test('remove arrays do not exists when data is not changed', () => {
  const variables: UpdateMyProfileVariables = updateMutationVariables(
    formValues,
    myProfile
  );

  expect(variables.input.profile.removeAddresses).toBeFalsy();
  expect(variables.input.profile.removeEmails).toBeFalsy();
  expect(variables.input.profile.removePhones).toBeFalsy();
});
