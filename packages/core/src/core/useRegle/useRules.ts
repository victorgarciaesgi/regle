import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { ComputedRef, MaybeRef, Raw } from 'vue';
import { computed, isRef, ref } from 'vue';
import { isEmpty, isObject } from '../../../../shared';
import type {
  ExtendedRulesDeclarations,
  ExtendedRulesDeclarationsOverrides,
  LocalRegleBehaviourOptions,
  RegleBehaviourOptions,
  RegleFieldStatus,
  RegleRoot,
  RegleRuleDecl,
  RegleShortcutDefinition,
  RegleUnknownRulesTree,
  RegleValidationGroupEntry,
} from '../../types';
import type { DeepMaybeRef, InferInput, JoinDiscriminatedUnions, PrimitiveTypes, Unwrap } from '../../types/utils';
import { isRuleDef } from './guards';
import { createRootRegleLogic } from './shared.rootRegle';
import type { GlobalConfigOptions } from '../defineRegleConfig';

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
  TCustomRules extends Partial<ExtendedRulesDeclarationsOverrides>,
  TShortcuts extends RegleShortcutDefinition<any> = never,
> {
  <
    TRules extends RegleUnknownRulesTree | RegleRuleDecl,
    TDecl extends RegleRuleDecl<NonNullable<TState>, Partial<ExtendedRulesDeclarations> & TCustomRules>,
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
  __config?: GlobalConfigOptions<TCustomRules, TShortcuts>;
}

export function createUseRulesComposable<
  TCustomRules extends Partial<ExtendedRulesDeclarationsOverrides>,
  TShortcuts extends RegleShortcutDefinition<any>,
>(options?: GlobalConfigOptions<TCustomRules, TShortcuts>): useRulesFn<TCustomRules, TShortcuts> {
  const { rules: customRules, modifiers = {}, shortcuts, overrides } = options ?? {};

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

    const processedState = ref(createEmptyRuleState(definedRules?.value as any));

    const regle = createRootRegleLogic({
      state: processedState,
      rulesFactory: definedRules,
      options,
      globalOptions: modifiers,
      customRules,
      shortcuts,
      overrides,
    });

    return regle.regle as any;
  }

  return useRules as any;
}

/**
 * `useRules` is a variant of `useRegle` that doesn't require you to provide initial state.
 * It creates an empty state based on your rules structure and implements the Standard Schema spec.
 *
 * This is useful when you want to define validation rules first and infer the state type from them.
 *
 * @param rules - Your validation rules object
 * @param modifiers - Optional configuration to customize regle behavior
 * @returns The reactive validation state (implements StandardSchemaV1)
 *
 * @example
 * ```ts
 * import { useRules, type InferInput } from '@regle/core';
 * import { required, string, email } from '@regle/rules';
 *
 * const r$ = useRules({
 *   name: { required, string },
 *   email: { required, email }
 * });
 *
 * // State is automatically created and typed
 * r$.$value.name // string | null
 * r$.$value.email // string | null
 *
 * // Can be used with Standard Schema compatible libraries
 * const result = await r$['~standard'].validate({ name: '', email: '' });
 * ```
 *
 * @see {@link https://reglejs.dev/common-usage/standard-schema#userules Documentation}
 */
export const useRules = createUseRulesComposable();
