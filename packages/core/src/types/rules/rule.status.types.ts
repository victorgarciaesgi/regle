import type { PartialDeep } from 'type-fest';
import type { UnwrapNestedRefs } from 'vue';
import type {
  $InternalRegleCollectionErrors,
  $InternalRegleErrors,
  $InternalRegleResult,
  AllRulesDeclarations,
  ArrayElement,
  DeepSafeFormState,
  ExtractFromGetter,
  FieldRegleBehaviourOptions,
  InlineRuleDeclaration,
  Maybe,
  Prettify,
  RegleCollectionErrors,
  RegleCollectionRuleDecl,
  RegleCollectionRuleDefinition,
  RegleErrorTree,
  RegleFormPropertyType,
  ReglePartialRuleTree,
  RegleResult,
  RegleRuleDecl,
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
  RegleShortcutDefinition,
  RegleValidationGroupEntry,
  RegleValidationGroupOutput,
  SafeFieldProperty,
} from '..';

/**
 * @public
 */
export type RegleRoot<
  TState extends Record<string, any> = Record<string, any>,
  TRules extends ReglePartialRuleTree<TState> = Record<string, any>,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]> = never,
  TShortcuts extends RegleShortcutDefinition = {},
> = RegleStatus<TState, TRules, TShortcuts> &
  ([TValidationGroups] extends [never]
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
  TRules extends ReglePartialRuleTree<TState> = Record<string, any>,
  TShortcuts extends RegleShortcutDefinition = {},
> = RegleCommonStatus<TState> & {
  readonly $fields: {
    readonly [TKey in keyof TState]: InferRegleStatusType<NonNullable<TRules[TKey]>, TState, TKey, TShortcuts>;
  } & {
    readonly [TKey in keyof TState as TRules[TKey] extends NonNullable<TRules[TKey]>
      ? TKey
      : never]-?: InferRegleStatusType<NonNullable<TRules[TKey]>, TState, TKey, TShortcuts>;
  };
  readonly $errors: RegleErrorTree<TState>;
  readonly $silentErrors: RegleErrorTree<TState>;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $validate: () => Promise<RegleResult<TState, TRules>>;
} & ([TShortcuts['nested']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['nested']]: ReturnType<NonNullable<TShortcuts['nested']>[K]>;
      });
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
  $validate: () => Promise<$InternalRegleResult>;
}

/**
 * @public
 */
export type InferRegleStatusType<
  TRule extends RegleCollectionRuleDecl | RegleRuleDecl | ReglePartialRuleTree<any>,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
  TShortcuts extends RegleShortcutDefinition = {},
> =
  NonNullable<TState[TKey]> extends Array<Record<string, any> | any>
    ? TRule extends RegleCollectionRuleDefinition<any, any>
      ? ExtractFromGetter<TRule['$each']> extends ReglePartialRuleTree<any>
        ? RegleCollectionStatus<TState[TKey], ExtractFromGetter<TRule['$each']>, TRule, TShortcuts>
        : RegleFieldStatus<TState[TKey], TRule, TShortcuts>
      : RegleCollectionStatus<TState[TKey], {}, TRule, TShortcuts>
    : TRule extends ReglePartialRuleTree<any>
      ? NonNullable<TState[TKey]> extends Array<any>
        ? RegleCommonStatus<TState[TKey]>
        : NonNullable<TState[TKey]> extends Date | File
          ? RegleFieldStatus<TState[TKey], TRule, TShortcuts>
          : NonNullable<TState[TKey]> extends Record<PropertyKey, any>
            ? RegleStatus<TState[TKey], TRule, TShortcuts>
            : RegleFieldStatus<TState[TKey], TRule, TShortcuts>
      : NonNullable<TState[TKey]> extends Date | File
        ? RegleFieldStatus<TState[TKey], TRule, TShortcuts>
        : NonNullable<TState[TKey]> extends Record<PropertyKey, any>
          ? RegleStatus<TState[TKey], ReglePartialRuleTree<TState[TKey]>, TShortcuts>
          : RegleFieldStatus<TState[TKey], TRule, TShortcuts>;

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
export type RegleFieldStatus<
  TState extends any = any,
  TRules extends RegleFormPropertyType<any, Partial<AllRulesDeclarations>> = Record<string, any>,
  TShortcuts extends RegleShortcutDefinition = never,
> = Omit<RegleCommonStatus<TState>, '$value'> & {
  $value: Maybe<UnwrapNestedRefs<TState>>;
  readonly $errors: string[];
  readonly $silentErrors: string[];
  readonly $externalErrors: string[];
  $extractDirtyFields: (filterNullishValues?: boolean) => Maybe<TState>;
  $validate: () => Promise<RegleResult<TState, TRules>>;
  readonly $rules: {
    readonly [TRuleKey in keyof Omit<TRules, '$each' | keyof FieldRegleBehaviourOptions>]: RegleRuleStatus<
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
} & ([TShortcuts['fields']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['fields']]: ReturnType<NonNullable<TShortcuts['fields']>[K]>;
      });

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
  $validate: () => Promise<$InternalRegleResult>;
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
  readonly $name: string;
  $id?: string;
  $value: UnwrapNestedRefs<TValue>;
  $touch(runCommit?: boolean, withConditions?: boolean): void;
  $reset(): void;
  $resetAll: () => void;
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
  $validator(value: any, ...args: any[]): RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>;
  $validate(): Promise<boolean>;
  $unwatch(): void;
  $watch(): void;
  $reset(): void;
}

/**
 * @public
 */
export type RegleCollectionStatus<
  TState extends any[] = any[],
  TRules extends ReglePartialRuleTree<ArrayElement<TState>> = Record<string, any>,
  TFieldRule extends RegleCollectionRuleDecl<any, any> = never,
  TShortcuts extends RegleShortcutDefinition = {},
> = Omit<
  RegleFieldStatus<TState, TRules, TShortcuts>,
  '$errors' | '$silentErrors' | '$extractDirtyFields' | '$externalErrors' | '$rules' | '$value' | '$validate'
> & {
  $value: Maybe<TState>;
  readonly $each: Array<InferRegleStatusType<NonNullable<TRules>, NonNullable<TState>, number, TShortcuts>>;
  readonly $field: RegleFieldStatus<TState, TFieldRule, TShortcuts>;
  readonly $errors: RegleCollectionErrors<TState>;
  readonly $silentErrors: RegleCollectionErrors<TState>;
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $validate: () => Promise<RegleResult<TState, TRules>>;
} & ([TShortcuts['collections']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['collections']]: ReturnType<NonNullable<TShortcuts['collections']>[K]>;
      });

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
  $validate: () => Promise<$InternalRegleResult>;
  /** Track each array state */
  $unwatch(): void;
  $watch(): void;
}
