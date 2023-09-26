/**
 * Inline rule definition
 * */
export type InlineRuleDefinition<T extends any> = (value: T) => boolean | Promise<boolean>;

/**
 * Regroup inline and registered rules
 * */
export type FormRuleDefinition<TValue extends any, TParams extends any[] = []> =
  | InlineRuleDefinition<TValue>
  | ShibieRuleDefinition<TValue, TParams>;

/**
 * createRule options
 */
export interface ShibieRuleInit<TValue extends any, TParams extends any[] = []> {
  validator: (value: TValue, ...args: TParams) => boolean;
  message: string | ((value: TValue, ...args: TParams) => string);
  active?: boolean | ((value: TValue, ...args: TParams) => boolean);
  type: string;
}

export interface ShibieInternalRuleDefs<TValue extends any, TParams extends any[] = []> {
  _validator: (value: TValue, ...args: TParams) => boolean;
  _message: string | ((value: TValue, ...args: TParams) => string);
  _active?: boolean | ((value: TValue, ...args: TParams) => boolean);
  _type: string;
}

/**
 * Returned typed of rules created with `createRule`
 * */
export interface ShibieRuleDefinition<TValue extends any = any, TParams extends any[] = []> {
  validator: (value: TValue, ...args: TParams) => boolean;
  message: (value: TValue, ...args: TParams) => string;
  active: (value: TValue, ...args: TParams) => boolean;
  type: string;
}

/**
 * Rules with params created with `createRules` are callable while being customizable
 */
export interface ShibieRuleWithParamsDefinition<
  TValue extends any = any,
  TParams extends any[] = [],
> extends ShibieRuleInit<TValue, TParams> {
  (...params: TParams): ShibieRuleDefinition<TValue, TParams>;
}

/**
 * Processed results of the rule definition
 */
export type ShibieRuleResult<TValue extends any = any, TParams extends any[] = []> = {
  validator: (value: TValue, ...args: TParams) => boolean;
  message: string;
  active: boolean;
  type: string;
};

/**
 * Generic types for a created ShibieRule
 */
export type ShibieRule<TValue extends any = any, TParams extends any[] = []> =
  | ShibieRuleDefinition<TValue, TParams>
  | ShibieRuleWithParamsDefinition<TValue, TParams>;

/**
 * Process the type of a created rule with `createRule`.
 * For a rule with params it will return a function
 * Otherwise it will return the rule definition
 */
export type InferShibieRule<TValue extends any = any, TParams extends any[] = []> = [
  TParams,
] extends [[]]
  ? ShibieRuleDefinition<TValue, TParams>
  : ShibieRuleWithParamsDefinition<TValue, TParams>;

export type CustomRulesDeclarationTree = Record<string, ShibieRule<any, any>>;

// ---------------------------------------------------------------------

// export type ShibieRuleDecl

//
//
//
//

// export type UseFormOptions = {
//     scrollToError?: boolean;
//     editable?: boolean;
// } & GlobalConfig;

// - User importable types
// export type InferErrors<T extends (...args: any[]) => UseFormReturnType<any, any>> = ReturnType<T> extends UseFormReturnType<any, any, infer TRules>
//     ? ValidationErrorTree<TRules>
//     : never;
// export type UnsafeValidationErrorTree<TData extends Record<string, any> = Record<string, any>> = {
//   [K in keyof TData]: ValidationError<TData[K]>;
// };

// export type ValidationError<
//   TKey extends DataType = string | Record<string, any>,
//   TRule extends ValidationItem<any, any> | undefined = never,
// > = [TKey] extends [never]
//   ? TRule extends TypedRuleDecl<any, any>
//     ? string[]
//     : TRule extends PartialValidationTree<any, any>
//     ? ValidationErrorTree<TRule>
//     : never
//   : TKey extends Array<any>
//   ? string[]
//   : TKey extends Date
//   ? string[]
//   : TKey extends Record<any, any>
//   ? UnsafeValidationErrorTree<TKey>
//   : string[];

// // - Internal Data types
// export type DataType =
//   | string
//   | number
//   | Record<string, any>
//   | File
//   | Array<any>
//   | Date
//   | null
//   | undefined;

// export type RuleResultRecord = Record<
//   string,
//   ShibieRuleResult<any> | Promise<ShibieRuleResult<any>>
// >;

// export type ValidationErrorTree<TRules extends PartialValidationTree<any, any>> = {
//   [K in keyof TRules]: ValidationError<never, TRules[K]>;
// };

// // - Rules definition
// export type TypedRuleDecl<
//   T = string,
//   TCustomRules extends RuleResultRecord = Record<string, any>,
//   Q = DefaultValidators & TCustomRules,
// > = {
//   [K in keyof Q]?: Q[K] extends RuleDefinition<infer P>
//     ? ValidationRuleWithParams<P, T>
//     : ValidationRuleWithParams<any, T> | ValidationRuleWithoutParams<T> | ValidatorFn<T>;
// };

// export type PartialValidationTree<
//   T extends Record<string, any>,
//   TCustomRules extends RuleResultRecord,
// > = {
//   [K in keyof T]?: ValidationItem<T[K], TCustomRules>;
// };

// export type ValidationItem<
//   T extends DataType,
//   TCustomRules extends RuleResultRecord,
// > = NonNullable<T> extends Array<infer A>
//   ? TypedRuleDecl<NonNullable<T>, TCustomRules, DefaultValidators & TCustomRules> & {
//       $each?: TypedRuleDecl<A, TCustomRules>;
//     }
//   : NonNullable<T> extends Date
//   ? TypedRuleDecl<NonNullable<T>, TCustomRules>
//   : NonNullable<T> extends File
//   ? TypedRuleDecl<NonNullable<T>, TCustomRules>
//   : NonNullable<T> extends Record<string, any>
//   ? PartialValidationTree<NonNullable<T>, TCustomRules>
//   : TypedRuleDecl<NonNullable<T>, TCustomRules>;

// export type UnwrapStateTree<T extends Record<string, any>> = {
//   [K in keyof T]: T[K] extends Record<string, any> | undefined ? UnwrapStateTree<T[K]> : T[K];
// };
