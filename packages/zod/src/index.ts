import { z } from 'zod';
import { computed, Ref, ref, shallowRef, toRaw, UnwrapRef } from 'vue';
import { isEmpty } from './utils';
import { Regle, RegleErrorTree, ReglePartialValidationTree, useRegle } from '@regle/core';
import { PossibleDefTypes, processZodTypeDef } from './utils/guessDefType';

type MaybeRef<T = any> = T | Ref<T>;

type DeepReactiveState<T extends Record<string, any>> = {
  [K in keyof T]: MaybeRef<T[K]>;
};

type ZodObj<T extends z.ZodRawShape> = {
  [K in keyof T]: T[K] extends Record<string, any> ? z.ZodObject<ZodObj<T[K]>> : z.ZodType<T[K]>;
};

type toZod<T extends z.ZodRawShape> = z.ZodObject<ZodObj<T>>;

export function useZodForm<
  TState extends Record<string, any>,
  TZod extends toZod<UnwrapRef<TState>> = toZod<UnwrapRef<TState>>,
>(state: Ref<TState> | DeepReactiveState<TState>, schema: TZod) {
  const processedState = ref(state) as Ref<TState>;
  const initialState = shallowRef<TState>(structuredClone(toRaw(processedState.value)));

  const rules = ref<ReglePartialValidationTree<any, any>>({});

  function zodShapeToRegleRules() {
    rules.value = Object.fromEntries(
      Object.entries(schema.shape).map(([key, shape]) => {
        if (typeof shape === 'object' && '_def' in shape) {
          const def = shape._def as PossibleDefTypes;
          return [key, processZodTypeDef(def)];
        }
        return [key, {}];
      })
    );
  }

  zodShapeToRegleRules();

  return useRegle(
    processedState,
    computed(() => rules.value)
  );

  // function processIssues(): void {
  //   const errors = schema.safeParse(processedState.value);
  //   console.log(errors);
  //   if (errors.success) {
  //     $errors.value = [];
  //   } else {
  //     const newErrors: Record<string, any> = {};

  //     errors.error.issues.forEach((issue) => {
  //       if (issue.path.length === 1) {
  //         if (isEmpty(newErrors[issue.path[0]])) {
  //           newErrors[issue.path[0]] = [issue.message];
  //         } else {
  //           newErrors[issue.path[0]].push(issue.message);
  //         }
  //       } else {
  //         /**
  //          * Recursive error assignment
  //          */
  //         function errorReducer(
  //           source: Record<string | number, any> | Array<any>,
  //           path: string | number,
  //           index: number
  //         ) {
  //           if (index + 1 === issue.path.length) {
  //             if (typeof path === 'number' && Array.isArray(source)) {
  //               if (Array.isArray(source[path])) {
  //                 if (isEmpty(source[path])) {
  //                   source[path] = [issue.message];
  //                 } else {
  //                   source[path].push(issue.message);
  //                 }
  //               }
  //             } else if (typeof path === 'string' && !Array.isArray(source)) {
  //               if (isEmpty(source[path])) {
  //                 source[path] = [issue.message];
  //               } else {
  //                 source[path].push(issue.message);
  //               }
  //             }
  //           } else {
  //             if (typeof path === 'number' && Array.isArray(source)) {
  //               if (source[path] == null) {
  //                 source[path] = [];
  //               }
  //               errorReducer(source[path], issue.path[index + 1], index + 1);
  //             } else if (typeof path === 'string' && !Array.isArray(source)) {
  //               if (source[path] == null) {
  //                 source[path] = {};
  //               }
  //               source[path] = {};
  //               errorReducer(source[path], issue.path[index + 1], index + 1);
  //             }
  //           }
  //         }

  //         errorReducer(newErrors, issue.path[0], 0);
  //       }
  //     });

  //     $errors.value = newErrors;
  //   }
  // }
}
