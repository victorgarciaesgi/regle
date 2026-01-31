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
import { extractValidator } from './common/extractValidator';
import { capitalize } from 'vue';
import type { IsUnknown } from 'type-fest';

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
  TType extends string | unknown = unknown,
  TValue = unknown,
  TParams extends any[] = [],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> = RegleRuleMetadataDefinition,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  rule:
    | RegleRuleDefinition<TType, TValue, TParams, TAsync, TMetadata>
    | InlineRuleDeclaration<TValue, TParams, TReturn>,
  message?: RegleRuleDefinitionWithMetadataProcessor<
    TValue,
    RegleRuleMetadataConsumer<TValue, TParams, TMetadata>,
    string | string[]
  >
): RegleRuleDefinition<
  IsUnknown<TType> extends true ? 'not' : `not:${TType & string}`,
  TValue,
  TParams,
  TAsync,
  TMetadata
> {
  let newValidator: RegleRuleDefinitionProcessor<any, any, any>;

  const { _type, validator, _params, _async, _active } = extractValidator(rule);

  if (_async) {
    newValidator = async (value: any, ...params: any[]) => {
      if (isFilled(value)) {
        try {
          const result = await validator(value, ...(params as any));
          return !result;
        } catch {
          return true;
        }
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
    type: _type ? `not(${capitalize(_type)})` : undefined,
    validator: newValidator,
    message: message ?? 'Error',
    active: _active,
    async: _async,
  }) as RegleRuleRaw;

  const newParams = [...(_params ?? [])];
  newRule._params = newParams;

  if (typeof newRule === 'function') {
    const executedRule = newRule(...newParams);
    return executedRule as any;
  } else {
    return newRule as any;
  }
}
