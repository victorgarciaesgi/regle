import type { MaybeRef, Ref } from 'vue';
import type { DeepReactiveState, FieldRegleBehaviourOptions, Regle } from '../../types/core';
import type { ArrayElement, Maybe, MaybeGetter, Unwrap } from '../utils';
import type { AllRulesDeclarations } from './rule.custom.types';
import type {
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
  RegleRuleWithParamsDefinition,
} from './rule.definition.type';
import type { UnwrapRegleUniversalParams } from './rule.params.types';

/**
 * @public
 */
export type ReglePartialRuleTree<
  TForm extends Record<string, any>,
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
  [TKey in keyof TState]?: RegleFormPropertyType<
    TState[TKey],
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
  ? RegleRuleDecl<TValue, TCustomRules>
  : NonNullable<TValue> extends Array<any>
    ? RegleCollectionRuleDecl<TValue, TCustomRules>
    : NonNullable<TValue> extends Date
      ? RegleRuleDecl<NonNullable<TValue>, TCustomRules>
      : NonNullable<TValue> extends File
        ? RegleRuleDecl<NonNullable<TValue>, TCustomRules>
        : NonNullable<TValue> extends Ref<infer V>
          ? RegleFormPropertyType<V, TCustomRules>
          : NonNullable<TValue> extends Record<string, any>
            ? ReglePartialRuleTree<NonNullable<TValue>, TCustomRules>
            : RegleRuleDecl<NonNullable<TValue>, TCustomRules>;

/**
 * @internal
 * @reference {@link RegleFormPropertyType}
 */
export type $InternalFormPropertyTypes =
  | $InternalRegleRuleDecl
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
> = FieldRegleBehaviourOptions & {
  [TKey in keyof TCustomRules]?: NonNullable<TCustomRules[TKey]> extends RegleRuleWithParamsDefinition<
    any,
    infer TParams
  >
    ? RegleRuleDefinition<TValue, [...TParams, ...args: [...any[]]], boolean>
    : NonNullable<TCustomRules[TKey]> extends RegleRuleDefinition<any, any, any, any>
      ? FormRuleDeclaration<TValue, any>
      : FormRuleDeclaration<TValue, any> | FieldRegleBehaviourOptions[keyof FieldRegleBehaviourOptions];
};

/**
 * @internal
 * @reference {@link RegleRuleDecl}
 */
export type $InternalRegleRuleDecl = Record<string, FormRuleDeclaration<any, any>>;

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
      $each?: MaybeGetter<
        RegleFormPropertyType<ArrayElement<NonNullable<TValue>>, TCustomRules>,
        ArrayElement<TValue>,
        RegleCollectionRuleDeclKeyProperty
      >;
    } & RegleRuleDecl<NonNullable<TValue>, TCustomRules>)
  | ({
      $each?: MaybeGetter<
        RegleFormPropertyType<ArrayElement<NonNullable<TValue>>, TCustomRules>,
        ArrayElement<TValue>,
        RegleCollectionRuleDeclKeyProperty
      >;
    } & FieldRegleBehaviourOptions);

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
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> =
    | RegleRuleMetadataDefinition
    | Promise<RegleRuleMetadataDefinition>,
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
  TValue extends any,
  TParams extends any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> =
    | RegleRuleMetadataDefinition
    | Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = boolean,
> = InlineRuleDeclaration<TValue, TParams, TReturn> | RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>;
