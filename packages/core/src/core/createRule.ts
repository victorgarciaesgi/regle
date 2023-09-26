import { ShibieRule, ShibieRuleDefinition } from '../types';

interface ShibieRuleInit<TValue extends any, TParams extends any[] = []> {
  validator: (value: TValue, ...args: TParams) => boolean;
  message: string | ((value: TValue, ...args: TParams) => string);
  active?: boolean | ((value: TValue, ...args: TParams) => boolean);
}

export function createRule<TValue extends any, TParams extends any[] = never>(
  definition: ShibieRuleInit<TValue, TParams>
): ShibieRule<TValue, TParams> {
  if (typeof definition.validator === 'function') {
    return function (...params: TParams): ShibieRuleDefinition<TValue, TParams> {
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
      };
    } as ShibieRule<TValue, TParams>;
  }
  throw new Error('Validator must be a function');
}
