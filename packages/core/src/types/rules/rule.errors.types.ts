import type { PartialDeep } from 'type-fest';
import type { MaybeRef, UnwrapNestedRefs } from 'vue';
import type { ReglePartialRuleTree } from './rule.declaration.types';
import type { DeepSafeFormState, SafeFieldProperty } from '../core';
import type { ExtendOnlyRealRecord, Maybe, Prettify } from '../utils';

export type RegleErrorTree<TState = MaybeRef<Record<string, any> | any[]>> = {
  readonly [K in keyof UnwrapNestedRefs<TState>]: RegleValidationErrors<UnwrapNestedRefs<TState>[K]>;
};

export type RegleExternalErrorTree<TState = Record<string, any> | any[]> = PartialDeep<
  RegleErrorTree<TState>,
  { recurseIntoArrays: true }
>;

export type RegleValidationErrors<TState extends Record<string, any> | any[] | unknown = never> =
  NonNullable<TState> extends Array<infer U extends Record<string, any>>
    ? RegleCollectionErrors<U>
    : NonNullable<TState> extends Date | File
      ? string[]
      : NonNullable<TState> extends Record<string, any>
        ? RegleErrorTree<TState>
        : string[];

export type RegleCollectionErrors<TState extends Record<string, any>> = {
  readonly $errors: string[];
  readonly $each: RegleValidationErrors<TState>[];
};

/** @internal */
export type $InternalRegleCollectionErrors = {
  readonly $errors?: string[];
  readonly $each?: $InternalRegleErrors[];
};

export type $InternalRegleErrorTree = {
  [x: string]: $InternalRegleErrors;
};

/**
 * @internal
 */
export type $InternalRegleErrors = $InternalRegleCollectionErrors | string[] | $InternalRegleErrorTree;

// - Misc

export type PartialFormState<TState extends Record<string, any>> = [unknown] extends [TState]
  ? {}
  : Prettify<
      {
        [K in keyof TState as ExtendOnlyRealRecord<TState[K]> extends true
          ? never
          : TState[K] extends Array<any>
            ? never
            : K]?: Maybe<TState[K]>;
      } & {
        [K in keyof TState as ExtendOnlyRealRecord<TState[K]> extends true
          ? K
          : TState[K] extends Array<any>
            ? K
            : never]: NonNullable<TState[K]> extends Array<infer U extends Record<string, any>>
          ? PartialFormState<U>[]
          : PartialFormState<TState[K]>;
      }
    >;

export type RegleResult<Data extends Record<string, any> | any[] | unknown, TRules extends ReglePartialRuleTree<any>> =
  | {
      result: false;
      data: NonNullable<Data> extends Date | File
        ? Maybe<Data>
        : NonNullable<Data> extends Array<infer U extends Record<string, any>>
          ? PartialFormState<U>[]
          : NonNullable<Data> extends Record<string, any>
            ? PartialFormState<NonNullable<Data>>
            : Maybe<Data>;
    }
  | {
      result: true;
      data: Data extends Array<infer U extends Record<string, any>>
        ? DeepSafeFormState<U, TRules>[]
        : Data extends Date | File
          ? SafeFieldProperty<Data, TRules>
          : Data extends Record<string, any>
            ? DeepSafeFormState<Data, TRules>
            : SafeFieldProperty<Data, TRules>;
    };

export type $InternalRegleResult = { result: boolean; data: any };

export type DataType = string | number | Record<string, any> | File | Array<any> | Date | null | undefined;
