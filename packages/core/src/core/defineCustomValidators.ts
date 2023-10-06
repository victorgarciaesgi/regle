import { AllRulesDeclarations, CustomRulesDeclarationTree } from '../types';
import { createUseRegleComposable } from './useRegle';

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
  const useRegle = createUseRegleComposable<TCustomRules>(customRules);

  return {
    useRegle,
  };
}
