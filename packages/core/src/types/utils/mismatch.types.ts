import type { And, Extends, IsAny, IsNever, IsUnknown, Not, StrictEqualUsingBranding, UsefulKeys } from 'expect-type';

/**
 * Borrowed from vitest
 */
export type PrintType<T> =
  IsUnknown<T> extends true
    ? 'unknown'
    : IsNever<T> extends true
      ? 'never'
      : IsAny<T> extends true
        ? never
        : boolean extends T
          ? 'boolean'
          : T extends boolean
            ? `literal boolean: ${T}`
            : string extends T
              ? 'string'
              : T extends string
                ? `literal string: ${T}`
                : number extends T
                  ? 'number'
                  : T extends number
                    ? `literal number: ${T}`
                    : bigint extends T
                      ? 'bigint'
                      : T extends bigint
                        ? `literal bigint: ${T}`
                        : T extends null
                          ? 'null'
                          : T extends undefined
                            ? 'undefined'
                            : T extends (...args: any[]) => any
                              ? 'function'
                              : '...';

/**
 * Borrowed from vitest
 */
export type MismatchInfo<Actual, Expected> =
  And<[Extends<PrintType<Actual>, '...'>, Not<IsAny<Actual>>]> extends true
    ? And<[Extends<any[], Actual>, Extends<any[], Expected>]> extends true
      ? Array<MismatchInfo<Extract<Actual, any[]>[number], Extract<Expected, any[]>[number]>>
      : {
          [K in UsefulKeys<Actual> | UsefulKeys<Expected>]: MismatchInfo<
            K extends keyof Actual ? Actual[K] : never,
            K extends keyof Expected ? Expected[K] : never
          >;
        }
    : StrictEqualUsingBranding<Actual, Expected> extends true
      ? Actual
      : `[Regle error] The parent property does not match the form schema`;
