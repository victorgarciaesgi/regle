export interface ResetOptions<TState extends unknown> {
  toInitialState?: boolean;
  toEmptyState?: boolean;
  toState?: TState;
  keepDirty?: boolean;
}
