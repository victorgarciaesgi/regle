import type { ArrayElement, ExtractFromGetter, NonPresentKeys } from '../utils';
import type {
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleDecl,
} from './rule.declaration.types';
import type { RegleCollectionRuleDefinition } from './rule.definition.type';

export type RegleErrorTree<
  TRules extends ReglePartialValidationTree<any, any>,
  TExternal extends RegleExternalErrorTree<Record<string, unknown>> | undefined = {},
> = {
  readonly [K in keyof TRules]: RegleValidationErrors<
    TRules[K],
    K extends keyof NonNullable<TExternal> ? NonNullable<TExternal>[K] : {}
  >;
} & {
  readonly [K in keyof NonPresentKeys<
    TRules,
    NonNullable<TExternal>
  >]-?: NonNullable<TExternal> extends RegleExternalErrorTree<infer U>
    ? K extends keyof RegleExternalErrorTreeOutput<U>
      ? RegleExternalErrorTreeOutput<U>[K]
      : {}
    : {};
};

export type RegleValidationErrors<
  TRule extends RegleFormPropertyType<any, any> | undefined = {},
  TExternalError extends RegleExternalValidationErrors<any> | undefined = {},
> = TRule extends RegleCollectionRuleDefinition
  ? RegleCollectionErrors<
      ExtractFromGetter<TRule['$each']>,
      TExternalError extends RegleExternalCollectionErrors
        ? ArrayElement<TExternalError['$each']>
        : {}
    >
  : TRule extends RegleRuleDecl<any, any>
    ? string[]
    : TRule extends ReglePartialValidationTree<any, any>
      ? RegleErrorTree<TRule, TExternalError extends RegleExternalErrorTree ? TExternalError : {}>
      : string[];

export type RegleCollectionErrors<
  TRule extends RegleFormPropertyType<any, any> | undefined = {},
  TExternalError extends RegleExternalValidationErrors<any> | undefined = {},
> = {
  readonly $errors: string[];
  readonly $each: RegleValidationErrors<TRule, TExternalError>[];
};

/** @internal */
export type $InternalRegleCollectionErrors = {
  readonly $errors: string[];
  readonly $each: $InternalRegleErrors[];
};

export type $InternalRegleErrorTree = {
  [x: string]: $InternalRegleErrors;
};

/**
 * @internal
 */
export type $InternalRegleErrors =
  | $InternalRegleCollectionErrors
  | string[]
  | $InternalRegleErrorTree;

//-
// ------- External errors
// -

// -- Errors inputs
export type RegleExternalErrorTree<
  TState extends Record<string, any> | undefined = Record<string, any>,
> = {
  [K in keyof TState]?: RegleExternalValidationErrors<TState[K]>;
};

export type RegleExternalValidationErrors<TValue extends any> = [NonNullable<TValue>] extends [
  never,
]
  ? string[]
  : NonNullable<TValue> extends Array<infer U extends Record<string, any> | undefined>
    ? RegleExternalCollectionErrors<U>
    : NonNullable<TValue> extends Date
      ? string[]
      : NonNullable<TValue> extends File
        ? string[]
        : NonNullable<TValue> extends Record<string, any>
          ? RegleExternalErrorTree<NonNullable<TValue>>
          : string[];

export type RegleExternalCollectionErrors<
  TValue extends Record<string, any> | undefined = Record<string, any>,
> = {
  $errors?: string[];
  $each?: RegleExternalErrorTree<TValue>[];
};

// -- Output status errors

export type RegleExternalErrorTreeOutput<
  TState extends Record<string, any> | undefined = Record<string, any>,
> = {
  [K in keyof TState]-?: RegleExternalValidationErrorsOuput<TState[K]>;
};

export type RegleExternalValidationErrorsOuput<TValue extends any> = [NonNullable<TValue>] extends [
  never,
]
  ? string[]
  : NonNullable<TValue> extends Array<infer U extends Record<string, any> | undefined>
    ? RegleExternalCollectionErrorsOutput<U>
    : NonNullable<TValue> extends Date
      ? string[]
      : NonNullable<TValue> extends File
        ? string[]
        : NonNullable<TValue> extends Record<string, any>
          ? RegleExternalErrorTreeOutput<NonNullable<TValue>>
          : string[];

export type RegleExternalCollectionErrorsOutput<
  TValue extends Record<string, any> | undefined = Record<string, any>,
> = {
  $errors: string[];
  $each: RegleExternalErrorTree<TValue>[];
};

export type $InternalExternalRegleErrors =
  | RegleExternalCollectionErrors<any>
  | string[]
  | RegleExternalErrorTree<any>;

// - Misc

export type DataType =
  | string
  | number
  | Record<string, any>
  | File
  | Array<any>
  | Date
  | null
  | undefined;
