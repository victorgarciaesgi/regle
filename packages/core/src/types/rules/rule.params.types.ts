import { MaybeRef } from 'vue';

export type ParamDecl<T = any> = MaybeRef<T> | (() => T);

type CreateFn<T extends any[]> = (...args: T) => any;

/**
 * Transform normal parameters tuple declaration to a rich tuple declaration
 *
 * [foo: string, bar?: number] => [foo: MaybeRef<string> | (() => string), bar?: MaybeRef<number | undefined> | (() => number) | undefined]
 */
export type ShibieUniversalParams<T extends any[] = [], F = CreateFn<T>> = [T] extends [[]]
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

export type UnwrapShibieUniversalParams<T extends ParamDecl[] = [], F = CreateFn<T>> = [T] extends [
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
