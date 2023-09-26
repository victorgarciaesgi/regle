import { InferShibieRule, ShibieRuleDefinition, ShibieRuleInit } from '../types';

function defineRuleProcessors<TValue extends any, TParams extends any[]>(
  definition: ShibieRuleInit<TValue, TParams>,
  ...params: TParams
): ShibieRuleDefinition<TValue, TParams> {
  const { message, validator, active, ...properties } = definition;
  return {
    message(value, ...args) {
      if (typeof definition.message === 'function') {
        return definition.message(value, ...params);
      } else {
        return definition.message;
      }
    },
    validator(value, ...args) {
      return definition.validator(value, ...params);
    },
    active(value, ...args) {
      if (typeof definition.active === 'function') {
        return definition.active(value, ...params);
      } else {
        return definition.active ?? true;
      }
    },
    ...properties,
    ...{
      _validator: definition.validator,
      _message: definition.message,
      _active: definition.active,
      _type: definition.type,
    },
  } satisfies ShibieRuleDefinition<TValue, TParams>;
}

export function createRule<TValue extends any, TParams extends any[] = []>(
  definition: ShibieRuleInit<TValue, TParams>
): InferShibieRule<TValue, TParams> {
  if (typeof definition.validator === 'function') {
    let params = [] as unknown as TParams;
    const staticProcessors = defineRuleProcessors(definition, ...params);
    // For validators needing a params like maxLength or requiredIf
    if (definition.validator.length > 1) {
      const ruleFactory = function (...params: TParams) {
        return defineRuleProcessors(definition, ...params);
      };
      ruleFactory.validator = staticProcessors.validator;
      ruleFactory.message = staticProcessors.message;
      ruleFactory.active = staticProcessors.active;
      ruleFactory.type = staticProcessors.type;

      ruleFactory._validator = definition.validator;
      ruleFactory._message = definition.message;
      ruleFactory._active = definition.active;
      ruleFactory._type = definition.type;
      return ruleFactory as InferShibieRule<TValue, TParams>;
    } else {
      return staticProcessors as InferShibieRule<TValue, TParams>;
    }
  }
  throw new Error('Validator must be a function');
}
