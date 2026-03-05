import type {
  FormRuleDeclaration,
  InlineRuleDeclaration,
  Maybe,
  ParamsToLooseParams,
  RegleRuleDefinition,
  RegleRuleMetadataConsumer,
  RegleRuleMetadataDefinition,
  RegleRuleRaw,
  RegleRuleWithParamsDefinitionInput,
  MaybeInput,
} from '@regle/core';
import { createRule, unwrapRuleParameters } from '@regle/core';
import type { MaybeRefOrGetter } from 'vue';
import { extractValidator } from './common/extractValidator';

interface ApplyIfOptions {
  /**
   * ⚠️ Internal use for the `pipe` operator.
   */
  hideParams?: boolean;
}

/**
 * The `applyIf` operator is similar to `requiredIf`, but it can be used with **any rule**.
 * It simplifies conditional rule declarations.
 *
 * @param _condition - The condition to check (ref, getter, or value)
 * @param rule - The rule to apply conditionally
 * @returns A rule that only applies when the condition is truthy
 *
 * @example
 * ```ts
 * import { minLength, applyIf } from '@regle/rules';
 *
 * const condition = ref(false);
 *
 * const { r$ } = useRegle({ name: '' }, {
 *   name: {
 *     minLength: applyIf(condition, minLength(6))
 *   },
 * });
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/rules-operators#applyif Documentation}
 */
export function applyIf<
  TType extends string | unknown,
  TValue,
  TParams extends [param?: any, ...any[]],
  TAsync extends boolean,
  TMetadata extends RegleRuleMetadataDefinition,
>(
  _condition: MaybeRefOrGetter<Maybe<boolean>>,
  rule: RegleRuleWithParamsDefinitionInput<TType, TValue, TParams, TAsync, TMetadata, any>,
  options?: ApplyIfOptions
): RegleRuleDefinition<
  TType,
  TValue,
  ParamsToLooseParams<[...TParams]>,
  TAsync,
  TMetadata,
  MaybeInput<TValue>,
  TValue,
  false
>;
export function applyIf<
  TType extends string | unknown,
  TValue,
  TParams extends any[],
  TAsync extends boolean,
  TMetadata extends RegleRuleMetadataDefinition,
>(
  _condition: MaybeRefOrGetter<Maybe<boolean>>,
  rule: RegleRuleWithParamsDefinitionInput<TType, TValue, TParams, TAsync, TMetadata, any>,
  options?: ApplyIfOptions
): RegleRuleDefinition<
  TType,
  TValue,
  ParamsToLooseParams<[...TParams]>,
  TAsync,
  TMetadata,
  MaybeInput<TValue>,
  TValue,
  false
>;

export function applyIf<
  TValue,
  TParams extends any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>,
>(
  _condition: MaybeRefOrGetter<Maybe<boolean>>,
  rule: InlineRuleDeclaration<TValue, TParams, TReturn>,
  options?: ApplyIfOptions
): RegleRuleDefinition<
  'applyIf',
  TValue,
  ParamsToLooseParams<TParams>,
  TReturn extends Promise<any> ? true : false,
  TReturn extends Promise<infer M> ? M : TReturn,
  MaybeInput<TValue>,
  TValue,
  false
>;
export function applyIf<
  TType extends string | unknown,
  TValue,
  TParams extends any[],
  TAsync extends boolean,
  TMetadata extends RegleRuleMetadataDefinition,
>(
  _condition: MaybeRefOrGetter<Maybe<boolean>>,
  rule: RegleRuleDefinition<TType, TValue, TParams, TAsync, TMetadata, any, any, any>,
  options?: ApplyIfOptions
): RegleRuleDefinition<
  TType,
  TValue,
  ParamsToLooseParams<[...TParams]>,
  TAsync,
  TMetadata,
  MaybeInput<TValue>,
  TValue,
  false
>;

export function applyIf(
  _condition: MaybeRefOrGetter<Maybe<boolean>>,
  rule: FormRuleDeclaration<any>,
  options?: ApplyIfOptions
): FormRuleDeclaration<any> {
  const { _type, validator, _params, _message, _async, _active } = extractValidator(rule);

  const augmentedParams = (_params ?? []).concat(options?.hideParams ? [] : [_condition]);

  function newValidator(value: any, ...args: any[]) {
    const [condition] = unwrapRuleParameters<[boolean]>([_condition]);
    if (condition) {
      return validator(value, ...args);
    }
    return true;
  }

  function newActive(metadata: RegleRuleMetadataConsumer<any, any[]>) {
    const [condition] = unwrapRuleParameters<[boolean]>([_condition]);
    if (condition) {
      if (typeof _active === 'function') {
        return _active(metadata);
      } else {
        return _active ?? true;
      }
    }
    return false;
  }

  const newRule = createRule({
    type: _type,
    validator: newValidator,
    active: newActive,
    message: _message,
    async: _async,
  }) as RegleRuleRaw;

  newRule._params = augmentedParams;

  if (typeof newRule === 'function') {
    const executedRule = newRule(...augmentedParams);
    return executedRule as any;
  } else {
    return newRule as any;
  }
}
