import type { MaybeRef } from 'vue';

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
