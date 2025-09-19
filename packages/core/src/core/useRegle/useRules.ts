import type { ComputedRef, MaybeRef, Raw } from 'vue';
import { computed, isRef, ref, shallowRef, triggerRef, watchEffect } from 'vue';
import { cloneDeep, isEmpty, isObject } from '../../../../shared';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type {
  $InternalReglePartialRuleTree,
  $InternalRegleStatusType,
  AllRulesDeclarations,
  CustomRulesDeclarationTree,
  LocalRegleBehaviourOptions,
  RegleBehaviourOptions,
  RegleFieldStatus,
  RegleRoot,
  RegleRuleDecl,
  RegleShortcutDefinition,
  RegleUnknownRulesTree,
  RegleValidationGroupEntry,
  ResolvedRegleBehaviourOptions,
} from '../../types';
import type { DeepMaybeRef, InferInput, JoinDiscriminatedUnions, PrimitiveTypes, Unwrap } from '../../types/utils';
import { isRuleDef } from './guards';
import { useRootStorage } from './root';
import { flatErrors } from './useErrors';

function createEmptyRuleState(rules: RegleUnknownRulesTree | RegleRuleDecl): Record<string, any> | any {
  const result: Record<string, any> = {};

  if (Object.entries(rules).some(([_, rule]) => isRuleDef(rule) || typeof rule === 'function')) {
    return null;
  }

  for (const key in rules) {
    const item = rules[key];

    if (!!item && isObject(item) && '$each' in item && item['$each'] && isObject(item['$each'])) {
      result[key] = [createEmptyRuleState(item['$each'] as any)];
    } else if (
      isObject(item) &&
      !isEmpty(item) &&
      !Object.entries(item).some(([_, rule]) => isRuleDef(rule) || typeof rule === 'function')
    ) {
      result[key] = createEmptyRuleState(item as any);
    } else {
      result[key] = null;
    }
  }

  return result;
}

export type useRulesFnOptions<
  TRules extends RegleUnknownRulesTree | RegleRuleDecl,
  TValidationGroups extends Record<string, RegleValidationGroupEntry[]>,
  TState = InferInput<TRules>,
> = Partial<DeepMaybeRef<RegleBehaviourOptions>> &
  LocalRegleBehaviourOptions<
    JoinDiscriminatedUnions<TState extends Record<string, any> ? Unwrap<TState> : {}>,
    TState extends Record<string, any> ? (TRules extends Record<string, any> ? TRules : {}) : {},
    TValidationGroups
  >;

export interface useRulesFn<
  TCustomRules extends Partial<AllRulesDeclarations>,
  TShortcuts extends RegleShortcutDefinition<any> = never,
> {
  <
    TRules extends RegleUnknownRulesTree | RegleRuleDecl,
    TDecl extends RegleRuleDecl<NonNullable<TState>, Partial<AllRulesDeclarations> & TCustomRules>,
    TValidationGroups extends Record<string, RegleValidationGroupEntry[]>,
    TState extends Record<string, any> = InferInput<TRules>,
  >(
    rulesFactory: TState extends Record<string, any> ? MaybeRef<TRules> | ((...args: any[]) => TRules) : {},
    options?: useRulesFnOptions<TRules, TValidationGroups, TState>
  ): NonNullable<TState> extends PrimitiveTypes
    ? Raw<RegleFieldStatus<NonNullable<TState>, TDecl, TShortcuts>> & StandardSchemaV1<TState>
    : Raw<
        RegleRoot<
          TState extends Record<string, any> ? Unwrap<TState> : {},
          TRules extends Record<string, any> ? TRules : {},
          TValidationGroups,
          TShortcuts
        >
      > &
        StandardSchemaV1<TState>;
  __config?: {
    rules?: () => CustomRulesDeclarationTree;
    modifiers?: RegleBehaviourOptions;
    shortcuts?: TShortcuts;
  };
}

export function createUseRulesComposable<
  TCustomRules extends Partial<AllRulesDeclarations>,
  TShortcuts extends RegleShortcutDefinition<any>,
>(
  customRules?: () => TCustomRules,
  options?: RegleBehaviourOptions,
  shortcuts?: RegleShortcutDefinition | undefined
): useRulesFn<TCustomRules, TShortcuts> {
  const globalOptions: RegleBehaviourOptions = {
    autoDirty: options?.autoDirty,
    lazy: options?.lazy,
    rewardEarly: options?.rewardEarly,
    silent: options?.silent,
    clearExternalErrorsOnChange: options?.clearExternalErrorsOnChange,
  };

  function useRules(
    rulesFactory: Record<string, any> | ((...args: any[]) => Record<string, any>) | ComputedRef<Record<string, any>>,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
      LocalRegleBehaviourOptions<Record<string, any>, Record<string, any>, any>
  ): RegleRoot<Record<string, any>, Record<string, any>, any, any> & StandardSchemaV1<any> {
    const definedRules = isRef(rulesFactory)
      ? rulesFactory
      : typeof rulesFactory === 'function'
        ? undefined
        : computed(() => rulesFactory);

    const resolvedOptions: ResolvedRegleBehaviourOptions = {
      ...globalOptions,
      ...options,
    } as any;

    const processedState = ref(createEmptyRuleState(definedRules?.value as any));

    const watchableRulesGetters = shallowRef<Record<string, any> | null>(definedRules ?? {});

    if (typeof rulesFactory === 'function') {
      watchEffect(() => {
        watchableRulesGetters.value = rulesFactory(processedState);
        triggerRef(watchableRulesGetters);
      });
    }

    const initialState = ref(
      isObject(processedState.value) ? { ...cloneDeep(processedState.value) } : cloneDeep(processedState.value)
    );

    const originalState = isObject(processedState.value)
      ? { ...cloneDeep(processedState.value) }
      : cloneDeep(processedState.value);

    const regle: {
      regle: ($InternalRegleStatusType & StandardSchemaV1<any>) | undefined;
    } = useRootStorage({
      scopeRules: watchableRulesGetters as ComputedRef<$InternalReglePartialRuleTree>,
      state: processedState,
      options: resolvedOptions,
      initialState,
      originalState,
      customRules,
      shortcuts,
    }) as any;

    return regle.regle as any;
  }

  return useRules as any;
}

/**
 * useRules is a clone of useRegle, without the need to provide a state.
 *
 * It accepts the following inputs:
 *
 * @param rules - Your rules object
 * @param modifiers - Customize regle behaviour
 * 
 * ```ts
 * import { useRules } from '@regle/core';
   import { required } from '@regle/rules';

   const { r$ } = useRules({
     email: { required }
   })
 * ```
 */
export const useRules = createUseRulesComposable();
