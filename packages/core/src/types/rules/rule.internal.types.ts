import { ShibieUniversalParams } from './rule.params.types';

/**
 * Internal definition of the rule, can be used to reset or patch the rule
 */
export interface ShibieInternalRuleDefs<TValue extends any = any, TParams extends any[] = []> {
  _validator: (value: TValue, ...args: TParams) => boolean;
  _message: string | ((value: TValue, ...args: TParams) => string);
  _active?: boolean | ((value: TValue, ...args: TParams) => boolean);
  _type: string;
  _patched: boolean;
  _params?: ShibieUniversalParams<TParams>;
}
