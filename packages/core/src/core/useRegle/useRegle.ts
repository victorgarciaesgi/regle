import type { EmptyObject, RequiredDeep, IsEqual } from 'type-fest';
import type { ComputedRef, MaybeRef, Ref } from 'vue';
import { computed, isRef, ref, toRaw } from 'vue';
import type {
  $InternalReglePartialValidationTree,
  AllRulesDeclarations,
  DeepReactiveState,
  DeepSafeFormState,
  isDeepExact,
  LocalRegleBehaviourOptions,
  Regle,
  RegleBehaviourOptions,
  RegleExternalErrorTree,
  ReglePartialValidationTree,
  RegleValidationGroupEntry,
  ResolvedRegleBehaviourOptions,
} from '../../types';
import type { DeepMaybeRef, NoInferLegacy, Unwrap } from '../../types/utils';
import { cloneDeep, isObject } from '../../utils';
import { useStateProperties } from './useStateProperties';

export type useRegleFn<TCustomRules extends Partial<AllRulesDeclarations>> = <
  TState extends Record<string, any>,
  TRules extends ReglePartialValidationTree<
    Unwrap<TState>,
    Partial<AllRulesDeclarations> & TCustomRules
  > &
    TValid,
  TExternal extends RegleExternalErrorTree<Unwrap<TState>>,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]>,
  TValid = isDeepExact<
    NoInferLegacy<TRules>,
    ReglePartialValidationTree<Unwrap<TState>, Partial<AllRulesDeclarations> & TCustomRules>
  > extends true
    ? {}
    : never,
>(
  state: MaybeRef<TState> | DeepReactiveState<TState>,
  rulesFactory: TRules | (() => TRules) | ComputedRef<TRules>,
  options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
    LocalRegleBehaviourOptions<Unwrap<TState>, TRules, TExternal, TValidationGroups>
) => Regle<Unwrap<TState>, TRules, TExternal, TValidationGroups>;

export function createUseRegleComposable<TCustomRules extends Partial<AllRulesDeclarations>>(
  customRules?: () => TCustomRules,
  options?: RegleBehaviourOptions
): useRegleFn<TCustomRules> {
  const globalOptions: RequiredDeep<RegleBehaviourOptions> = {
    autoDirty: options?.autoDirty ?? true,
    lazy: options?.lazy ?? false,
    rewardEarly: options?.rewardEarly ?? false,
  };

  function useRegle(
    state: MaybeRef<Record<string, any>> | DeepReactiveState<Record<string, any>>,
    rulesFactory:
      | Record<string, any>
      | (() => Record<string, any>)
      | ComputedRef<Record<string, any>>,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
      LocalRegleBehaviourOptions<Record<string, any>, Record<string, any>, any, any>
  ): Regle<Record<string, any>, Record<string, any>, any, any> {
    const scopeRules = isRef(rulesFactory)
      ? rulesFactory
      : computed((typeof rulesFactory === 'function' ? rulesFactory : () => rulesFactory) as any);

    const resolvedOptions: ResolvedRegleBehaviourOptions = {
      ...globalOptions,
      ...options,
    } as any;

    const processedState = (isRef(state) ? state : ref(state)) as Ref<Record<string, any>>;

    const initialState = cloneDeep(toRaw(processedState.value));

    const { regle, errors } = useStateProperties(
      scopeRules as ComputedRef<$InternalReglePartialValidationTree>,
      processedState,
      resolvedOptions,
      customRules
    );

    function resetAll() {
      regle.$unwatch();
      resetValuesRecursively(state, initialState);
      regle.$reset();
    }

    function resetValuesRecursively(
      current: Ref<Record<string, MaybeRef<any>>> | Record<string, MaybeRef<any>>,
      initial: Record<string, MaybeRef<any>>
    ) {
      Object.entries(initial).forEach(([key, value]) => {
        let currentRef = isRef<Record<string, MaybeRef<any>>>(current) ? current.value : current;
        let currentValue = isRef(currentRef[key]) ? currentRef[key].value : currentRef[key];
        let initialRef = isRef(initial[key]) ? (initial[key] as any)._value : initial[key];
        if (Array.isArray(initialRef) && Array.isArray(currentValue)) {
          currentRef[key] = [];
          initialRef.forEach((val, index) => {
            currentRef[key][index] = {};
            resetValuesRecursively(currentRef[key][index], initialRef[index]);
          });
        } else if (isObject(initialRef)) {
          resetValuesRecursively(currentValue, initialRef);
        } else {
          if (isRef(currentRef[key])) {
            currentRef[key].value = initialRef;
          } else {
            currentRef[key] = initialRef;
          }
        }
      });
    }

    const ready = computed<boolean>(() => {
      return !(regle.$invalid || regle.$pending);
    });

    async function validateState(): Promise<false | Record<string, any>> {
      regle.$touch();
      const result = await regle.$validate();
      if (result) {
        return processedState.value as any;
      }
      return false;
    }

    return {
      regle: regle as any,
      r$: regle as any,
      errors: errors as any,
      resetAll,
      validateState: validateState as any,
      ready,
      state: processedState as any,
    };
  }

  return useRegle as any;
}

export const useRegle = createUseRegleComposable();
