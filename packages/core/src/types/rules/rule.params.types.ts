import type { Maybe } from '../../types/utils';
import type { MaybeRef } from 'vue';

export type ParamDecl<T = any> = MaybeRef<Maybe<T>> | (() => Maybe<T>);

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
              [K in keyof Args]: ParamDecl<Args[K]>;
            }
          ) => any
        : never
    >;

export type UnwrapRegleUniversalParams<T extends ParamDecl[] = [], F = CreateFn<T>> = [T] extends [
  [],
]
  ? []
  : Parameters<
      F extends (...args: infer Args) => any
        ? (
            ...args: {
              [K in keyof Args]: Args[K] extends ParamDecl<infer U> ? U : Args[K];
            }
          ) => any
        : never
    >;
