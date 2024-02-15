import type {
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleDecl,
} from './rule.declaration.types';
import type { RegleCollectionRuleDefinition } from './rule.definition.type';

export type RegleErrorTree<TRules extends ReglePartialValidationTree<any, any>> = {
  readonly [K in keyof TRules]: RegleValidationErrors<TRules[K]>;
};

export type RegleValidationErrors<
  TRule extends RegleFormPropertyType<any, any> | undefined = never,
> = TRule extends RegleCollectionRuleDefinition
  ? RegleCollectionErrors<TRule['$each']>
  : TRule extends RegleRuleDecl<any, any>
    ? string[]
    : TRule extends ReglePartialValidationTree<any, any>
      ? RegleErrorTree<TRule>
      : string[];

// test.test.$each

export type RegleCollectionErrors<
  TRule extends RegleFormPropertyType<any, any> | undefined = never,
> = {
  readonly $errors: string[];
  readonly $each: RegleValidationErrors<TRule>[];
};

/**
 * @internal
 */
export type $InternalRegleErrors = RegleCollectionErrors<any> | string[] | RegleErrorTree<any>;

//-
// ------- External errors
// -

export type RegleExternalErrorTree<TState extends Record<string, any> = Record<string, any>> = {
  [K in keyof TState]?: RegleExternalValidationErrors<TState[K]>;
};

export type RegleExternalValidationErrors<TValue extends any> = [NonNullable<TValue>] extends [
  never,
]
  ? string[]
  : TValue extends Array<infer U>
    ? RegleExternalCollectionErrors<U>
    : NonNullable<TValue> extends Date
      ? string[]
      : NonNullable<TValue> extends File
        ? string[]
        : TValue extends Record<string, any>
          ? RegleExternalErrorTree<TValue>
          : string[];

export type RegleExternalCollectionErrors<TValue extends any = any> = {
  $errors?: string[];
  $each?: RegleExternalValidationErrors<TValue>[];
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
