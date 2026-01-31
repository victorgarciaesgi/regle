import type {
  FormRuleDeclaration,
  InlineRuleDeclaration,
  Maybe,
  RegleRuleDefinition,
  RegleRuleRaw,
  RegleRuleWithParamsDefinitionInput,
} from '@regle/core';
import { createRule, unwrapRuleParameters } from '@regle/core';
import type { MaybeRefOrGetter } from 'vue';
import { extractValidator } from './common/extractValidator';

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
  rule: TRule
): TRule extends InlineRuleDeclaration<infer TValue, infer TParams, infer TReturn>
  ? RegleRuleDefinition<
      'applyIf',
      TValue,
      [...TParams, condition: boolean],
      TReturn extends Promise<any> ? true : false,
      TReturn extends Promise<infer M> ? M : TReturn
    >
  : TRule extends RegleRuleWithParamsDefinitionInput<
        infer TType,
        infer TValue,
        infer TParams,
        infer TAsync,
        infer TMetadata
      >
    ? RegleRuleDefinition<TType, TValue, [...TParams, condition: boolean], TAsync, TMetadata>
    : TRule extends RegleRuleDefinition<infer TType, infer TValue, any[], infer TAsync, infer TMetadata>
      ? RegleRuleDefinition<TType, TValue, [condition: boolean], TAsync, TMetadata>
      : TRule {
  const { _type, validator, _params, _message, _async } = extractValidator(rule);

  const augmentedParams = (_params ?? []).concat([_condition]);

  function newValidator(value: any, ...args: any[]) {
    const [condition] = unwrapRuleParameters<[boolean]>([_condition]);
    if (condition) {
      return validator(value, ...args);
    }
    return true;
  }

  function newActive() {
    const [condition] = unwrapRuleParameters<[boolean]>([_condition]);
    return condition;
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
