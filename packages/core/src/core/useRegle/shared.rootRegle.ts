import type { Ref } from 'vue';
import { computed, isRef, ref, shallowRef, triggerRef, watchEffect, type ComputedRef } from 'vue';
import type { DeepMaybeRef, LocalRegleBehaviourOptions, RegleBehaviourOptions } from '../..';
import { cloneDeep, isObject } from '../../../../shared';
import type {
  $InternalReglePartialRuleTree,
  AllRulesDeclarations,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
} from '../../types';
import type { PrimitiveTypes } from '../../types/utils';
import { useRootStorage } from './root';

interface RootRegleOptions {
  state: Ref<Record<string, any> | PrimitiveTypes>;
  rulesFactory?: Record<string, any> | ((...args: any[]) => Record<string, any>) | ComputedRef<Record<string, any>>;
  options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
    LocalRegleBehaviourOptions<Record<string, any>, Record<string, any>, any>;
  globalOptions: RegleBehaviourOptions;
  customRules?: () => Partial<AllRulesDeclarations>;
  shortcuts?: RegleShortcutDefinition | undefined;
}

export function createRootRegleLogic({
  state,
  rulesFactory,
  options,
  globalOptions,
  customRules,
  shortcuts,
}: RootRegleOptions) {
  const definedRules = isRef(rulesFactory)
    ? rulesFactory
    : typeof rulesFactory === 'function'
      ? undefined
      : computed(() => rulesFactory);

  const resolvedOptions: ResolvedRegleBehaviourOptions = {
    ...globalOptions,
    ...options,
  } as any;

  const watchableRulesGetters = shallowRef<Record<string, any> | null>(definedRules ?? {});

  if (typeof rulesFactory === 'function') {
    watchEffect(() => {
      watchableRulesGetters.value = rulesFactory(state);
      triggerRef(watchableRulesGetters);
    });
  }

  const initialState = ref(isObject(state.value) ? { ...cloneDeep(state.value) } : cloneDeep(state.value));

  const originalState = isObject(state.value) ? { ...cloneDeep(state.value) } : cloneDeep(state.value);

  return useRootStorage({
    scopeRules: watchableRulesGetters as ComputedRef<$InternalReglePartialRuleTree>,
    state: state,
    options: resolvedOptions,
    initialState,
    originalState,
    customRules,
    shortcuts,
  });
}
