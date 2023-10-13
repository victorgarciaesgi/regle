import {
  InferRegleRule,
  RegleRuleDefinition,
  RegleRuleInit,
  RegleRuleWithParamsDefinition,
  RegleUniversalParams,
} from '../../types';
import { defineRuleProcessors } from './defineRuleProcessors';

export function createRule<
  TValue extends any,
  TParams extends any[] = [],
  TType extends string = string,
>(definition: RegleRuleInit<TValue, TParams, TType>): InferRegleRule<TValue, TParams> {
  if (typeof definition.validator === 'function') {
    let fakeParams = [] as never;
    const staticProcessors = defineRuleProcessors(definition, ...fakeParams);
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

      ruleFactory._validator = definition.validator;
      ruleFactory._message = definition.message;
      ruleFactory._active = definition.active;
      ruleFactory._type = definition.type;
      ruleFactory._patched = false;
      return ruleFactory satisfies RegleRuleWithParamsDefinition<TValue, TParams>;
    } else {
      return staticProcessors satisfies RegleRuleDefinition<TValue, TParams> as any;
    }
  }
  throw new Error('Validator must be a function');
}
