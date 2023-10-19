import {
  RegleInternalRuleDefs,
  RegleRuleDefinition,
  RegleRuleInit,
  RegleUniversalParams,
} from '../../types';
import { createReactiveParams, unwrapRuleParameters } from './unwrapRuleParameters';

export function defineRuleProcessors<TValue extends any = any, TParams extends any[] = []>(
  definition: RegleRuleInit<TValue, TParams>,
  ...params: RegleUniversalParams<TParams>
): RegleRuleDefinition<TValue, TParams> {
  const { message, validator, active, ...properties } = definition;

  const isAsync = validator.constructor.name === 'AsyncFunction';

  const processors = {
    message(value: any, ...args: any[]) {
      if (typeof definition.message === 'function') {
        return definition.message(value, ...(<TParams>(args.length ? args : params)));
      } else {
        return definition.message;
      }
    },
    validator(value: any, ...args: any[]) {
      return definition.validator(value, ...(<TParams>(args.length ? args : params)));
    },
    active(value: any, ...args: any[]) {
      if (typeof definition.active === 'function') {
        return definition.active(value, ...(<TParams>(args.length ? args : params)));
      } else {
        return definition.active ?? true;
      }
    },
    ...properties,
    ...({
      _validator: definition.validator,
      _message: definition.message,
      _active: definition.active,
      _type: definition.type,
      _patched: false,
      _async: isAsync,
      _params: createReactiveParams<RegleUniversalParams<TParams>>(params),
    } satisfies RegleInternalRuleDefs<TValue, TParams>),
  } satisfies RegleRuleDefinition<TValue, TParams>;

  return processors;
}
