import type {
  AllRulesDeclarations,
  RegleCollectionRuleDecl,
  RegleCollectionRuleDefinition,
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleDecl,
  RegleRuleDefinition,
} from '..';

/**
 * @public
 */
export interface RegleStatus<
  TState extends Record<string, any> = Record<string, any>,
  TRules extends ReglePartialValidationTree<TState> = Record<string, any>,
> extends RegleCommonStatus {
  readonly $fields: {
    readonly [TKey in keyof TRules]: InferRegleStatusType<NonNullable<TRules[TKey]>, TState, TKey>;
  };
}

/**
 * @internal
 * @reference RegleStatus
 */
export interface $InternalRegleStatus<
  TState extends Record<string, any> = Record<string, any>,
  TRules extends ReglePartialValidationTree<TState> = Record<string, any>,
> extends RegleCommonStatus {
  $fields: {
    [TKey in keyof TRules]: $InternalRegleStatusType;
  };
}

/**
 * @public
 */
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

/**
 * @internal
 * @reference InferRegleStatusType
 */
export type $InternalRegleStatusType =
  | $InternalRegleCollectionStatus<any, any[]>
  | RegleCommonStatus
  | $InternalRegleStatus
  | $InternalRegleFieldStatus;

/**
 * @public
 */
export interface RegleFieldStatus<
  TRules extends RegleFormPropertyType<any, AllRulesDeclarations> = Record<string, any>,
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

/**
 * @internal
 * @reference RegleFieldStatus
 */
export interface $InternalRegleFieldStatus extends RegleCommonStatus {
  $value: any;
  $rules: Record<string, $InternalRegleRuleStatus>;
}

/**
 * @public
 */
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

/**
 * @public
 */
export type RegleRuleStatus<TValue = any, TParams extends any[] = any[]> = {
  readonly $type: string;
  readonly $message: string;
  readonly $active: boolean;
  readonly $valid: boolean;
  readonly $pending: boolean;
  readonly $path: string;
  $validator: (value: TValue, ...args: TParams) => boolean | Promise<boolean>;
  $validate(): Promise<boolean>;
} & ([TParams] extends [[]]
  ? {}
  : {
      readonly $params: TParams;
    });

/**
 * @internal
 * @reference RegleRuleStatus
 */
export interface $InternalRegleRuleStatus<TValue = any, TParams extends any[] = any[]> {
  readonly $type: string;
  readonly $message: string;
  readonly $active: boolean;
  readonly $valid: boolean;
  readonly $pending: boolean;
  readonly $path: string;
  $validator(value: TValue, ...args: TParams): boolean | Promise<boolean>;
  $validate(): Promise<boolean>;
  readonly $params?: TParams;
}

/**
 * @public
 */
export interface RegleCollectionStatus<
  TRules extends RegleRuleDecl | ReglePartialValidationTree<any>,
  TState extends any[],
> extends RegleFieldStatus<TRules, TState> {
  readonly $each: Array<InferRegleStatusType<NonNullable<TRules>, TState, number>>;
}
/**
 * @internal
 * @reference RegleCollectionStatus
 */
export interface $InternalRegleCollectionStatus<
  TRules extends RegleRuleDecl | ReglePartialValidationTree<any>,
  TState extends any[],
> extends RegleFieldStatus<TRules, TState> {
  readonly $each: Array<InferRegleStatusType<NonNullable<TRules>, TState, number>>;
}
