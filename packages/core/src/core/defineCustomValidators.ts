// import { computed, ComputedRef, MaybeRef, ref } from 'vue';
// import { CustomErrorMessage, PartialValidationTree, RuleResultRecord } from './types';
// import { createUseFormComposable } from './useForm';

// /**
//  * Root function that allows you to define project-wise all your custom validators and their error messages
//  *
//  * It will return utility functions that let you build type-safe forms
//  *
//  * @param customRules
//  */
// export function defineCustomValidators<TCustomRules extends RuleResultRecord>(
//   customRules: (
//     params: DefaultValidators & TCustomRules
//   ) => Partial<Record<keyof DefaultValidators, CustomErrorMessage>> &
//     Record<keyof TCustomRules, CustomErrorMessage>
// ) {
//   const useForm = createUseFormComposable<TCustomRules>(formatErrorMessages);

//   return {
//     formatErrorMessages,
//     useForm,
//   };
// }
