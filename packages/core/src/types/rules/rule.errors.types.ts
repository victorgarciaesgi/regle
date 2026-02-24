import type { EmptyObject, IsAny, IsEmptyObject } from 'type-fest';
import type { MaybeRef, UnwrapRef } from 'vue';
import type { FieldRegleBehaviourOptions } from '../core';
import type { HasNamedKeys, IsRegleStatic, JoinDiscriminatedUnions, UnwrapMaybeRef } from '../utils';
import type { ExtendedRulesDeclarations } from './rule.custom.types';
import type { InlineRuleDeclaration, RegleFormPropertyType, ReglePartialRuleTree } from './rule.declaration.types';
import type {
  RegleRuleDefinition,
  RegleRuleDefinitionLight,
  RegleRuleMetadataDefinition,
} from './rule.definition.type';
import type { RegleRuleStatus } from './rule.status.types';

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
} & {
  readonly $self?: string[];
};

export type RegleIssuesTree<
  TState = MaybeRef<Record<string, any> | any[]>,
  TSchema extends boolean = false,
  TRules extends ReglePartialRuleTree<NonNullable<TState>> = Record<string, any>,
> = {
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

export type RegleExternalErrorTree<TState = MaybeRef<Record<string, any> | any[]>, TSchema extends boolean = false> = {
  readonly [K in keyof JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>]?: RegleValidationErrors<
    JoinDiscriminatedUnions<UnwrapMaybeRef<TState>>[K],
    true,
    TSchema
  >;
} & {
  readonly $self?: RegleFieldIssue[];
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

type ErrorMessageOrIssue<
  TIssue extends boolean,
  TRules extends RegleFormPropertyType<Record<string, any>> = EmptyObject,
> = TIssue extends true ? RegleFieldIssue<TRules>[] : string[];

export type RegleValidationErrors<
  TState extends Record<string, any> | any[] | unknown = never,
  TExternal extends boolean = false,
  TIssue extends boolean = false,
  TSchema extends boolean = false,
  TRules extends RegleFormPropertyType<Record<string, any>> = EmptyObject,
> =
  HasNamedKeys<TState> extends true
    ? IsAny<TState> extends true
      ? any
      : NonNullable<TState> extends Array<infer U>
        ? TSchema extends false
          ? TExternal extends false
            ? RegleCollectionErrors<U, TIssue, TSchema>
            : RegleExternalCollectionErrors<U, TIssue, TSchema>
          : RegleCollectionErrors<U, TIssue, TSchema>
        : NonNullable<TState> extends Date | File
          ? ErrorMessageOrIssue<TIssue, TRules>
          : NonNullable<TState> extends Record<string, any>
            ? IsRegleStatic<NonNullable<TState>> extends true
              ? ErrorMessageOrIssue<TIssue, TRules>
              : TExternal extends false
                ? RegleErrorTree<TState, TIssue, TSchema>
                : RegleExternalErrorTree<TState, TSchema>
            : ErrorMessageOrIssue<TIssue, TRules>
    : any;

export type RegleFieldIssue<
  TRules extends RegleFormPropertyType<unknown, Partial<ExtendedRulesDeclarations>> = EmptyObject,
> = {
  readonly $property: string;
  readonly $type?: string;
  readonly $message: string;
} & (IsEmptyObject<TRules> extends true
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

export type ComputeFieldRules<
  TState extends any,
  TRules extends MaybeRef<RegleFormPropertyType<unknown, Partial<ExtendedRulesDeclarations>>>,
> =
  IsEmptyObject<UnwrapRef<TRules>> extends true
    ? {
        readonly [x: string]: RegleRuleStatus<TState, any[], any>;
      }
    : {
        readonly [TRuleKey in keyof Omit<
          UnwrapRef<TRules>,
          '$each' | keyof FieldRegleBehaviourOptions
        >]: RegleRuleStatus<
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
