import type { DefaultValidators } from '../../core/defaultValidators';
import type { RegleRuleRawInput } from './rule.definition.type';

export type CustomRulesDeclarationTree = {
  [x: string]: RegleRuleRawInput<any, any[], boolean, any> | undefined;
};

export type DefaultValidatorsTree = {
  [K in keyof DefaultValidators]: DefaultValidators[K] extends (...args: any[]) => infer U ? U : DefaultValidators[K];
};

export type DefaultValidatorsTreeOverrides = {
  [K in keyof DefaultValidators]: DefaultValidators[K] | ((...args: any[]) => DefaultValidators[K]);
};

/**
 * Extend this interface to declare your custom rules
 */
export interface CustomRules {}

export type ExtendedRulesDeclarations = CustomRulesDeclarationTree & DefaultValidatorsTree & CustomRules;
export type ExtendedRulesDeclarationsOverrides = CustomRulesDeclarationTree &
  DefaultValidatorsTreeOverrides &
  CustomRules;

/** @deprecated Use {@link ExtendedRulesDeclarations} instead */
export type AllRulesDeclarations = ExtendedRulesDeclarations;

// Shortcuts

/**
 * Extend this interface to declare your custom field properties
 */
export interface CustomFieldProperties {}

/**
 * Extend this interface to declare your custom nested properties
 */
export interface CustomNestedProperties {}

/**
 * Extend this interface to declare your custom collection properties
 */
export interface CustomCollectionProperties {}
