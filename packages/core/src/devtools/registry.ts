import { getCurrentInstance, shallowRef, watch, type WatchStopHandle } from 'vue';
import type { SuperCompatibleRegleRoot } from '../types';
import { tryOnScopeDispose } from '../utils';
import type { DevtoolsV6PluginAPI, RegleInstance } from './types';
import { emitInspectorState } from './actions';

/*#__PURE__*/
function useRegleDevtoolsRegistry() {
  const devtoolsApi = shallowRef<DevtoolsV6PluginAPI>();
  const instances = shallowRef(new Map<string, RegleInstance>());
  const watchers = shallowRef(new Map<string, WatchStopHandle>());
  let idCounter = 0;

  function setApi(api: DevtoolsV6PluginAPI): void {
    devtoolsApi.value = api;
  }

  function register(
    r$: SuperCompatibleRegleRoot,
    options?: { name?: string; componentName?: string; uid?: number }
  ): string {
    const id = `${options?.uid?.toString() ?? 'regle'}#${++idCounter}`;
    const name = options?.name || `Regle #${idCounter}`;

    instances.value.set(id, {
      id,
      name,
      r$,
      componentName: options?.componentName ? `<${options.componentName}>` : undefined,
    });

    const stopHandle = watch(
      () => r$,
      () => notifyDevtools(),
      { deep: true, flush: 'post' }
    );

    regleDevtoolsRegistry.addWatcher(id, stopHandle);

    notifyDevtools();

    return id;
  }

  function notifyDevtools(): void {
    if (devtoolsApi.value) {
      emitInspectorState(devtoolsApi.value);
    }
  }

  function unregister(id: string): void {
    instances.value.delete(id);

    const watcher = watchers.value.get(id);
    if (watcher) {
      watcher();
      watchers.value.delete(id);
    }

    notifyDevtools();
  }

  function getAll(): RegleInstance[] {
    return Array.from(instances.value.values());
  }

  function get(id: string): RegleInstance | undefined {
    return instances.value.get(id);
  }

  function clear(): void {
    watchers.value.forEach((stop) => stop());
    watchers.value.clear();

    instances.value.clear();
    notifyDevtools();
  }

  function addWatcher(id: string, stopHandle: WatchStopHandle): void {
    watchers.value.set(id, stopHandle);
  }

  return {
    register,
    unregister,
    getAll,
    get,
    clear,
    addWatcher,
    setApi,
    notifyDevtools,
  };
}

/*#__PURE__*/
export const regleDevtoolsRegistry = useRegleDevtoolsRegistry();

/**
 * To be used by `useRegle` composable.
 */
export function registerRegleInstance(r$: SuperCompatibleRegleRoot, options?: { name?: string }): void {
  if (typeof window === 'undefined') return;

  const instance = getCurrentInstance();
  const componentName = instance?.type?.name || instance?.type?.__name;

  const id = regleDevtoolsRegistry.register(r$, {
    name: options?.name,
    componentName,
    uid: instance?.uid,
  });

  tryOnScopeDispose(() => {
    regleDevtoolsRegistry.unregister(id);
  });
}
