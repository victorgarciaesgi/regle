import type { MaybeRef } from 'vue';
import type { RegleCollectionRuleDecl, RegleRuleDecl } from '../rules';
import type { ExtendOnlyRealRecord, ExtractFromGetter } from './misc.types';

/**
/**
 * DeepExact<T, S> is a TypeScript utility type that recursively checks whether the structure of type S
 * exactly matches the structure of type T, including all nested properties.
 * 
 * Used in `useRegle` and `inferRules` to enforce that the rules object matches the expected shape exactly.
 */
export type DeepExact<TInfer, TTree> =
  NonNullable<TTree> extends MaybeRef<RegleRuleDecl>
    ? TTree
    : NonNullable<TTree> extends MaybeRef<RegleCollectionRuleDecl>
      ? TTree
      : [keyof TInfer] extends [keyof ExtractFromGetter<TTree>]
        ? ExactObject<TInfer, TTree>
        : { [K in keyof TInfer as K extends keyof TTree ? never : K]: TypeError<`Unknown property: <${Coerce<K>}>`> };

type ExactObject<TInfer, TTree> = {
  [K in keyof TTree]: NonNullable<TTree[K]> extends Record<string, any>
    ? ExtendOnlyRealRecord<TTree[K]> extends true
      ? NonNullable<TTree[K]> extends MaybeRef<RegleRuleDecl>
        ? TTree[K]
        : K extends keyof TInfer
          ? DeepExact<TInfer[K], NonNullable<TTree[K]>>
          : TTree[K]
      : TTree[K]
    : TTree[K];
};

export type TypeError<Msg> = {
  [' TypeError']: Msg;
};

type Coerce<T> = `${T & string}`;
