import { Maybe } from '../utils';
import { RegleUniversalParams } from './rule.params.types';

/**
 * Internal definition of the rule, can be used to reset or patch the rule
 */
export interface RegleInternalRuleDefs<TValue extends any = any, TParams extends any[] = []> {
  _validator: (value: Maybe<TValue>, ...args: TParams) => boolean | Promise<boolean>;
  _message: string | ((value: Maybe<TValue>, ...args: TParams) => string);
  _active?: boolean | ((value: Maybe<TValue>, ...args: TParams) => boolean);
  _type: string;
  _patched: boolean;
  _params?: RegleUniversalParams<TParams>;
}

export enum InternalRuleType {
  Inline = '__inline',
  Async = '__async',
}
