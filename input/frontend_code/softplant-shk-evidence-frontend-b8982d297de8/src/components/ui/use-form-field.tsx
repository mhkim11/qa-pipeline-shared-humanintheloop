import React from 'react';

import { FieldError, FieldPath, FieldValues, useFormContext } from 'react-hook-form';

type TFormFieldContextValue<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = {
  name: TName;
};

type TFormItemContextValue = {
  id: string;
};

type TUseFormField = {
  invalid: boolean;
  isDirty: boolean;
  isTouched: boolean;
  isValidating: boolean;
  error?: FieldError;
  id: string;
  name: string;
  formItemId: string;
  formDescriptionId: string;
  formMessageId: string;
};

/**
 * * useFormField hook
 * @returns {TUseFormField} FormFieldContextValue
 */
export const useFormField = (): TUseFormField => {
  const FormFieldContext = React.createContext<TFormFieldContextValue>({} as TFormFieldContextValue);
  const FormItemContext = React.createContext<TFormItemContextValue>({} as TFormItemContextValue);

  const fieldContext = React.useContext(FormFieldContext);
  const itemContext = React.useContext(FormItemContext);
  const { getFieldState, formState } = useFormContext();

  const fieldState = getFieldState(fieldContext.name, formState);

  if (!fieldContext) {
    throw new Error('useFormField should be used within <FormField>');
  }

  const { id } = itemContext;

  return {
    id,
    name: fieldContext.name,
    formItemId: `${id}-form-item`,
    formDescriptionId: `${id}-form-item-description`,
    formMessageId: `${id}-form-item-message`,
    ...fieldState,
  };
};
