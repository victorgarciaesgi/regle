import { InlineRuleDeclaration, RegleRuleDefinition } from '@regle/core';

export type ExtractValueFromRules<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends RegleRuleDefinition<infer V, any>
    ? [V, ...ExtractValueFromRules<R>]
    : F extends InlineRuleDeclaration<infer V>
    ? [V, ...ExtractValueFromRules<R>]
    : [F, ...ExtractValueFromRules<R>]
  : [];

export type ExtractParamsFromRules<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends RegleRuleDefinition<any, infer P>
    ? [P, ...ExtractParamsFromRules<R>]
    : [F, ...ExtractParamsFromRules<R>]
  : [];

type CreateFn<T extends any[]> = (...args: T) => any;

type FilterTuple<T extends any[]> = T extends [infer F, ...infer R]
  ? [F] extends [[]]
    ? [...FilterTuple<R>]
    : [F, ...FilterTuple<R>]
  : [];

type UnwrapTuplesRaw<T extends any[] = [], F = CreateFn<T>> = [T] extends [[]]
  ? []
  : Parameters<
      F extends (...args: infer Args) => any
        ? (
            ...args: {
              [K in keyof Args]: Args[K] extends Array<infer U> ? U : never;
            }
          ) => any
        : never
    >;

export type UnwrapTuples<T extends any[]> = FilterTuple<UnwrapTuplesRaw<T>>;
