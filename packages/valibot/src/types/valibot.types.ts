import type { Maybe } from '@regle/core';
import type * as v from 'valibot';
import type { IsAny } from 'type-fest';

export type ValibotObj<T extends Record<string, unknown>> = {
  readonly [K in keyof T]: ValibotChild<IsAny<T[K]> extends true ? unknown : T[K]>;
};

export type ValibotChild<TValue extends unknown> =
  TValue extends Array<infer A>
    ? v.ArraySchema<ValibotChild<A>, v.ErrorMessage<v.ArrayIssue> | undefined>
    : TValue extends Date | File
      ? v.BaseSchema<Maybe<Date | File>, Maybe<Date | File>, v.BaseIssue<unknown>>
      : TValue extends Record<PropertyKey, any>
        ? v.ObjectSchema<ValibotObj<TValue>, v.ErrorMessage<v.ObjectIssue> | undefined>
        : v.BaseSchema<Maybe<TValue>, Maybe<TValue>, v.BaseIssue<unknown>>;

export type toValibot<T extends Record<string, unknown>> = v.ObjectSchema<
  ValibotObj<T>,
  v.ErrorMessage<v.ObjectIssue> | undefined
>;
