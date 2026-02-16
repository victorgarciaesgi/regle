import type { RequireOneOrNone } from 'type-fest';

export type ResetOptions<TState extends unknown> = RequireOneOrNone<
  {
    /**
     * Reset validation status and reset form state to its initial state.
     *
     * Initial state is different than the original state as the initial state can be mutated when using `$reset`.
     *
     * This serve as the base comparison state for `$edited` property.
     *
     * ⚠️ This doesn't work if the state is a `reactive` object.
     */
    toInitialState?: boolean;
    /**
     * Reset validation status and reset form state to its original state.
     *
     * Original state is the unmutated state that was passed to the form when it was initialized.
     */
    toOriginalState?: boolean;
    /**
     * Reset validation status and reset form state to the given state
     * Also set the new state as the initial state.
     */
    toState?: TState | (() => TState);
    /**
     * Clears the $externalErrors state back to an empty object.
     *
     * @default true
     */
    clearExternalErrors?: boolean;
    /**
     * Keep the validation state of the form ($dirty, $invalid, $pending etc..)
     * Only useful if you only want to reset the form state.
     *
     * @default false
     */
    keepValidationState?: boolean;
  },
  'toInitialState' | 'toState'
>;
