import { getCurrentInstance, reactive, watch, type WatchStopHandle } from 'vue';
import type { SuperCompatibleRegleRoot } from '../types';
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
      componentName: options?.componentName ? `<${options.componentName}>` : undefined,
    });

    this.notifyDevtools();

    return id;
  }

  unregister(id: string): void {
    this.instances.delete(id);

    const watcher = this.watchers.get(id);
    if (watcher) {
      watcher();
      this.watchers.delete(id);
    }

    this.notifyDevtools();
  }

  getAll(): RegleInstance[] {
    return Array.from(this.instances.values());
  }

  get(id: string): RegleInstance | undefined {
    return this.instances.get(id);
  }

  clear(): void {
    this.watchers.forEach((stop) => stop());
    this.watchers.clear();

    this.instances.clear();
    this.notifyDevtools();
  }

  onInstancesChange(callback: DevtoolsNotifyCallback): () => void {
    this.notifyCallbacks.add(callback);

    return () => {
      this.notifyCallbacks.delete(callback);
    };
  }

  addWatcher(id: string, stopHandle: WatchStopHandle): void {
    this.watchers.set(id, stopHandle);
  }

  private notifyDevtools(): void {
    this.notifyCallbacks.forEach((callback) => callback());
  }
}

export const regleDevtoolsRegistry = new RegleDevtoolsRegistry();

export function registerRegleInstance(r$: SuperCompatibleRegleRoot, options?: { name?: string }): void {
  if (typeof window === 'undefined') return;

  const instance = getCurrentInstance();
  const componentName = instance?.type?.name || instance?.type?.__name;

  const id = regleDevtoolsRegistry.register(r$, {
    name: options?.name,
    componentName,
  });

  tryOnScopeDispose(() => {
    regleDevtoolsRegistry.unregister(id);
  });
}

export function watchRegleInstance(
  id: string,
  r$: SuperCompatibleRegleRoot,
  onChange: () => void
): WatchStopHandle | undefined {
  if (typeof window === 'undefined') return;

  const stopHandle = watch(() => r$, onChange, { deep: true, flush: 'post' });

  regleDevtoolsRegistry.addWatcher(id, stopHandle);

  return stopHandle;
}
