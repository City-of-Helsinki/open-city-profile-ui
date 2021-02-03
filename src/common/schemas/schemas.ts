import * as yup from 'yup';
import validator from 'validator';

// Editproform
const maxLengthValidation = 'validation.maxLength';

export const addressSchema = yup.object().shape({
  address: yup
    .string()
    .required('validation.address')
    .max(128, maxLengthValidation),
  city: yup
    .string()
    .required('validation.city')
    .max(64, maxLengthValidation),
  postalCode: yup
    .string()
    .required('validation.postalCode')
    .max(5, maxLengthValidation),
});

export const basicDataSchema = yup.object().shape({
  firstName: yup
    .string()
    .required('validation.firstName')
    .max(128, maxLengthValidation),
  nickname: yup.string().max(64, maxLengthValidation),
  lastName: yup
    .string()
    .required('validation.lastName')
    .max(5, maxLengthValidation),
  addresses: yup.array().of(addressSchema),
});

export const phoneSchema = yup.object().shape({
  value: yup
    .string()
    .required('validation.phone')
    .min(6, 'validation.phoneMin')
    .max(255, 'validation.maxLength'),
});

export const emailSchema = yup.object().shape({
  value: yup.mixed().test('isValidEmail', 'validation.email', function() {
    return this.parent?.value ? validator.isEmail(this.parent?.value) : false;
  }),
});
