import { getCurrentInstance, inject, ref, shallowRef, watch, type App, type WatchStopHandle } from 'vue';
import { regleSymbol } from '../constants';
import type { SuperCompatibleRegleRoot } from '../types';
import { tryOnScopeDispose } from '../utils';
import { isRegleDevtoolsTestEnv } from '../utils/devtools.utils';
import { devtoolsDiagnostics } from '../diagnostics/devtools';
import { emitInspectorState } from './inspector-sync';
import type { DevtoolsV6PluginAPI, RegleInstance } from './types';

const REGLE_DEVTOOLS_GLOBAL_KEY = '__REGLE_DEVTOOLS_REGISTRY__' as const;

function createRegleDevtoolsRegistry() {
  const loggedWarning = ref(false);
  const devtoolsApi = shallowRef<DevtoolsV6PluginAPI>();
  const devtoolsApp = shallowRef<App>();
  const instances = shallowRef(new Map<string, RegleInstance>());
  const watchers = shallowRef(new Map<string, WatchStopHandle>());
  const instanceIndexCounter = ref(0);
  let pendingNotifyFrame: number | undefined;

  function setApi(api: DevtoolsV6PluginAPI, app?: App): void {
    devtoolsApi.value = api;
    if (app) {
      devtoolsApp.value = app;
    }
  }

  function register(
    r$: SuperCompatibleRegleRoot,
    options?: { name?: string; componentName?: string; uid?: number; filePath?: string }
  ): string {
    const instanceIndex = ++instanceIndexCounter.value;
    const id = `${options?.uid?.toString() ?? 'regle'}#${instanceIndex}`;
    const name = `${'r$'} #${options?.name ?? instanceIndex}`;

    instances.value.set(id, {
      id,
      name,
      r$,
      componentName: options?.componentName,
      filePath: options?.filePath,
    });

    const stopHandle = watch(
      [
        () => r$.$value,
        () => r$.$externalErrors,
        () => r$.$externalIssues,
        () => r$.$error,
        () => r$.$invalid,
        () => r$.$pending,
      ],
      () => scheduleNotifyDevtools(),
      { deep: true, flush: 'post' }
    );

    watchers.value.set(id, stopHandle);

    window.requestAnimationFrame(() => {
      notifyDevtools();
    });

    return id;
  }

  function notifyDevtools(): void {
    if (devtoolsApi.value) {
      emitInspectorState(devtoolsApi.value, devtoolsApp.value);
    }
  }

  function scheduleNotifyDevtools(): void {
    if (pendingNotifyFrame != null) return;

    pendingNotifyFrame = window.requestAnimationFrame(() => {
      pendingNotifyFrame = undefined;
      notifyDevtools();
    });
  }

  function unregister(id: string): void {
    const watcher = watchers.value.get(id);
    if (watcher) {
      watcher();
      watchers.value.delete(id);
    }

    instances.value.delete(id);

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

  return {
    devtoolsApi,
    devtoolsApp,
    register,
    unregister,
    getAll,
    get,
    clear,
    setApi,
    notifyDevtools,
    loggedWarning,
  };
}

type RegleDevtoolsRegistry = ReturnType<typeof createRegleDevtoolsRegistry>;

function getRegleDevtoolsRegistry(): RegleDevtoolsRegistry {
  if (typeof globalThis === 'undefined') {
    return createRegleDevtoolsRegistry();
  }

  const globalRegistry = globalThis as typeof globalThis & {
    [REGLE_DEVTOOLS_GLOBAL_KEY]?: RegleDevtoolsRegistry;
  };

  globalRegistry[REGLE_DEVTOOLS_GLOBAL_KEY] ??= createRegleDevtoolsRegistry();
  return globalRegistry[REGLE_DEVTOOLS_GLOBAL_KEY];
}

export const regleDevtoolsRegistry = getRegleDevtoolsRegistry();

/**
 * To be used by `useRegle` like composables.
 */
export function registerRegleInstance(r$: SuperCompatibleRegleRoot, options?: { name?: string }): () => void {
  if (
    typeof window === 'undefined' ||
    !(__USE_DEVTOOLS__ || (typeof __VUE_PROD_DEVTOOLS__ !== 'undefined' && __VUE_PROD_DEVTOOLS__)) ||
    isRegleDevtoolsTestEnv()
  ) {
    return () => {};
  }

  const regleVersion = inject(regleSymbol, undefined);

  if (!regleVersion && !regleDevtoolsRegistry.loggedWarning.value && !!regleDevtoolsRegistry.devtoolsApi) {
    regleDevtoolsRegistry.loggedWarning.value = true;
    devtoolsDiagnostics.REGLE_R0020();
    return () => {};
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

  function unregister() {
    regleDevtoolsRegistry.unregister(id);
  }

  tryOnScopeDispose(unregister);

  return unregister;
}
