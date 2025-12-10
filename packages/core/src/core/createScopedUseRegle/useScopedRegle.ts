import { computed, getCurrentInstance, onMounted, ref, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue';
import type { ExtendedRulesDeclarations, Regle, ScopedInstancesRecord } from '../../types';
import { randomId, tryOnScopeDispose } from '../../utils';
import { useRegle, type useRegleFn } from '../useRegle';
import type { RequireAtLeastOne } from 'type-fest';

export type UseScopedRegleOptions<TAsRecord extends boolean> = {
  namespace?: MaybeRefOrGetter<string>;
} & (TAsRecord extends true
  ? RequireAtLeastOne<
      {
        id: string;
        /**
         * @deprecated Use `id` instead
         */
        scopeKey: string;
      },
      'id' | 'scopeKey'
    >
  : {});

export function createUseScopedRegleComposable<
  TCustomRegle extends useRegleFn<any, any> = useRegleFn<Partial<ExtendedRulesDeclarations>>,
>(
  instances: Ref<ScopedInstancesRecord>,
  customUseRegle?: TCustomRegle
): {
  useScopedRegle: TCustomRegle;
} {
  const scopedUseRegle: useRegleFn<any, any> = customUseRegle ?? useRegle;

  const useScopedRegle: TCustomRegle = ((
    state: Record<string, unknown>,
    rulesFactory: MaybeRefOrGetter<{}>,
    options?: UseScopedRegleOptions<boolean> & Record<string, any>
  ) => {
    const { namespace, scopeKey, id, ...restOptions } = options ?? {};

    scopedUseRegle.__config ??= {};

    const computedScopeId = computed(() => id ?? scopeKey);

    const computedNamespace = computed(() => toValue(namespace));

    // Keep order while avoiding conflicting ids
    const $id = ref(`${Object.keys(instances.value).length + 1}-${randomId()}`);

    const instanceName = computed(() => {
      return computedScopeId.value ?? `instance-${$id.value}`;
    });

    const { r$ } = scopedUseRegle(state, rulesFactory, {
      ...restOptions,
      id: computedScopeId.value,
    });

    register();

    tryOnScopeDispose(dispose);

    watch(computedNamespace, (newName, oldName) => {
      dispose(oldName);
      register();
    });

    if (getCurrentInstance()) {
      onMounted(() => {
        // Avoid component to be mounted twice on HMR
        const currentInstance = getCurrentInstance();
        if (typeof window !== 'undefined' && currentInstance?.proxy?.$el?.parentElement) {
          if (
            document.documentElement &&
            !document.documentElement.contains(currentInstance?.proxy?.$el?.parentElement)
          ) {
            dispose();
          }
        }
      });
    }

    function dispose(oldName?: string) {
      const nameToClean = oldName ?? computedNamespace.value;
      if (nameToClean) {
        if (instances.value[nameToClean]) {
          delete instances.value[nameToClean][instanceName.value];
        }
      } else if (instances.value['~~global'][instanceName.value]) {
        delete instances.value['~~global'][instanceName.value];
      }
    }

    function register() {
      if (computedNamespace.value) {
        if (!instances.value[computedNamespace.value]) {
          instances.value[computedNamespace.value] = {};
        }
        instances.value[computedNamespace.value][instanceName.value] = r$;
      } else {
        if (!instances.value['~~global']) {
          instances.value['~~global'] = {};
        }
        instances.value['~~global'][instanceName.value] = r$;
      }
    }

    return { r$: r$, dispose, register } as Regle;
  }) as any;

  return { useScopedRegle };
}
