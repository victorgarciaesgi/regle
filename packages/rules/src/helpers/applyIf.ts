import type {
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleRuleMetadataConsumer,
  RegleRuleDefinitionWithMetadataProcessor,
  RegleRuleRaw,
  Maybe,
  FormRuleDeclaration,
  InlineRuleDeclaration,
} from '@regle/core';
import { createRule, InternalRuleType, unwrapRuleParameters } from '@regle/core';
import type { MaybeRefOrGetter } from 'vue';

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
      TValue,
      [...TParams, condition: boolean],
      TReturn extends Promise<any> ? true : false,
      TReturn extends Promise<infer M> ? M : TReturn
    >
  : TRule extends FormRuleDeclaration<infer TValue, infer TParams, any, infer TMetadata, infer TAsync>
    ? RegleRuleDefinition<TValue, [...TParams, condition: boolean], TAsync, TMetadata>
    : TRule {
  let _type: string | undefined;
  let validator: RegleRuleDefinitionProcessor<any, any, any>;
  let _params: any[] | undefined = [];
  let _message: RegleRuleDefinitionWithMetadataProcessor<
    any,
    RegleRuleMetadataConsumer<any, any[]>,
    string | string[]
  > = '';
  let _async: boolean = false;

  if (typeof rule === 'function') {
    _type = InternalRuleType.Inline;
    validator = rule;
    _params = [_condition];
  } else {
    ({ _type, validator, _message, _async } = rule);
    _params = rule._params?.concat([_condition] as any);
  }

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
    type: _type as any,
    validator: newValidator,
    active: newActive,
    message: _message,
    async: _async,
  }) as RegleRuleRaw;

  const newParams = [...(_params ?? [])] as [];
  newRule._params = newParams as any;

  if (typeof newRule === 'function') {
    const executedRule = newRule(...newParams);
    return executedRule as any;
  } else {
    return newRule as any;
  }
}
