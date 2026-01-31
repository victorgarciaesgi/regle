import type { InlineRuleDeclaration, RegleRuleDefinition } from '@regle/core';
import type { EmptyObject } from 'type-fest';

type ExtractBoolean<T extends [...any[]]> = T extends [infer F, ...infer R]
  ? F extends true
    ? true
    : F extends false
      ? ExtractBoolean<R>
      : false
  : false;

// --- Guess Async rules
export type ExtractValueFromRules<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends RegleRuleDefinition<unknown, infer V, any, any, any>
    ? [V, ...ExtractValueFromRules<R>]
    : F extends InlineRuleDeclaration<infer V, any>
      ? [V, ...ExtractValueFromRules<R>]
      : [F, ...ExtractValueFromRules<R>]
  : [];

type ExtractAsyncStatesFromRules<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends RegleRuleDefinition<unknown, any, any, infer A, any>
    ? [A, ...ExtractValueFromRules<R>]
    : F extends InlineRuleDeclaration<any, any>
      ? [ReturnType<F> extends Promise<any> ? true : false, ...ExtractValueFromRules<R>]
      : [F, ...ExtractValueFromRules<R>]
  : [];

export type GuessAsyncFromRules<T extends any[]> = ExtractBoolean<ExtractAsyncStatesFromRules<T>>;

// --- Guess NoEmpty rules

type ExtractNoEmptyStatesFromRules<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends RegleRuleDefinition<unknown, any, any, any, any, any, any, infer NonEmpty extends boolean>
    ? [NonEmpty, ...ExtractNoEmptyStatesFromRules<R>]
    : [false, ...ExtractNoEmptyStatesFromRules<R>]
  : [];

export type GuessNoEmptyFromRules<T extends any[]> = ExtractBoolean<ExtractNoEmptyStatesFromRules<T>>;

//
// --- Params
export type ExtractParamsFromRules<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends RegleRuleDefinition<unknown, any, infer P, any, any>
    ? [P, ...ExtractParamsFromRules<R>]
    : [F, ...ExtractParamsFromRules<R>]
  : [];

//
// --- Metadata

type MetadataBase = {
  $valid: boolean;
  [x: string]: any;
};

type ExtractMetaDataFromRules<T extends any[]> = T extends [infer F, ...infer R]
  ? F extends RegleRuleDefinition<unknown, any, any, any, infer M extends MetadataBase>
    ? [M, ...ExtractMetaDataFromRules<R>]
    : F extends InlineRuleDeclaration<any, any[], infer M extends MetadataBase | Promise<MetadataBase>>
      ? [M, ...ExtractMetaDataFromRules<R>]
      : [...ExtractMetaDataFromRules<R>]
  : [];

type ExtractMetadata<T extends [...any[]]> = T extends [infer F, ...infer R] ? F & ExtractMetadata<R> : {};

export type GuessMetadataFromRules<
  T extends any[],
  TMeta = ExtractMetadata<ExtractMetaDataFromRules<T>>,
> = TMeta extends EmptyObject ? boolean : TMeta;

//
// --- Utils

type CreateFn<T extends any[]> = (...args: T) => any;

type FilterTuple<T extends any[]> = T extends [infer F, ...infer R]
  ? [F] extends [[]]
    ? [...FilterTuple<R>]
    : [F, ...FilterTuple<R>]
  : [];

export type UnwrapTuplesRaw<T extends any[] = [], F = CreateFn<T>> = [T] extends [[]]
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

export type UnwrapTuples<T extends any[]> = FilterTuple<T> extends [infer U extends any[]] ? U : FilterTuple<T>;
