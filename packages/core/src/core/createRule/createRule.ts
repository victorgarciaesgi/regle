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
 * Create a typed custom rule that can be used like default rules.
 * It can also be declared in the global options
 *
 * It will automatically detect if the rule is async
 *
 *
 * @param definition - The rule processors object
 *
 * @returns A rule definition that can be callable depending on params presence
 *
 * @exemple
 *
 * ```ts
 * // Create a simple rule with no params
 * import {isFilled} from '@regle/rules';
 *
 * export const isFoo = createRule({
 *   validator(value: Maybe<string>) {
 *       if (isFilled(value)) {
 *           return value === 'foo';
 *       }
 *       return true
 *   },
 *   message: "The value should be 'foo'"
 * })
 *
 * ```
 *
 * Docs: {@link https://reglejs.dev/core-concepts/rules/reusable-rules}
 */
export function createRule<
  TValue extends any,
  TParams extends any[],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>,
  TMetadata extends RegleRuleMetadataDefinition = TReturn extends Promise<infer M> ? M : TReturn,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
>(
  definition: RegleRuleInit<TValue, TParams, TReturn, TMetadata, TAsync>
): InferRegleRule<TValue, TParams, TAsync, TMetadata> {
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
