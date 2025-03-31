import { effectScope, getCurrentScope, onScopeDispose, type EffectScope } from 'vue';

export function tryOnScopeDispose(fn: () => any) {
  if (getCurrentScope()) {
    onScopeDispose(fn);
    return true;
  }
  return false;
}

export function createGlobalState<Fn extends (...args: any[]) => any>(stateFactory: Fn): Fn {
  let initialized = false;
  let state: any;
  const scope = effectScope(true);

  return ((...args: any[]) => {
    if (!initialized) {
      state = scope.run(() => stateFactory(...args))!;
      initialized = true;
    }
    return state;
  }) as Fn;
}
