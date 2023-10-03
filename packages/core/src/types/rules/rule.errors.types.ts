import {
  ShibieFormPropertyType,
  ShibiePartialValidationTree,
  ShibieRuleDecl,
} from './rule.declaration.types';

export type ShibieErrorTree<TRules extends ShibiePartialValidationTree<any, any>> = {
  [K in keyof TRules]: ShibieValidationError<never, TRules[K]>;
};

export type ShibieValidationError<
  TKey extends DataType = string | Record<string, any>,
  TRule extends ShibieFormPropertyType<any, any> | undefined = never,
> = [TKey] extends [never]
  ? TRule extends ShibieRuleDecl<any, any>
    ? string[]
    : TRule extends ShibiePartialValidationTree<any, any>
    ? ShibieErrorTree<TRule>
    : never
  : TKey extends Array<any>
  ? string[]
  : TKey extends Date
  ? string[]
  : string[];

// export type UnsafeValidationErrorTree<TData extends Record<string, any> = Record<string, any>> = {
//   [K in keyof TData]: ValidationError<TData[K]>;
// };

export type DataType =
  | string
  | number
  | Record<string, any>
  | File
  | Array<any>
  | Date
  | null
  | undefined;
