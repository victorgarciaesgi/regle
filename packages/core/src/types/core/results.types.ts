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
  RegleFormPropertyType,
  RegleIssuesTree,
  ReglePartialRuleTree,
  RegleRuleDecl,
  RegleRuleDefinition,
} from '../rules';
import type {
  ArrayElement,
  ExtendOnlyRealRecord,
  ExtractFromGetter,
  HasNamedKeys,
  isRecordLiteral,
  JoinDiscriminatedUnions,
  Maybe,
  MaybeInput,
  MaybeOutput,
  MaybeRefOrComputedRef,
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
      /** The result is invalid */
      valid: false;
      /** Unsafe output data */
      data: IsUnknown<Data> extends true
        ? unknown
        : IsAny<Data> extends true
          ? unknown
          : HasNamedKeys<Data> extends true
            ? NonNullable<Data> extends Date | File
              ? MaybeOutput<Raw<Data>>
              : NonNullable<Data> extends Array<infer U extends Record<string, any>>
                ? PartialFormState<U>[]
                : NonNullable<Data> extends Record<string, any>
                  ? PartialFormState<NonNullable<Data>>
                  : MaybeOutput<Data>
            : unknown;
      /**
       * Collection of all the error messages, collected for all children properties and nested forms.
       *
       * Only contains errors from properties where $dirty equals true.
       * */
      issues: DataTypeRegleIssues<Data, TRules>;
      /**
       * Collection of all the issues, collected for all children properties and nested forms.
       *
       * Only contains issues from properties where $dirty equals true.
       */
      errors: DataTypeRegleErrors<Data>;
    }
  | {
      /** The result is valid */
      valid: true;
      /** Filtered type safe output data */
      data: IsUnknown<Data> extends true
        ? unknown
        : IsAny<Data> extends true
          ? unknown
          : HasNamedKeys<Data> extends true
            ? NonNullable<Data> extends Array<infer U extends Record<string, any>>
              ? DeepSafeFormState<U, TRules>[]
              : NonNullable<Data> extends Date | File
                ? SafeFieldProperty<Raw<NonNullable<Data>>, TRules>
                : NonNullable<Data> extends Record<string, any>
                  ? DeepSafeFormState<NonNullable<Data>, TRules>
                  : SafeFieldProperty<Data, TRules>
            : unknown;
      /** Empty object because the result is valid */
      issues: EmptyObject;
      /** Empty object because the result is valid */
      errors: EmptyObject;
    };

export type DataTypeRegleIssues<
  TData extends Record<string, any> | any[] | unknown,
  TRules extends ReglePartialRuleTree<any> | RegleFormPropertyType<any> = never,
> =
  HasNamedKeys<TData> extends true
    ? NonNullable<TData> extends Array<infer U>
      ? isRecordLiteral<U> extends true
        ? RegleFieldIssue<TRules>[]
        : RegleCollectionErrors<TData, true>
      : isRecordLiteral<TData> extends true
        ? RegleIssuesTree<TData>
        : RegleFieldIssue<TRules>[]
    : RegleFieldIssue | RegleCollectionErrors<TData, true> | RegleIssuesTree<TData>;

export type DataTypeRegleErrors<TData extends Record<string, any> | any[] | unknown> =
  HasNamedKeys<TData> extends true
    ? NonNullable<TData> extends Array<infer U>
      ? isRecordLiteral<U> extends true
        ? string[]
        : RegleCollectionErrors<TData>
      : isRecordLiteral<TData> extends true
        ? RegleErrorTree<TData>
        : string[]
    : string[] | RegleErrorTree<TData> | RegleCollectionErrors<TData>;

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
  TRule extends MaybeRefOrComputedRef<RegleRuleDecl<any, any>>
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
