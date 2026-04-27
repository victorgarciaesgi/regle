import type { MaybeRefOrGetter } from 'vue';
import type { Maybe } from '../utils';

type CreateFn<T extends any[]> = (...args: T) => any;

/**
 * Represents values that can be measured in terms of size or length.
 *
 * Supported types include:
 * - `string`: measured by character length
 * - `number`: measured by digit length when converted to string
 * - `T[]`: measured by array length
 * - `Record<PropertyKey, T>`: measured by number of own enumerable keys
 *
 * This type is primarily used by {@link https://reglejs.dev/core-concepts/rules/validations-helpers#getsize getSize function}
 * and related rules to ensure inputs are restricted to measurable values.
 *
 * @template T - The element type for arrays and object property values
 */
export type MeasurableValue<T extends any = any> = string | number | T[] | Record<PropertyKey, T>;

/**
 * Transform normal parameters tuple declaration to a rich tuple declaration
 *
 * [foo: string, bar?: number] => [foo: MaybeRef<string> | (() => string), bar?: MaybeRef<number | undefined> | (() => number) | undefined]
 */
export type RegleUniversalParams<T extends any[] = [], F = CreateFn<T>> = [T] extends [[]]
  ? []
  : Parameters<
      F extends (...args: infer Args) => any
        ? (
            ...args: {
              [K in keyof Args]: MaybeRefOrGetter<Maybe<Args[K]>>;
            }
          ) => any
        : never
    >;

export type UnwrapRegleUniversalParams<T extends MaybeRefOrGetter[] = [], F = CreateFn<T>> = [T] extends [[]]
  ? []
  : Parameters<
      F extends (...args: infer Args) => any
        ? (
            ...args: {
              [K in keyof Args]: Args[K] extends MaybeRefOrGetter<Maybe<infer U>> ? U : Args[K];
            }
          ) => any
        : never
    >;

/**
 * Transform a tuple of parameters to a tuple of parameters and loose parameters
 *
 * [foo: string, bar?: number] => [foo: string, bar?: number, ...unknown[]]
 *
 * @param TParams - The tuple of parameters
 * @param TLoose - The tuple of loose parameters
 * @returns The tuple of parameters and loose parameters
 */
export type ParamsToLooseParams<TParams extends any[], TLoose extends unknown[] = unknown[]> = TParams extends []
  ? [...TLoose]
  : TParams extends [infer TFirst, ...infer TRest]
    ? [TFirst, ...TRest, ...TLoose]
    : [...TParams, ...TLoose];

export type HasOptionalParams<T extends any[]> = T extends [param?: any, ...any[]]
  ? T[0] extends NonNullable<T[0]>
    ? false
    : true
  : false;
