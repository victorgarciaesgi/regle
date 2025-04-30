import type { Raw } from 'vue';
import type { enumType, Maybe } from '../utils';
import type { PossibleRegleRuleMetadataConsumer, RegleRuleMetadataDefinition } from './rule.definition.type';
import type { RegleUniversalParams } from './rule.params.types';

/**
 * Internal definition of the rule, this can be used to reset or patch the rule
 */
export type RegleInternalRuleDefs<
  TValue extends any = any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
> = Raw<{
  _validator: (value: Maybe<TValue>, ...args: TParams) => TAsync extends false ? TMetadata : Promise<TMetadata>;
  _message: string | string[] | ((metadata: PossibleRegleRuleMetadataConsumer<TValue>) => string | string[]);
  _active?: boolean | ((metadata: PossibleRegleRuleMetadataConsumer<TValue>) => boolean);
  _tooltip?: string | string[] | ((metadata: PossibleRegleRuleMetadataConsumer<TValue>) => string | string[]);
  _type?: string;
  _message_patched: boolean;
  _tooltip_patched: boolean;
  _params?: RegleUniversalParams<TParams>;
  _async: TAsync;
  readonly _brand: symbol;
}>;

export const InternalRuleType = {
  Inline: '__inline',
  Async: '__async',
} as const;

export type InternalRuleType = enumType<typeof InternalRuleType>;
