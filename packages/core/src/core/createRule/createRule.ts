import {
  InferRegleRule,
  RegleRuleDefinition,
  RegleRuleInit,
  RegleRuleWithParamsDefinition,
  RegleUniversalParams,
} from '../../types';
import { defineRuleProcessors } from './defineRuleProcessors';

/**
 * @description
 * Create a typed custom rule that can be used like default validators.
 * It can also be declared in the global options
 *
 * It will automatically detect if the rule is async
 *
 * @typeParam TValue - The input value the rule should receive
 * @typeParam TParams - Tuple declaration of the rule parameters (if any)
 *
 * @param definition - The rule processors object
 *
 * @returns A rule definition that can be callable depending on params presence
 *
 * @exemple
 *
 * ```ts
 * // Create a simple rule with no params
 * import {ruleHelpers} from '@regle/validators';
 *
 * export const isFoo = createRule<string>({
 *   validator(value) {
 *       if (ruleHelpers.isFilled(value)) {
 *           return value === 'foo';
 *       }
 *       return true
 *   },
 *   message: "The value should be 'foo'"
 * })
 * ```
 */
export function createRule<
  TValue extends any = unknown,
  TParams extends any[] = [],
  TAsync extends boolean = false,
>(definition: RegleRuleInit<TValue, TParams, TAsync>): InferRegleRule<TValue, TParams, TAsync> {
  if (typeof definition.validator === 'function') {
    let fakeParams = [] as never;
    const staticProcessors = defineRuleProcessors(definition, ...fakeParams);

    const isAsync = definition.validator.constructor.name === 'AsyncFunction';
    // For validators needing a params like maxLength or requiredIf
    if (definition.validator.length > 1) {
      // For validators with param, return a function providing params for all the rule processors
      const ruleFactory = function (...params: RegleUniversalParams<TParams>) {
        return defineRuleProcessors(definition, ...params);
      };

      // Assign all the internals to the rule raw function so they are accessible without calling it
      ruleFactory.validator = staticProcessors.validator;
      ruleFactory.message = staticProcessors.message;
      ruleFactory.active = staticProcessors.active;
      ruleFactory.type = staticProcessors.type;
      ruleFactory.exec = staticProcessors.exec;

      ruleFactory._validator = staticProcessors.validator;
      ruleFactory._message = staticProcessors.message;
      ruleFactory._active = staticProcessors.active;
      ruleFactory._type = definition.type;
      ruleFactory._patched = false;
      ruleFactory._async = isAsync as TAsync;
      return ruleFactory satisfies RegleRuleWithParamsDefinition<TValue, TParams, TAsync>;
    } else {
      return staticProcessors satisfies RegleRuleDefinition<TValue, TParams, TAsync> as any;
    }
  }
  throw new Error('Validator must be a function');
}
