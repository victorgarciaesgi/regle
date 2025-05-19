import type { Maybe, MaybeReadonly } from '../../types/utils';
import type { MaybeRefOrGetter } from 'vue';

type CreateFn<T extends any[]> = (...args: T) => any;

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
