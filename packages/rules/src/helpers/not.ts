import type {
  InlineRuleDeclaration,
  RegleRuleDefinition,
  RegleRuleDefinitionProcessor,
  RegleRuleDefinitionWithMetadataProcessor,
  RegleRuleMetadataConsumer,
  RegleRuleMetadataDefinition,
  RegleRuleRaw,
} from '@regle/core';
import { createRule } from '@regle/core';
import { isFilled } from './ruleHelpers';

/**
 * The `not` operator passes when the provided rule **fails** and fails when the rule **passes**.
 * It can be combined with other rules.
 *
 * @param rule - The rule to negate
 * @param message - Optional custom error message
 * @returns A negated rule
 *
 * @example
 * ```ts
 * import { useRegle } from '@regle/core';
 * import { not, required, sameAs, withMessage } from '@regle/rules';
 * import { ref } from 'vue';
 *
 * const form = ref({ oldPassword: '', newPassword: '' });
 *
 * const { r$ } = useRegle(form, {
 *   oldPassword: { required },
 *   newPassword: {
 *     notEqual: withMessage(
 *       not(sameAs(() => form.value.oldPassword)),
 *       'Your new password must not be the same as your old password'
 *     ),
 *   },
 * });
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/rules-operators#not Documentation}
 */
export function not<
  TValue,
  TParams extends any[] = [],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> = RegleRuleMetadataDefinition,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule: RegleRuleDefinition<TValue, TParams, TAsync, TMetadata> | InlineRuleDeclaration<TValue, TParams, TReturn>,
  message?: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TValue, TParams, TMetadata>,
    string | string[]
  >
): RegleRuleDefinition<TValue, TParams, TAsync, TMetadata> {
  let _type: string | undefined;
  let validator: RegleRuleDefinitionProcessor<any, any, any>;
  let newValidator: RegleRuleDefinitionProcessor<any, any, any>;
  let _params: any[] | undefined;

  let _async: boolean;

  if (typeof rule === 'function') {
    validator = rule;
    _async = rule.constructor.name === 'AsyncFunction';
  } else {
    ({ _type, validator, _params } = rule);
    _async = rule._async;
  }

  if (_async) {
    newValidator = async (value: any, ...params: any[]) => {
      if (isFilled(value)) {
        const result = await validator(value, ...(params as any));
        return !result;
      }
      return true;
    };
  } else {
    newValidator = (value: any, ...params: any[]) => {
      if (isFilled(value)) {
        return !validator(value, ...(params as any));
      }
      return true;
    };
  }

  const newRule = createRule({
    type: 'not',
    validator: newValidator,
    message: (message as any) ?? 'Error',
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
