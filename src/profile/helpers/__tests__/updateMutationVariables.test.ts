import _ from 'lodash';

import {
  AddressType,
  EmailType,
  Language,
  UpdateMyProfileMutationVariables,
  MyProfileQueryAddressesEdgesNodeFragment as Address,
  MyProfileQueryEmailsEdgesNodeFragment as Email,
  MyProfileQueryPhonesEdgesNodeFragment as Phone,
  PhoneType,
} from '../../../graphql/generatedTypes';
import { updateMutationVariables } from '../updateMutationVariables';
import { getMyProfile } from '../../../common/test/myProfileMocking';
import { FormValues } from '../editData';

type ClonedObject = Record<string, unknown>;
type ReplacerFunction = (key: string, value: unknown) => unknown;

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

const getAddressAsComparisonObject = (source: Address): Partial<Address> => {
  const clone = cloneAndReplace<Address>(source);
  if (source.id) {
    clone.id = source.id;
  }
  return clone;
};

const getPhoneAsComparisonObject = (source: Phone): Partial<Phone> => {
  const clone = cloneAndReplace<Phone>(source);
  if (source.id) {
    clone.id = source.id;
  }
  return clone;
};

const getEmailAsComparisonObject = (source: Email): Partial<Email> => {
  const clone = cloneAndReplace<Email>(source);
  if (source.email && source.id) {
    clone.id = source.id;
  }
  return clone;
};

const myProfile = getMyProfile();
const primaryEmail = cloneObject(myProfile.myProfile?.primaryEmail as Email);
const updatedSecondaryEmail = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ...cloneObject(myProfile.myProfile.emails.edges[1].node),
  ...{ email: 'kolmas@testi.fi' },
} as Email;
const newEmail = {
  email: 'toinen@testi.fi',
  primary: false,
  emailType: EmailType.OTHER,
  id: '',
  __typename: 'EmailNode',
} as Email;

const primaryPhone = cloneObject(myProfile.myProfile?.primaryPhone as Phone);
const updatedSecondaryPhone = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ...cloneObject(myProfile.myProfile?.phones.edges[1].node),
  ...{ phone: '0505472568' },
} as Phone;
const newPhone = {
  id: '',
  phone: '0507654321',
  phoneType: PhoneType.OTHER,
  primary: false,
  __typename: 'PhoneNode',
} as Phone;

const primaryAddress = cloneObject(
  myProfile.myProfile?.primaryAddress as Address
);
const updatedSecondaryAddress = {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore
  ...cloneObject(myProfile.myProfile?.addresses.edges[1].node as Address),
  ...{ address: 'Testaajaraitti' },
} as Address;
const newAddress = {
  id: '',
  address: 'Testikatu 66',
  city: 'Helsinki',
  countryCode: 'FI',
  postalCode: '00000',
  primary: false,
  addressType: AddressType.OTHER,
  __typename: 'AddressNode',
} as Address;

type FormParts = (keyof FormValues)[];

const multiNodeFormParts: FormParts = [
  'primaryAddress',
  'primaryEmail',
  'primaryPhone',
  'phones',
  'emails',
  'addresses',
];

const nameFormParts: FormParts = ['firstName', 'nickname', 'lastName'];

const getFormValues = (parts: FormParts): Partial<FormValues> => {
  const myProfileNamesAndLanguage = _.pick(myProfile.myProfile, [
    ...nameFormParts,
    'language',
  ]);
  const formValues = {
    ...myProfileNamesAndLanguage,
    primaryEmail,
    emails: [primaryEmail, newEmail, updatedSecondaryEmail],
    phones: [primaryPhone, newPhone, updatedSecondaryPhone],
    primaryPhone,
    addresses: [primaryAddress, newAddress, updatedSecondaryAddress],
    primaryAddress,
  };
  return _.pick(formValues, parts) as Partial<FormValues>;
};

describe('Update variables for basic data (names) are formed correctly', () => {
  let formValues: Partial<FormValues>;

  beforeEach(() => {
    formValues = getFormValues(nameFormParts);
  });

  it('Variables in update data match formValues even if not changed', () => {
    const variables: UpdateMyProfileMutationVariables = updateMutationVariables(
      formValues,
      myProfile
    );
    expect(variables.input.profile).toEqual(formValues);
  });

  it('Variables in update data match changes', () => {
    const newData = {
      firstName: 'test-firstName',
      nickname: 'test-nickname',
      lastName: 'test-lastName',
    };
    const variables: UpdateMyProfileMutationVariables = updateMutationVariables(
      newData,
      myProfile
    );
    expect(variables.input.profile).toEqual(newData);

    const partialData1 = {
      firstName: 'test-firstName',
    };
    expect(
      updateMutationVariables(partialData1, myProfile).input.profile
    ).toEqual(partialData1);

    const partialData2 = {
      nickname: 'test-nickname',
      lastName: 'test-lastName',
    };
    expect(
      updateMutationVariables(partialData2, myProfile).input.profile
    ).toEqual(partialData2);
  });
});

describe('Update variable for language is formed correctly', () => {
  let formValues: Partial<FormValues>;

  beforeEach(() => {
    formValues = getFormValues(['language']);
  });

  it('Variable in update data match formValues even if not changed', () => {
    const variables: UpdateMyProfileMutationVariables = updateMutationVariables(
      formValues,
      myProfile
    );
    expect(variables.input.profile).toEqual(formValues);
  });

  it('Variables in update data match changes', () => {
    const newData = {
      language: Language.SWEDISH,
    };
    const variables: UpdateMyProfileMutationVariables = updateMutationVariables(
      newData,
      myProfile
    );
    expect(variables.input.profile).toEqual(newData);
  });
});

describe('MultiItemArrays are formed correctly', () => {
  let formValues: Partial<FormValues>;

  beforeEach(() => {
    formValues = getFormValues(multiNodeFormParts);
  });

  it('Names and language do not exist in update variables when not in formValues', () => {
    const variables: UpdateMyProfileMutationVariables = updateMutationVariables(
      formValues,
      myProfile
    );
    expect(variables.input.profile.firstName).toBeUndefined();
    expect(variables.input.profile.nickname).toBeUndefined();
    expect(variables.input.profile.lastName).toBeUndefined();
    expect(variables.input.profile.language).toBeUndefined();
  });

  it('add arrays are formed correctly with new data', () => {
    const variables: UpdateMyProfileMutationVariables = updateMutationVariables(
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

  it('add arrays are empty when using existing data', () => {
    const variables: UpdateMyProfileMutationVariables = updateMutationVariables(
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

  it('update arrays are formed correctly with updated data objects', () => {
    const variables: UpdateMyProfileMutationVariables = updateMutationVariables(
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

  it('update arrays are empty when using unchanged or new data', () => {
    const variables: UpdateMyProfileMutationVariables = updateMutationVariables(
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

  it('remove arrays are formed correctly with existing data', () => {
    const variables: UpdateMyProfileMutationVariables = updateMutationVariables(
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

  it('remove arrays do not exists when data is not changed', () => {
    const variables: UpdateMyProfileMutationVariables = updateMutationVariables(
      formValues,
      myProfile
    );

    expect(variables.input.profile.removeAddresses).toBeFalsy();
    expect(variables.input.profile.removeEmails).toBeFalsy();
    expect(variables.input.profile.removePhones).toBeFalsy();
  });
});

describe('Full profile can be updated ', () => {
  let formValues: Partial<FormValues>;

  beforeEach(() => {
    formValues = getFormValues([
      ...multiNodeFormParts,
      ...nameFormParts,
      'language',
    ]);
  });

  it('Variables include all formValues or corresponding update property', () => {
    const variables: UpdateMyProfileMutationVariables = updateMutationVariables(
      formValues,
      myProfile
    );
    expect(variables.input.profile.firstName).toBeDefined();
    expect(variables.input.profile.nickname).toBeDefined();
    expect(variables.input.profile.lastName).toBeDefined();
    expect(variables.input.profile.language).toBeDefined();
    expect(variables.input.profile.updateAddresses).toBeDefined();
    expect(variables.input.profile.updateEmails).toBeDefined();
    expect(variables.input.profile.updatePhones).toBeDefined();
  });

  it('Empty formValues are also handled and return empty mutation variables', () => {
    expect(updateMutationVariables({}, myProfile)).toEqual({
      input: { profile: {} },
    });
  });
});
