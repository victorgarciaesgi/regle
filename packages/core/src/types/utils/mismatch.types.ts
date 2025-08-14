import type { MaybeRef, UnwrapRef } from 'vue';
import type { RegleCollectionRuleDecl, ReglePartialRuleTree, RegleRuleDecl } from '../rules';
import type { ArrayElement } from './Array.types';
import type { JoinDiscriminatedUnions } from './object.types';

export type isDeepExact<TRules, TTree> = {
  [K in keyof TRules]-?: CheckDeepExact<
    NonNullable<TRules[K]>,
    K extends keyof JoinDiscriminatedUnions<TTree> ? NonNullable<JoinDiscriminatedUnions<TTree>[K]> : never
  >;
}[keyof TRules] extends true
  ? true
  : false;

type CheckDeepExact<TRules, TTree> = [TTree] extends [never]
  ? false
  : TRules extends RegleCollectionRuleDecl
    ? TTree extends Array<any>
      ? isDeepExact<NonNullable<TRules['$each']>, JoinDiscriminatedUnions<NonNullable<ArrayElement<TTree>>>>
      : TRules extends MaybeRef<RegleRuleDecl>
        ? true
        : TRules extends ReglePartialRuleTree<any>
          ? isDeepExact<UnwrapRef<TRules>, TTree>
          : false
    : TRules extends MaybeRef<RegleRuleDecl>
      ? true
      : TRules extends ReglePartialRuleTree<any>
        ? isDeepExact<UnwrapRef<TRules>, TTree>
        : false;
