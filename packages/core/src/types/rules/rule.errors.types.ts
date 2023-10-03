import {
  ShibieFormPropertyType,
  ShibiePartialValidationTree,
  ShibieRuleDecl,
} from './rule.declaration.types';

export type ShibieErrorTree<TRules extends ShibiePartialValidationTree<any, any>> = {
  readonly [K in keyof TRules]: ShibieValidationErrors<never, TRules[K]>;
};

export type ShibieValidationErrors<
  TKey extends DataType = string | Record<string, any>,
  TRule extends ShibieFormPropertyType<any, any> | undefined = never,
> = [TKey] extends [never]
  ? TRule extends ShibieRuleDecl<any, any>
    ? string[]
    : TRule extends ShibiePartialValidationTree<any, any>
    ? ShibieErrorTree<TRule>
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

export type ShibieCollectionErrors<
  TKey extends DataType = string | Record<string, any>,
  TRule extends ShibieFormPropertyType<any, any> | undefined = never,
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
