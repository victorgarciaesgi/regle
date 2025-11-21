import { getCurrentInstance, reactive, watch, type Raw, type WatchStopHandle } from 'vue';
import type { RegleRoot, SuperCompatibleRegleRoot } from '../types';
import { tryOnScopeDispose } from '../utils';

export interface RegleInstance {
  id: string;
  name: string;
  r$: SuperCompatibleRegleRoot;
  componentName?: string;
}

type DevtoolsNotifyCallback = () => void;

class RegleDevtoolsRegistry {
  private instances: Map<string, RegleInstance> = reactive(new Map());
  private watchers: Map<string, WatchStopHandle> = new Map();
  private idCounter = 0;
  private notifyCallbacks: Set<DevtoolsNotifyCallback> = new Set();

  register(r$: SuperCompatibleRegleRoot, options?: { name?: string; componentName?: string }): string {
    const id = `regle-${++this.idCounter}`;
    const name = options?.name || `Regle #${this.idCounter}`;

    this.instances.set(id, {
      id,
      name,
      r$,
      componentName: options?.componentName,
    });

    // Notify devtools about the new instance
    this.notifyDevtools();

    return id;
  }

  unregister(id: string): void {
    this.instances.delete(id);

    // Stop watching this instance
    const watcher = this.watchers.get(id);
    if (watcher) {
      watcher();
      this.watchers.delete(id);
    }

    // Notify devtools about the removal
    this.notifyDevtools();
  }

  getAll(): RegleInstance[] {
    return Array.from(this.instances.values());
  }

  get(id: string): RegleInstance | undefined {
    return this.instances.get(id);
  }

  clear(): void {
    // Stop all watchers
    this.watchers.forEach((stop) => stop());
    this.watchers.clear();

    this.instances.clear();
    this.notifyDevtools();
  }

  // Register a callback to be called when instances change
  onInstancesChange(callback: DevtoolsNotifyCallback): () => void {
    this.notifyCallbacks.add(callback);

    // Return unsubscribe function
    return () => {
      this.notifyCallbacks.delete(callback);
    };
  }

  // Add a watcher for an instance
  addWatcher(id: string, stopHandle: WatchStopHandle): void {
    this.watchers.set(id, stopHandle);
  }

  private notifyDevtools(): void {
    this.notifyCallbacks.forEach((callback) => callback());
  }
}

export const regleDevtoolsRegistry = new RegleDevtoolsRegistry();

/**
 * Register a Regle instance with the devtools
 * This is called automatically when useRegle is used
 */
export function registerRegleInstance(r$: SuperCompatibleRegleRoot, options?: { name?: string }): void {
  if (typeof window === 'undefined') return;

  // Try to get component name from the current Vue instance
  const instance = getCurrentInstance();
  const componentName = instance?.type?.name || instance?.type?.__name;

  const id = regleDevtoolsRegistry.register(r$, {
    name: options?.name,
    componentName,
  });

  // Cleanup when component is unmounted
  tryOnScopeDispose(() => {
    regleDevtoolsRegistry.unregister(id);
  });
}

/**
 * Set up a watcher for a specific instance
 * This is used internally by the devtools
 */
export function watchRegleInstance(
  id: string,
  r$: Raw<RegleRoot<any, any, any, any>>,
  onChange: () => void
): WatchStopHandle | undefined {
  if (typeof window === 'undefined') return;

  const stopHandle = watch(
    () => ({
      // Watch key validation states
      invalid: r$.$invalid,
      dirty: r$.$dirty,
      anyDirty: r$.$anyDirty,
      error: r$.$error,
      pending: r$.$pending,
      ready: r$.$ready,
      valid: r$.$valid,
      // Watch for field changes
      fieldsKeys: r$.$fields ? Object.keys(r$.$fields) : [],
      // Deep watch fields for changes
      fieldsState: r$.$fields ? JSON.stringify(r$.$fields) : '',
    }),
    () => {
      onChange();
    },
    { deep: true, flush: 'post' }
  );

  regleDevtoolsRegistry.addWatcher(id, stopHandle);

  return stopHandle;
}
