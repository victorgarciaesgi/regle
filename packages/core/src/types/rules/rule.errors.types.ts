import type { MaybeRef } from 'vue';
import type { ExtendOnlyRealRecord, JoinDiscriminatedUnions, UnwrapMaybeRef } from '../utils';

export type RegleErrorTree<TState = MaybeRef<Record<string, any> | any[]>> = {
  readonly [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]: RegleValidationErrors<
    JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
    false
  >;
};

export type RegleExternalErrorTree<TState = MaybeRef<Record<string, any> | any[]>> = {
  readonly [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]?: RegleValidationErrors<
    JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
    true
  >;
};

export type RegleValidationErrors<
  TState extends Record<string, any> | any[] | unknown = never,
  TExternal extends boolean = false,
> =
  NonNullable<TState> extends Array<infer U extends Record<string, any>>
    ? ExtendOnlyRealRecord<U> extends true
      ? TExternal extends false
        ? RegleCollectionErrors<U>
        : RegleExternalCollectionErrors<U>
      : string[]
    : NonNullable<TState> extends Date | File
      ? string[]
      : NonNullable<TState> extends Record<string, any>
        ? TExternal extends false
          ? RegleErrorTree<TState>
          : RegleExternalErrorTree<TState>
        : string[];

export type RegleCollectionErrors<TState extends Record<string, any>> = {
  readonly $self: string[];
  readonly $each: RegleValidationErrors<TState, false>[];
};

export type RegleExternalCollectionErrors<TState extends Record<string, any>> = {
  readonly $self?: string[];
  readonly $each?: RegleValidationErrors<TState, true>[];
};

/** @internal */
export type $InternalRegleCollectionErrors = {
  readonly $self?: string[];
  readonly $each?: $InternalRegleErrors[];
};

export type $InternalRegleErrorTree = {
  [x: string]: $InternalRegleErrors;
};

/**
 * @internal
 */
export type $InternalRegleErrors = $InternalRegleCollectionErrors | string[] | $InternalRegleErrorTree;
