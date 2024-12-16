import type { Maybe } from '@regle/core';
import type * as v from 'valibot';
import type { IsAny } from 'type-fest';

export type ValibotObj<T extends Record<string, unknown>> = {
  [K in keyof T]: ValibotChild<T[K]>;
};

type ObjectEntries<T extends Record<string, unknown>> = {
  [K in keyof T]: ValibotChild<IsAny<T[K]> extends true ? unknown : T[K]>;
};

export type ValibotChild<T extends unknown> =
  T extends Array<infer A>
    ? v.ArraySchema<ValibotChild<A>, undefined>
    : T extends Date | File
      ? v.BaseSchema<Maybe<Date | File>, Date | File, v.BaseIssue<unknown>>
      : T extends Record<PropertyKey, any>
        ? v.ObjectSchema<ObjectEntries<T>, undefined>
        : v.BaseSchema<Maybe<T>, T, v.BaseIssue<unknown>>;

export type toValibot<T extends Record<string, unknown>> = v.ObjectSchema<ValibotObj<T>, any>;
