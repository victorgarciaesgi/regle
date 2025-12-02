import { def, hasOwn, isConstructor } from '../../../../shared';
import { REGLE_FLAGS } from '../../constants';
import type { RegleStatic } from '../../types';

/**
 * Marks a value as static and treats the constructor as a regular raw Field.
 * @param value - The value to mark as static.
 * @returns The marked value.
 * @example
 * ```ts
 * const StaticDecimal = markStatic(Decimal);
 * const StaticBigWrapper = markStatic(BigWrapper);
 * ```
 */
export function markStatic<T extends object>(value: T): RegleStatic<T> {
  if (isConstructor(value)) {
    const OriginalConstructor = value;
    const StaticConstructor = class extends (OriginalConstructor as { new (...args: any[]): any }) {
      constructor(...args: any[]) {
        super(...args);
        return applyMarkStatic(this);
      }
    };

    Object.defineProperty(StaticConstructor, 'name', { value: OriginalConstructor.name });

    return applyMarkStatic(StaticConstructor) as unknown as RegleStatic<T>;
  }

  return applyMarkStatic(value);
}

function applyMarkStatic<T extends object>(value: T): RegleStatic<T> {
  if (!hasOwn(value, REGLE_FLAGS.REGLE_STATIC) && Object.isExtensible(value)) {
    def(value, REGLE_FLAGS.REGLE_STATIC, true);
  }
  return value as RegleStatic<T>;
}
