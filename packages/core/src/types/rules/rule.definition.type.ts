import type { RegleRuleCore } from './rule.init.types';
import { RegleRuleInit } from './rule.init.types';
import type { RegleUniversalParams } from './rule.params.types';
import type { RegleInternalRuleDefs } from './rule.internal.types';
import type {
  AllRulesDeclarations,
  RegleCommonStatus,
  RegleFormPropertyType,
  RegleRuleDecl,
} from '.';
import type { ArrayElement, ExcludeByType, Maybe, MaybeGetter } from '../utils';

/**
 * Returned typed of rules created with `createRule`
 * */
export interface RegleRuleDefinition<
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = boolean,
  TMetaData extends RegleRuleMetadataDefinition = RegleRuleMetadataDefinition,
  TFilteredValue extends any = TValue extends Date & File & infer M ? M : TValue,
> extends RegleInternalRuleDefs<TFilteredValue, TParams, TAsync, TMetaData> {
  validator: RegleRuleDefinitionProcessor<
    TFilteredValue,
    TParams,
    TAsync extends false ? TMetaData : Promise<TMetaData>
  >;
  message: RegleRuleDefinitionWithMetadataProcessor<
    TFilteredValue,
    PossibleRegleRuleMetadataConsumer,
    string | string[]
  >;
  active: RegleRuleDefinitionWithMetadataProcessor<
    TFilteredValue,
    PossibleRegleRuleMetadataConsumer,
    boolean
  >;
  type?: string;
  exec: (value: Maybe<TFilteredValue>) => TAsync extends false ? TMetaData : Promise<TMetaData>;
}

/**
 * @internal
 * */
export interface $InternalRegleRuleDefinition extends RegleInternalRuleDefs<any, any, any> {
  validator: RegleRuleDefinitionProcessor;
  message: RegleRuleDefinitionWithMetadataProcessor<any, any, any>;
  active: RegleRuleDefinitionWithMetadataProcessor<any, any, any>;
  type?: string;
  exec: (value: any) => RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>;
}

/**
 * Rules with params created with `createRules` are callable while being customizable
 */
export interface RegleRuleWithParamsDefinition<
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
> extends RegleRuleCore<TValue, TParams, TAsync, TMetadata>,
    RegleInternalRuleDefs<TValue, TParams, TAsync, TMetadata> {
  (
    ...params: RegleUniversalParams<TParams>
  ): RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>;
}

export type RegleRuleMetadataExtended = {
  $valid: boolean;
  [x: string]: any;
};

/**
 * Define a rule Metadata definition
 */
export type RegleRuleMetadataDefinition = RegleRuleMetadataExtended | boolean;

type DefaultMetadataProperties = Pick<ExcludeByType<RegleCommonStatus, Function>, '$invalid'>;

/**
 * Will be used to consumme metadata on related helpers and rule status
 */
export type RegleRuleMetadataConsumer<
  TParams extends any[] = [],
  TMetadata extends RegleRuleMetadataDefinition = boolean,
> = DefaultMetadataProperties &
  (TParams extends never
    ? {}
    : {
        $params: TParams;
      }) &
  (Exclude<TMetadata, boolean> extends RegleRuleMetadataExtended
    ? TMetadata extends boolean
      ? Partial<Omit<Exclude<TMetadata, boolean>, '$valid'>>
      : Omit<Exclude<TMetadata, boolean>, '$valid'>
    : {});

/**
 * Will be used to consumme metadata on related helpers and rule status
 */
export type PossibleRegleRuleMetadataConsumer = DefaultMetadataProperties & {
  $params?: any[];
};

/**
 * @internal
 */
export type $InternalRegleRuleMetadataConsumer = DefaultMetadataProperties & {
  $params?: any[];
  [x: string]: any;
};

/**
 * Generic types for a created RegleRule
 */
export type RegleRuleRaw<
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
  TMetaData extends RegleRuleMetadataDefinition = boolean,
> =
  | RegleRuleDefinition<TValue, TParams, TAsync, TMetaData>
  | RegleRuleWithParamsDefinition<TValue, TParams, TAsync, TMetaData>;

/**
 * Process the type of a created rule with `createRule`.
 * For a rule with params it will return a function
 * Otherwise it will return the rule definition
 */
export type InferRegleRule<
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
  TMetaData extends RegleRuleMetadataDefinition = boolean,
> = [TParams] extends [[]]
  ? RegleRuleDefinition<TValue, TParams, TAsync, TMetaData>
  : RegleRuleWithParamsDefinition<TValue, TParams, TAsync, TMetaData>;

export type RegleRuleDefinitionProcessor<
  TValue extends any = any,
  TParams extends any[] = [],
  TReturn = any,
> = (value: Maybe<TValue>, ...params: TParams) => TReturn;

export type RegleRuleDefinitionWithMetadataProcessor<
  TValue extends any,
  TMetadata extends RegleRuleMetadataConsumer<any, any>,
  TReturn = any,
> = ((value: Maybe<TValue>, metadata: TMetadata) => TReturn) | TReturn;

export type RegleCollectionRuleDefinition<
  TValue = any[],
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> =
  | (RegleRuleDecl<NonNullable<TValue>, TCustomRules> & {
      $each: MaybeGetter<
        RegleFormPropertyType<ArrayElement<NonNullable<TValue>>, TCustomRules>,
        ArrayElement<TValue>
      >;
    })
  | {
      $each: MaybeGetter<
        RegleFormPropertyType<ArrayElement<NonNullable<TValue>>, TCustomRules>,
        ArrayElement<TValue>
      >;
    };
