import React from 'react';
import { Dropdown, DropdownProps } from 'hds-react';
import { Field, FieldProps } from 'formik';

import { Language } from '../../graphql/generatedTypes';

type Props = {
  name: string;
  default: string | Language;
} & DropdownProps;

export type OptionType = {
  value: string;
  label: string;
};

export type HdsOptionType = {
  //eslint-disable-next-line
  [key: string]: any;
};

function FormikDropdown(props: Props) {
  // HDS Dropdown expects default value to be an object. Find correct option object from array.
  const getSelectDefault = (options: OptionType[], value?: string) => {
    return options.find((option: OptionType) => option.value === value);
  };

  return (
    <Field name={props.name}>
      {(fieldProps: FieldProps<string>) => (
        <Dropdown
          {...fieldProps.field}
          {...props}
          defaultValue={getSelectDefault(
            props.options as OptionType[],
            props.default
          )}
          multiselect={false}
        />
      )}
    </Field>
  );
}

export default FormikDropdown;
