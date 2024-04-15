export type FormField = {
  required: boolean;
  min?: number;
  max?: number;
  translationKey: string;
  comboBox?: boolean;
};

type DataType =
  | 'basic-data'
  | 'additional-information'
  | 'addresses'
  | 'phones'
  | 'emails';

export type DataTypeFormFields = Record<string, FormField>;
type FormFieldsByDataType = Record<DataType, Record<string, FormField>>;
export const formFieldsByDataType: FormFieldsByDataType = {
  addresses: {
    address: {
      required: true,
      max: 128,
      translationKey: 'profileForm.address',
    },
    postalCode: {
      required: true,
      max: 32,
      translationKey: 'profileForm.postalCode',
    },
    city: {
      required: true,
      max: 64,
      translationKey: 'profileForm.city',
    },
    countryCode: {
      required: true,
      comboBox: true,
      translationKey: 'profileForm.country',
    },
  },
  'basic-data': {
    firstName: {
      required: true,
      max: 150,
      translationKey: 'profileForm.firstName',
    },
    nickname: {
      required: false,
      max: 32,
      translationKey: 'profileForm.nickname',
    },
    lastName: {
      required: true,
      max: 150,
      translationKey: 'profileForm.lastName',
    },
  },
  phones: {
    number: {
      required: true,
      min: 5,
      max: 250,
      translationKey: 'profileForm.phone',
    },
    countryCallingCode: {
      required: true,
      comboBox: true,
      translationKey: 'profileForm.countryCallingCode',
    },
  },
  emails: {
    email: {
      required: true,
      min: 1,
      max: 255,
      translationKey: 'profileForm.email',
    },
  },
  'additional-information': {
    profileLanguage: {
      required: true,
      translationKey: 'profileForm.profileLanguage',
    },
  },
};

export const getFormFields = (dataType: DataType): DataTypeFormFields =>
  formFieldsByDataType[dataType];
