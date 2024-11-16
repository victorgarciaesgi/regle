import type { Ref, UnwrapNestedRefs } from 'vue';
import type {
  AllRulesDeclarations,
  ExtractFromGetter,
  InlineRuleDeclaration,
  RegleCollectionRuleDecl,
  RegleCollectionRuleDefinition,
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
  RegleValidationGroupEntry,
  RegleValidationGroupOutput,
} from '..';

/**
 * @public
 */
export type RegleStatus<
  TState extends Record<string, any> = Record<string, any>,
  TRules extends ReglePartialValidationTree<TState> = Record<string, any>,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]> = never,
> = RegleCommonStatus<TState> & {
  readonly $fields: {
    readonly [TKey in keyof TRules]: InferRegleStatusType<NonNullable<TRules[TKey]>, TState, TKey>;
  };
} & ([TValidationGroups] extends [never]
    ? object
    : {
        $groups: {
          readonly [TKey in keyof TValidationGroups]: RegleValidationGroupOutput;
        };
      });
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
      ? ExtractFromGetter<TRule['$each']> extends RegleRuleDecl | ReglePartialValidationTree<any>
        ? RegleCollectionStatus<ExtractFromGetter<TRule['$each']>, TState[TKey]>
        : never
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
      TRules[TRuleKey] extends RegleRuleDefinition<any, infer TParams, any> ? TParams : [],
      TRules[TRuleKey] extends RegleRuleDefinition<any, any, any, infer TMetadata>
        ? TMetadata
        : TRules[TRuleKey] extends InlineRuleDeclaration<any, any[], infer TMetadata>
          ? TMetadata extends Promise<infer P>
            ? P
            : TMetadata
          : never
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
  $errors: string[];
  $silentErrors: string[];
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
  readonly $errors: string[];
  readonly $silentErrors: string[];
  $id?: string;
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
export type RegleRuleStatus<
  TValue = any,
  TParams extends any[] = any[],
  TMetadata extends RegleRuleMetadataDefinition = never,
> = {
  readonly $type: string;
  readonly $message: string | string[];
  readonly $active: boolean;
  readonly $valid: boolean;
  readonly $pending: boolean;
  readonly $path: string;
  readonly $metadata: TMetadata;
  $validator: (value: TValue, ...args: TParams) => boolean | Promise<boolean>;
  $validate(): Promise<boolean>;
  $reset(): void;
} & ([TParams] extends [[]]
  ? object
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
  $metadata: any;
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
  readonly $field: RegleFieldStatus<TRules, TState>;
}

/**
 * @internal
 * @reference {@link RegleCollectionStatus}
 */
export interface $InternalRegleCollectionStatus extends Omit<$InternalRegleStatus, '$fields'> {
  $field: $InternalRegleFieldStatus;
  $each: Array<$InternalRegleStatusType>;
  $externalErrors?: string[];
  /** Track each array state */
  $unwatch(): void;
  $watch(): void;
}
