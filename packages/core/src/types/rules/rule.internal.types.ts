import type { Maybe } from '../utils';
import type {
  PossibleRegleRuleMetadataConsumer,
  RegleRuleMetadataDefinition,
} from './rule.definition.type';
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
  _validator: (
    value: Maybe<TValue>,
    ...args: TParams
  ) => TAsync extends false ? TMetadata : Promise<TMetadata>;
  _message:
    | string
    | string[]
    | ((value: Maybe<TValue>, metadata: PossibleRegleRuleMetadataConsumer) => string | string[]);
  _active?:
    | boolean
    | ((value: Maybe<TValue>, metadata: PossibleRegleRuleMetadataConsumer) => boolean);
  _type?: string;
  _patched: boolean;
  _params?: RegleUniversalParams<TParams>;
  _async: TAsync;
}

export enum InternalRuleType {
  Inline = '__inline',
  Async = '__async',
}
