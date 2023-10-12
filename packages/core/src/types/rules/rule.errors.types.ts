import { RegleCollectionRuleDefinition } from '.';
import {
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleDecl,
} from './rule.declaration.types';

export type RegleErrorTree<TRules extends ReglePartialValidationTree<any, any>> = {
  readonly [K in keyof TRules]: RegleValidationErrors<TRules[K]>;
};

export type RegleValidationErrors<
  TRule extends RegleFormPropertyType<any, any> | undefined = never,
> = TRule extends RegleRuleDecl<any, any>
  ? string[]
  : TRule extends RegleCollectionRuleDefinition
  ? RegleCollectionErrors<TRule['$each']>
  : TRule extends ReglePartialValidationTree<any, any>
  ? RegleErrorTree<TRule>
  : string[];

export type RegleCollectionErrors<
  TRule extends RegleFormPropertyType<any, any> | undefined = never,
> = {
  readonly $errors: string[];
  readonly $each: RegleValidationErrors<TRule>[];
};

export type PossibleRegleErrors = RegleCollectionErrors<any> | string[] | RegleErrorTree<any>;

export type DataType =
  | string
  | number
  | Record<string, any>
  | File
  | Array<any>
  | Date
  | null
  | undefined;
