import { def, hasOwn, isConstructor } from '../../../../shared';
import { REGLE_FLAGS } from '../../constants';
import type { RegleStatic, RegleStaticImpl } from '../../types';

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
export function markStatic<T extends object>(value: T): T extends RegleStaticImpl<unknown> ? T : RegleStatic<T> {
  if (isConstructor(value)) {
    const OriginalConstructor = value;
    const StaticConstructor = class extends (OriginalConstructor as { new (...args: any[]): any }) {
      constructor(...args: any[]) {
        super(...args);
        return applyMarkStatic(this);
      }
    };

    Object.defineProperty(StaticConstructor, 'name', { value: OriginalConstructor.name });

    return applyMarkStatic(StaticConstructor) as any;
  }

  return applyMarkStatic(value) as any;
}

function applyMarkStatic<T extends object>(value: T): T extends RegleStaticImpl<unknown> ? T : RegleStatic<T> {
  if (!hasOwn(value, REGLE_FLAGS.REGLE_STATIC) && Object.isExtensible(value)) {
    def(value, REGLE_FLAGS.REGLE_STATIC, true);
  }
  return value as any;
}
