import {
  RegleInternalRuleDefs,
  RegleRuleDefinition,
  RegleRuleInit,
  RegleUniversalParams,
} from '../../types';
import { createReactiveParams, unwrapRuleParameters } from './unwrapRuleParameters';

export function defineRuleProcessors<
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
>(
  definition: RegleRuleInit<TValue, TParams, TAsync>,
  ...params: RegleUniversalParams<TParams>
): RegleRuleDefinition<TValue, TParams, TAsync> {
  const { message, validator, active, ...properties } = definition;

  const isAsync = validator.constructor.name === 'AsyncFunction';

  const defaultProcessors = {
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
    exec(value: any) {
      return definition.validator(value, ...unwrapRuleParameters<TParams>(params));
    },
  };

  const processors = {
    ...defaultProcessors,
    ...properties,
    ...({
      _validator: definition.validator,
      _message: definition.message,
      _active: definition.active,
      _type: definition.type,
      _patched: false,
      _async: isAsync as TAsync,
      _params: createReactiveParams<RegleUniversalParams<TParams>>(params),
    } satisfies RegleInternalRuleDefs<TValue, TParams, TAsync>),
  } satisfies RegleRuleDefinition<TValue, TParams, TAsync>;

  return processors;
}
