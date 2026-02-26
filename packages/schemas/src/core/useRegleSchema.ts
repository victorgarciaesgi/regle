import type {
  DeepMaybeRef,
  DeepPartial,
  DeepReactiveState,
  GlobalConfigOverrides,
  HaveAnyRequiredProps,
  LocalRegleBehaviourOptions,
  NoInferLegacy,
  PrimitiveTypes,
  RegleBehaviourOptions,
  RegleExternalSchemaErrorTree,
  RegleFieldIssue,
  RegleShortcutDefinition,
  ResolvedRegleBehaviourOptions,
} from '@regle/core';
import { useRootStorage } from '@regle/core';
import type { StandardSchemaV1 } from '@standard-schema/spec';
import type { MaybeRef, Raw, UnwrapNestedRefs } from 'vue';
import { computed, effectScope, getCurrentScope, nextTick, onScopeDispose, ref, toValue, unref, watch } from 'vue';
import { toReactive } from '../../../shared';
import type { $InternalRegleResult, RegleSchema, RegleSchemaBehaviourOptions, RegleSingleFieldSchema } from '../types';
import { type SchemaIssueWithArrayValue } from './useRegleSchema/issues.mapper';
import { createSchemaState } from './useRegleSchema/state.factory';
import { createSchemaValidationRunner } from './useRegleSchema/validation.runner';

export type useRegleSchemaFnOptions<
  TSchema extends Record<string, any>,
  TAdditionalOptions extends Record<string, any>,
> = Omit<
  Partial<DeepMaybeRef<RegleBehaviourOptions>> & LocalRegleBehaviourOptions<TSchema, {}, never>,
  'validationGroups' | 'lazy'
> &
  RegleSchemaBehaviourOptions &
  TAdditionalOptions;

export interface useRegleSchemaFn<
  TShortcuts extends RegleShortcutDefinition<any> = never,
  TAdditionalReturnProperties extends Record<string, any> = {},
  TAdditionalOptions extends Record<string, any> = {},
> {
  <TSchema extends StandardSchemaV1, TState extends StandardSchemaV1.InferInput<TSchema> | undefined>(
    ...params: [
      state: MaybeRef<DeepPartial<NoInferLegacy<TState>>> | DeepReactiveState<DeepPartial<NoInferLegacy<TState>>>,
      rulesFactory: MaybeRef<TSchema>,
      ...(HaveAnyRequiredProps<
        useRegleSchemaFnOptions<NoInferLegacy<NonNullable<TState>>, TAdditionalOptions>
      > extends true
        ? [options: useRegleSchemaFnOptions<NoInferLegacy<NonNullable<TState>>, TAdditionalOptions>]
        : [options?: useRegleSchemaFnOptions<NoInferLegacy<NonNullable<TState>>, TAdditionalOptions>]),
    ]
  ): NonNullable<TState> extends PrimitiveTypes
    ? RegleSingleFieldSchema<NonNullable<TState>, TSchema, TShortcuts, TAdditionalReturnProperties>
    : RegleSchema<UnwrapNestedRefs<NonNullable<TState>>, TSchema, TShortcuts, TAdditionalReturnProperties>;
}

export function createUseRegleSchemaComposable<TShortcuts extends RegleShortcutDefinition<any>>(params?: {
  options?: RegleBehaviourOptions;
  shortcuts?: RegleShortcutDefinition | undefined;
  overrides?: GlobalConfigOverrides;
}): useRegleSchemaFn<TShortcuts> {
  const { options: modifiers, shortcuts, overrides } = params ?? {};

  function useRegleSchema(
    state: MaybeRef<Record<string, any>> | DeepReactiveState<Record<string, any>> | PrimitiveTypes,
    schema: MaybeRef<StandardSchemaV1>,
    options?: Partial<DeepMaybeRef<RegleBehaviourOptions>> &
      LocalRegleBehaviourOptions<Record<string, any>, {}, never> &
      RegleSchemaBehaviourOptions
  ): RegleSchema<Record<string, any>, StandardSchemaV1, RegleShortcutDefinition> {
    if (!unref(schema)?.['~standard']) {
      throw new Error(`Only "standard-schema" compatible libraries are supported`);
    }

    const { syncState = { onUpdate: false, onValidate: false }, ...defaultOptions } = options ?? {};
    const { onUpdate: syncOnUpdate = false, onValidate: syncOnValidate = false } = syncState;

    const resolvedOptions: ResolvedRegleBehaviourOptions = {
      ...modifiers,
      ...defaultOptions,
    } as any;

    const { processedState, isSingleField, initialState, originalState } = createSchemaState(state);

    const customErrors = ref<Raw<RegleExternalSchemaErrorTree> | RegleFieldIssue[]>({});
    const previousIssues = ref<readonly SchemaIssueWithArrayValue[]>([]);

    let schemaScope: ReturnType<typeof effectScope> | undefined;
    let runner: ReturnType<typeof createSchemaValidationRunner> | undefined;

    function createRunner() {
      return createSchemaValidationRunner({
        processedState,
        getSchema: () => unref(schema),
        isSingleField,
        customErrors,
        previousIssues,
        resolvedOptions,
        syncOnUpdate,
        syncOnValidate,
      });
    }

    function startSchemaRuntime() {
      schemaScope?.stop();
      schemaScope = effectScope();
      schemaScope.run(() => {
        runner = createRunner();
        runner.defineWatchState();
        void runner.computeErrors();
      });
    }

    function stopSchemaRuntime() {
      runner?.stopWatching();
      runner = undefined;
      schemaScope?.stop();
      schemaScope = undefined;
    }

    startSchemaRuntime();

    // Keep schema runtime aligned with disabled: stop all schema reactivity when disabled, recreate when enabled.
    const unwatchDisabled = watch(
      () => toValue(resolvedOptions.disabled),
      (disabled) => {
        if (disabled) {
          stopSchemaRuntime();
        } else {
          startSchemaRuntime();
        }
      }
    );

    if (toValue(resolvedOptions.disabled)) {
      nextTick().then(() => {
        stopSchemaRuntime();
      });
    }

    let regle: ReturnType<typeof useRootStorage> | undefined;

    const onValidate = async (): Promise<$InternalRegleResult> => {
      try {
        const validationRunner = runner ?? createRunner();
        const result = await validationRunner.computeErrors(true);
        regle?.value?.$touch();

        return {
          valid: !result.issues?.length,
          data: processedState.value,
          errors: regle?.value?.$errors,
          issues: customErrors.value,
        };
      } catch (e) {
        return Promise.reject(e);
      }
    };

    if (getCurrentScope()) {
      onScopeDispose(() => {
        unwatchDisabled();
        stopSchemaRuntime();
      });
    }

    const isDisabled = computed(() => toValue(resolvedOptions.disabled) ?? false);

    regle = useRootStorage({
      scopeRules: computed(() => ({})),
      state: processedState,
      options: resolvedOptions,
      schemaErrors: customErrors,
      initialState,
      originalState,
      shortcuts,
      schemaMode: true,
      onValidate,
      overrides,
    });

    return {
      r$: toReactive(regle, isDisabled) as any,
    };
  }

  return useRegleSchema as any;
}

/**
 * `useRegleSchema` enables validation using Standard Schema compatible libraries
 * like Zod, Valibot, or ArkType.
 *
 * @param state - Your form data (plain object, ref, reactive object, or structure with nested refs)
 * @param schema - A Standard Schema compliant schema (Zod, Valibot, ArkType, etc.)
 * @param modifiers - Optional configuration to customize regle behavior
 * @returns An object containing `r$` - the reactive validation state
 *
 * @example
 * ```ts
 * import { useRegleSchema } from '@regle/schemas';
 * import * as v from 'valibot';
 *
 * // With Valibot
 * const { r$ } = useRegleSchema(
 *   { name: '', email: '' },
 *   v.object({
 *     name: v.pipe(v.string(), v.minLength(3)),
 *     email: v.pipe(v.string(), v.email())
 *   })
 * );
 *
 * // With Zod
 * import { z } from 'zod';
 *
 * const { r$ } = useRegleSchema(
 *   { name: '' },
 *   z.object({
 *     name: z.string().min(3)
 *   })
 * );
 *
 * // Access validation state
 * r$.$valid        // Whether all validations pass
 * r$.$value        // The current form values
 * r$.name.$errors  // Errors for the name field
 * ```
 *
 * @see {@link https://reglejs.dev/integrations/schemas-libraries Documentation}
 */
export const useRegleSchema = createUseRegleSchemaComposable();
