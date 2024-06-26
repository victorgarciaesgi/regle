import type { UnwrapNestedRefs } from 'vue';
import type {
  AllRulesDeclarations,
  RegleCollectionRuleDecl,
  RegleCollectionRuleDefinition,
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
} from '..';

/**
 * @public
 */
export interface RegleStatus<
  TState extends Record<string, any> = Record<string, any>,
  TRules extends ReglePartialValidationTree<TState> = Record<string, any>,
> extends RegleCommonStatus<TState> {
  readonly $fields: {
    readonly [TKey in keyof TRules]: InferRegleStatusType<NonNullable<TRules[TKey]>, TState, TKey>;
  };
}
/**
 * @internal
 * @reference {@link RegleStatus}
 */
export interface $InternalRegleStatus extends RegleCommonStatus {
  $fields: {
    [x: string]: $InternalRegleStatusType;
  };
}

/**
 * @public
 */
export type InferRegleStatusType<
  TRule extends RegleCollectionRuleDecl | RegleRuleDecl | ReglePartialValidationTree<any>,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
> =
  TRule extends RegleCollectionRuleDefinition<any, any>
    ? NonNullable<TState[TKey]> extends Array<Record<string, any> | any>
      ? RegleCollectionStatus<TRule['$each'], TState[TKey]>
      : RegleFieldStatus<TRule, TState, TKey>
    : TRule extends ReglePartialValidationTree<any>
      ? NonNullable<TState[TKey]> extends Array<any>
        ? RegleCommonStatus<TState[TKey]>
        : NonNullable<TState[TKey]> extends Record<PropertyKey, any>
          ? RegleStatus<TState[TKey], TRule>
          : RegleFieldStatus<TRule, TState, TKey>
      : RegleFieldStatus<TRule, TState, TKey>;

/**
 * @internal
 * @reference {@link InferRegleStatusType}
 */
export type $InternalRegleStatusType =
  | $InternalRegleCollectionStatus
  | RegleCommonStatus
  | $InternalRegleStatus
  | $InternalRegleFieldStatus;

/**
 * @public
 */
export interface RegleFieldStatus<
  TRules extends RegleFormPropertyType<any, Partial<AllRulesDeclarations>> = Record<string, any>,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
> extends RegleCommonStatus<TState> {
  $value: UnwrapNestedRefs<TState[TKey]>;
  readonly $externalErrors?: string[];
  readonly $rules: {
    readonly [TRuleKey in keyof TRules]: RegleRuleStatus<
      TState[TKey],
      TRules[TRuleKey] extends RegleRuleDefinition<any, infer TParams> ? TParams : []
    >;
  };
}

/**
 * @internal
 * @reference {@link RegleFieldStatus}
 */
export interface $InternalRegleFieldStatus extends RegleCommonStatus {
  $value: any;
  $rules: Record<string, $InternalRegleRuleStatus>;
  $externalErrors?: string[];
}

/**
 * @public
 */
export interface RegleCommonStatus<TValue = any> {
  readonly $valid: boolean;
  readonly $invalid: boolean;
  readonly $dirty: boolean;
  readonly $anyDirty: boolean;
  readonly $pending: boolean;
  readonly $error: boolean;
  $id?: number;
  $value: UnwrapNestedRefs<TValue>;
  $touch(): void;
  $reset(): void;
  $validate(): Promise<boolean>;
  $unwatch(): void;
  $watch(): void;
  $clearExternalErrors(): void;
}

/**
 * @public
 */
export type RegleRuleStatus<TValue = any, TParams extends any[] = any[]> = {
  readonly $type: string;
  readonly $message: string | string[];
  readonly $active: boolean;
  readonly $valid: boolean;
  readonly $pending: boolean;
  readonly $path: string;
  $validator: (value: TValue, ...args: TParams) => boolean | Promise<boolean>;
  $validate(): Promise<boolean>;
  $reset(): void;
} & ([TParams] extends [[]]
  ? {}
  : {
      readonly $params: TParams;
    });

/**
 * @internal
 * @reference {@link RegleRuleStatus}
 */
export interface $InternalRegleRuleStatus {
  $type: string;
  $message: string | string[];
  $active: boolean;
  $valid: boolean;
  $pending: boolean;
  $path: string;
  $externalErrors?: string[];
  $params?: any[];
  $validator(
    value: any,
    ...args: any[]
  ): RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>;
  $validate(): Promise<boolean>;
  $unwatch(): void;
  $watch(): void;
  $reset(): void;
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
 * @reference {@link RegleCollectionStatus}
 */
export interface $InternalRegleCollectionStatus extends Omit<$InternalRegleStatus, '$fields'> {
  $each: Array<$InternalRegleStatusType>;
  $rules?: Record<string, $InternalRegleRuleStatus>;
  /** Track each array state */
  $unwatch(): void;
  $watch(): void;
  $fields?: {
    [x: string]: $InternalRegleStatusType;
  };
}
