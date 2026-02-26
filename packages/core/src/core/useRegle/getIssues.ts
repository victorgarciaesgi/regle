import type { Get, IsStringLiteral, Paths } from 'type-fest';
import { toValue, type MaybeRefOrGetter } from 'vue';
import { getDotPath } from '../../../../shared';
import type { RegleFieldIssue, SuperCompatibleRegleRoot, SuperCompatibleRegleStatus } from '../../types';

/**
 * Retrieves detailed validation issues for a specific field using a dot-notation path.
 * Issues contain more information than errors, including the rule name, property, and metadata.
 *
 * @typeParam TRegle - The Regle instance type (root or status)
 * @typeParam TPath - The dot-notation path type, validated at compile-time
 *
 * @param r$ - The Regle instance (e.g., from `useRegle()`)
 * @param path - Dot-notation path to the field (e.g., `'user.email'` or `'items.0.name'`)
 * @returns Array of `RegleFieldIssue` objects for the field, or `undefined` if path doesn't exist
 *
 * @example
 * ```ts
 * import { getIssues, useRegle } from '@regle/core';
 * import { required, email } from '@regle/rules';
 *
 * const { r$ } = useRegle(
 *   { user: { email: '' } },
 *   { user: { email: { required, email } } }
 * );
 *
 * await r$.$validate();
 *
 * // Type-safe access to nested issues with full metadata
 * const emailIssues = getIssues(r$, 'user.email');
 * // [{
 * //   $message: 'This field is required',
 * //   $property: 'email',
 * //   $rule: 'required'
 * // }]
 *
 * // Works with collections too
 * const itemIssues = getIssues(r$, 'items.0.name');
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/displaying-errors#get-issues-by-path Documentation}
 */
export function getIssues<
  TRegle extends SuperCompatibleRegleRoot | SuperCompatibleRegleStatus,
  TPath extends Paths<TRegle['$issues']>,
>(
  r$: MaybeRefOrGetter<TRegle>,
  path: TPath | (string & {})
): IsStringLiteral<TPath> extends true ? Get<TRegle['$issues'], TPath & string> : RegleFieldIssue[] | undefined {
  return getDotPath(toValue(r$).$issues, String(path));
}
