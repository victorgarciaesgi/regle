import type {
  JoinDiscriminatedUnions,
  PrimitiveTypes,
  RegleCollectionErrors,
  RegleCommonStatus,
  RegleErrorTree,
  RegleRuleStatus,
  RegleShortcutDefinition,
} from '@regle/core';
import type { PartialDeep } from 'type-fest';
import type { Raw } from 'vue';
import type { z, ZodTypeAny } from 'zod';
import type { GetNestedZodSchema } from './utils.types';
import type { toZod } from './zod.types';

export interface ZodRegle<
  TState extends Record<string, any>,
  TSchema extends toZod<any>,
  TShortcuts extends RegleShortcutDefinition = {},
> {
  /**
   * r$ is a reactive object containing the values, errors, dirty state and all the necessary validations properties you'll need to display informations.
   *
   * To see the list of properties: {@link https://reglejs.dev/core-concepts/validation-properties}
   */
  r$: Raw<ZodRegleStatus<TState, TSchema, TShortcuts>>;
}

export type ZodRegleResult<TSchema extends z.ZodTypeAny> =
  | { result: false; data: PartialDeep<z.output<TSchema>> }
  | { result: true; data: z.output<TSchema> };

type ExtractZodObject<T extends z.ZodType> =
  T extends z.ZodType<any, z.ZodIntersectionDef<infer A extends z.ZodObject<any>, infer B extends z.ZodObject<any>>>
    ? z.ZodObject<z.objectUtil.extendShape<A['shape'], B['shape']>>
    : T extends z.ZodType<any, z.ZodIntersectionDef<infer A, infer B>>
      ? z.ZodObject<z.objectUtil.extendShape<ExtractZodObject<A>['shape'], ExtractZodObject<B>['shape']>>
      : T extends z.ZodObject<any>
        ? T
        : T extends z.ZodDiscriminatedUnion<any, infer U extends z.ZodDiscriminatedUnionOption<any>[]>
          ? ExtractZodObject<U[number]>
          : T extends z.ZodEffects<infer U extends z.ZodType>
            ? ExtractZodObject<U>
            : T;
/**
 * @public
 */
export type ZodRegleStatus<
  TState extends Record<string, any> = Record<string, any>,
  TSchema extends toZod<any> = toZod<TState>,
  TShortcuts extends RegleShortcutDefinition = {},
> = RegleCommonStatus<TState> & {
  /** Represents all the children of your object. You can access any nested child at any depth to get the relevant data you need for your form. */
  readonly $fields: ExtractZodObject<TSchema> extends z.ZodObject<infer O extends z.ZodRawShape, any>
    ? {
        readonly [TKey in keyof JoinDiscriminatedUnions<TState>]: TKey extends keyof JoinDiscriminatedUnions<O>
          ? NonNullable<JoinDiscriminatedUnions<O>[TKey]> extends z.ZodTypeAny
            ? InferZodRegleStatusType<
                NonNullable<JoinDiscriminatedUnions<O>[TKey]>,
                JoinDiscriminatedUnions<TState>,
                TKey,
                TShortcuts
              >
            : never
          : never;
      } & {
        readonly [TKey in keyof JoinDiscriminatedUnions<TState> as TKey extends keyof JoinDiscriminatedUnions<O>
          ? JoinDiscriminatedUnions<O>[TKey] extends NonNullable<JoinDiscriminatedUnions<O>[TKey]>
            ? JoinDiscriminatedUnions<O>[TKey] extends z.ZodType<infer Z extends PrimitiveTypes>
              ? TKey
              : never
            : never
          : never]-?: TKey extends keyof JoinDiscriminatedUnions<O>
          ? InferZodRegleStatusType<
              NonNullable<
                JoinDiscriminatedUnions<O>[TKey] extends ZodTypeAny
                  ? NonNullable<JoinDiscriminatedUnions<O>[TKey]>
                  : never
              >,
              NonNullable<JoinDiscriminatedUnions<TState>>,
              TKey,
              TShortcuts
            >
          : never;
      }
    : {};
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: RegleErrorTree<TState>;
  /** Collection of all the error messages, collected for all children properties. */
  readonly $silentErrors: RegleErrorTree<TState>;
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
  $validate: () => Promise<ZodRegleResult<TSchema>>;
} & ([TShortcuts['nested']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['nested']]: ReturnType<NonNullable<TShortcuts['nested']>[K]>;
      });

/**
 * @public
 */
export type InferZodRegleStatusType<
  TSchema extends z.ZodTypeAny,
  TState extends Record<PropertyKey, any> = any,
  TKey extends PropertyKey = string,
  TShortcuts extends RegleShortcutDefinition = {},
> =
  TState[TKey] extends Array<any>
    ? GetNestedZodSchema<TSchema> extends z.ZodType<z.arrayOutputType<infer A>>
      ? ZodRegleCollectionStatus<A, TState[TKey], TShortcuts>
      : RegleCommonStatus<TState[TKey]>
    : GetNestedZodSchema<TSchema> extends z.ZodType<z.objectOutputType<any, any>>
      ? ZodRegleStatus<TState[TKey], GetNestedZodSchema<TSchema>, TShortcuts>
      : GetNestedZodSchema<TSchema> extends z.ZodDiscriminatedUnion<any, infer U>
        ? ZodRegleStatus<TState[TKey], U[number], TShortcuts>
        : ZodRegleFieldStatus<GetNestedZodSchema<TSchema>, TState[TKey], TShortcuts>;

/**
 * @public
 */
export type ZodRegleFieldStatus<
  TSchema extends z.ZodTypeAny,
  TState extends unknown = any,
  TShortcuts extends RegleShortcutDefinition = {},
> = RegleCommonStatus<TState> & {
  /** A reference to the original validated model. It can be used to bind your form with v-model.*/
  $value: TState;
  /** $value variant that will not "touch" the field and update the value silently, running only the rules, so you can easily swap values without impacting user interaction. */
  $silentValue: TState;
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: string[];
  /** Collection of all the error messages, collected for all children properties and nested forms.  */
  readonly $silentErrors: string[];
  /** Stores external errors of the current field */
  readonly $externalErrors?: string[];
  /** Stores active tooltips messages of the current field */
  readonly $inactive: boolean;
  /** This is reactive tree containing all the declared rules of your field. To know more about the rule properties check the rules properties section */
  readonly $rules: {
    [Key in `${string & TSchema['_def']['typeName']}`]: RegleRuleStatus<TState, []>;
  };
  /** Sets all properties as dirty, triggering all rules. It returns a promise that will either resolve to false or a type safe copy of your form state. Values that had the required rule will be transformed into a non-nullable value (type only). */
  $validate: () => Promise<ZodRegleResult<TSchema>>;
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
} & ([TShortcuts['fields']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['fields']]: ReturnType<NonNullable<TShortcuts['fields']>[K]>;
      });

/**
 * @public
 */
export type ZodRegleCollectionStatus<
  TSchema extends z.ZodTypeAny,
  TState extends any[],
  TShortcuts extends RegleShortcutDefinition = {},
> = Omit<ZodRegleFieldStatus<TSchema, TState>, '$errors' | '$silentErrors'> & {
  /** Collection of status of every item in your collection. Each item will be a field you can access, or map on it to display your elements. */
  readonly $each: Array<InferZodRegleStatusType<NonNullable<TSchema>, TState, number, TShortcuts>>;
  /** Represents the status of the collection itself. You can have validation rules on the array like minLength, this field represents the isolated status of the collection. */
  readonly $self: ZodRegleFieldStatus<TSchema, TState[number], TShortcuts>;
  /** Collection of all the error messages, collected for all children properties and nested forms.
   *
   * Only contains errors from properties where $dirty equals true. */
  readonly $errors: RegleCollectionErrors<TState>;
  /** Collection of all the error messages, collected for all children properties and nested forms.  */
  readonly $silentErrors: RegleCollectionErrors<TState>;
  /** Will return a copy of your state with only the fields that are dirty. By default it will filter out nullish values or objects, but you can override it with the first parameter $extractDirtyFields(false). */
  $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
  $validate: () => Promise<ZodRegleResult<TSchema>>;
} & ([TShortcuts['collections']] extends [never]
    ? {}
    : {
        [K in keyof TShortcuts['collections']]: ReturnType<NonNullable<TShortcuts['collections']>[K]>;
      });
