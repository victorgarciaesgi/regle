import type { MaybeRef, Ref } from 'vue';
import type { CollectionRegleBehaviourOptions, DeepReactiveState, FieldRegleBehaviourOptions, Regle } from '../core';
import type { ArrayElement, JoinDiscriminatedUnions, Maybe, MaybeGetter, Unwrap } from '../utils';
import type { AllRulesDeclarations } from './rule.custom.types';
import type {
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
  RegleRuleWithParamsDefinition,
  RegleRuleWithParamsDefinitionInput,
} from './rule.definition.type';
import type { UnwrapRegleUniversalParams } from './rule.params.types';

/**
 * @public
 */
export type ReglePartialRuleTree<
  TForm extends Record<string, any> = Record<string, any>,
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> = {
  [TKey in keyof TForm]?: RegleFormPropertyType<TForm[TKey], TCustomRules>;
};

/**
 * @public
 */
export type RegleRuleTree<
  TForm extends Record<string, any>,
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> = {
  [TKey in keyof TForm]: RegleFormPropertyType<TForm[TKey], TCustomRules>;
};

/**
 * @public
 */
export type RegleUnknownRulesTree = {
  [x: string]: RegleRuleDecl | RegleCollectionRuleDecl | RegleUnknownRulesTree;
};

/**
 * @public
 */
export type RegleComputedRules<
  TForm extends MaybeRef<Record<string, any>> | DeepReactiveState<Record<string, any>>,
  TCustomRules extends Partial<AllRulesDeclarations> | Regle<any, any> = Partial<AllRulesDeclarations>,
  TState = Unwrap<TForm>,
  TCustom = TCustomRules extends Regle<any, infer R>
    ? R extends ReglePartialRuleTree<any, infer C>
      ? C
      : Partial<AllRulesDeclarations>
    : TCustomRules,
> = {
  [TKey in keyof JoinDiscriminatedUnions<TState>]?: RegleFormPropertyType<
    JoinDiscriminatedUnions<TState>[TKey],
    TCustom extends Partial<AllRulesDeclarations> ? TCustom : {}
  >;
};

/**
 * @internal
 * @reference {@link ReglePartialRuleTree}
 */
export type $InternalReglePartialRuleTree = {
  [x: string]: $InternalFormPropertyTypes;
};

/**
 * @public
 */
export type RegleFormPropertyType<
  TValue = any,
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> = [NonNullable<TValue>] extends [never]
  ? MaybeRef<RegleRuleDecl<TValue, TCustomRules>>
  : NonNullable<TValue> extends Array<any>
    ? RegleCollectionRuleDecl<TValue, TCustomRules>
    : NonNullable<TValue> extends Date
      ? MaybeRef<RegleRuleDecl<NonNullable<TValue>, TCustomRules>>
      : NonNullable<TValue> extends File
        ? MaybeRef<RegleRuleDecl<NonNullable<TValue>, TCustomRules>>
        : NonNullable<TValue> extends Ref<infer V>
          ? RegleFormPropertyType<V, TCustomRules>
          : NonNullable<TValue> extends Record<string, any>
            ? ReglePartialRuleTree<NonNullable<TValue>, TCustomRules>
            : MaybeRef<RegleRuleDecl<NonNullable<TValue>, TCustomRules>>;

/**
 * @internal
 * @reference {@link RegleFormPropertyType}
 */
export type $InternalFormPropertyTypes =
  | MaybeRef<$InternalRegleRuleDecl>
  | $InternalRegleCollectionRuleDecl
  | $InternalReglePartialRuleTree
  | FieldRegleBehaviourOptions;

/**
 * @public
 * Rule tree for a form property
 */
export type RegleRuleDecl<
  TValue extends any = any,
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
  TOptions extends Record<string, unknown> = FieldRegleBehaviourOptions,
> = TOptions & {
  [TKey in keyof TCustomRules]?: NonNullable<TCustomRules[TKey]> extends RegleRuleWithParamsDefinition<
    any,
    infer TParams
  >
    ? RegleRuleDefinition<TValue, [...TParams, ...args: [...any[]]], boolean>
    : NonNullable<TCustomRules[TKey]> extends RegleRuleDefinition<any, any[], any, any>
      ? FormRuleDeclaration<TValue, any[]>
      : FormRuleDeclaration<TValue, any[]> | TOptions[keyof TOptions];
};

/**
 * @internal
 * @reference {@link RegleRuleDecl}
 */
export type $InternalRegleRuleDecl = FieldRegleBehaviourOptions &
  CollectionRegleBehaviourOptions &
  Record<string, FormRuleDeclaration<any, any>>;

/**
 * @public
 */
export type RegleCollectionRuleDeclKeyProperty = {
  $key?: PropertyKey;
};

/**
 * @public
 */
export type RegleCollectionRuleDecl<
  TValue = any[],
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> =
  | ({
      $each?: RegleCollectionEachRules<TValue, TCustomRules>;
    } & RegleRuleDecl<NonNullable<TValue>, TCustomRules, CollectionRegleBehaviourOptions>)
  | ({
      $each?: RegleCollectionEachRules<TValue, TCustomRules>;
    } & CollectionRegleBehaviourOptions);

/** @public */
export type RegleCollectionEachRules<
  TValue = any[],
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> = MaybeGetter<
  RegleFormPropertyType<ArrayElement<NonNullable<TValue>>, TCustomRules>,
  ArrayElement<TValue>,
  RegleCollectionRuleDeclKeyProperty
>;

/**
 * @internal
 * @reference {@link RegleCollectionRuleDecl}
 */
export type $InternalRegleCollectionRuleDecl = $InternalRegleRuleDecl & {
  $each?: MaybeGetter<$InternalFormPropertyTypes & RegleCollectionRuleDeclKeyProperty, any>;
};

/**
 * @public
 */
export type InlineRuleDeclaration<
  TValue extends any = any,
  TParams extends any[] = any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> = boolean,
> = (value: Maybe<TValue>, ...args: UnwrapRegleUniversalParams<TParams>) => TReturn;

/**
 * @internal
 */
export type $InternalInlineRuleDeclaration = (value: Maybe<any>, ...args: any[]) => any;

/**
 * @public
 * Regroup inline and registered rules
 * */
export type FormRuleDeclaration<
  TValue extends any = unknown,
  TParams extends any[] = any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> =
    | RegleRuleMetadataDefinition
    | Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = boolean,
> =
  | InlineRuleDeclaration<TValue, TParams, TReturn>
  | RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>
  | RegleRuleWithParamsDefinitionInput<TValue, [param?: any], TAsync, TMetadata>
  | RegleRuleWithParamsDefinitionInput<TValue, [param?: any, ...any[]], TAsync, TMetadata>;
