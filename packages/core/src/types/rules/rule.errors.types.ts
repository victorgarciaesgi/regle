import type { MaybeRef } from 'vue';
import type {
  ExtendOnlyRealRecord,
  HasNamedKeys,
  IsRegleStatic,
  JoinDiscriminatedUnions,
  UnwrapMaybeRef,
} from '../utils';
import type { RegleFieldIssue } from './rule.status.types';
import type { IsAny } from 'type-fest';

export type RegleErrorTree<
  TState = MaybeRef<Record<string, any> | any[]>,
  TIssue extends boolean = false,
  TSchema extends boolean = false,
> = {
  readonly [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]: RegleValidationErrors<
    JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
    false,
    TIssue,
    TSchema
  >;
};

export type RegleIssuesTree<TState = MaybeRef<Record<string, any> | any[]>, TSchema extends boolean = false> = {
  readonly [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]: RegleValidationErrors<
    JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
    false,
    true,
    TSchema
  >;
};

export type RegleExternalErrorTree<TState = MaybeRef<Record<string, any> | any[]>, TSchema extends boolean = false> = {
  readonly [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]?: RegleValidationErrors<
    JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
    true,
    TSchema
  >;
};

export type RegleExternalSchemaErrorTree<
  TState = MaybeRef<Record<string, any> | any[]>,
  TSchema extends boolean = false,
> = {
  readonly [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]?: RegleValidationErrors<
    JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
    true,
    true,
    TSchema
  >;
};

type ErrorMessageOrIssue<TIssue extends boolean> = TIssue extends true ? RegleFieldIssue[] : string[];

export type RegleValidationErrors<
  TState extends Record<string, any> | any[] | unknown = never,
  TExternal extends boolean = false,
  TIssue extends boolean = false,
  TSchema extends boolean = false,
> =
  HasNamedKeys<TState> extends true
    ? IsAny<TState> extends true
      ? any
      : NonNullable<TState> extends Array<infer U>
        ? TSchema extends false
          ? U extends Record<string, any>
            ? TExternal extends false
              ? RegleCollectionErrors<U, TIssue, TSchema>
              : RegleExternalCollectionErrors<U, TIssue, TSchema>
            : ErrorMessageOrIssue<TIssue>
          : RegleCollectionErrors<U, TIssue, TSchema>
        : NonNullable<TState> extends Date | File
          ? ErrorMessageOrIssue<TIssue>
          : NonNullable<TState> extends Record<string, any>
            ? IsRegleStatic<NonNullable<TState>> extends true
              ? ErrorMessageOrIssue<TIssue>
              : TExternal extends false
                ? RegleErrorTree<TState, TIssue, TSchema>
                : RegleExternalErrorTree<TState, TSchema>
            : ErrorMessageOrIssue<TIssue>
    : any;

export type RegleCollectionErrors<
  TState extends any,
  TIssue extends boolean = false,
  TSchema extends boolean = false,
> = {
  readonly $self: TIssue extends true ? RegleFieldIssue[] : string[];
  readonly $each: RegleValidationErrors<TState, false, TIssue, TSchema>[];
};

export type RegleExternalCollectionErrors<
  TState extends Record<string, any>,
  TIssue extends boolean = false,
  TSchema extends boolean = false,
> = {
  readonly $self?: TIssue extends true ? RegleFieldIssue[] : string[];
  readonly $each?: RegleValidationErrors<TState, true, TIssue, TSchema>[];
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
