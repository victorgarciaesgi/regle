import type {
  AllRulesDeclarations,
  RegleCollectionRuleDecl,
  RegleCollectionRuleDefinition,
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleDecl,
  RegleRuleDefinition,
} from '..';

export interface RegleStatus<
  TState extends Record<string, any>,
  TRules extends ReglePartialValidationTree<TState>,
> extends RegleCommonStatus {
  readonly $fields: {
    readonly [TKey in keyof TRules]: InferRegleStatusType<NonNullable<TRules[TKey]>, TState, TKey>;
  };
}

export type InferRegleStatusType<
  TRule extends RegleCollectionRuleDecl | RegleRuleDecl | ReglePartialValidationTree<any>,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
> = TRule extends RegleCollectionRuleDefinition<any, any>
  ? RegleCollectionStatus<TRule['$each'], TState[TKey]>
  : TRule extends ReglePartialValidationTree<any>
  ? TState[TKey] extends Array<any>
    ? RegleCommonStatus
    : RegleStatus<TState[TKey], TRule>
  : RegleFieldStatus<TRule, TState, TKey>;

export interface RegleFieldStatus<
  TRules extends RegleFormPropertyType<any, AllRulesDeclarations>,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
> extends RegleCommonStatus {
  $value: TState[TKey];
  readonly $rules: {
    readonly [TRuleKey in keyof TRules]: RegleRuleStatus<
      TState[TKey],
      TRules[TRuleKey] extends RegleRuleDefinition<any, infer TParams> ? TParams : []
    >;
  };
}

export interface RegleCommonStatus {
  readonly $valid: boolean;
  readonly $invalid: boolean;
  readonly $dirty: boolean;
  readonly $anyDirty: boolean;
  readonly $pending: boolean;
  readonly $error: boolean;
  $touch(): void;
  $reset(): void;
  $validate(): Promise<boolean>;
}

export interface RegleSoftRuleStatus<TValue = any, TParams extends any[] = any[]> {
  readonly $type: string;
  readonly $message: string;
  readonly $active: boolean;
  readonly $valid: boolean;
  readonly $pending: boolean;
  readonly $params?: TParams;
  readonly $path: string;
  $validator(value: TValue, ...args: TParams): boolean | Promise<boolean>;
  $validate(): Promise<boolean>;
}

export type RegleRuleStatus<TValue = any, TParams extends any[] = any[]> = {
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

export interface RegleCollectionStatus<
  TRules extends RegleRuleDecl | ReglePartialValidationTree<any>,
  TState extends any[],
> extends RegleFieldStatus<TRules, TState> {
  readonly $each: Array<InferRegleStatusType<NonNullable<TRules>, TState, number>>;
}

export type PossibleRegleStatus =
  | RegleStatus<any, any>
  | RegleFieldStatus<any>
  | RegleSoftRuleStatus
  | RegleCollectionStatus<any, any>
  | RegleCommonStatus;

export type PossibleRegleFieldStatus = RegleFieldStatus<any, any> | RegleStatus<any, any>;
