import * as yup from 'yup';
import validator from 'validator';

import { formFieldsByDataType } from '../../profile/helpers/formProperties';

type MessageWithOptions = {
  message: string;
  options?: Record<string, string>;
};

const maxLengthValidation = 'validation.maxLength';
const requiredValidation = 'validation.required';

export const setErrorMessageWithOptions = (messageWithOptions: MessageWithOptions): string => {
  const { message, options } = messageWithOptions;
  if (!options) {
    return message;
  }
  const optionsString = new URLSearchParams(options).toString();
  return `${message}?${optionsString}`;
};

export const getErrorMessageWithOptions = (messageWithOptions: string): MessageWithOptions => {
  const messageWithOptionsArray = messageWithOptions.split('?');
  const message = messageWithOptionsArray[0];
  const options = messageWithOptionsArray[1]
    ? Object.fromEntries(new URLSearchParams(messageWithOptionsArray[1]))
    : undefined;
  return { message, options };
};

const createMaxLengthMessage = (max: number, message = maxLengthValidation): string =>
  setErrorMessageWithOptions({
    message,
    options: { max: String(max) },
  });

const createMinLengthMessage = (min: number, message: string): string =>
  setErrorMessageWithOptions({
    message,
    options: { min: String(min) },
  });

const addressesProperties = formFieldsByDataType['addresses'];
const addressMax = addressesProperties.address.max as number;
const cityMax = addressesProperties.city.max as number;
const postalCodeMax = addressesProperties.postalCode.max as number;
export const addressSchema = yup.object().shape({
  address: yup.string().required(requiredValidation).max(addressMax, createMaxLengthMessage(addressMax)),
  city: yup.string().required(requiredValidation).max(cityMax, createMaxLengthMessage(cityMax)),
  postalCode: yup.string().required(requiredValidation).max(postalCodeMax, createMaxLengthMessage(postalCodeMax)),
  countryCode: yup.string().required(requiredValidation),
});

const basicDataProperties = formFieldsByDataType['basic-data'];
const firstNameMax = basicDataProperties.firstName.max as number;
const nicknameMax = basicDataProperties.nickname.max as number;
const lastNameMax = basicDataProperties.lastName.max as number;
export const basicDataSchema = yup.object().shape({
  firstName: yup.string().required(requiredValidation).max(firstNameMax, createMaxLengthMessage(firstNameMax)),
  nickname: yup.string().max(nicknameMax, createMaxLengthMessage(nicknameMax)),
  lastName: yup.string().required(requiredValidation).max(lastNameMax, createMaxLengthMessage(lastNameMax)),
});

const phonesProperties = formFieldsByDataType['phones'];
const phonesMin = phonesProperties.number.min as number;
const phonesMax = phonesProperties.number.max as number;
const getDefaultPhoneSchema = () =>
  yup
    .string()
    .min(phonesMin, createMinLengthMessage(phonesMin, 'validation.phoneMin'))
    .max(phonesMax, createMaxLengthMessage(phonesMax))
    .test('numbersOnly', 'validation.numbersOnly', (value) => !/\D/g.test(value || ''));

export const phoneSchema = yup.object().shape({
  number: getDefaultPhoneSchema().required(requiredValidation),
  countryCallingCode: yup.string().required(requiredValidation),
});
export const createProfilePhoneSchema = yup.object().shape({
  number: getDefaultPhoneSchema(),
  countryCallingCode: yup
    .string()
    .test('isValidCountryCallingCode', 'validation.countryCallingCodeRequiredIfNumber', function () {
      if (this.parent.number) {
        return !!this.parent.countryCallingCode;
      }
      return true;
    }),
});
export const emailSchema = yup.object().shape({
  email: yup.mixed().test('isValidEmail', 'validation.email', function () {
    return this.parent?.email ? validator.isEmail(this.parent?.email) : false;
  }),
});
