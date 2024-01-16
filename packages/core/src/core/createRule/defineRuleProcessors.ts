import {
  $InternalRegleRuleDefinition,
  $InternalRegleRuleInit,
  $InternalRegleRuleMetadataConsumer,
} from '../../types';
import { createReactiveParams, unwrapRuleParameters } from './unwrapRuleParameters';

export function defineRuleProcessors(
  definition: $InternalRegleRuleInit,
  ...params: any[]
): $InternalRegleRuleDefinition {
  const { message, validator, active, ...properties } = definition;

  const isAsync = validator.constructor.name === 'AsyncFunction';

  const defaultProcessors = {
    validator(value: any, ...args: any[]) {
      return definition.validator(value, ...unwrapRuleParameters(args.length ? args : params));
    },
    message(value: any, metadata: $InternalRegleRuleMetadataConsumer) {
      if (typeof definition.message === 'function') {
        return definition.message(value, {
          ...metadata,
          $params: unwrapRuleParameters(metadata.$params?.length ? metadata.$params : params),
        });
      } else {
        return definition.message;
      }
    },

    active(value: any, metadata: $InternalRegleRuleMetadataConsumer) {
      if (typeof definition.active === 'function') {
        return definition.active(value, {
          ...metadata,
          $params: unwrapRuleParameters(metadata.$params?.length ? metadata.$params : params),
        });
      } else {
        return definition.active ?? true;
      }
    },
    exec(value: any) {
      return definition.validator(value, ...unwrapRuleParameters(params));
    },
  };

  const processors = {
    ...defaultProcessors,
    ...properties,
    ...{
      _validator: definition.validator as any,
      _message: definition.message,
      _active: definition.active,
      _type: definition.type,
      _patched: false,
      _async: isAsync,
      _params: createReactiveParams<never>(params),
    },
  };

  return processors;
}
