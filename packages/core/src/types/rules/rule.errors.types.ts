import type { MaybeRef } from 'vue';
import type { ExtendOnlyRealRecord, JoinDiscriminatedUnions, UnwrapMaybeRef } from '../utils';
import type { RegleFieldIssue } from './rule.status.types';

export type RegleErrorTree<TState = MaybeRef<Record<string, any> | any[]>, TIssue extends boolean = false> = {
  readonly [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]: RegleValidationErrors<
    JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
    false,
    TIssue
  >;
};

export type RegleIssuesTree<TState = MaybeRef<Record<string, any> | any[]>> = {
  readonly [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]: RegleValidationErrors<
    JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
    false,
    true
  >;
};

export type RegleExternalErrorTree<TState = MaybeRef<Record<string, any> | any[]>> = {
  readonly [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]?: RegleValidationErrors<
    JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
    true
  >;
};

export type RegleExternalSchemaErrorTree<TState = MaybeRef<Record<string, any> | any[]>> = {
  readonly [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]?: RegleValidationErrors<
    JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
    true,
    true
  >;
};

export type RegleValidationErrors<
  TState extends Record<string, any> | any[] | unknown = never,
  TExternal extends boolean = false,
  TIssue extends boolean = false,
> =
  NonNullable<TState> extends Array<infer U extends Record<string, any>>
    ? ExtendOnlyRealRecord<U> extends true
      ? TExternal extends false
        ? RegleCollectionErrors<U, TIssue>
        : RegleExternalCollectionErrors<U, TIssue>
      : TIssue extends true
        ? RegleFieldIssue[]
        : string[]
    : NonNullable<TState> extends Date | File
      ? TIssue extends true
        ? RegleFieldIssue[]
        : string[]
      : NonNullable<TState> extends Record<string, any>
        ? TExternal extends false
          ? RegleErrorTree<TState, TIssue>
          : RegleExternalErrorTree<TState>
        : TIssue extends true
          ? RegleFieldIssue[]
          : string[];

export type RegleCollectionErrors<TState extends Record<string, any>, TIssue extends boolean = false> = {
  readonly $self: TIssue extends true ? RegleFieldIssue[] : string[];
  readonly $each: RegleValidationErrors<TState, false, TIssue>[];
};

export type RegleExternalCollectionErrors<TState extends Record<string, any>, TIssue extends boolean = false> = {
  readonly $self?: TIssue extends true ? RegleFieldIssue[] : string[];
  readonly $each?: RegleValidationErrors<TState, true, TIssue>[];
};

/** @internal */
export type $InternalRegleCollectionErrors = {
  readonly $self?: string[];
  readonly $each?: $InternalRegleErrors[];
};

export type $InternalRegleErrorTree = {
  [x: string]: $InternalRegleErrors;
};

export type $InternalRegleErrors = $InternalRegleCollectionErrors | string[] | $InternalRegleErrorTree;

// -- Issues

export type $InternalRegleIssuesTree = {
  [x: string]: $InternalRegleIssues;
};

export type $InternalRegleIssues = $InternalRegleCollectionIssues | RegleFieldIssue[] | $InternalRegleIssuesTree;

export type $InternalRegleCollectionIssues = {
  readonly $self?: RegleFieldIssue[];
  readonly $each?: $InternalRegleIssues[];
};

// -- Schemas

export type $InternalRegleSchemaErrorTree = {
  [x: string]: $InternalRegleSchemaErrors;
};

export type $InternalRegleSchemaCollectionErrors = {
  readonly $self?: RegleFieldIssue[];
  readonly $each?: $InternalRegleSchemaErrors[];
};

/**
 * @internal
 */

export type $InternalRegleSchemaErrors =
  | $InternalRegleCollectionErrors
  | RegleFieldIssue[]
  | $InternalRegleSchemaErrorTree;
