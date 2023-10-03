import { ComputedRef, Ref } from 'vue';
import { AllRulesDeclarations, ShibieFormPropertyType, ShibiePartialValidationTree } from '.';

export interface Shibie<
  TState extends Record<string, any>,
  TRules extends ShibiePartialValidationTree<TState>,
> extends ShibieCommonStatus<TState> {
  fields: {
    [TKey in keyof TRules]: ShibieFieldStatus<NonNullable<TRules[TKey]>, TState, TKey>;
  };
}

export interface ShibieFieldStatus<
  TRules extends ShibieFormPropertyType<any, AllRulesDeclarations>,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
> extends ShibieCommonStatus<TState[TKey]> {
  $rules: {
    [TKey in keyof TRules]: ShibieRuleStatus;
  };
}

export interface ShibieCommonStatus<TValue = any> {
  $valid: boolean;
  $invalid: boolean;
  $dirty: boolean;
  $pending: boolean;
  $value: TValue;
  $touch: () => void;
  $reset: () => void;
}

export interface ShibieRuleStatus {
  $type: string;
  $message: string;
  $validator: (value: any, ...args: any[]) => boolean | Promise<boolean>;
  $active: boolean;
  $valid: boolean;
}
