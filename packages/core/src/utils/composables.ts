import type { EffectScope } from 'vue';
import { effectScope, getCurrentScope, onScopeDispose } from 'vue';

export function createSharedComposable<Fn extends (...args: any) => any>(composable: Fn): Fn {
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
    if (!state) {
      scope = effectScope(true);
      state = scope.run(() => composable(...args));
    }
    if (getCurrentScope()) {
      onScopeDispose(dispose);
    }
    return state;
  });
}
