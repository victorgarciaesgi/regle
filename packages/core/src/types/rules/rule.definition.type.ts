import type { RegleRuleCore } from './rule.init.types';
import type { RegleUniversalParams } from './rule.params.types';
import type { RegleInternalRuleDefs } from './rule.internal.types';
import type { AllRulesDeclarations, RegleCommonStatus, RegleFormPropertyType, RegleRuleDecl } from '.';
import type { ArrayElement, ExcludeByType, Maybe, MaybeGetter } from '../utils';
import type { FieldRegleBehaviourOptions } from '../core';

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
  message: (metadata: PossibleRegleRuleMetadataConsumer<TFilteredValue>) => string | string[];
  active: (metadata: PossibleRegleRuleMetadataConsumer<TFilteredValue>) => boolean;
  tooltip: (metadata: PossibleRegleRuleMetadataConsumer<TFilteredValue>) => string | string[];
  type?: string;
  exec: (value: Maybe<TFilteredValue>) => TAsync extends false ? TMetaData : Promise<TMetaData>;
}

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
export interface RegleRuleWithParamsDefinition<
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
> extends RegleRuleCore<TValue, TParams, TAsync, TMetadata>,
    RegleInternalRuleDefs<TValue, TParams, TAsync, TMetadata> {
  (...params: RegleUniversalParams<TParams>): RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>;
}

export type RegleRuleMetadataExtended = {
  $valid: boolean;
  [x: string]: any;
};

export type UnwrapRuleTree<T extends { [x: string]: RegleRuleRaw<any> | undefined }> = {
  [K in keyof T]: UnwrapRuleWithParams<T[K]>;
};

export type UnwrapRuleWithParams<T extends RegleRuleRaw<any> | undefined> =
  T extends RegleRuleWithParamsDefinition<infer TValue, infer TParams, infer TAsync, infer TMetadata>
    ? RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>
    : T;

/**
 * Define a rule Metadata definition
 */
export type RegleRuleMetadataDefinition = RegleRuleMetadataExtended | boolean;

type DefaultMetadataProperties = Pick<ExcludeByType<RegleCommonStatus, Function>, '$invalid' | '$dirty' | '$pending'>;

/**
 * Will be used to consumme metadata on related helpers and rule status
 */
export type RegleRuleMetadataConsumer<
  TValue extends any,
  TParams extends any[] = never,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
> = { $value: Maybe<TValue> } & DefaultMetadataProperties &
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
export type PossibleRegleRuleMetadataConsumer<TValue> = { $value: Maybe<TValue> } & DefaultMetadataProperties & {
    $params?: any[];
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
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = boolean,
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

export type RegleRuleDefinitionProcessor<TValue extends any = any, TParams extends any[] = [], TReturn = any> = (
  value: Maybe<TValue>,
  ...params: TParams
) => TReturn;

export type RegleRuleDefinitionWithMetadataProcessor<
  TValue extends any,
  TMetadata extends RegleRuleMetadataConsumer<TValue, any>,
  TReturn = any,
> = ((metadata: TMetadata) => TReturn) | TReturn;

export type RegleCollectionRuleDefinition<
  TValue = any[],
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> =
  | (RegleRuleDecl<NonNullable<TValue>, TCustomRules> & {
      $each: MaybeGetter<RegleFormPropertyType<ArrayElement<NonNullable<TValue>>, TCustomRules>, ArrayElement<TValue>>;
    })
  | ({
      $each: MaybeGetter<RegleFormPropertyType<ArrayElement<NonNullable<TValue>>, TCustomRules>, ArrayElement<TValue>>;
    } & FieldRegleBehaviourOptions);
