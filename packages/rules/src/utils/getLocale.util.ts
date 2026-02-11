import type { Maybe } from '@regle/core';

export function getUserLocale(): string {
  if (navigator.languages != undefined) return navigator.languages[0];
  return navigator.language ?? 'en-US';
}

export function formatLocaleDate(date: Maybe<string | Date>) {
  if (date) {
    return new Intl.DateTimeFormat(getUserLocale(), { dateStyle: 'short' }).format(new Date(date));
  }
  return '?';
}
