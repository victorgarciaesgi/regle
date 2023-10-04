import {
  RegleFormPropertyType,
  ReglePartialValidationTree,
  RegleRuleDecl,
} from './rule.declaration.types';

export type RegleErrorTree<TRules extends ReglePartialValidationTree<any, any>> = {
  readonly [K in keyof TRules]: RegleValidationErrors<never, TRules[K]>;
};

export type RegleValidationErrors<
  TKey extends DataType = string | Record<string, any>,
  TRule extends RegleFormPropertyType<any, any> | undefined = never,
> = [TKey] extends [never]
  ? TRule extends RegleRuleDecl<any, any>
    ? string[]
    : TRule extends ReglePartialValidationTree<any, any>
    ? RegleErrorTree<TRule>
    : never
  : TKey extends Array<any>
  ? 'Arrayy' // TODO collection
  : TKey extends Date
  ? string[]
  : TKey extends File
  ? string[]
  : string[];

// export type UnsafeValidationErrorTree<TData extends Record<string, any> = Record<string, any>> = {
//   [K in keyof TData]: ValidationError<TData[K]>;
// };

export type RegleCollectionErrors<
  TKey extends DataType = string | Record<string, any>,
  TRule extends RegleFormPropertyType<any, any> | undefined = never,
> = {
  readonly $errors: any;
};

export type DataType =
  | string
  | number
  | Record<string, any>
  | File
  | Array<any>
  | Date
  | null
  | undefined;
