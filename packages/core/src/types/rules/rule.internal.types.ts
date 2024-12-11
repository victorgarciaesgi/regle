import type { Maybe } from '../utils';
import type { PossibleRegleRuleMetadataConsumer, RegleRuleMetadataDefinition } from './rule.definition.type';
import type { RegleUniversalParams } from './rule.params.types';

/**
 * Internal definition of the rule, can be used to reset or patch the rule
 */
export interface RegleInternalRuleDefs<
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
> {
  _validator: (value: Maybe<TValue>, ...args: TParams) => TAsync extends false ? TMetadata : Promise<TMetadata>;
  _message: string | string[] | ((metadata: PossibleRegleRuleMetadataConsumer<TValue>) => string | string[]);
  _active?: boolean | ((metadata: PossibleRegleRuleMetadataConsumer<TValue>) => boolean);
  _tooltip?: string | string[] | ((metadata: PossibleRegleRuleMetadataConsumer<TValue>) => string | string[]);
  _type?: string;
  _message_patched: boolean;
  _tooltip_patched: boolean;
  _params?: RegleUniversalParams<TParams>;
  _async: TAsync;
}

export enum InternalRuleType {
  Inline = '__inline',
  Async = '__async',
}
