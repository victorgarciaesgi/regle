import { effectScope, getCurrentScope, onScopeDispose, type EffectScope } from 'vue';

export function tryOnScopeDispose(fn: () => any) {
  if (getCurrentScope()) {
    onScopeDispose(fn);
    return true;
  }
  return false;
}

export function createSharedComposable<Fn extends (...args: any[]) => any>(composable: Fn): Fn {
  let subscribers = 0;
  let state: ReturnType<Fn> | undefined;
  let scope: EffectScope | undefined;

  const dispose = () => {
    subscribers -= 1;
    if (scope && subscribers <= 0) {
      scope.stop();
      state = undefined;
      scope = undefined;
    }
  };

  return <Fn>((...args) => {
    subscribers += 1;
    if (!scope) {
      scope = effectScope(true);
      state = scope.run(() => composable(...args));
    }
    tryOnScopeDispose(dispose);
    return state;
  });
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
