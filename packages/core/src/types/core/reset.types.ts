import type { RequireOneOrNone } from 'type-fest';

export type ResetOptions<TState extends unknown> = RequireOneOrNone<
  {
    /**
     * Reset validation status and reset form state to its initial state
     */
    toInitialState?: boolean;
    /**
     * Reset validation status and reset form state to the given state
     */
    toState?: TState | (() => TState);
  },
  'toInitialState' | 'toState'
>;
