import type { EmptyObject, IsAny, IsUnknown } from 'type-fest';
import type { MaybeRef, Raw, UnwrapRef } from 'vue';
import type {
  $InternalRegleCollectionErrors,
  $InternalRegleCollectionIssues,
  $InternalRegleErrorTree,
  $InternalRegleIssuesTree,
  CustomRulesDeclarationTree,
  RegleCollectionErrors,
  RegleCollectionRuleDecl,
  RegleErrorTree,
  RegleFieldIssue,
  RegleFieldStatus,
  RegleFormPropertyType,
  RegleIssuesTree,
  RegleLike,
  ReglePartialRuleTree,
  RegleRoot,
  RegleRuleDecl,
  RegleRuleDefinition,
  SuperCompatibleRegleFieldStatus,
  SuperCompatibleRegleRoot,
} from '../rules';
import type {
  ArrayElement,
  ExtendOnlyRealRecord,
  ExtractFromGetter,
  HasNamedKeys,
  JoinDiscriminatedUnions,
  Maybe,
  MaybeInput,
  MaybeOutput,
  Prettify,
} from '../utils';

export type PartialFormState<TState extends Record<string, any>> = [unknown] extends [TState]
  ? {}
  : Prettify<
      {
        [K in keyof TState as ExtendOnlyRealRecord<TState[K]> extends true
          ? never
          : TState[K] extends Array<any>
            ? never
            : K]?: MaybeOutput<TState[K]>;
      } & {
        [K in keyof TState as ExtendOnlyRealRecord<TState[K]> extends true
          ? K
          : TState[K] extends Array<any>
            ? K
            : never]: NonNullable<TState[K]> extends Array<infer U extends Record<string, any>>
          ? PartialFormState<U>[]
          : PartialFormState<TState[K]>;
      }
    >;

export type RegleResult<
  Data extends Record<string, any> | any[] | unknown,
  TRules extends ReglePartialRuleTree<any> | RegleFormPropertyType<any>,
> =
  | {
      valid: false;
      data: IsUnknown<Data> extends true
        ? unknown
        : IsAny<Data> extends true
          ? unknown
          : HasNamedKeys<Data> extends true
            ? NonNullable<Data> extends Date | File
              ? MaybeOutput<Data>
              : NonNullable<Data> extends Array<infer U extends Record<string, any>>
                ? PartialFormState<U>[]
                : NonNullable<Data> extends Record<string, any>
                  ? PartialFormState<NonNullable<Data>>
                  : MaybeOutput<Data>
            : unknown;
    }
  | {
      valid: true;
      data: IsUnknown<Data> extends true
        ? unknown
        : IsAny<Data> extends true
          ? unknown
          : HasNamedKeys<Data> extends true
            ? Data extends Array<infer U extends Record<string, any>>
              ? DeepSafeFormState<U, TRules>[]
              : Data extends Date | File
                ? SafeFieldProperty<Data, TRules>
                : Data extends Record<string, any>
                  ? DeepSafeFormState<Data, TRules>
                  : SafeFieldProperty<Data, TRules>
            : unknown;
    };

export type RegleNestedResult<
  Data extends Record<string, any> | unknown,
  TRules extends ReglePartialRuleTree<any> | RegleFormPropertyType<any>,
> = RegleResult<Data, TRules> &
  (
    | {
        /**
         * The form contains validation errors, so the issues and errors will be populated.
         */
        valid: false;
        /**
         * Collection of all the error messages, collected for all children properties and nested forms.
         *
         * Only contains errors from properties where $dirty equals true.
         * */
        issues: RegleIssuesTree<Data>;
        /**
         * Collection of all the issues, collected for all children properties and nested forms.
         *
         * Only contains issues from properties where $dirty equals true.
         */
        errors: RegleErrorTree<Data>;
      }
    | {
        /**
         * The result is valid, so the issues and errors will be empty.
         */
        valid: true;
        issues: EmptyObject;
        errors: EmptyObject;
      }
  );

export type RegleCollectionResult<
  Data extends any[],
  TRules extends ReglePartialRuleTree<any> | RegleFormPropertyType<any>,
> = RegleResult<Data, TRules> &
  (
    | {
        valid: false;
        issues: RegleCollectionErrors<Data, true>;
        errors: RegleCollectionErrors<Data>;
      }
    | {
        valid: true;
        issues: EmptyObject;
        errors: EmptyObject;
      }
  );

export type RegleFieldResult<
  Data extends any,
  TRules extends ReglePartialRuleTree<any> | RegleFormPropertyType<any>,
> = RegleResult<Data, TRules> &
  (
    | {
        valid: false;
        issues: RegleFieldIssue<TRules>[];
        errors: string[];
      }
    | {
        valid: true;
        issues: [];
        errors: [];
      }
  );

/**
 * Infer safe output from any `r$` instance
 *
 * ```ts
 * type FormRequest = InferSafeOutput<typeof r$>;
 * ```
 */
export type InferSafeOutput<TRegle extends MaybeRef<SuperCompatibleRegleRoot | SuperCompatibleRegleFieldStatus>> =
  UnwrapRef<TRegle> extends Raw<RegleRoot<infer TState extends Record<string, any>, infer TRules, any, any>>
    ? DeepSafeFormState<JoinDiscriminatedUnions<TState>, TRules>
    : UnwrapRef<TRegle> extends RegleFieldStatus<infer TState, infer TRules>
      ? SafeFieldProperty<TState, TRules>
      : UnwrapRef<TRegle> extends RegleLike<infer TState extends Record<string, any>>
        ? TState
        : never;

export type $InternalRegleResult = {
  valid: boolean;
  data: any;
  errors: $InternalRegleErrorTree | $InternalRegleCollectionErrors | string[];
  issues: $InternalRegleIssuesTree | $InternalRegleCollectionIssues | RegleFieldIssue[];
};

export type DeepSafeFormState<
  TState extends Record<string, any>,
  TRules extends
    | ReglePartialRuleTree<Record<string, any>, CustomRulesDeclarationTree>
    | RegleFormPropertyType<any, any>
    | undefined,
> = [unknown] extends [TState]
  ? {}
  : TRules extends undefined
    ? TState
    : TRules extends ReglePartialRuleTree<TState, CustomRulesDeclarationTree>
      ? Prettify<
          {
            [K in keyof TState as IsPropertyOutputRequired<TState[K], TRules[K]> extends false
              ? K
              : never]?: SafeProperty<TState[K], TRules[K]> extends MaybeInput<infer M>
              ? MaybeOutput<M>
              : SafeProperty<TState[K], TRules[K]>;
          } & {
            [K in keyof TState as IsPropertyOutputRequired<TState[K], TRules[K]> extends false
              ? never
              : K]-?: unknown extends SafeProperty<TState[K], TRules[K]>
              ? unknown
              : NonNullable<SafeProperty<TState[K], TRules[K]>>;
          }
        >
      : TState;

type FieldHaveRequiredRule<TRule extends RegleFormPropertyType<any, any> | undefined = never> =
  TRule extends MaybeRef<RegleRuleDecl<any, any>>
    ? [unknown] extends UnwrapRef<TRule>['required']
      ? NonNullable<UnwrapRef<TRule>['literal']> extends RegleRuleDefinition<any, any[], any, any, any, any>
        ? true
        : false
      : NonNullable<UnwrapRef<TRule>['required']> extends UnwrapRef<TRule>['required']
        ? UnwrapRef<TRule>['required'] extends RegleRuleDefinition<any, infer Params, any, any, any, any>
          ? Params extends never[]
            ? true
            : false
          : false
        : false
    : false;

type ObjectHaveAtLeastOneRequiredField<
  TState extends Record<string, any>,
  TRule extends ReglePartialRuleTree<TState, any>,
> =
  TState extends Maybe<TState>
    ? {
        [K in keyof NonNullable<TState>]-?: IsPropertyOutputRequired<NonNullable<TState>[K], TRule[K]>;
      }[keyof TState] extends false
      ? false
      : true
    : true;

type ArrayHaveAtLeastOneRequiredField<TState extends Maybe<any[]>, TRule extends RegleCollectionRuleDecl<TState>> =
  TState extends Maybe<TState>
    ?
        | FieldHaveRequiredRule<
            Omit<TRule, '$each'> extends MaybeRef<RegleRuleDecl> ? Omit<UnwrapRef<TRule>, '$each'> : {}
          >
        | ObjectHaveAtLeastOneRequiredField<
            ArrayElement<NonNullable<TState>>,
            ExtractFromGetter<TRule['$each']> extends undefined ? {} : NonNullable<ExtractFromGetter<TRule['$each']>>
          > extends false
      ? false
      : true
    : true;

export type SafeProperty<TState, TRule extends RegleFormPropertyType<any, any> | undefined> = unknown extends TState
  ? unknown
  : TRule extends RegleCollectionRuleDecl<any, any>
    ? TState extends Array<infer U extends Record<string, any>>
      ? DeepSafeFormState<U, ExtractFromGetter<TRule['$each']>>[]
      : TState
    : TRule extends ReglePartialRuleTree<any, any>
      ? ExtendOnlyRealRecord<TState> extends true
        ? DeepSafeFormState<
            NonNullable<TState> extends Record<string, any> ? JoinDiscriminatedUnions<NonNullable<TState>> : {},
            TRule
          >
        : TRule extends MaybeRef<RegleRuleDecl<any, any>>
          ? FieldHaveRequiredRule<UnwrapRef<TRule>> extends true
            ? TState
            : MaybeOutput<TState>
          : TState
      : TState;

export type IsPropertyOutputRequired<TState, TRule extends RegleFormPropertyType<any, any> | undefined> = [
  unknown,
] extends [TState]
  ? unknown
  : NonNullable<TState> extends Array<any>
    ? TRule extends RegleCollectionRuleDecl<any, any>
      ? ArrayHaveAtLeastOneRequiredField<NonNullable<TState>, TRule> extends false
        ? false
        : true
      : false
    : TRule extends ReglePartialRuleTree<any, any>
      ? ExtendOnlyRealRecord<TState> extends true
        ? ObjectHaveAtLeastOneRequiredField<
            NonNullable<TState> extends Record<string, any> ? NonNullable<TState> : {},
            TRule
          > extends false
          ? false
          : true
        : TRule extends MaybeRef<RegleRuleDecl<any, any>>
          ? FieldHaveRequiredRule<UnwrapRef<TRule>> extends false
            ? false
            : true
          : false
      : false;

export type SafeFieldProperty<TState, TRule extends RegleFormPropertyType<any, any> | undefined = never> =
  FieldHaveRequiredRule<TRule> extends true ? NonNullable<TState> : MaybeOutput<TState>;
