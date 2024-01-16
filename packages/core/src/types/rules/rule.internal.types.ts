import { Maybe } from '../utils';
import { RegleRuleMetadataConsumer, RegleRuleMetadataDefinition } from './rule.definition.type';
import { RegleUniversalParams } from './rule.params.types';

/**
 * Internal definition of the rule, can be used to reset or patch the rule
 */
export interface RegleInternalRuleDefs<
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
> {
  _validator: (
    value: Maybe<TValue>,
    ...args: TParams
  ) => TAsync extends false ? TMetadata : Promise<TMetadata>;
  _message:
    | string
    | ((value: Maybe<TValue>, metadata: RegleRuleMetadataConsumer<TParams, TMetadata>) => string);
  _active?:
    | boolean
    | ((value: Maybe<TValue>, metadata: RegleRuleMetadataConsumer<TParams, TMetadata>) => boolean);
  _type?: string;
  _patched: boolean;
  _params?: RegleUniversalParams<TParams>;
  _async: TAsync;
}

export enum InternalRuleType {
  Inline = '__inline',
  Async = '__async',
}
