import type { Raw, Ref } from 'vue';
import type { useRegleFn } from '../../core';
import type { CollectionRegleBehaviourOptions, DeepReactiveState, FieldRegleBehaviourOptions, Regle } from '../core';
import type {
  ArrayElement,
  JoinDiscriminatedUnions,
  Maybe,
  MaybeGetter,
  MaybeRefOrComputedRef,
  RegleStatic,
  RemoveIndexSignature,
  Unwrap,
  UnwrapMaybeRef,
} from '../utils';
import type { DefaultValidatorsTree, ExtendedRulesDeclarations } from './rule.custom.types';
import type {
  RegleRuleDefinition,
  RegleRuleMetadataDefinition,
  RegleRuleWithParamsDefinitionInput,
} from './rule.definition.type';
import type { UnwrapRegleUniversalParams } from './rule.params.types';

/**
 * @public
 */
export type ReglePartialRuleTree<
  TForm extends Record<string, any> = Record<string, any>,
  TCustomRules extends Partial<ExtendedRulesDeclarations> = Partial<ExtendedRulesDeclarations>,
> = {
  [TKey in keyof TForm]?: RegleFormPropertyType<TForm[TKey], TCustomRules>;
};

/**
 * @public
 */
export type RegleRuleTree<
  TForm extends Record<string, any>,
  TCustomRules extends Partial<ExtendedRulesDeclarations> = Partial<ExtendedRulesDeclarations>,
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
  TForm extends MaybeRefOrComputedRef<Record<string, any>> | DeepReactiveState<Record<string, any>>,
  TCustomRules extends Partial<ExtendedRulesDeclarations> | Regle<any, any> | useRegleFn<any> =
    Partial<ExtendedRulesDeclarations>,
  TState = Unwrap<UnwrapMaybeRef<TForm>>,
  TCustom = TCustomRules extends Regle<any, infer R>
    ? R extends ReglePartialRuleTree<any, infer C>
      ? C
      : Partial<ExtendedRulesDeclarations>
    : TCustomRules extends useRegleFn<infer Rules, any>
      ? Rules
      : {},
> = {
  [TKey in keyof JoinDiscriminatedUnions<TState>]?: RegleFormPropertyType<
    JoinDiscriminatedUnions<TState>[TKey],
    Omit<Partial<ExtendedRulesDeclarations>, keyof TCustom> & Partial<TCustom>
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
  TCustomRules extends Partial<ExtendedRulesDeclarations> = Partial<ExtendedRulesDeclarations>,
> = [NonNullable<TValue>] extends [never]
  ? MaybeRefOrComputedRef<RegleRuleDecl<TValue, TCustomRules>>
  : NonNullable<TValue> extends Array<any>
    ? RegleCollectionRuleDecl<TValue, TCustomRules>
    : NonNullable<TValue> extends Date
      ? MaybeRefOrComputedRef<RegleRuleDecl<NonNullable<TValue>, TCustomRules>>
      : NonNullable<TValue> extends File
        ? MaybeRefOrComputedRef<RegleRuleDecl<NonNullable<TValue>, TCustomRules>>
        : NonNullable<TValue> extends Ref<infer V>
          ? RegleFormPropertyType<V, TCustomRules>
          : NonNullable<TValue> extends Record<string, any>
            ? NonNullable<TValue> extends RegleStatic<infer U>
              ? MaybeRefOrComputedRef<RegleRuleDecl<Raw<U>, TCustomRules>>
              : ReglePartialRuleTree<NonNullable<TValue>, TCustomRules>
            : MaybeRefOrComputedRef<RegleRuleDecl<NonNullable<TValue>, TCustomRules>>;

/**
 * @internal
 * @reference {@link RegleFormPropertyType}
 */
export type $InternalFormPropertyTypes =
  | MaybeRefOrComputedRef<$InternalRegleRuleDecl>
  | $InternalRegleCollectionRuleDecl
  | $InternalReglePartialRuleTree
  | FieldRegleBehaviourOptions;

/**
 * @public
 * Rule tree for a form property
 */
export type RegleRuleDecl<
  TValue extends any = any,
  TCustomRules extends Partial<ExtendedRulesDeclarations> = Partial<DefaultValidatorsTree>,
  TOptions extends Record<string, unknown> = FieldRegleBehaviourOptions,
> = TOptions & {
  [TKey in keyof RemoveIndexSignature<TCustomRules>]?: FormRuleDeclaration<TValue, any[]>;
} & { [x: string]: FormRuleDeclaration<TValue, any[]> | boolean | number | undefined };

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
  TCustomRules extends Partial<ExtendedRulesDeclarations> = Partial<ExtendedRulesDeclarations>,
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
  TCustomRules extends Partial<ExtendedRulesDeclarations> = Partial<ExtendedRulesDeclarations>,
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
