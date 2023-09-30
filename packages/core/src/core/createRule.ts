import { isRef, unref } from 'vue';
import {
  InferShibieRule,
  ParamDecl,
  ShibieRuleDefinition,
  ShibieRuleInit,
  ShibieUniversalParams,
} from '../types';

/**
 * Returns a clean list of parameters
 * Removing Ref and executing function to return the unwraped value
 */
function unwrapParameters<TParams extends any[]>(params: unknown[]): TParams {
  return params.map((param) => {
    if (typeof param === 'function') {
      return param();
    }
    return unref(param);
  }) as TParams;
}

function defineRuleProcessors<TValue extends any, TParams extends any[]>(
  definition: ShibieRuleInit<TValue, TParams>,
  ...params: TParams
): ShibieRuleDefinition<TValue, ShibieUniversalParams<TParams>> {
  const { message, validator, active, ...properties } = definition;
  return {
    message(value: any, ...args: any[]) {
      if (typeof definition.message === 'function') {
        return definition.message(value, ...(unwrapParameters<TParams>(params) as any));
      } else {
        return definition.message;
      }
    },
    validator(value: any, ...args: any[]) {
      return definition.validator(value, ...(unwrapParameters<TParams>(params) as any));
    },
    active(value: any, ...args: any[]) {
      if (typeof definition.active === 'function') {
        return definition.active(value, ...(unwrapParameters<TParams>(params) as any));
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
      _patched: false,
      _params: params,
    },
  } as unknown as ShibieRuleDefinition<TValue, ShibieUniversalParams<TParams>>;
}

export function createRule<TValue extends any, TParams extends (any | (() => any))[] = []>(
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
      ruleFactory._patched = false;
      return ruleFactory as any;
    } else {
      return staticProcessors as any;
    }
  }
  throw new Error('Validator must be a function');
}
