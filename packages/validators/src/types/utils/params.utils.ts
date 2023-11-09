import { InlineRuleDeclaration, RegleRuleDefinition } from '@regle/core';

export type ExtractValueFromRules<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends RegleRuleDefinition<infer V, any, any>
    ? [V, ...ExtractValueFromRules<R>]
    : F extends InlineRuleDeclaration<infer V>
    ? [V, ...ExtractValueFromRules<R>]
    : [F, ...ExtractValueFromRules<R>]
  : [];

type ExtractAsyncStatesFromRules<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends RegleRuleDefinition<any, any, infer A>
    ? [A, ...ExtractValueFromRules<R>]
    : F extends InlineRuleDeclaration<any>
    ? [ReturnType<F> extends Promise<any> ? true : false, ...ExtractValueFromRules<R>]
    : [F, ...ExtractValueFromRules<R>]
  : [];

type ExtractAsync<T extends [...any[]]> = T extends [infer F, ...infer R]
  ? F extends true
    ? true
    : F extends false
    ? ExtractAsync<R>
    : false
  : false;

export type GuessAsyncFromRules<T extends any[]> = ExtractAsync<ExtractAsyncStatesFromRules<T>>;

export type ExtractParamsFromRules<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends RegleRuleDefinition<any, infer P, any>
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
