import type {
  $InternalRegleRuleInit,
  InferRegleRule,
  RegleRuleInit,
  RegleRuleMetadataDefinition,
  RegleUniversalParams,
} from '../../types';
import { defineRuleProcessors } from './defineRuleProcessors';
import { getFunctionParametersLength } from './unwrapRuleParameters';

/**
 * Create a typed custom rule that can be used like built-in rules.
 * The created rule can be declared in global options or used directly.
 *
 * Features:
 * - Automatically detects if the rule is async
 * - Supports parameters for configurable rules
 * - Full TypeScript type inference
 * - Custom metadata support
 *
 * @param definition - The rule definition object containing:
 *   - `validator`: The validation function
 *   - `message`: Error message (string or function)
 *   - `type`: Optional rule type identifier
 *   - `active`: Optional function to conditionally activate the rule
 *   - `tooltip`: Optional tooltip message
 *
 * @returns A rule definition that is callable if it accepts parameters
 *
 * @example
 * ```ts
 * import { createRule } from '@regle/core';
 * import { isFilled } from '@regle/rules';
 *
 * // Simple rule without params
 * export const isFoo = createRule({
 *   validator(value: Maybe<string>) {
 *     if (isFilled(value)) {
 *       return value === 'foo';
 *     }
 *     return true;
 *   },
 *   message: "The value should be 'foo'"
 * });
 *
 * // Rule with parameters
 * export const minCustom = createRule({
 *   validator(value: Maybe<number>, min: number) {
 *     if (isFilled(value)) {
 *       return value >= min;
 *     }
 *     return true;
 *   },
 *   message: ({ $params: [min] }) => `Value must be at least ${min}`
 * });
 *
 * // Usage
 * useRegle({ name: '' }, { name: { isFoo } });
 * useRegle({ count: 0 }, { count: { minCustom: minCustom(5) } });
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/reusable-rules Documentation}
 */
export function createRule<
  const TType extends string | unknown,
  TValue extends any,
  TParams extends any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
  TNonEmpty extends boolean = false,
>(
  definition: RegleRuleInit<TType, TValue, TParams, TReturn, TMetadata, TAsync, TNonEmpty>
): InferRegleRule<TType, TValue, TParams, TAsync, TMetadata, TNonEmpty> {
  if (typeof definition.validator === 'function') {
    let fakeParams: any[] = [];
    const isAsync = definition.async ?? definition.validator.constructor.name === 'AsyncFunction';
    const staticProcessors = defineRuleProcessors(
      { ...definition, async: isAsync } as $InternalRegleRuleInit,
      ...fakeParams
    );

    // For validators needing a params like maxLength or requiredIf
    if (getFunctionParametersLength(definition.validator) > 1) {
      // For validators with param, return a function providing params for all the rule processors
      const ruleFactory = function (...params: RegleUniversalParams<TParams>) {
        return defineRuleProcessors(definition as any, ...params);
      };

      // Assign all the internals to the rule raw function so they are accessible without calling it
      ruleFactory.validator = staticProcessors.validator;
      ruleFactory.message = staticProcessors.message;
      ruleFactory.active = staticProcessors.active;
      ruleFactory.tooltip = staticProcessors.tooltip;
      ruleFactory.type = staticProcessors.type;
      ruleFactory.exec = staticProcessors.exec;

      ruleFactory._validator = staticProcessors.validator;
      ruleFactory._message = staticProcessors.message;
      ruleFactory._active = staticProcessors.active;
      ruleFactory._tooltip = staticProcessors.tooltip;
      ruleFactory._type = definition.type;
      ruleFactory._message_pacthed = false;
      ruleFactory._tooltip_pacthed = false;
      ruleFactory._async = isAsync as TAsync;
      return ruleFactory as any;
    } else {
      return staticProcessors as any;
    }
  }
  throw new Error('[createRule] validator must be a function');
}
