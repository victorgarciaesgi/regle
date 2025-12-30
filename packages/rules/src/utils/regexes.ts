/** Regex for validating url protocols */
export const DEFAULT_PROTOCOL_REGEX: RegExp = /^https?$/;

/** Regex for validating url hostnames */
export const HOSTNAME_REGEX: RegExp =
  /^(?=.{1,253}\.?$)[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[-0-9a-zA-Z]{0,61}[0-9a-zA-Z])?)*\.?$/;

/**
 * Regex taken from {@link https://gist.github.com/dperini/729294}
 */
export const URL_REGEX: RegExp =
  /^(?:(?:(?:https?|ftp):)?\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u00a1-\uffff][a-z0-9\u00a1-\uffff_-]{0,62})?[a-z0-9\u00a1-\uffff]\.)+(?:[a-z\u00a1-\uffff]{2,}\.?))(?::\d{2,5})?(?:[/?#]\S*)?$/i;

/** Regex for validating url domains */
export const DOMAIN_REGEX: RegExp = /^([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}$/;

/** Regex for validating emoji */
const _EMOJI_REGEX: string = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
export function EMOJI_REGEX(): RegExp {
  return new RegExp(_EMOJI_REGEX, 'u');
}

/** Regex for validating lowercase strings */
export const LOWERCASE_REGEX: RegExp = /^[^A-Z]*$/;

/** Regex for validating uppercase strings */
export const UPPERCASE_REGEX: RegExp = /^[^a-z]*$/;

/** Regex for validating hexadecimal strings */
export const HEX_REGEX: RegExp = /^[0-9a-fA-F]*$/;

/** Regex for validating alpha strings */
export const ALPHA_REGEX: RegExp = /^[a-zA-Z]*$/;

/** Regex for validating alpha-symbol strings */
export const ALPHA_SYMBOL_REGEX: RegExp = /^[\w.]+$/;

/** Regex for validating alpha-numeric strings */
export const ALPHA_NUM_REGEX: RegExp = /^[a-zA-Z0-9]*$/;

/** Regex for validating alpha-numeric-symbol strings */
export const ALPHA_NUM_SYMBOL_REGEX: RegExp = /^[a-zA-Z0-9_]*$/;

/** Regex for validating decimal strings */
export const DECIMAL_REGEX: RegExp = /^[-]?\d*(\.\d+)?$/;

/** Regex for validating email addresses */
export const EMAIL_REGEX: RegExp =
  /* oxlint-disable-next-line */
  /^(?:[A-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[A-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9]{2,}(?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])$/i;

/** Regex for validating integer strings */
export const INTEGER_REGEX: RegExp = /(^[0-9]*$)|(^-[0-9]+$)/;

/** Regex for validating numeric strings */
export const NUMERIC_REGEX: RegExp = /^\d*(\.\d+)?$/;
