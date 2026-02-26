import type { Get, IsStringLiteral, Paths } from 'type-fest';
import { toValue, type MaybeRefOrGetter } from 'vue';
import { getDotPath } from '../../../../shared';
import type { SuperCompatibleRegleRoot, SuperCompatibleRegleStatus } from '../../types';

/**
 * Retrieves error messages for a specific field using a dot-notation path.
 * Provides type-safe access to nested error arrays in a Regle instance.
 *
 * @typeParam TRegle - The Regle instance type (root or status)
 * @typeParam TPath - The dot-notation path type, validated at compile-time
 *
 * @param r$ - The Regle instance (e.g., from `useRegle()`)
 * @param path - Dot-notation path to the field (e.g., `'user.email'` or `'items.0.name'`)
 * @returns Array of error strings for the field, or `undefined` if path doesn't exist
 *
 * @example
 * ```ts
 * import { getErrors, useRegle } from '@regle/core';
 * import { required, email } from '@regle/rules';
 *
 * const { r$ } = useRegle(
 *   { user: { email: '' } },
 *   { user: { email: { required, email } } }
 * );
 *
 * await r$.$validate();
 *
 * // Type-safe access to nested errors
 * const emailErrors = getErrors(r$, 'user.email');
 * // ['This field is required']
 *
 * // Works with collections too
 * const itemErrors = getErrors(r$, 'items.0.name');
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/displaying-errors#get-errors-by-path Documentation}
 */
export function getErrors<
  TRegle extends SuperCompatibleRegleRoot | SuperCompatibleRegleStatus,
  TPath extends Paths<TRegle['$errors']> | (string & {}),
>(
  r$: MaybeRefOrGetter<TRegle>,
  path: TPath
): IsStringLiteral<TPath> extends true ? Get<TRegle['$errors'], TPath & string> : string[] | undefined {
  return getDotPath(toValue(r$).$errors, String(path));
}
