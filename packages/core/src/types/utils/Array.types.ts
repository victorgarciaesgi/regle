import type { MaybeRef } from 'vue';
import type { PrimitiveTypes } from './misc.types';

export type ArrayElement<T> = T extends Array<infer U> ? U : never;

export type ExcludeFromTuple<T extends readonly any[], E> = T extends [infer F, ...infer R]
  ? [NonNullable<F>] extends [E]
    ? ExcludeFromTuple<R, E>
    : [Exclude<F, E>, ...ExcludeFromTuple<R, E>]
  : [];

export type UnrefTuple<T extends readonly any[]> = T extends [infer F, ...infer R]
  ? [NonNullable<F>] extends [MaybeRef<infer U>]
    ? [U, ...UnrefTuple<R>]
    : [F, ...UnrefTuple<R>]
  : [];

export type IsPrimitiveArray<T extends any[] | null | undefined> =
  NonNullable<T> extends Array<infer A> ? (A extends PrimitiveTypes ? true : false) : false;

export type Transform$EachKeys<T extends Record<string, any>> = {
  [K in keyof T as `${string & K}$each`]: T[K];
};

export type NonEmptyTuple<T> = [T, ...T[]] | T[];
