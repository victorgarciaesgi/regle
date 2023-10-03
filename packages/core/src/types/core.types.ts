import type {
  AllRulesDeclarations,
  ShibieCollectionRuleDecl,
  ShibieFormPropertyType,
  ShibiePartialValidationTree,
  ShibieRuleDecl,
  ShibieRuleWithParamsDefinition,
} from '.';

export interface ShibieStatus<
  TState extends Record<string, any>,
  TRules extends ShibiePartialValidationTree<TState>,
> extends ShibieCommonStatus<TState> {
  fields: {
    [TKey in keyof TRules]: InferShibieStatusType<NonNullable<TRules[TKey]>, TState, TKey>;
  };
}

export type InferShibieStatusType<
  TRule extends ShibieCollectionRuleDecl | ShibieRuleDecl | ShibiePartialValidationTree<any>,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
> = TRule extends ShibieCollectionRuleDecl
  ? /* TODO collection  */ any
  : TRule extends ShibiePartialValidationTree<any>
  ? ShibieStatus<TState[TKey], TRule>
  : ShibieFieldStatus<TRule, TState, TKey>;

export interface ShibieFieldStatus<
  TRules extends ShibieFormPropertyType<any, AllRulesDeclarations>,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
> extends ShibieCommonStatus<TState[TKey]> {
  $rules: {
    [TKey in keyof TRules]: ShibieRuleStatus<
      TState[TKey],
      TRules[TKey] extends ShibieRuleWithParamsDefinition<any, infer TParams> ? TParams : []
    >;
  };
}

export type PossibleShibieFieldStatus = ShibieFieldStatus<any, any> | ShibieStatus<any, any>;

export interface ShibieCommonStatus<TValue = any> {
  $valid: boolean;
  $invalid: boolean;
  $dirty: boolean;
  $pending: boolean;
  $value: TValue;
  $touch: () => void;
  $reset: () => void;
}

export interface ShibieRuleStatus<TValue = any, TParams extends any[] = any[]> {
  $type: string;
  $message: string;
  $validator: (value: TValue, ...args: TParams[]) => boolean | Promise<boolean>;
  $active: boolean;
  $valid: boolean;
}
