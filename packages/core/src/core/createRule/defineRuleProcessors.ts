import {
  ShibieInternalRuleDefs,
  ShibieRuleDefinition,
  ShibieRuleInit,
  ShibieUniversalParams,
} from '../../types';
import { unwrapRuleParameters } from './unwrapRuleParameters';

export function defineRuleProcessors<TValue extends any = any, TParams extends any[] = []>(
  definition: ShibieRuleInit<TValue, TParams>,
  ...params: ShibieUniversalParams<TParams>
): ShibieRuleDefinition<TValue, TParams> {
  const { message, validator, active, ...properties } = definition;

  const processors = {
    message(value: any, ...args: any[]) {
      if (typeof definition.message === 'function') {
        return definition.message(
          value,
          ...unwrapRuleParameters<TParams>(args.length ? args : params)
        );
      } else {
        return definition.message;
      }
    },
    validator(value: any, ...args: any[]) {
      return definition.validator(
        value,
        ...unwrapRuleParameters<TParams>(args.length ? args : params)
      );
    },
    active(value: any, ...args: any[]) {
      if (typeof definition.active === 'function') {
        return definition.active(
          value,
          ...unwrapRuleParameters<TParams>(args.length ? args : params)
        );
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
      _params: params,
    } satisfies ShibieInternalRuleDefs<TValue, TParams>),
  } satisfies ShibieRuleDefinition<TValue, TParams>;

  return processors;
}
