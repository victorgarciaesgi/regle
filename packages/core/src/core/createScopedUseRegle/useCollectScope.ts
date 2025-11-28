import { computed, reactive, ref, toValue, watch } from 'vue';
import type { MaybeRefOrGetter, Ref } from 'vue';
import type { RegleRoot, ScopedInstancesRecord, SuperCompatibleRegleRoot } from '../../types';
import { mergeRegles, type MergedRegles, type MergedScopedRegles } from '../mergeRegles';

export type useCollectScopeFn<TNamedScoped extends boolean = false> = TNamedScoped extends true
  ? <const TValue extends Record<string, Record<string, any>>>(
      namespace?: MaybeRefOrGetter<string | string[]>
    ) => {
      r$: MergedRegles<{
        [K in keyof TValue]: RegleRoot<TValue[K]> & SuperCompatibleRegleRoot;
      }>;
    }
  : <TValue extends Record<string, unknown>[] = Record<string, unknown>[]>(
      namespace?: MaybeRefOrGetter<string | string[]>
    ) => {
      r$: MergedScopedRegles<TValue>;
    };

export function createUseCollectScope<TNamedScoped extends boolean = false>(
  instances: Ref<ScopedInstancesRecord>,
  options: { asRecord?: TNamedScoped }
): { useCollectScope: useCollectScopeFn<TNamedScoped> } {
  function useCollectScope(namespace?: MaybeRefOrGetter<string | string[]>): {
    r$: MergedScopedRegles<Record<string, unknown>[]> | MergedRegles<Record<string, SuperCompatibleRegleRoot>>;
  } {
    const computedNamespace = computed<string | string[] | undefined>(() => toValue(namespace));

    const namespaceInstances = reactive<Record<string, SuperCompatibleRegleRoot>>({});

    setEmptyNamespace();

    const r$ = ref<MergedScopedRegles | MergedRegles<any>>(collectRegles(instances.value));

    const regle = reactive({ r$ });

    function setEmptyNamespace() {
      if (computedNamespace.value) {
        if (typeof computedNamespace.value === 'string' && !instances.value[computedNamespace.value]) {
          instances.value[computedNamespace.value] = {};
        } else if (Array.isArray(computedNamespace.value)) {
          computedNamespace.value.forEach((namespace) => {
            if (!instances.value[namespace]) {
              instances.value[namespace] = {};
            }
          });
        }
      }
    }

    watch(computedNamespace, setEmptyNamespace);

    watch(
      instances,
      (newInstances) => {
        r$.value = collectRegles(newInstances);
      },
      { deep: true }
    );

    function collectRegles(r$Instances: ScopedInstancesRecord) {
      if (computedNamespace.value) {
        if (typeof computedNamespace.value === 'string') {
          return mergeRegles(r$Instances[computedNamespace.value] ?? {}, !options.asRecord);
        } else {
          Object.keys(namespaceInstances).forEach((key) => {
            delete namespaceInstances[key];
          });

          computedNamespace.value.forEach((namespace) => {
            Object.entries(r$Instances[namespace]).forEach(([key, regle]) => {
              Object.assign(namespaceInstances, { [key]: regle });
            });
          });
          return mergeRegles(namespaceInstances, !options.asRecord);
        }
      } else {
        return mergeRegles(r$Instances['~~global'] ?? {}, !options.asRecord);
      }
    }

    return { r$: regle.r$ as any };
  }

  return { useCollectScope: useCollectScope as any };
}
