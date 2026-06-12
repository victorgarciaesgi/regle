import type { EmptyObject, IsAny, IsEmptyObject, IsUnknown, Paths } from 'type-fest';
import type { MaybeRef, UnwrapRef } from 'vue';
import type { FieldRegleBehaviourOptions } from '../core';
import type { HasNamedKeys, IsRegleStatic, JoinDiscriminatedUnions, UnwrapMaybeRef } from '../utils';
import type { ExtendedRulesDeclarations } from './rule.custom.types';
import type { InlineRuleDeclaration, RegleFormPropertyType, ReglePartialRuleTree } from './rule.declaration.types';
import type { RegleRuleDefinitionLight, RegleRuleMetadataDefinition } from './rule.definition.type';
import type { RegleRuleStatus } from './rule.status.types';

export type RegleErrorTree<
  TState = MaybeRef<Record<string, any> | any[]>,
  TIssue extends boolean = false,
  TSchema extends boolean = false,
> =
  IsAny<TState> extends true
    ? any
    : IsUnknown<TState> extends true
      ? any
      : {
          readonly [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]: RegleValidationErrors<
            JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
            false,
            TIssue,
            TSchema
          >;
        } & {
          readonly $self?: string[];
        };

export type RegleIssuesTree<
  TState = MaybeRef<Record<string, any> | any[]>,
  TSchema extends boolean = false,
  TRules extends ReglePartialRuleTree<NonNullable<TState>> = Record<string, any>,
> =
  IsAny<TState> extends true
    ? any
    : IsUnknown<TState> extends true
      ? any
      : {
          readonly [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]: RegleValidationErrors<
            JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
            false,
            true,
            TSchema,
            K extends keyof TRules
              ? TRules[K] extends RegleFormPropertyType<Record<string, any>>
                ? TRules[K]
                : EmptyObject
              : EmptyObject
          >;
        } & {
          readonly $self?: RegleFieldIssue[];
        };

export type RegleExternalErrorTree<TState = MaybeRef<Record<string, any> | any[]>, TSchema extends boolean = false> =
  IsAny<TState> extends true
    ? any
    : IsUnknown<TState> extends true
      ? any
      :
          | ({
              [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]?: RegleValidationErrors<
                JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
                true,
                TSchema
              >;
            } & {
              $self?: RegleFieldIssue[];
            })
          | Record<Paths<TState> | (string & {}), string[]>;

export type RegleExternalIssueTree<TState = MaybeRef<Record<string, any> | any[]>, TSchema extends boolean = false> =
  IsAny<TState> extends true
    ? any
    : IsUnknown<TState> extends true
      ? any
      :
          | ({
              [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]?: RegleValidationErrors<
                JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
                true,
                true,
                TSchema
              >;
            } & {
              $self?: RegleExternalFieldIssue[];
            })
          | Partial<Record<Paths<TState> | (string & {}), RegleExternalFieldIssue[]>>;

export type RegleExternalSchemaErrorTree<
  TState = MaybeRef<Record<string, any> | any[]>,
  TSchema extends boolean = false,
> =
  IsAny<TState> extends true
    ? any
    : IsUnknown<TState> extends true
      ? any
      : {
          [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]?: RegleValidationErrors<
            JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
            true,
            true,
            TSchema
          >;
        };

export type RegleExternalSchemaIssueTree<
  TState = MaybeRef<Record<string, any> | any[]>,
  TSchema extends boolean = false,
> =
  IsAny<TState> extends true
    ? any
    : IsUnknown<TState> extends true
      ? any
      : {
          [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]?: RegleValidationErrors<
            JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
            true,
            true,
            TSchema
          >;
        };

type ErrorMessageOrIssue<
  TIssue extends boolean,
  TRules extends RegleFormPropertyType<Record<string, any>> = EmptyObject,
> = TIssue extends true ? RegleFieldIssue<TRules>[] : string[];

type ExternalErrorMessageOrIssue<TIssue extends boolean> = TIssue extends true ? RegleExternalFieldIssue[] : string[];

export type RegleValidationErrors<
  TState extends Record<string, any> | any[] | unknown = never,
  TExternal extends boolean = false,
  TIssue extends boolean = false,
  TSchema extends boolean = false,
  TRules extends RegleFormPropertyType<Record<string, any>> = EmptyObject,
> =
  IsAny<TState> extends true
    ? any
    : IsUnknown<TState> extends true
      ? any
      : HasNamedKeys<TState> extends true
        ? NonNullable<TState> extends Array<infer U>
          ? TSchema extends false
            ? TExternal extends false
              ? RegleCollectionErrors<U, TIssue, TSchema>
              : RegleExternalCollectionErrors<U, TIssue, TSchema>
            : RegleCollectionErrors<U, TIssue, TSchema>
          : NonNullable<TState> extends Date | File
            ? TExternal extends true
              ? ExternalErrorMessageOrIssue<TIssue>
              : ErrorMessageOrIssue<TIssue, TRules>
            : NonNullable<TState> extends Record<string, any>
              ? IsRegleStatic<NonNullable<TState>> extends true
                ? TExternal extends true
                  ? ExternalErrorMessageOrIssue<TIssue>
                  : ErrorMessageOrIssue<TIssue, TRules>
                : TExternal extends false
                  ? RegleErrorTree<TState, TIssue, TSchema>
                  : TIssue extends true
                    ? RegleExternalIssueTree<TState, TSchema>
                    : RegleExternalErrorTree<TState, TSchema>
              : TExternal extends true
                ? ExternalErrorMessageOrIssue<TIssue>
                : ErrorMessageOrIssue<TIssue, TRules>
        : any;

export interface RegleIssueCustomMetadata {}

export type RegleFieldIssue<
  TRules extends RegleFormPropertyType<unknown, Partial<ExtendedRulesDeclarations>> = EmptyObject,
> = {
  readonly $property: string;
  readonly $type?: string;
  readonly $message: string;
  [x: string]: unknown;
} & RegleIssueCustomMetadata &
  (IsEmptyObject<TRules> extends true
    ? {
        readonly $rule: string;
      }
    : {
        [K in keyof ComputeFieldRules<any, TRules>]: ComputeFieldRules<any, TRules>[K] extends {
          $metadata: infer TMetadata;
        }
          ? K extends string
            ? { readonly $rule: K } & (TMetadata extends boolean ? { readonly $rule: string } : TMetadata)
            : { readonly $rule: string }
          : { readonly $rule: string };
      }[keyof ComputeFieldRules<any, TRules>]);

export type RegleExternalFieldIssue = Pick<RegleFieldIssue, '$message'> &
  Partial<Omit<RegleFieldIssue, '$message'>> &
  Record<string, unknown>;

export type ComputeFieldRules<
  TState extends any,
  TRules extends MaybeRef<RegleFormPropertyType<unknown, Partial<ExtendedRulesDeclarations>>>,
> =
  IsEmptyObject<UnwrapRef<TRules>> extends true
    ? {
        readonly [x: string]: RegleRuleStatus<TState, any[], any>;
      }
    : {
        readonly [TRuleKey in keyof UnwrapRef<TRules> as TRuleKey extends '$each' | keyof FieldRegleBehaviourOptions
          ? never
          : TRuleKey]: RegleRuleStatus<
          TState,
          UnwrapRef<TRules>[TRuleKey] extends RegleRuleDefinitionLight<infer TParams, any> ? TParams : [],
          UnwrapRef<TRules>[TRuleKey] extends RegleRuleDefinitionLight<any, any, infer TMetadata>
            ? TMetadata
            : UnwrapRef<TRules>[TRuleKey] extends InlineRuleDeclaration<any, any[], infer TReturn>
              ? TReturn extends Promise<infer P>
                ? P
                : TReturn
              : RegleRuleMetadataDefinition
        >;
      };

export type RegleCollectionErrors<
  TState extends any,
  TIssue extends boolean = false,
  TSchema extends boolean = false,
> = {
  readonly $self: TIssue extends true ? RegleFieldIssue[] : string[];
  readonly $each: RegleValidationErrors<TState, false, TIssue, TSchema>[];
};

export type RegleExternalCollectionErrors<
  TState extends unknown,
  TIssue extends boolean = false,
  TSchema extends boolean = false,
> = {
  readonly $self?: TIssue extends true ? RegleExternalFieldIssue[] : string[];
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

export type $InternalRegleExternalIssues =
  | $InternalRegleExternalCollectionIssues
  | RegleExternalFieldIssue[]
  | $InternalRegleIssuesTree;

export type $InternalRegleExternalCollectionIssues = {
  readonly $self?: RegleExternalFieldIssue[];
  readonly $each?: $InternalRegleExternalIssues[];
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
