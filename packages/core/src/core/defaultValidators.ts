import { CustomRulesDeclarationTree } from '../types';
import { maxLength, required, requiredIf } from '../validators';

export const defaultValidators = {
  maxLength,
  required,
} satisfies CustomRulesDeclarationTree;

export type DefaultValidators = typeof defaultValidators;
