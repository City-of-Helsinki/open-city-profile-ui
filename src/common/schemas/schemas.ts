import * as yup from 'yup';
import validator from 'validator';

type MessageWithOptions = {
  message: string;
  options?: Record<string, string>;
};

const maxLengthValidation = 'validation.maxLength';
const requiredValidation = 'validation.required';

export const setErrorMessageWithOptions = (
  messageWithOptions: MessageWithOptions
): string => {
  const { message, options } = messageWithOptions;
  if (!options) {
    return message;
  }
  const optionsString = new URLSearchParams(options).toString();
  return `${message}?${optionsString}`;
};

export const getErrorMessageWithOptions = (
  messageWithOptions: string
): MessageWithOptions => {
  const messageWithOptionsArray = messageWithOptions.split('?');
  const message = messageWithOptionsArray[0];
  const options = messageWithOptionsArray[1]
    ? Object.fromEntries(new URLSearchParams(messageWithOptionsArray[1]))
    : undefined;
  return { message, options };
};

const createMaxLengthMessage = (
  max: number,
  message = maxLengthValidation
): string =>
  setErrorMessageWithOptions({
    message,
    options: { max: String(max) },
  });

const createMinLengthMessage = (min: number, message: string): string =>
  setErrorMessageWithOptions({
    message,
    options: { min: String(min) },
  });

export const addressSchema = yup.object().shape({
  address: yup
    .string()
    .required(requiredValidation)
    .max(128, createMaxLengthMessage(128)),
  city: yup
    .string()
    .required(requiredValidation)
    .max(64, createMaxLengthMessage(64)),
  postalCode: yup
    .string()
    .required(requiredValidation)
    .max(5, createMaxLengthMessage(5)),
});

export const basicDataSchema = yup.object().shape({
  firstName: yup
    .string()
    .required(requiredValidation)
    .max(128, createMaxLengthMessage(128)),
  nickname: yup.string().max(64, createMaxLengthMessage(64)),
  lastName: yup
    .string()
    .required(requiredValidation)
    .max(255, createMaxLengthMessage(255)),
});

export const phoneSchema = yup.object().shape({
  value: yup
    .string()
    .required(requiredValidation)
    .min(6, createMinLengthMessage(6, 'validation.phoneMin'))
    .max(255, createMaxLengthMessage(255)),
});

export const emailSchema = yup.object().shape({
  value: yup.mixed().test('isValidEmail', 'validation.email', function() {
    return this.parent?.value ? validator.isEmail(this.parent?.value) : false;
  }),
});
