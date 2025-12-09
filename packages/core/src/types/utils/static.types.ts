import type { IsUnknown } from 'type-fest';
import type { Raw } from 'vue';
import type { isRecordLiteral } from './misc.types';

declare const RegleStaticSymbol: unique symbol;

export type RegleStatic<T> = T extends new (...args: infer Args) => infer U
  ? RegleStaticImpl<new (...args: Args) => RegleStaticImpl<U>>
  : RegleStaticImpl<T>;

export type RegleStaticImpl<T> = Raw<T & { [RegleStaticSymbol]: true }>;

export type UnwrapRegleStatic<T> = T extends RegleStaticImpl<infer U> ? U : T;
export type IsRegleStatic<T> = T extends RegleStaticImpl<T> ? true : false;

export type UnwrapStatic<T> =
  IsUnknown<T> extends true ? any : NonNullable<T> extends RegleStaticImpl<infer U> ? Raw<U> : UnwrapStaticSimple<T>;

type UnwrapStaticSimple<T> =
  NonNullable<T> extends Array<infer U>
    ? Array<UnwrapStatic<U>>
    : isRecordLiteral<NonNullable<T>> extends true
      ? {
          [K in keyof T]: UnwrapStatic<T[K]>;
        }
      : T;
