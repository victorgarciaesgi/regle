import type { MaybeRef } from 'vue';
import type { PrimitiveTypes } from './misc.types';

/**
 * Extract the element type from an array.
 *
 * @example
 * ```ts
 * type Element = ArrayElement<[1, 2, 3]>; // number
 * ```
 */
export type ArrayElement<T> = T extends Array<infer U> ? U : never;

/**
 * Exclude an element from a tuple Array.
 */
export type ExcludeFromTuple<T extends readonly any[], E> = T extends [infer F, ...infer R]
  ? [NonNullable<F>] extends [E]
    ? ExcludeFromTuple<R, E>
    : [Exclude<F, E>, ...ExcludeFromTuple<R, E>]
  : [];

/**
 * Unref nested elements from a tuple array.
 */
export type UnrefTuple<T extends readonly any[]> = T extends [infer F, ...infer R]
  ? [NonNullable<F>] extends [MaybeRef<infer U>]
    ? [U, ...UnrefTuple<R>]
    : [F, ...UnrefTuple<R>]
  : [];

/**
 * Check if every element in the array is a primitive type.
 */
export type IsPrimitiveArray<T extends any[] | null | undefined> =
  NonNullable<T> extends Array<infer A> ? (A extends PrimitiveTypes ? true : false) : false;

/**
 * Declares a tuple that must have at least one element
 */
export type NonEmptyTuple<T> = [T, ...T[]] | T[];
