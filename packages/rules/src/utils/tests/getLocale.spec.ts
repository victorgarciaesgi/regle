import { describe, it, expect, afterEach } from 'vitest';
import { getUserLocale, formatLocaleDate } from '../getLocale.util';

describe('getUserLocale', () => {
  const originalNavigator = global.navigator;

  afterEach(() => {
    Object.defineProperty(global, 'navigator', {
      value: originalNavigator,
      writable: true,
    });
  });

  it('should return the first language from navigator.languages', () => {
    Object.defineProperty(global, 'navigator', {
      value: { languages: ['fr-FR', 'en-US'], language: 'en-US' },
      writable: true,
    });

    expect(getUserLocale()).toBe('fr-FR');
  });

  it('should return navigator.language when languages is undefined', () => {
    Object.defineProperty(global, 'navigator', {
      value: { languages: undefined, language: 'de-DE' },
      writable: true,
    });

    expect(getUserLocale()).toBe('de-DE');
  });
});

describe('formatLocaleDate', () => {
  it('should format a Date object', () => {
    const date = new Date('2023-12-25');
    const result = formatLocaleDate(date);

    expect(result).toBeTruthy();
    expect(result).not.toBe('?');
  });

  it('should format a date string', () => {
    const result = formatLocaleDate('2023-12-25');

    expect(result).toBeTruthy();
    expect(result).not.toBe('?');
  });

  it('should return "?" for null', () => {
    expect(formatLocaleDate(null)).toBe('?');
  });

  it('should return "?" for undefined', () => {
    expect(formatLocaleDate(undefined)).toBe('?');
  });

  it('should return "?" for empty string', () => {
    expect(formatLocaleDate('')).toBe('?');
  });
});
