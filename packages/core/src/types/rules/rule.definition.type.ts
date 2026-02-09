import type { RegleRuleCore } from './rule.init.types';
import type { RegleUniversalParams } from './rule.params.types';
import type { RegleInternalRuleDefs } from './rule.internal.types';
import type {
  $InternalRegleRuleStatus,
  ExtendedRulesDeclarations,
  RegleCommonStatus,
  RegleFormPropertyType,
  RegleRuleDecl,
} from '.';
import type { ArrayElement, ExcludeByType, Maybe, MaybeGetter } from '../utils';
import type { CollectionRegleBehaviourOptions } from '../core';

type IsLiteral<T> = string extends T ? false : true;

/**
 * Returned typed of rules created with `createRule`
 * */
export interface RegleRuleDefinition<
  TType extends string | unknown = unknown,
  TValue extends unknown = unknown,
  TParams extends any[] = [],
  TAsync extends boolean = boolean,
  TMetaData extends RegleRuleMetadataDefinition = RegleRuleMetadataDefinition,
  _TInput = unknown,
  TFilteredValue extends any = TValue extends Date & File & (infer M) ? M : TValue,
  TNonEmpty extends boolean = boolean,
>
  extends
    RegleInternalRuleDefs<TFilteredValue, TParams, TAsync, TMetaData>,
    RegleRuleDefinitionLight<TParams, TAsync, TMetaData> {
  validator: RegleRuleDefinitionProcessor<
    TFilteredValue,
    [...TParams, ...any[]],
    TAsync extends false ? TMetaData : Promise<TMetaData>
  >;
  message: (metadata: PossibleRegleRuleMetadataConsumer<TFilteredValue>) => string | string[];
  active: (metadata: PossibleRegleRuleMetadataConsumer<TFilteredValue>) => boolean;
  tooltip: (metadata: PossibleRegleRuleMetadataConsumer<TFilteredValue>) => string | string[];
  type?: TType;
  _value?: IsLiteral<TValue> extends true ? TValue : any;
  exec: (value: Maybe<TFilteredValue>) => TAsync extends false ? TMetaData : Promise<TMetaData>;
  required: TNonEmpty;
}

export type RegleRuleDefinitionLight<
  TParams extends any[] = [],
  TAsync extends boolean = boolean,
  TMetaData extends RegleRuleMetadataDefinition = RegleRuleMetadataDefinition,
> = {
  value: unknown;
  params: [...TParams, ...unknown[]];
  async: TAsync;
  metadata: TMetaData;
};

/**
 * @internal
 * */
export interface $InternalRegleRuleDefinition extends RegleInternalRuleDefs<any, any, any> {
  validator: RegleRuleDefinitionProcessor;
  message: RegleRuleDefinitionWithMetadataProcessor<any, any, unknown>;
  active: RegleRuleDefinitionWithMetadataProcessor<any, any, unknown>;
  tooltip: RegleRuleDefinitionWithMetadataProcessor<any, any, unknown>;
  type?: string;
  exec: (value: any) => RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>;
}

/**
 * Rules with params created with `createRules` are callable while being customizable
 */
export type RegleRuleWithParamsDefinition<
  TType extends string | unknown = unknown,
  TValue extends unknown = unknown,
  TParams extends any[] = never,
  TAsync extends boolean = false,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
  TInput = unknown,
  TFilteredValue extends any = TValue extends Date & File & (infer M) ? M : TValue,
  TNonEmpty extends boolean = false,
> = RegleRuleCore<TType, TFilteredValue, TParams, TAsync, TMetadata, TNonEmpty> &
  RegleInternalRuleDefs<TFilteredValue, TParams, TAsync, TMetadata> &
  RegleRuleDefinitionLight<TParams, TAsync, TMetadata> & {
    (
      ...params: RegleUniversalParams<TParams>
    ): RegleRuleDefinition<TType, TFilteredValue, TParams, TAsync, TMetadata, TInput, TFilteredValue, TNonEmpty>;
  } & (TParams extends [param?: any, ...any[]]
    ? {
        exec: (value: Maybe<TFilteredValue>) => TAsync extends false ? TMetadata : Promise<TMetadata>;
      }
    : {});

export type RegleRuleWithParamsDefinitionInput<
  TType extends string | unknown = unknown,
  TValue extends any = any,
  TParams extends any[] = never,
  TAsync extends boolean = false,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
  TFilteredValue extends any = TValue extends Date & File & (infer M) ? M : TValue,
> = RegleRuleCore<TType, TFilteredValue, TParams, TAsync, TMetadata> &
  RegleInternalRuleDefs<TFilteredValue, TParams, TAsync, TMetadata> &
  (TParams extends [param?: any, ...any[]]
    ? {
        exec: (value: Maybe<TFilteredValue>) => TAsync extends false ? TMetadata : Promise<TMetadata>;
      }
    : {});

export type RegleRuleMetadataExtended = {
  $valid: boolean;
  [x: string]: any;
};

export type UnwrapRuleTree<T extends { [x: string]: RegleRuleRawInput<any, any[], any, any> | undefined }> = {
  [K in keyof T]: UnwrapRuleWithParams<T[K]>;
};

export type UnwrapRuleWithParams<T extends RegleRuleRawInput<any, any[], any, any> | undefined> =
  T extends RegleRuleWithParamsDefinition<infer TType, infer TValue, infer TParams, infer TAsync, infer TMetadata>
    ? RegleRuleDefinition<TType, TValue, TParams, TAsync, TMetadata>
    : T;

/**
 * Define a rule Metadata definition
 */
export type RegleRuleMetadataDefinition = RegleRuleMetadataExtended | boolean;

type DefaultMetadataPropertiesCommon = Pick<
  ExcludeByType<RegleCommonStatus, Function>,
  '$invalid' | '$dirty' | '$pending' | '$correct' | '$error'
>;

type DefaultMetadataProperties = DefaultMetadataPropertiesCommon & {
  $rule: Pick<$InternalRegleRuleStatus, '$valid' | '$pending'>;
};

/**
 * Will be used to consume metadata on related helpers and rule status
 */
export type RegleRuleMetadataConsumer<
  TValue extends any,
  TParams extends [...any[]] = never,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
> = { $value: Maybe<TValue> } & DefaultMetadataProperties &
  (TParams extends never
    ? {}
    : {
        $params: [...TParams];
      }) &
  (Exclude<TMetadata, boolean> extends RegleRuleMetadataExtended
    ? TMetadata extends boolean
      ? Partial<Omit<Exclude<TMetadata, boolean>, '$valid'>>
      : Omit<Exclude<TMetadata, boolean>, '$valid'>
    : {});

/**
 * Will be used to consume metadata on related helpers and rule status
 */
export type PossibleRegleRuleMetadataConsumer<TValue> = { $value: Maybe<TValue> } & DefaultMetadataProperties & {
    $params?: [...any[]];
  };

/**
 * @internal
 */
export type $InternalRegleRuleMetadataConsumer = DefaultMetadataProperties & {
  $value: Maybe<unknown>;
  $params?: any[];
  [x: string]: any;
};

/**
 * Generic types for a created RegleRule
 */
export type RegleRuleRaw<
  TType extends string | unknown = unknown,
  TValue extends any = any,
  TParams extends [...any[]] = [...any[]],
  TAsync extends boolean = boolean,
  TMetaData extends RegleRuleMetadataDefinition = boolean,
> =
  | RegleRuleDefinition<TType, TValue, TParams, TAsync, TMetaData>
  | RegleRuleWithParamsDefinition<TType, TValue, TParams, TAsync, TMetaData>;

export type RegleRuleRawInput<
  TValue extends any = any,
  TParams extends [...any[]] = [...any[]],
  TAsync extends boolean = boolean,
  TMetaData extends RegleRuleMetadataDefinition = boolean,
> = Omit<
  | RegleRuleDefinition<unknown, TValue, TParams, TAsync, TMetaData>
  | RegleRuleWithParamsDefinition<unknown, TValue, TParams, TAsync, TMetaData>,
  'message' | 'tooltip' | 'active'
> & {
  message: any;
  active?: any;
  tooltip?: any;
};
/**
 * Process the type of created rule with `createRule`.
 * For a rule with params it will return a function
 * Otherwise it will return the rule definition
 */
export type InferRegleRule<
  TType extends string | unknown,
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
  TMetaData extends RegleRuleMetadataDefinition = boolean,
  TNonEmpty extends boolean = false,
> = [TParams] extends [[]]
  ? RegleRuleDefinition<TType, TValue, TParams, TAsync, TMetaData, TValue, TValue, TNonEmpty>
  : RegleRuleWithParamsDefinition<TType, TValue, TParams, TAsync, TMetaData, TValue, TValue, TNonEmpty>;

export type RegleRuleDefinitionProcessor<TValue extends any = any, TParams extends any[] = [], TReturn = any> = (
  value: Maybe<TValue>,
  ...params: TParams
) => TReturn;

export type RegleRuleDefinitionWithMetadataProcessor<
  TValue extends any,
  TMetadata extends RegleRuleMetadataConsumer<TValue, any[]>,
  TReturn = any,
> = ((metadata: TMetadata) => TReturn) | TReturn;

export type RegleCollectionRuleDefinition<
  TValue = any[],
  TCustomRules extends Partial<ExtendedRulesDeclarations> = Partial<ExtendedRulesDeclarations>,
> =
  | (RegleRuleDecl<NonNullable<TValue>, TCustomRules, CollectionRegleBehaviourOptions> & {
      $each: MaybeGetter<RegleFormPropertyType<ArrayElement<NonNullable<TValue>>, TCustomRules>, ArrayElement<TValue>>;
    })
  | ({
      $each: MaybeGetter<RegleFormPropertyType<ArrayElement<NonNullable<TValue>>, TCustomRules>, ArrayElement<TValue>>;
    } & CollectionRegleBehaviourOptions);
