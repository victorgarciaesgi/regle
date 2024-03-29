import type { MaybeRef, Ref } from 'vue';
import { UnwrapRef } from 'vue';
import type { FieldRegleBehaviourOptions, Regle } from '../../types/core';
import type { ArrayElement, Maybe } from '../utils';
import { PrimitiveTypes } from '../utils';
import type { AllRulesDeclarations } from './rule.custom.types';
import type {
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
  RegleRuleWithParamsDefinition,
} from './rule.definition.type';

/**
 * @public
 */
export type ReglePartialValidationTree<
  TForm extends Record<string, any>,
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> = {
  [TKey in keyof TForm]?: RegleFormPropertyType<TForm[TKey], TCustomRules>;
};

/**
 * @public
 */
export type RegleValidationTree<
  TForm extends Record<string, any>,
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> = {
  [TKey in keyof TForm]: RegleFormPropertyType<TForm[TKey], TCustomRules>;
};

/**
 * @public
 */
export type RegleComputedRules<
  TForm extends MaybeRef<Record<string, any>>,
  TCustomRules extends
    | Partial<AllRulesDeclarations>
    | Regle<any, any> = Partial<AllRulesDeclarations>,
  TState = TForm extends Ref<infer R> ? R : TForm,
  TCustom = TCustomRules extends Regle<any, infer R>
    ? R extends ReglePartialValidationTree<any, infer C>
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
 * @reference {@link ReglePartialValidationTree}
 */
export type $InternalReglePartialValidationTree = {
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
            ? ReglePartialValidationTree<NonNullable<TValue>, TCustomRules>
            : RegleRuleDecl<NonNullable<TValue>, TCustomRules>;

/**
 * @internal
 * @reference {@link RegleFormPropertyType}
 */
export type $InternalFormPropertyTypes =
  | $InternalRegleRuleDecl
  | $InternalRegleCollectionRuleDecl
  | $InternalReglePartialValidationTree
  | FieldRegleBehaviourOptions;

/**
 * @public
 * Rule tree for a form property
 */
export type RegleRuleDecl<
  TValue extends any = any,
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> = FieldRegleBehaviourOptions & {
  [TKey in keyof TCustomRules]?: NonNullable<
    TCustomRules[TKey]
  > extends RegleRuleWithParamsDefinition<any, infer TParams>
    ? RegleRuleDefinition<TValue, TParams, boolean>
    : NonNullable<TCustomRules[TKey]> extends RegleRuleDefinition<any, any, any, any>
      ? FormRuleDeclaration<TValue, any>
      :
          | FormRuleDeclaration<TValue, any>
          | FieldRegleBehaviourOptions[keyof FieldRegleBehaviourOptions];
};

/**
 * @internal
 * @reference {@link RegleRuleDecl}
 */
export type $InternalRegleRuleDecl = Record<string, FormRuleDeclaration<any, any>>;

/**
 * @public
 */
export type RegleCollectionRuleDecl<
  TValue = any[],
  TCustomRules extends Partial<AllRulesDeclarations> = Partial<AllRulesDeclarations>,
> =
  | (RegleRuleDecl<NonNullable<TValue>, TCustomRules> & {
      $each?: RegleFormPropertyType<ArrayElement<NonNullable<TValue>>, TCustomRules>;
    })
  | {
      $each?: RegleFormPropertyType<ArrayElement<NonNullable<TValue>>, TCustomRules>;
    };

/**
 * @internal
 * @reference {@link RegleCollectionRuleDecl}
 *
 */
export type $InternalRegleCollectionRuleDecl = $InternalRegleRuleDecl & {
  $each?: $InternalFormPropertyTypes;
};

/**
 * @public
 */
export type InlineRuleDeclaration<
  TValue extends any = any,
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> =
    | RegleRuleMetadataDefinition
    | Promise<RegleRuleMetadataDefinition>,
> = (value: Maybe<TValue>, ...args: any[]) => TReturn;

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
> =
  | InlineRuleDeclaration<TValue, TReturn>
  | RegleRuleDefinition<TValue, TParams, TAsync, TMetadata>;
