import { createRule } from '.';
import { maxLength } from '..';
import { withMessage } from '../helpers';
import { AllRulesDeclarations } from '../types';
import { createUseFormComposable } from './useForm';

/**
 * Root function that allows you to define project-wise all your custom validators or overwrite default ones
 *
 * It will return utility functions that let you build type-safe forms
 *
 * @param customRules
 */
export function defineCustomValidators<TCustomRules extends Partial<AllRulesDeclarations>>(
  customRules: () => TCustomRules
) {
  const useForm = createUseFormComposable<TCustomRules>(customRules);

  return {
    useForm,
  };
}

defineCustomValidators(() => ({
  foo: createRule({ message: 'bar', validator: (value) => value, type: 'foo' }),
  maxLength: withMessage(maxLength, (value, count) => `foo ${count}`),
}));
