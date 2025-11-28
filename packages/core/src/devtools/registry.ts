import { getCurrentInstance, inject, ref, shallowRef, watch, type WatchStopHandle } from 'vue';
import type { SuperCompatibleRegleRoot } from '../types';
import { tryOnScopeDispose } from '../utils';
import type { DevtoolsV6PluginAPI, RegleInstance } from './types';
import { emitInspectorState } from './actions';
import { regleSymbol } from '../constants';

/*#__PURE__*/
function useRegleDevtoolsRegistry() {
  const loggedWarning = ref(false);
  const devtoolsApi = shallowRef<DevtoolsV6PluginAPI>();
  const instances = shallowRef(new Map<string, RegleInstance>());
  const watchers = shallowRef(new Map<string, WatchStopHandle>());
  const idCounters = shallowRef(new Map<string, number>());
  const looseIdCounter = ref(0);

  function setApi(api: DevtoolsV6PluginAPI): void {
    devtoolsApi.value = api;
  }

  function register(
    r$: SuperCompatibleRegleRoot,
    options?: { name?: string; componentName?: string; uid?: number; filePath?: string }
  ): string {
    const idPath = options?.filePath ?? 'loose';
    const existingCounter = idCounters.value.get(idPath);
    const perComponentCounter = existingCounter ? existingCounter + 1 : 1;
    idCounters.value.set(idPath, perComponentCounter);

    const id = `${options?.uid?.toString() ?? 'regle'}#${++looseIdCounter.value}`;
    const name = `${'r$'} #${options?.name ?? perComponentCounter}`;

    instances.value.set(id, {
      id,
      name,
      r$,
      componentName: options?.componentName,
      filePath: options?.filePath,
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
    loggedWarning,
  };
}

/*#__PURE__*/
export const regleDevtoolsRegistry = useRegleDevtoolsRegistry();

/**
 * To be used by `useRegle` like composables.
 */
export function registerRegleInstance(r$: SuperCompatibleRegleRoot, options?: { name?: string }): void {
  if (typeof window === 'undefined') return;

  if (__USE_DEVTOOLS__) {
    const regleVersion: string | undefined = inject(regleSymbol);

    if (!regleVersion && !regleDevtoolsRegistry.loggedWarning.value) {
      regleDevtoolsRegistry.loggedWarning.value = true;
      console.warn(
        `📏 Regle Devtools are not available. Install Regle plugin in your app to enable them. https://reglejs.dev/introduction/devtools`
      );
      return;
    }
  }

  const instance = getCurrentInstance();
  const componentName = instance?.type?.name || instance?.type?.__name;
  // Find the file path of the component (if available)
  let filePath: string | undefined;
  if (instance && instance.type && typeof instance.type === 'object' && '__file' in instance.type) {
    filePath = (instance.type as any).__file;
  }

  const id = regleDevtoolsRegistry.register(r$, {
    name: options?.name,
    componentName,
    uid: instance?.uid,
    filePath,
  });

  tryOnScopeDispose(() => {
    regleDevtoolsRegistry.unregister(id);
  });
}
