import type { PartialDeep } from 'type-fest';
import type { UnwrapNestedRefs } from 'vue';
import type {
  $InternalRegleCollectionErrors,
  $InternalRegleErrors,
  AllRulesDeclarations,
  DeepSafeFormState,
  ExtractFromGetter,
  FieldRegleBehaviourOptions,
  InlineRuleDeclaration,
  Maybe,
  Prettify,
  RegleCollectionRuleDecl,
  RegleCollectionRuleDefinition,
  RegleErrorTree,
  RegleExternalErrorTree,
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
  RegleValidationGroupEntry,
  RegleValidationGroupOutput,
  SafeProperty,
} from '..';

/**
 * @public
 */
export type RegleRoot<
  TState extends Record<string, any> = Record<string, any>,
  TRules extends ReglePartialValidationTree<TState> = Record<string, any>,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]> = never,
  TExternal extends RegleExternalErrorTree<TState> = never,
> = RegleStatus<TState, TRules, TExternal> & {
  $resetAll: () => void;
} & ([TValidationGroups] extends [never]
    ? {}
    : {
        $groups: {
          readonly [TKey in keyof TValidationGroups]: RegleValidationGroupOutput;
        };
      });

/**
 * @public
 */
export type RegleStatus<
  TState extends Record<string, any> = Record<string, any>,
  TRules extends ReglePartialValidationTree<TState> = Record<string, any>,
  TExternal extends RegleExternalErrorTree<TState> = never,
> = RegleCommonStatus<TState> & {
  readonly $fields: {
    readonly [TKey in keyof TRules]: InferRegleStatusType<NonNullable<TRules[TKey]>, TState, TKey>;
  };
  readonly $errors: RegleErrorTree<TRules, TExternal>;
  readonly $silentErrors: RegleErrorTree<TRules, TExternal>;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $parse: () => Promise<false | Prettify<DeepSafeFormState<TState, TRules>>>;
};
/**
 * @internal
 * @reference {@link RegleStatus}
 */
export interface $InternalRegleStatus extends RegleCommonStatus {
  $fields: {
    [x: string]: $InternalRegleStatusType;
  };
  readonly $errors: Record<string, $InternalRegleErrors>;
  readonly $silentErrors: Record<string, $InternalRegleErrors>;
  $extractDirtyFields: (filterNullishValues?: boolean) => Record<string, any>;
  $parse: () => Promise<false | Record<string, any>>;
  $resetAll?: () => void;
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
        ? RegleCollectionStatus<TState[TKey], ExtractFromGetter<TRule['$each']>, TRule>
        : never
      : RegleFieldStatus<TState[TKey], TRule>
    : TRule extends ReglePartialValidationTree<any>
      ? NonNullable<TState[TKey]> extends Array<any>
        ? RegleCommonStatus<TState[TKey]>
        : NonNullable<TState[TKey]> extends Record<PropertyKey, any>
          ? RegleStatus<TState[TKey], TRule>
          : RegleFieldStatus<TState[TKey], TRule>
      : RegleFieldStatus<TState[TKey], TRule>;

/**
 * @internal
 * @reference {@link InferRegleStatusType}
 */
export type $InternalRegleStatusType =
  | $InternalRegleCollectionStatus
  | $InternalRegleStatus
  | $InternalRegleFieldStatus;

/**
 * @public
 */
export interface RegleFieldStatus<
  TState extends any = any,
  TRules extends RegleFormPropertyType<any, Partial<AllRulesDeclarations>> = Record<string, any>,
> extends Omit<RegleCommonStatus<TState>, '$value'> {
  $value: Maybe<UnwrapNestedRefs<TState>>;
  readonly $errors: string[];
  readonly $silentErrors: string[];
  readonly $externalErrors?: string[];
  $extractDirtyFields: (filterNullishValues?: boolean) => TState | null;
  readonly $rules: {
    readonly [TRuleKey in keyof Omit<
      TRules,
      '$each' | keyof FieldRegleBehaviourOptions
    >]: RegleRuleStatus<
      TState,
      TRules[TRuleKey] extends RegleRuleDefinition<any, infer TParams, any> ? TParams : [],
      TRules[TRuleKey] extends RegleRuleDefinition<any, any, any, infer TMetadata>
        ? TMetadata
        : TRules[TRuleKey] extends InlineRuleDeclaration<any, any[], infer TMetadata>
          ? TMetadata extends Promise<infer P>
            ? P
            : TMetadata
          : any
    >;
  };
}

/**
 * @internal
 * @reference {@link RegleFieldStatus}
 */
export interface $InternalRegleFieldStatus extends RegleCommonStatus {
  $value: any;
  readonly $rules: Record<string, $InternalRegleRuleStatus>;
  readonly $externalErrors?: string[];
  readonly $errors: string[];
  readonly $silentErrors: string[];
  $extractDirtyFields: (filterNullishValues?: boolean) => any;
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
  readonly $ready: boolean;
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
  TMetadata extends RegleRuleMetadataDefinition = any,
> = {
  readonly $type: string;
  readonly $message: string | string[];
  readonly $active: boolean;
  readonly $valid: boolean;
  readonly $pending: boolean;
  readonly $path: string;
  readonly $metadata: TMetadata;
  $validator: ((
    value: Maybe<TValue>,
    ...args: [TParams] extends [never[]] ? [] : [unknown[]] extends [TParams] ? any[] : TParams
  ) => RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>) &
    ((
      value: TValue,
      ...args: [TParams] extends [never[]] ? [] : [unknown[]] extends [TParams] ? any[] : TParams
    ) => RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>);
  $validate(): Promise<boolean>;
  $reset(): void;
} & ([TParams] extends [never[]]
  ? {}
  : [unknown[]] extends [TParams]
    ? {
        readonly $params?: any[];
      }
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
  _haveAsync: boolean;
  $validating: boolean;
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
  TState extends any[] = any[],
  TRules extends RegleRuleDecl | ReglePartialValidationTree<any> = Record<string, any>,
  TFieldRule extends RegleCollectionRuleDecl<any, any> = never,
> extends Omit<
    RegleFieldStatus<TState, TRules>,
    '$errors' | '$silentErrors' | '$extractDirtyFields'
  > {
  readonly $each: Array<InferRegleStatusType<NonNullable<TRules>, NonNullable<TState>, number>>;
  readonly $field: RegleFieldStatus<TState, TFieldRule>;
  readonly $errors: RegleErrorTree<TRules>;
  readonly $silentErrors: RegleErrorTree<TRules>;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $parse: () => Promise<false | SafeProperty<TState, TRules>>;
}

/**
 * @internal
 * @reference {@link RegleCollectionStatus}
 */
export interface $InternalRegleCollectionStatus
  extends Omit<$InternalRegleStatus, '$fields' | '$errors' | '$silentErrors'> {
  readonly $field: $InternalRegleFieldStatus;
  readonly $each: Array<$InternalRegleStatusType>;
  readonly $errors: $InternalRegleCollectionErrors;
  readonly $silentErrors: $InternalRegleCollectionErrors;
  readonly $externalErrors?: string[];
  $extractDirtyFields: (filterNullishValues?: boolean) => any[];
  $parse: () => Promise<false | any[]>;
  /** Track each array state */
  $unwatch(): void;
  $watch(): void;
}
