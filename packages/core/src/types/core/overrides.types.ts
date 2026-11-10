import type { MaybeInput } from '../utils';

export interface GlobalConfigOverrides<TValue extends unknown = unknown> {
  /**
   * Override the default $edited and $modified handler.
   */
  isEdited?: isEditedHandlerFn<TValue>;
}

export type isEditedHandlerFn<TValue extends unknown = unknown> = (
  currentValue: MaybeInput<TValue>,
  initialValue: MaybeInput<TValue>,
  defaultHandlerFn: (currentValue: unknown, initialValue: unknown) => boolean
) => boolean;
