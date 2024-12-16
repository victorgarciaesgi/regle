// import type { z } from 'valibot';
// import type { toValibot } from './valibot.types';

// export type ValibotToRegleErrorTree<TSchema extends toValibot<any>> =
//   TSchema extends z.ValibotObject<infer O>
//     ? {
//         readonly [K in keyof O]: ValibotDefToRegleValidationErrors<O[K]>;
//       }
//     : never;

// export type ValibotDefToRegleValidationErrors<TRule extends z.ValibotTypeAny> =
//   TRule extends z.ValibotArray<infer A>
//     ? ValibotToRegleCollectionErrors<A>
//     : TRule extends z.ValibotObject<any>
//       ? ValibotToRegleErrorTree<TRule>
//       : string[];

// export type ValibotToRegleCollectionErrors<TRule extends z.ValibotTypeAny> = {
//   readonly $self: string[];
//   readonly $each: ValibotDefToRegleValidationErrors<TRule>[];
// };
