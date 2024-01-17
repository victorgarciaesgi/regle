import { Maybe } from '../utils';
import {
  $InternalRegleRuleMetadataConsumer,
  RegleRuleMetadataConsumer,
  RegleRuleMetadataDefinition,
} from './rule.definition.type';

/**
 * @argument
 * createRule arguments options
 */
export interface RegleRuleInit<
  TValue extends any,
  TParams extends any[] = [],
  TMetadata extends RegleRuleMetadataDefinition = boolean,
  TReturn extends TMetadata | Promise<TMetadata> = TMetadata,
  TAsync extends boolean = TReturn extends Promise<any> ? true : false,
> {
  type: { value: TValue; params: TParams };
  validator: (value: Maybe<TValue>, ...args: TParams) => TReturn;
  message:
    | string
    | ((value: Maybe<TValue>, metadata: RegleRuleMetadataConsumer<TParams, TMetadata>) => string);
  active?:
    | boolean
    | ((value: Maybe<TValue>, metadata: RegleRuleMetadataConsumer<TParams, TMetadata>) => boolean);
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
  validator: (
    value: Maybe<TValue>,
    ...args: TParams
  ) => TAsync extends false ? TMetadata : Promise<TMetadata>;
  message:
    | string
    | ((value: Maybe<TValue>, metadata: RegleRuleMetadataConsumer<TParams, TMetadata>) => string);
  active?:
    | boolean
    | ((value: Maybe<TValue>, metadata: RegleRuleMetadataConsumer<TParams, TMetadata>) => boolean);
  type?: string;
}

/**
 * @internal
 * createRule arguments options
 */
export interface $InternalRegleRuleInit {
  validator: (
    value: any,
    ...args: any[]
  ) => RegleRuleMetadataDefinition | Promise<RegleRuleMetadataDefinition>;
  message: string | ((value: any, metadata: $InternalRegleRuleMetadataConsumer) => string);
  active?: boolean | ((value: any, metadata: $InternalRegleRuleMetadataConsumer) => boolean);
  type?: string;
}
