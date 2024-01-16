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
  TAsync extends boolean = false,
  TMetaData extends RegleRuleMetadataDefinition = boolean,
> {
  validator: (
    value: Maybe<TValue>,
    ...args: TParams
  ) => TAsync extends false ? TMetaData : Promise<TMetaData>;
  message:
    | string
    | ((value: Maybe<TValue>, metadata: RegleRuleMetadataConsumer<TParams, TMetaData>) => string);
  active?:
    | boolean
    | ((value: Maybe<TValue>, metadata: RegleRuleMetadataConsumer<TParams, TMetaData>) => boolean);
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
