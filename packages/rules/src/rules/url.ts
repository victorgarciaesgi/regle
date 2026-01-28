import type { MaybeInput, RegleRuleWithParamsDefinition } from '@regle/core';
import { createRule } from '@regle/core';
import { isEmpty, matchRegex } from '../helpers';
import { HOSTNAME_REGEX, URL_REGEX } from '../utils/regexes';

export interface UrlOptions {
  protocol?: RegExp;
}

/**
 * Validates URLs.
 *
 * @param options - Optional configuration for url validation
 * @param options.protocol - Optional regex for validating the protocol
 *
 * @example
 * ```ts
 * import { url } from '@regle/rules';
 *
 * const { r$ } = useRegle({ bestUrl: '' }, {
 *   bestUrl: { url },
 *   // or with custom protocol validation
 *   bestUrl: { url: url({ protocol: /^https?$/ }) },
 * })
 * ```
 *
 * @see {@link https://reglejs.dev/core-concepts/rules/built-in-rules#url Documentation}
 */
export const url: RegleRuleWithParamsDefinition<
  string,
  [options?: UrlOptions | undefined],
  false,
  boolean,
  unknown,
  string
> = createRule({
  type: 'url',
  validator(value: MaybeInput<string>, options: UrlOptions = {}) {
    try {
      if (isEmpty(value)) {
        return true;
      }
      const { protocol } = options || {};
      const urlInput = new URL(value);

      if (!HOSTNAME_REGEX.test(urlInput.hostname)) {
        return false;
      }

      if (protocol) {
        if (!protocol.test(urlInput.protocol.endsWith(':') ? urlInput.protocol.slice(0, -1) : urlInput.protocol)) {
          return false;
        }
      }
      return matchRegex(value, URL_REGEX);
    } catch {
      return false;
    }
  },
  message: 'The value must be a valid URL',
});
