import type {
  AllRulesDeclarations,
  ShibieCollectionRuleDecl,
  ShibieCollectionRuleDefinition,
  ShibieFormPropertyType,
  ShibiePartialValidationTree,
  ShibieRuleDecl,
  ShibieRuleDefinition,
} from '.';

export interface ShibieStatus<
  TState extends Record<string, any>,
  TRules extends ShibiePartialValidationTree<TState>,
> extends ShibieCommonStatus<TState> {
  readonly $fields: {
    readonly [TKey in keyof TRules]: InferShibieStatusType<NonNullable<TRules[TKey]>, TState, TKey>;
  };
}

export type InferShibieStatusType<
  TRule extends ShibieCollectionRuleDecl | ShibieRuleDecl | ShibiePartialValidationTree<any>,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
> = TRule extends ShibieCollectionRuleDefinition<any, any>
  ? /* TODO collection  */ any
  : TRule extends ShibiePartialValidationTree<any>
  ? TState[TKey] extends Array<any>
    ? ShibieCommonStatus<TState[TKey]>
    : ShibieStatus<TState[TKey], TRule>
  : ShibieFieldStatus<TRule, TState, TKey>;

export interface ShibieFieldStatus<
  TRules extends ShibieFormPropertyType<any, AllRulesDeclarations>,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
> extends ShibieCommonStatus<TState[TKey]> {
  readonly $rules: {
    readonly [TRuleKey in keyof TRules]: ShibieRuleStatus<
      TState[TKey],
      TRules[TRuleKey] extends ShibieRuleDefinition<any, infer TParams> ? TParams : []
    >;
  };
}

export type PossibleShibieFieldStatus = ShibieFieldStatus<any, any> | ShibieStatus<any, any>;

export interface ShibieCommonStatus<TValue = any> {
  readonly $valid: boolean;
  readonly $invalid: boolean;
  readonly $dirty: boolean;
  readonly $anyDirty: boolean;
  readonly $pending: boolean;
  $value: TValue;
  readonly $error: boolean;
  $touch: () => void;
  $reset: () => void;
}

export interface ShibieSoftRuleStatus<TValue = any, TParams extends any[] = any[]> {
  readonly $type: string;
  readonly $message: string;
  readonly $validator: (value: TValue, ...args: TParams) => boolean | Promise<boolean>;
  readonly $active: boolean;
  readonly $valid: boolean;
  readonly $pending: boolean;
  readonly $params?: TParams;
}

export type ShibieRuleStatus<TValue = any, TParams extends any[] = any[]> = {
  readonly $type: string;
  readonly $message: string;
  readonly $validator: (value: TValue, ...args: TParams) => boolean | Promise<boolean>;
  readonly $active: boolean;
  readonly $valid: boolean;
  readonly $pending: boolean;
} & ([TParams] extends [[]]
  ? {}
  : {
      readonly $params: TParams;
    });
