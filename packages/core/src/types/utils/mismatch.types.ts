import type { MaybeRef } from 'vue';
import type {
  AllRulesDeclarations,
  RegleCollectionEachRules,
  RegleCollectionRuleDecl,
  RegleCollectionRuleDefinition,
  ReglePartialRuleTree,
  RegleRuleDecl,
} from '../rules';
import type { ExtendOnlyRealRecord, ExtractFromGetter, Unwrap } from './misc.types';

/**
/**
 * DeepExact<T, S> is a TypeScript utility type that recursively checks whether the structure of type S
 * exactly matches the structure of type T, including all nested properties.
 * 
 * Used in `useRegle` and `inferRules` to enforce that the rules object matches the expected shape exactly.
 */
export type DeepExact<T, S> =
  NonNullable<S> extends MaybeRef<RegleRuleDecl>
    ? S
    : NonNullable<S> extends MaybeRef<RegleCollectionRuleDecl>
      ? S
      : [keyof T] extends [keyof ExtractFromGetter<S>]
        ? ExactObject<T, S>
        : { [K in keyof T as K extends keyof S ? never : K]: TypeError<`Unknown property: <${Coerce<K>}>`> };

type ExactObject<T, S> = {
  [K in keyof S]: ExtendOnlyRealRecord<S[K]> extends true
    ? NonNullable<S[K]> extends MaybeRef<RegleRuleDecl>
      ? S[K]
      : K extends keyof T
        ? DeepExact<T[K], NonNullable<S[K]>>
        : S[K]
    : S[K];
};

type foo = ReglePartialRuleTree<Unwrap<{ collection: { name: string }[] }>, Partial<AllRulesDeclarations>>;

type test = DeepExact<
  {
    collection: {
      required: () => true;
    };
  },
  ReglePartialRuleTree<Unwrap<{ collection: { name: string }[] }>, Partial<AllRulesDeclarations>>
>;

type TypeError<Msg> = {
  [' TypeError']: Msg;
};

type Coerce<T> = `${T & string}`;
