import { markRaw } from 'vue';
import { RegleRuleSymbol } from '../../../../shared';
import {
  InternalRuleType,
  type $InternalRegleRuleDefinition,
  type $InternalRegleRuleInit,
  type $InternalRegleRuleMetadataConsumer,
  type RegleRuleMetadataDefinition,
} from '../../types';
import { createReactiveParams, unwrapRuleParameters } from './unwrapRuleParameters';

export function defineRuleProcessors(
  definition: $InternalRegleRuleInit,
  ...params: any[]
): $InternalRegleRuleDefinition {
  const { validator, type, async } = definition;

  const isAsync = async || type === InternalRuleType.Async || validator.constructor.name === 'AsyncFunction';

  const defaultProcessors = {
    validator(value: any, ...args: any[]) {
      return definition.validator(value, ...unwrapRuleParameters(args.length ? args : params));
    },
    message(metadata: $InternalRegleRuleMetadataConsumer) {
      if (typeof definition.message === 'function') {
        return definition.message({
          ...metadata,
          $params: unwrapRuleParameters(metadata?.$params?.length ? metadata.$params : params),
        });
      } else {
        return definition.message;
      }
    },
    active(metadata: $InternalRegleRuleMetadataConsumer) {
      if (typeof definition.active === 'function') {
        return definition.active({
          ...metadata,
          $params: unwrapRuleParameters(metadata?.$params?.length ? metadata.$params : params),
        });
      } else {
        return definition.active ?? true;
      }
    },
    tooltip(metadata: $InternalRegleRuleMetadataConsumer) {
      if (typeof definition.tooltip === 'function') {
        return definition.tooltip({
          ...metadata,
          $params: unwrapRuleParameters(metadata?.$params?.length ? metadata.$params : params),
        });
      } else {
        return definition.tooltip ?? [];
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

  const processors = markRaw({
    ...defaultProcessors,
    type,
    _validator: definition.validator as any,
    _message: definition.message,
    _active: definition.active,
    _tooltip: definition.tooltip,
    _type: definition.type,
    _message_patched: false,
    _tooltip_patched: false,
    _async: isAsync,
    _params: createReactiveParams<never>(params),
    _brand: RegleRuleSymbol,
  });

  return processors;
}
