import { ShibieStatus } from './status.types';

export interface ShibieInstance<TState extends Record<string, unknown>> {
  state: TState;
  errors: string[];
  rules: [];
  status: ShibieStatus;

  validateForm: () => void;
  resetForm: () => void;
}
