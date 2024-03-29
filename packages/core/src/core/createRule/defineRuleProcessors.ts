import type {
  $InternalRegleRuleDefinition,
  $InternalRegleRuleInit,
  $InternalRegleRuleMetadataConsumer,
  RegleRuleMetadataDefinition,
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
      const validator = definition.validator(value, ...unwrapRuleParameters(params));
      let rawResult: RegleRuleMetadataDefinition;
      if (validator instanceof Promise) {
        return validator.then((result) => {
          rawResult = result;
          if (typeof rawResult === 'object' && '$valid' in rawResult) {
            return rawResult.$valid;
          } else if (typeof rawResult === 'boolean') {
            return rawResult;
          }
          return false;
        });
      } else {
        rawResult = validator;
      }

      if (typeof rawResult === 'object' && '$valid' in rawResult) {
        return rawResult.$valid;
      } else if (typeof rawResult === 'boolean') {
        return rawResult;
      }
      return false;
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
