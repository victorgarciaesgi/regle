import type { Maybe } from '../utils';
import type {
  $InternalRegleRuleMetadataConsumer,
  RegleRuleMetadataConsumer,
  RegleRuleMetadataDefinition,
} from './rule.definition.type';

export type RegleInitPropertyGetter<
  TValue,
  TReturn,
  TParams extends [...any[]],
  TMetadata extends RegleRuleMetadataDefinition,
> = TReturn | ((metadata: RegleRuleMetadataConsumer<TValue, TParams, TMetadata>) => TReturn);

/**
 * @argument
 * createRule arguments options
 */
export interface RegleRuleInit<
  TValue extends any,
  TParams extends [...any[]] = [],
  TReturn extends RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition> = boolean,
  TMetadata extends RegleRuleMetadataDefinition = RegleRuleMetadataDefinition,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
> {
  validator: (value: Maybe<TValue>, ...args: TParams) => TReturn;
  message: RegleInitPropertyGetter<TValue, string | string[], TParams, TMetadata>;
  active?: RegleInitPropertyGetter<TValue, boolean, TParams, TMetadata>;
  tooltip?: RegleInitPropertyGetter<TValue, string | string[], TParams, TMetadata>;
  type?: string;
  async?: TAsync;
}

/**
 * @argument
 * Rule core
 */
export interface RegleRuleCore<
  TValue extends any,
  TParams extends any[] = [],
  TAsync extends boolean = false,
  TMetadata extends RegleRuleMetadataDefinition = boolean,
> {
  validator: (value: Maybe<TValue>, ...args: TParams) => TAsync extends false ? TMetadata : Promise<TMetadata>;
  message: RegleInitPropertyGetter<TValue, string | string[], TParams, TMetadata>;
  active?: RegleInitPropertyGetter<TValue, string | string[], TParams, TMetadata>;
  tooltip?: RegleInitPropertyGetter<TValue, string | string[], TParams, TMetadata>;
  type?: string;
}

/**
 * @internal
 * createRule arguments options
 */
export interface $InternalRegleRuleInit {
  validator: (value: any, ...args: any[]) => RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>;
  message: string | string[] | ((metadata: $InternalRegleRuleMetadataConsumer) => string | string[]);
  active?: boolean | ((metadata: $InternalRegleRuleMetadataConsumer) => boolean);
  tooltip?: string | string[] | ((metadata: $InternalRegleRuleMetadataConsumer) => string | string[]);
  type?: string;
}

export type RegleRuleTypeReturn<TValue, TParams extends [...any[]]> = {
  value: TValue;
  params: [...TParams];
};
