import type { MaybeRef, Raw, UnwrapRef } from 'vue';
import type {
  DataTypeRegleErrors,
  DataTypeRegleIssues,
  DeepSafeFormState,
  RegleResult,
  SafeFieldProperty,
} from '../core';
import type {
  RegleFieldStatus,
  RegleLike,
  ReglePartialRuleTree,
  RegleRoot,
  SuperCompatibleRegleFieldStatus,
  SuperCompatibleRegleRoot,
} from '../rules';
import type { DeepPartial, JoinDiscriminatedUnions } from '../utils';

/**
 * Infer safe output from any `r$` instance
 *
 * ```ts
 * type FormRequest = InferSafeOutput<typeof r$>;
 * ```
 *
 * @deprecated Use {@link InferValidOutput} instead
 */
export type InferSafeOutput<TRegle extends MaybeRef<SuperCompatibleRegleRoot | SuperCompatibleRegleFieldStatus>> =
  UnwrapRef<TRegle> extends Raw<RegleRoot<infer TState extends Record<string, any>, infer TRules, any, any>>
    ? TRules extends ReglePartialRuleTree<Record<string, any>, any>
      ? DeepSafeFormState<JoinDiscriminatedUnions<TState>, TRules>
      : never
    : UnwrapRef<TRegle> extends RegleFieldStatus<infer TState, infer TRules>
      ? SafeFieldProperty<TState, TRules>
      : UnwrapRef<TRegle> extends RegleLike<infer TState extends Record<string, any>>
        ? TState
        : never;

/**
 * Infer safe output from any `r$` instance
 *
 * ```ts
 * type FormRequest = InferValidOutput<typeof r$>;
 * ```
 */
export type InferValidOutput<TRegle extends MaybeRef<SuperCompatibleRegleRoot | SuperCompatibleRegleFieldStatus>> =
  InferSafeOutput<TRegle>;

/**
 * Infer complete validation result from any `r$` instance
 */
export type InferRegleValidationResult<
  TRegle extends MaybeRef<SuperCompatibleRegleRoot | SuperCompatibleRegleFieldStatus>,
> =
  InferRegleSettings<TRegle> extends { state: infer TState; rules: never }
    ? ({ valid: true; data: TState } | { valid: false; data: DeepPartial<TState> }) & {
        errors: DataTypeRegleErrors<TState>;
        issues: DataTypeRegleIssues<TState>;
      }
    : InferRegleSettings<TRegle> extends { state: infer TState; rules: infer TRules extends Record<string, any> }
      ? RegleResult<TState, TRules>
      : never;

/**
 * Infer State and Rules from any `r$` instance
 */
export type InferRegleSettings<TRegle extends MaybeRef<SuperCompatibleRegleRoot | SuperCompatibleRegleFieldStatus>> =
  UnwrapRef<TRegle> extends Raw<
    RegleRoot<infer TState extends Record<string, any>, infer TRules extends Record<string, any>, any, any>
  >
    ? { state: TState; rules: TRules }
    : UnwrapRef<TRegle> extends RegleFieldStatus<infer TState, infer TRules extends Record<string, any>>
      ? { state: TState; rules: TRules }
      : UnwrapRef<TRegle> extends RegleLike<infer TState extends Record<string, any>>
        ? { state: TState; rules: never }
        : never;
