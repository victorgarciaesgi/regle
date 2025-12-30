import type { MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty } from '../helpers';
import { DEFAULT_PROTOCOL_REGEX } from '../utils/regexes';
import { url, type UrlOptions } from './url';

/**
 * Validates HTTP URLs.
 *
 * @param options - Optional configuration for http url validation
 * @param options.protocol - Optional regex for validating the protocol
 *
 * @example
 * ```ts
 * import { httpUrl } from '@regle/rules';
 *
 * const { r$ } = useRegle({ bestUrl: '' }, {
 *   bestUrl: { httpUrl },
 *   // or to force https protocol
 *   bestUrl: { httpUrl: httpUrl({ protocol: /^https$/ }) },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#httpurl Documentation}
 */
export const httpUrl: RegleRuleWithParamsDefinition<
  string,
  [options?: UrlOptions | undefined],
  false,
  boolean,
  unknown,
  string
> = createRule({
  type: 'httpUrl',
  validator(value: MaybeInput<string>, options: UrlOptions = {}) {
    if (isEmpty(value)) {
      return true;
    }
    const { protocol = DEFAULT_PROTOCOL_REGEX } = options || {};
    return url({ protocol }).exec(value);
  },
  message: 'The value is not a valid http URL address',
});
