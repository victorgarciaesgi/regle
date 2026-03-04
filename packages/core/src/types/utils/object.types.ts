import type { IsUnion } from 'type-fest';
import type { ComputedRef, MaybeRef, Ref, UnwrapNestedRefs, UnwrapRef } from 'vue';
import type { DeepReactiveState } from '../core';
import type { RegleStaticImpl } from './static.types';
import type { LazyJoinDiscriminatedUnions } from './union.types';

// ----- Utils -----

/**
 * Restore the optional properties (with ?) of a generated mapped object type
 */
export type RestoreOptionalProperties<TObject extends Record<string, any>> = {
  [K in keyof TObject as TObject[K] extends NonNullable<TObject[K]> ? K : never]: TObject[K];
} & {
  [K in keyof TObject as TObject[K] extends NonNullable<TObject[K]> ? never : K]?: TObject[K];
};

export type RemoveIndexSignature<T> = {
  [K in keyof T as string extends K ? never : number extends K ? never : symbol extends K ? never : K]: T[K];
};

// ----- Prop types
/**
 * Merge every boolean property into a single boolean.
 */
type MergePropsIntoRequiredBooleans<TObject extends Record<string, any>> = {
  [K in keyof TObject]-?: TObject[K] extends NonNullable<TObject[K]> ? true : false;
}[keyof TObject];

/**
 * Ensure that if at least one prop is required, the "prop" object will be required too
 */
export type HaveAnyRequiredProps<TObject extends Record<string, any>> = [TObject] extends [never]
  ? false
  : TObject extends Record<string, any>
    ? MergePropsIntoRequiredBooleans<TObject> extends false
      ? false
      : true
    : false;

// ----- Enum types -----

export type EnumType<T extends Record<string, unknown>> = T[keyof T];
export type EnumLike = {
  [k: string]: string | number;
  [nu: number]: string;
};

// ------ Vue Ref utils

export type MaybeRefOrComputedRef<T extends any> = MaybeRef<T> | ComputedRef<T>;

export type UnwrapMaybeRef<T extends MaybeRef<any> | DeepReactiveState<any>> =
  T extends Ref<any> ? UnwrapRef<T> : UnwrapNestedRefs<T>;

// ------ Object Checks -----
export type TupleToPlainObj<T> = { [I in keyof T & `${number}`]: T[I] };

export type HasNamedKeys<T> =
  IsUnion<T> extends true ? ProcessHasNamedKeys<LazyJoinDiscriminatedUnions<T>> : ProcessHasNamedKeys<T>;

type ProcessHasNamedKeys<T> = {
  [K in keyof NonNullable<T>]: K extends string ? (string extends K ? never : K) : never;
}[keyof NonNullable<T>] extends never
  ? false
  : true;

// ----- Object Transformations -----

/**
 * Convert a nested object to a deeply nested partial object.
 */
export type DeepPartial<T> =
  T extends Array<infer U>
    ? Array<DeepPartial<U>>
    : T extends Date | File | RegleStaticImpl<unknown>
      ? T
      : T extends Record<string, any>
        ? {
            [K in keyof T]?: DeepPartial<T[K]> | undefined;
          }
        : T | undefined;
