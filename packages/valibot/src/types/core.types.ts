// import type { RegleCommonStatus, RegleRuleStatus } from '@regle/core';
// import type { PartialDeep } from 'type-fest';
// import type { z } from 'valibot';
// import type { toValibot } from './valibot.types';
// import type { ValibotToRegleCollectionErrors, ValibotToRegleErrorTree } from './errors.types';

// export interface ValibotRegle<TState extends Record<string, any>, TSchema extends toValibot<any>> {
//   r$: ValibotRegleStatus<TState, TSchema>;
// }

// export type ValibotRegleResult<TSchema extends toValibot<any>> =
//   | { result: false; data: PartialDeep<z.output<TSchema>> }
//   | { result: true; data: z.output<TSchema> };

// /**
//  * @public
//  */
// export interface ValibotRegleStatus<
//   TState extends Record<string, any> = Record<string, any>,
//   TSchema extends toValibot<any> = toValibot<any>,
// > extends RegleCommonStatus<TState> {
//   readonly $fields: TSchema extends z.ValibotObject<infer O extends z.ValibotRawShape>
//     ? {
//         readonly [TKey in keyof O]: O[TKey] extends z.ValibotTypeAny
//           ? InferValibotRegleStatusType<O[TKey], TState, TKey>
//           : never;
//       }
//     : never;
//   readonly $errors: ValibotToRegleErrorTree<TSchema>;
//   readonly $silentErrors: ValibotToRegleErrorTree<TSchema>;
//   $resetAll: () => void;
//   $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
//   $validate: () => Promise<ValibotRegleResult<TSchema>>;
// }

// /**
//  * @public
//  */
// export type InferValibotRegleStatusType<
//   TSchema extends z.ValibotTypeAny,
//   TState extends Record<PropertyKey, any> = any,
//   TKey extends PropertyKey = string,
// > =
//   TSchema extends z.ValibotArray<infer A>
//     ? ValibotRegleCollectionStatus<A, TState[TKey]>
//     : TSchema extends z.ValibotObject<any>
//       ? TState[TKey] extends Array<any>
//         ? RegleCommonStatus<TState[TKey]>
//         : ValibotRegleStatus<TState[TKey], TSchema>
//       : ValibotRegleFieldStatus<TSchema, TState, TKey>;

// /**
//  * @public
//  */
// export interface ValibotRegleFieldStatus<
//   TSchema extends z.ValibotTypeAny,
//   TState extends Record<PropertyKey, any> = any,
//   TKey extends PropertyKey = string,
// > extends RegleCommonStatus<TState> {
//   $value: TState[TKey];
//   readonly $externalErrors?: string[];
//   readonly $errors: string[];
//   readonly $silentErrors: string[];
//   readonly $rules: {
//     [Key in `${string & TSchema['_def']['typeName']}`]: RegleRuleStatus<TState[TKey], []>;
//   };
//   $validate: () => Promise<false | z.output<TSchema>>;
//   $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
// }

// /**
//  * @public
//  */
// export interface ValibotRegleCollectionStatus<TSchema extends z.ValibotTypeAny, TState extends any[]>
//   extends Omit<ValibotRegleFieldStatus<TSchema, TState>, '$errors' | '$silentErrors' | '$value'> {
//   $value: TState;
//   readonly $each: Array<InferValibotRegleStatusType<NonNullable<TSchema>, TState, number>>;
//   readonly $field: ValibotRegleFieldStatus<TSchema, TState>;
//   readonly $errors: ValibotToRegleCollectionErrors<TSchema>;
//   readonly $silentErrors: ValibotToRegleCollectionErrors<TSchema>;
//   $extractDirtyFields: (filterNullishValues?: boolean) => PartialDeep<TState>;
//   $validate: () => Promise<false | z.output<TSchema>>;
// }
