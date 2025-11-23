import { getCurrentInstance, shallowRef, watch, type WatchStopHandle } from 'vue';
import type { SuperCompatibleRegleRoot } from '../types';
import { tryOnScopeDispose } from '../utils';
import type { DevtoolsNotifyCallback, RegleInstance } from './types';

/*#__PURE__*/
function useRegleDevtoolsRegistry() {
  const instances = shallowRef(new Map<string, RegleInstance>());
  const watchers = shallowRef(new Map<string, WatchStopHandle>());
  let idCounter = 0;
  const notifyCallbacks = shallowRef(new Set<DevtoolsNotifyCallback>());

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

    notifyDevtools();

    return id;
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

  function onInstancesChange(callback: DevtoolsNotifyCallback): () => void {
    notifyCallbacks.value.add(callback);

    return () => {
      notifyCallbacks.value.delete(callback);
    };
  }

  function addWatcher(id: string, stopHandle: WatchStopHandle): void {
    watchers.value.set(id, stopHandle);
  }

  function notifyDevtools(): void {
    notifyCallbacks.value.forEach((callback) => callback());
  }

  return {
    register,
    unregister,
    getAll,
    get,
    clear,
    onInstancesChange,
    addWatcher,
  };
}

/*#__PURE__*/
export const regleDevtoolsRegistry = useRegleDevtoolsRegistry();

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

export function watchRegleInstance(id: string, r$: SuperCompatibleRegleRoot, onChange: () => void): WatchStopHandle {
  const stopHandle = watch(() => r$, onChange, { deep: true, flush: 'post' });

  regleDevtoolsRegistry.addWatcher(id, stopHandle);

  return stopHandle;
}
