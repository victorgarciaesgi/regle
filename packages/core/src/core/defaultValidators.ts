import { CustomRulesDeclarationTree } from '../types';
import { maxLength, required, requiredIf } from '../validators';

export const defaultValidators = {
  maxLength,
  required,
  requiredIf,
} as const satisfies CustomRulesDeclarationTree;

export type DefaultValidators = typeof defaultValidators;
