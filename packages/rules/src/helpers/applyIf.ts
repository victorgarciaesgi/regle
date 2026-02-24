import type {
  FormRuleDeclaration,
  InlineRuleDeclaration,
  Maybe,
  ParamsToLooseParams,
  RegleRuleDefinition,
  RegleRuleMetadataConsumer,
  RegleRuleRaw,
  RegleRuleWithParamsDefinitionInput,
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
export function applyIf<TRule extends FormRuleDeclaration<any>>(
  _condition: MaybeRefOrGetter<Maybe<boolean>>,
  rule: TRule,
  options?: ApplyIfOptions
): TRule extends InlineRuleDeclaration<infer TValue, infer TParams, infer TReturn>
  ? RegleRuleDefinition<
      'applyIf',
      TValue,
      ParamsToLooseParams<TParams, [condition: boolean]>,
      TReturn extends Promise<any> ? true : false,
      TReturn extends Promise<infer M> ? M : TReturn
    >
  : TRule extends RegleRuleDefinition<
        infer TType,
        infer TValue,
        infer TParams,
        infer TAsync,
        infer TMetadata,
        any,
        any,
        any
      >
    ? RegleRuleDefinition<TType, TValue, ParamsToLooseParams<[...TParams], [condition: boolean]>, TAsync, TMetadata>
    : TRule extends RegleRuleWithParamsDefinitionInput<
          infer TType,
          infer TValue,
          infer TParams,
          infer TAsync,
          infer TMetadata,
          any
        >
      ? RegleRuleDefinition<TType, TValue, ParamsToLooseParams<[...TParams], [condition: boolean]>, TAsync, TMetadata>
      : TRule {
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
